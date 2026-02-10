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

async function checkSanity() {
    console.log('🔍 Checking Sanity Connection & Schema...');

    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ CSV Map not found!');
        return;
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const records = Papa.parse(csvData, { header: true }).data;

    // Pick the first valid record to test
    const testSku = records.find(r => r.SKU && r.Bottle_URL)?.SKU;

    if (!testSku) {
        console.error('❌ No valid SKUs found in CSV');
        return;
    }

    console.log(`\n🧪 Testing lookup for SKU: ${testSku}`);

    // Let's look at one of EACH type to verify logic
    const testIds = [
        "cap-GBCylAmb5BlkSht",      // Flat Cap (0, 0)
        "cap-GBCylAmb5SpryBlkMt",  // Spray (-144, -486)
        "cap-GBCylAmb5RollSlSh"    // Roll-on (-149, -15)
    ];

    console.log(`\n🕵️‍♀️ Fetching representative samples...`);

    const query = `*[_id in $testIds]{
        _id,
        title,
        sku,
        assembly_offset_x,
        assembly_offset_y,
        "image": image_url
    }`;

    try {
        const docs = await client.fetch(query, { testIds });

        console.log(`\n✅ REPRESENTATIVE SAMPLES IN SANITY:`);
        console.table(docs.map(d => ({
            Type: d._id.includes('Spry') ? 'SPRAY' : (d._id.includes('Roll') ? 'ROLL-ON' : 'FLAT'),
            SKU: d.sku,
            Offset_X: d.assembly_offset_x,
            Offset_Y: d.assembly_offset_y,
            Has_Image: d.image ? 'YES' : 'NO'
        })));

    } catch (e) {
        console.error('❌ Sanity Query Failed:', e.message);
    }
}

checkSanity();
