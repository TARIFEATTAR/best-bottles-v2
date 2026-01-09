
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Initialize Clients
const supabase = createSupabaseClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const sanity = createSanityClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H', // Hardcoded as per previous successful usage
    apiVersion: '2024-01-01',
    useCdn: false,
});

const inventoryPath = path.resolve('./inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// Helper to find a product in the scrape by SKU (with fuzzy matching for sizes)
function findInScrape(sku: string) {
    // 1. Exact match
    let match = inventory.find((p: any) => p.sku === sku);
    if (match) return match;

    // 2. Fuzzy match (ignore 10 vs 12 vs 9)
    const normalizedSku = sku.replace(/\d+/, '');
    match = inventory.find((p: any) => p.sku.replace(/\d+/, '') === normalizedSku);
    return match;
}

// Logic to extract component names from description
function parseDescription(desc: string) {
    const text = desc.toLowerCase();

    // Default values
    let glassName = "Standard Glass";
    let capName = "Standard Cap";
    let fitmentName = "No Fitment";

    // Glass match
    if (text.includes("clear glass")) glassName = "Clear Glass";
    else if (text.includes("frosted glass")) glassName = "Frosted Glass";
    else if (text.includes("amber glass")) glassName = "Amber Glass";
    else if (text.includes("blue glass") || text.includes("cobalt")) glassName = "Cobalt Glass";

    // Cap match
    if (text.includes("shiny gold")) capName = "Shiny Gold Cap";
    else if (text.includes("matte gold")) capName = "Matte Gold Cap";
    else if (text.includes("shiny silver")) capName = "Shiny Silver Cap";
    else if (text.includes("matte silver")) capName = "Matte Silver Cap";
    else if (text.includes("shiny black")) capName = "Shiny Black Cap";
    else if (text.includes("matte black")) capName = "Matte Black Cap";
    else if (text.includes("white cap")) capName = "White Cap";

    // Fitment match
    if (text.includes("metal roller")) fitmentName = "Metal Roller";
    else if (text.includes("plastic roller")) fitmentName = "Plastic Roller";
    else if (text.includes("dropper")) fitmentName = "Dropper";
    else if (text.includes("sprayer") || text.includes("spray")) fitmentName = "Sprayer";

    return { glassName, capName, fitmentName };
}

async function uploadToSanity(url: string, filename: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const asset = await sanity.assets.upload('image', Buffer.from(buffer), {
            filename,
            contentType: 'image/png'
        });
        return asset._id;
    } catch (e) {
        return null;
    }
}

async function align() {
    console.log('🚀 Aligning Supabase Components with Scrape & Sanity...');

    // 1. List folders in components bucket
    const { data: folders, error } = await supabase.storage.from('bottle-images').list('components', { limit: 100 });
    if (error) {
        console.error('Error listing components:', error);
        return;
    }

    console.log(`Found ${folders.length} component folders in Supabase.`);

    for (const folder of folders) {
        const sku = folder.name;
        const scrapeData = findInScrape(sku);

        if (!scrapeData) {
            console.log(`  ❓ SKU ${sku} not found in scrape. Skipping.`);
            continue;
        }

        console.log(`\n📦 Processing SKU: ${sku} (Matched: ${scrapeData.sku})`);
        const { glassName, capName, fitmentName } = parseDescription(scrapeData.description);
        console.log(`  - Components: Glass[${glassName}] Cap[${capName}] Fitment[${fitmentName}]`);

        // Get files in folder
        const { data: files } = await supabase.storage.from('bottle-images').list(`components/${sku}`);
        if (!files) continue;

        const fileMap: Record<string, string> = {};
        for (const file of files) {
            const { data } = supabase.storage.from('bottle-images').getPublicUrl(`components/${sku}/${file.name}`);
            fileMap[file.name] = data.publicUrl;
        }

        // --- GLASS ---
        if (fileMap['bottle.png']) {
            console.log(`  🔗 Uploading bottle base for ${glassName}...`);
            const assetId = await uploadToSanity(fileMap['bottle.png'], `${sku}-bottle.png`);
            if (assetId) {
                const docId = `glass-${glassName.toLowerCase().replace(/\s+/g, '-')}`;
                const glassDoc = await sanity.createOrReplace({
                    _type: 'glassOption',
                    _id: docId,
                    name: glassName,
                    layerImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
                });
                console.log(`    ✅ Updated Glass: ${docId}`);

                // Link to Product
                const products = await sanity.fetch('*[_type == "product" && (sku == $sku || sku == $scrapeSku)]', { sku, scrapeSku: scrapeData.sku });
                for (const p of products) {
                    console.log(`    📝 Linking Glass to Product: ${p.title} (${p._id})`);
                    await sanity.patch(p._id)
                        .setIfMissing({ glassOptions: [] })
                        .insert('after', 'glassOptions[-1]', [{ _type: 'reference', _ref: glassDoc._id, _key: glassDoc._id }])
                        .commit();
                }
            }
        }

        // --- CAP ---
        if (fileMap['cap.png']) {
            console.log(`  🔗 Uploading cap overlay for ${capName}...`);
            const assetId = await uploadToSanity(fileMap['cap.png'], `${sku}-cap.png`);
            if (assetId) {
                const docId = `cap-${capName.toLowerCase().replace(/\s+/g, '-')}`;
                const capDoc = await sanity.createOrReplace({
                    _type: 'capOption',
                    _id: docId,
                    name: capName,
                    layerImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
                });
                console.log(`    ✅ Updated Cap: ${docId}`);

                // Link to Product
                const products = await sanity.fetch('*[_type == "product" && (sku == $sku || sku == $scrapeSku)]', { sku, scrapeSku: scrapeData.sku });
                for (const p of products) {
                    console.log(`    📝 Linking Cap to Product: ${p.title} (${p._id})`);
                    await sanity.patch(p._id)
                        .setIfMissing({ capOptions: [] })
                        .insert('after', 'capOptions[-1]', [{ _type: 'reference', _ref: capDoc._id, _key: capDoc._id }])
                        .commit();
                }
            }
        }

        // --- FITMENT ---
        if (fileMap['fitment.png']) {
            console.log(`  🔗 Uploading fitment overlay for ${fitmentName}...`);
            const assetId = await uploadToSanity(fileMap['fitment.png'], `${sku}-fitment.png`);
            if (assetId) {
                const docId = `fitment-${fitmentName.toLowerCase().replace(/\s+/g, '-')}`;
                const fitmentDoc = await sanity.createOrReplace({
                    _type: 'fitmentVariant',
                    _id: docId,
                    name: fitmentName,
                    layerImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
                });
                console.log(`    ✅ Updated Fitment: ${docId}`);

                // Link to Product
                const products = await sanity.fetch('*[_type == "product" && (sku == $sku || sku == $scrapeSku)]', { sku, scrapeSku: scrapeData.sku });
                for (const p of products) {
                    console.log(`    📝 Linking Fitment to Product: ${p.title} (${p._id})`);
                    await sanity.patch(p._id)
                        .setIfMissing({ fitmentVariants: [] })
                        .insert('after', 'fitmentVariants[-1]', [{ _type: 'reference', _ref: fitmentDoc._id, _key: fitmentDoc._id }])
                        .commit();
                }
            }
        }
    }

    console.log('\n✨ Alignment Complete.');
}

align().catch(console.error);
