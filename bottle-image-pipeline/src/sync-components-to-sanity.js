import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01'
});

const CSV_PATH = path.join(process.cwd(), 'uploaded_components_map.csv');

async function syncToSanity() {
    console.log('🚀 Starting Scalable Sync (Data Only - No Image Uploads)...');

    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ CSV Map not found!');
        return;
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const records = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    let successCount = 0;

    // Using transaction for speed
    const transaction = client.transaction();

    for (const record of records) {
        const { SKU, Bottle_URL, Fitment_URL, Cap_URL, Overcap_URL } = record;

        if (!SKU) continue;

        console.log(`🔹 Linking Supabase URLs for SKU: ${SKU}`);

        // Offsets
        let offX = 0;
        let offY = 0;
        if (SKU.includes('Spry') || SKU.includes('Spray')) {
            offX = -144;
            offY = -486;
        } else if (SKU.includes('Roll')) {
            offX = -149;
            offY = -15;
        }

        // 1. Create GLASS Option
        if (Bottle_URL) {
            transaction.createOrReplace({
                _id: `glass-${SKU}`,
                _type: 'glassOption',
                name: `Glass: ${SKU}`,
                skuPart: SKU,
                image_url: Bottle_URL // Storing URL String, NOT uploading
            });
        }

        // 2. Create CAP Option
        const finalCapUrl = Cap_URL || Overcap_URL;
        if (finalCapUrl) {
            transaction.createOrReplace({
                _id: `cap-${SKU}`,
                _type: 'capOption',
                name: `Cap: ${SKU}`,
                skuPart: SKU,
                image_url: finalCapUrl,
                assembly_offset_x: offX,
                assembly_offset_y: offY
            });
        }

        // 3. Create FITMENT Variant
        if (Fitment_URL || Overcap_URL) {
            const fitmentDoc = {
                _id: `fitment-${SKU}`,
                _type: 'fitmentVariant',
                name: `Fitment: ${SKU}`,
                skuPart: SKU,
                type: SKU.includes('Roll') ? 'Roller' : 'Spray',
                image_url: Fitment_URL
            };
            if (Overcap_URL) {
                fitmentDoc.overcap_url = Overcap_URL;
                fitmentDoc.assembly_offset_x = offX;
                fitmentDoc.assembly_offset_y = offY;
            }
            transaction.createOrReplace(fitmentDoc);
        }

        successCount++;
    }

    console.log('⏳ Committing transaction...');

    try {
        await transaction.commit();
        console.log(`✅ Successfully linked ${successCount} component sets to Supabase URLs.`);
    } catch (err) {
        console.error('❌ Transaction failed:', err.message);
    }
}

syncToSanity();
