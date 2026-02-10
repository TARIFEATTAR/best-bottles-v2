
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

async function linkBellPaperDoll() {
    console.log('🚀 Activating Paper Doll for Bell Design...');

    const folder = 'GBBell12BlkSht';
    const sku = 'GBBell10SpryBlkSh'; // The Sanity SKU

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

    // 2. Upload Layered Assets to Sanity
    const glassAssetId = fileMap['bottle.png'] ? await uploadToSanity(fileMap['bottle.png'], 'bell-bottle-layer.png') : null;
    const capAssetId = fileMap['cap.png'] ? await uploadToSanity(fileMap['cap.png'], 'bell-cap-layer.png') : null;

    if (!glassAssetId || !capAssetId) {
        console.error('Missing required layers.');
        return;
    }

    // 3. Create/Update Component Documents
    console.log('📝 Creating Component Documents...');
    const glassDoc = await sanity.createOrReplace({
        _type: 'glassOption',
        _id: 'glass-bell-clear',
        name: 'Bell Clear Glass',
        layerImage: { _type: 'image', asset: { _type: 'reference', _ref: glassAssetId } }
    });

    const capDoc = await sanity.createOrReplace({
        _type: 'capOption',
        _id: 'cap-bell-black-shiny',
        name: 'Bell Shiny Black Sprayer',
        layerImage: { _type: 'image', asset: { _type: 'reference', _ref: capAssetId } }
    });

    // 4. Link to Product
    console.log('🔗 Linking to Product Document...');
    const product = await sanity.fetch('*[_type == "product" && sku == $sku][0]', { sku });

    if (product) {
        await sanity.patch(product._id)
            .set({
                title: 'Bell Vintage Design (Modular)',
                defaultGlass: { _type: 'reference', _ref: glassDoc._id },
                glassOptions: [{ _type: 'reference', _ref: glassDoc._id, _key: glassDoc._id }],
                capOptions: [{ _type: 'reference', _ref: capDoc._id, _key: capDoc._id }],
                status: 'product_published'
            })
            .commit();
        console.log(`✅ Success! Product ${sku} is now live with Paper Doll layers.`);
    } else {
        console.warn(`Product SKU ${sku} not found in Sanity.`);
    }
}

linkBellPaperDoll().catch(console.error);
