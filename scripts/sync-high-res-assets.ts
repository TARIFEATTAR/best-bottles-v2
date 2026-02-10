
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import 'dotenv/config';

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef';
const SANITY_DATASET = process.env.VITE_SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY || !SANITY_TOKEN) {
    console.error('❌ Missing required environment variables (SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SANITY_API_TOKEN)');
    process.exit(1);
}

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const sanity = createSanityClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

/**
 * Mapping table to bridge Supabase SKUs to Sanity names
 */
const MAPPING: Record<string, { names: string[], type: string, field: string }> = {
    // CAPS
    'CAP-9ML-ShnGl': { names: ['Shiny Gold Cap', 'Shiney Gold', 'Gold Shiny'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-MattGl': { names: ['Matte Gold Cap', 'Matte Gold', 'Gold Matte'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-ShnSl': { names: ['Shiny Silver Cap', 'Silver Shiny'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-MattSl': { names: ['Matte Silver Cap', 'Silver Matte'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-BlkDot': { names: ['Black Dot Cap', 'Black Dots', 'Black Dot'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-SlDot': { names: ['Silver Dot Cap', 'Silver Dot'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-PnkDot': { names: ['Pink Dot Cap', 'Pink Dots', 'Pink Dot'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-Wht': { names: ['White Cap', 'White'], type: 'capOption', field: 'layerImage' },
    'CAP-9ML-ShBlk': { names: ['Shiny Black Cap', 'Black Shiny'], type: 'capOption', field: 'layerImage' },

    // ROLLERS (Fitments)
    'ROLLER-9ML-METAL': { names: ['Metal Roller'], type: 'fitmentVariant', field: 'overlayImage' },
    'ROLLER-9ML-PLASTIC': { names: ['Plastic Roller'], type: 'fitmentVariant', field: 'overlayImage' },

    // GLASS (Base Images - using the primary SKU for now)
    'GBCyl9MtlRollBlkDot': { names: ['Clear Glass (Metal Roller)', 'Clear Glass'], type: 'glassOption', field: 'layerImage' },
    'GBCylAmb9MtlRollBlkDot': { names: ['Amber Glass (Metal Roller)', 'Amber Glass'], type: 'glassOption', field: 'layerImage' },
    'GBCylBlu9MtlRollBlkDot': { names: ['Cobalt Glass (Metal Roller)', 'Cobalt Glass', 'Colbalt'], type: 'glassOption', field: 'layerImage' },
    'GBCylFrst9MtlRollBlkDot': { names: ['Frosted Glass (Metal Roller)', 'Frosted Glass'], type: 'glassOption', field: 'layerImage' },
    'GBCylSwrl9MtlRollBlkDot': { names: ['Swirl Glass (Metal Roller)', 'Swirl Glass', 'Swirl'], type: 'glassOption', field: 'layerImage' },
};

async function syncAssets() {
    console.log('🚀 Starting High-Res Asset Sync to Sanity...');

    // 1. Fetch completed components/bases from Supabase
    // We fetch everything completed to catch both 'component' and actual product bases
    const { data: records, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('processing_status', 'completed');

    if (error) {
        console.error('❌ Failed to fetch records from Supabase:', error);
        return;
    }

    console.log(`📦 Found ${records?.length || 0} completed records in Supabase.`);

    for (const rec of records) {
        let mapping = MAPPING[rec.sku];
        let docs = [];

        if (mapping) {
            console.log(`\n🔄 Syncing ${rec.sku} -> Sanity ${mapping.type} (via MAPPING)...`);
            const query = `*[_type == $type && (name in $names || title in $names || label in $names)]`;
            docs = await sanity.fetch(query, { type: mapping.type, names: mapping.names });
        } else {
            // Try Dynamic SKU Match for Products
            console.log(`\n🔍 Searching for Sanity product with SKU: ${rec.sku}...`);
            const product = await sanity.fetch('*[_type == "product" && sku == $sku][0]', { sku: rec.sku });
            if (product) {
                console.log(`  ✅ Found Product: ${product.title}`);
                mapping = { names: [product.title], type: 'product', field: 'heroImage' };
                docs = [product];
            }
        }

        if (!mapping || docs.length === 0) {
            console.warn(`  ⚠️ No mapping or Sanity documents found for SKU: ${rec.sku}`);
            continue;
        }

        try {
            const imageUrl = rec.enhanced_image_url;
            if (!imageUrl) {
                console.warn(`  ⚠️ Enhanced image URL missing for ${rec.sku}`);
                continue;
            }

            console.log(`  🌐 Downloading: ${imageUrl}`);
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const asset = await sanity.assets.upload('image', buffer, {
                filename: `${rec.sku}-highres.png`,
                contentType: 'image/png',
            });

            for (const doc of docs) {
                console.log(`  📝 Patching doc ${doc._id} [${doc.name || doc.title || doc.sku}] field ${mapping.field}...`);
                await sanity
                    .patch(doc._id)
                    .set({
                        [mapping.field]: {
                            _type: 'image',
                            asset: { _type: 'reference', _ref: asset._id }
                        }
                    })
                    .commit();
            }
            console.log(`  🎉 Success for ${rec.sku}`);
        } catch (err: any) {
            console.error(`  ❌ Failed for ${rec.sku}:`, err.message);
        }
    }

    console.log('\n✨ Sync completed.');
}

syncAssets();
