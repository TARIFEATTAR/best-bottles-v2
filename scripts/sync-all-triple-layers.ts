
import { createClient as createSanityClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Sanity
const sanity = createSanityClient({
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

async function syncAllTripleLayers() {
    console.log('🚀 Starting Global Triple-Layer Architectural Sync...');

    const { data: folders, error } = await supabase.storage.from('bottle-images').list('components', { limit: 1000 });
    if (error) {
        console.error('Error listing components:', error);
        return;
    }

    for (const folder of folders) {
        const sku = folder.name;
        if (sku.includes('.') || sku === '24' || sku === '25') continue; // Clean up ghost folders

        const { data: files } = await supabase.storage.from('bottle-images').list(`components/${sku}`);
        if (!files || files.length < 2) continue; // Needs at least glass and cap

        console.log(`\n📦 Syncing ${sku}...`);

        const fileMap: Record<string, string> = {};
        for (const file of files) {
            const { data } = supabase.storage.from('bottle-images').getPublicUrl(`components/${sku}/${file.name}`);
            fileMap[file.name] = data.publicUrl;
        }

        const componentRefs: Record<string, string> = {};

        // 1. Process Layers
        const layerConfigs = [
            { key: 'bottle.png', type: 'glassOption', suffix: 'bottle' },
            { key: 'fitment.png', type: 'fitmentVariant', suffix: 'fitment' },
            { key: 'cap.png', type: 'capOption', suffix: 'cap' }
        ];

        for (const config of layerConfigs) {
            if (fileMap[config.key]) {
                const assetId = await uploadToSanity(fileMap[config.key], `${sku}-${config.suffix}.png`);
                if (assetId) {
                    const sanitizedSku = sku.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                    const docId = `${config.type}-${sanitizedSku}-${config.suffix}`;
                    const doc = await sanity.createOrReplace({
                        _type: config.type,
                        _id: docId,
                        name: `${sku} ${config.suffix}`,
                        layerImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
                    });
                    componentRefs[config.type] = doc._id;
                    console.log(`  ✅ Added ${config.suffix} layer.`);
                }
            }
        }

        // 2. Link to Product in Sanity (Try exact SKU match first)
        const product = await sanity.fetch('*[_type == "product" && (sku == $sku || title match $sku)][0]', { sku });
        if (product && componentRefs['glassOption']) {
            console.log(`  🔗 Linking to product: ${product.title}`);
            const patch: any = {
                defaultGlass: { _type: 'reference', _ref: componentRefs['glassOption'] },
                glassOptions: [{ _type: 'reference', _ref: componentRefs['glassOption'], _key: 'glass' }]
            };
            if (componentRefs['capOption']) patch.capOptions = [{ _type: 'reference', _ref: componentRefs['capOption'], _key: 'cap' }];
            if (componentRefs['fitmentVariant']) patch.fitmentVariants = [{ _type: 'reference', _ref: componentRefs['fitmentVariant'], _key: 'fitment' }];

            await sanity.patch(product._id).set(patch).commit();
            console.log(`  🎉 Product Fully Modularized.`);
        }
    }

    console.log('\n✨ Global Sync Complete.');
}

syncAllTripleLayers().catch(console.error);
