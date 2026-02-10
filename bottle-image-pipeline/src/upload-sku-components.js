import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Load environment variables
dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// CONFIG
const BUCKET_NAME = 'bottle-images';
// Path to the folder containing the clean, standardized SKU subfolders
const COMPONENTS_DIR = path.join(process.cwd(), 'OUTPUT_CLEAN');
const OUTPUT_CSV = path.join(process.cwd(), 'uploaded_clean_map.csv');

async function uploadToSupabase(filePath, storagePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

        return data.publicUrl;
    } catch (err) {
        console.error(`❌ Upload failed for ${path.basename(filePath)}:`, err.message);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Component Upload Pipeline...');
    console.log(`📂 Source: ${COMPONENTS_DIR}`);

    if (!fs.existsSync(COMPONENTS_DIR)) {
        console.error(`❌ Error: Source directory does not exist!`);
        return;
    }

    // Get all SKU folders
    const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
    const skuFolders = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    console.log(`📦 Found ${skuFolders.length} SKU folders to process.`);

    const results = [];
    let processedCount = 0;

    for (const sku of skuFolders) {
        const folderPath = path.join(COMPONENTS_DIR, sku);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));

        // Object to store URLs for this SKU
        const row = {
            SKU: sku,
            Bottle_URL: '',
            Fitment_URL: '',
            Cap_URL: '',
            Overcap_URL: ''
        };

        console.log(`\n🔹 Processing ${sku} (${files.length} files)...`);

        for (const file of files) {
            const lowerName = file.toLowerCase();
            let type = null;

            // Determine component type based on filename suffix
            if (lowerName.includes('bottle')) type = 'bottle';
            else if (lowerName.includes('fitment')) type = 'fitment';
            else if (lowerName.includes('cap') && !lowerName.includes('overcap')) type = 'cap';
            else if (lowerName.includes('overcap')) type = 'OVERCAP_SPECIAL'; // temp marker

            // Handle the specific naming convention we just created
            // e.g., GBCylAmb5SprySlMt_overcap.png

            const storagePath = `clean-1500px/${sku}/${file}`; // Clean storage path

            const publicUrl = await uploadToSupabase(path.join(folderPath, file), storagePath);

            if (publicUrl) {
                if (type === 'bottle') row.Bottle_URL = publicUrl;
                else if (type === 'fitment') row.Fitment_URL = publicUrl;
                else if (type === 'cap') row.Cap_URL = publicUrl;
                else if (type === 'OVERCAP_SPECIAL') row.Overcap_URL = publicUrl;

                console.log(`   ✅ Uploaded: ${file}`);
            }
        }

        results.push(row);
        processedCount++;
    }

    // Generate CSV
    console.log('\n📝 Generating Mapping CSV...');
    const csv = Papa.unparse(results);
    fs.writeFileSync(OUTPUT_CSV, csv);

    console.log(`\n🎉 DONE! Processed ${processedCount} SKUs.`);
    console.log(`📄 Map saved to: ${OUTPUT_CSV}`);
}

run().catch(err => {
    console.error('❌ Fatal Error:', err);
});
