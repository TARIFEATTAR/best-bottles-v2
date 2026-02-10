
import { createClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Sanity
const sanity = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

// Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY!);

async function uploadToSanity(url: string, filename: string) {
    console.log(`  🌐 Uploading to Sanity: ${filename}...`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const asset = await sanity.assets.upload('image', Buffer.from(buffer), {
            filename,
            contentType: 'image/png'
        });
        return asset._id;
    } catch (e: any) {
        console.error(`  ❌ Failed to upload ${filename}: ${e.message}`);
        return null;
    }
}

async function fixBellPaperDoll() {
    console.log('🚀 Fixing Paper Doll for Bell Design (Adding Sprayer)...');

    const folder = 'GBBell12SpryBlkSh';
    const sku = 'GBBell10SpryBlkSh';

    // 1. Get URLs from Supabase
    const { data: files } = await supabase.storage.from('bottle-images').list(`components/${folder}`);
    if (!files || files.length === 0) {
        console.error('No files found in Supabase folder.');
        return;
    }

    const fileMap: Record<string, string> = {};
    for (const file of files) {
        const { data } = supabase.storage.from('bottle-images').getPublicUrl(`components/${folder}/${file.name}`);
        fileMap[file.name] = data.publicUrl;
    }

    // 2. Map Layers following the SKU-layer convention
    const layers = [
        { name: 'bottle.png', type: 'glassOption', suffix: 'bottle', label: 'Bell Clear Glass' },
        { name: 'fitment.png', type: 'fitmentVariant', suffix: 'fitment', label: 'Bell Shiny Black Sprayer' },
        { name: 'cap.png', type: 'capOption', suffix: 'cap', label: 'Bell Shiny Black Top' }
    ];

    const refs: Record<string, string> = {};

    for (const layer of layers) {
        if (fileMap[layer.name]) {
            const assetId = await uploadToSanity(fileMap[layer.name], `${sku}-${layer.suffix}.png`);
            if (assetId) {
                const docId = `${layer.type}-${sku.toLowerCase()}-${layer.suffix}`;
                const doc = await sanity.createOrReplace({
                    _type: layer.type,
                    _id: docId,
                    name: layer.label,
                    layerImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
                });
                refs[layer.type] = doc._id;
            }
        }
    }

    // 3. Link to Product
    if (refs['glassOption'] && refs['fitmentVariant'] && refs['capOption']) {
        console.log('🔗 Linking ALL layers to Product Document...');
        const product = await sanity.fetch('*[_type == "product" && sku == $sku][0]', { sku });

        if (product) {
            await sanity.patch(product._id)
                .set({
                    title: 'Bell Vintage Design (Full Modular)',
                    defaultGlass: { _type: 'reference', _ref: refs['glassOption'] },
                    glassOptions: [{ _type: 'reference', _ref: refs['glassOption'], _key: 'glass' }],
                    fitmentVariants: [{ _type: 'reference', _ref: refs['fitmentVariant'], _key: 'fitment' }],
                    capOptions: [{ _type: 'reference', _ref: refs['capOption'], _key: 'cap' }],
                    status: 'product_published'
                })
                .commit();
            console.log(`✅ Success! Product ${sku} now has ALL 3 layers linked.`);
        }
    }
}

fixBellPaperDoll().catch(console.error);
