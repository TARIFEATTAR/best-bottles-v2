
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET_NAME = 'bottle-images';
const ORGANIZED_DIR = path.join(process.cwd(), 'organized_components');
const MANIFEST_PATH = path.join(ORGANIZED_DIR, '_manifest.json');
const INVENTORY_CSV = path.join(process.cwd(), '../bestbottles_inventory_clean.csv');
const OUTPUT_CSV = path.join(process.cwd(), 'bestbottles_consolidated_inventory.csv');

async function uploadToSupabase(filePath, storagePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        throw new Error(`Upload failed for ${filePath}: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

async function run() {
    console.log('🚀 Starting Consolidation Pipeline...');

    // 1. Load Manifest
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ Manifest not found! Run "npm run organize" first.');
        return;
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    console.log(`📦 Loaded manifest with ${manifest.length} items.`);

    // 2. Load Inventory CSV
    const csvData = fs.readFileSync(INVENTORY_CSV, 'utf8');
    const inventory = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
    console.log(`📄 Loaded inventory CSV with ${inventory.length} rows.`);

    // 3. Process and Upload
    const urlMap = new Map();
    let uploadedCount = 0;

    for (const item of manifest) {
        const skuFolder = item.sku;

        // Clean SKU: Strip "1. " or "10. " prefix if it exists
        const cleanSku = skuFolder.replace(/^\d+\.\s*/, '');

        console.log(`📤 Processing ${skuFolder} (Clean SKU: ${cleanSku})...`);

        const urls = {
            bottle: null,
            cap: null,
            fitment: null
        };

        const folderPath = path.join(ORGANIZED_DIR, skuFolder);

        // Upload Bottle
        if (item.bottle) {
            urls.bottle = await uploadToSupabase(
                path.join(folderPath, item.bottle),
                `components/${cleanSku}/bottle.png`
            );
        }

        // Upload Cap
        if (item.cap) {
            urls.cap = await uploadToSupabase(
                path.join(folderPath, item.cap),
                `components/${cleanSku}/cap.png`
            );
        }

        // Upload Fitment (Roller/Spray/Pump)
        if (item.fitment) {
            urls.fitment = await uploadToSupabase(
                path.join(folderPath, item.fitment),
                `components/${cleanSku}/fitment.png`
            );
        }

        urlMap.set(cleanSku, urls);
        uploadedCount++;

        if (uploadedCount % 10 === 0) {
            console.log(`   Uploaded ${uploadedCount}/${manifest.length}...`);
        }
    }

    // 4. Join and Generate New CSV
    console.log('🔄 Joining data...');
    const consolidated = inventory.map(row => {
        const urls = urlMap.get(row.SKU) || {};
        return {
            ...row,
            Bottle_Image_URL: urls.bottle || '',
            Cap_Image_URL: urls.cap || '',
            Fitment_Image_URL: urls.fitment || ''
        };
    });

    const outputCsv = Papa.unparse(consolidated);
    fs.writeFileSync(OUTPUT_CSV, outputCsv);

    console.log(`\n✅ Success!`);
    console.log(`   📄 Consolidated Inventory: ${OUTPUT_CSV}`);
    console.log(`   📁 Total SKUs Mapped: ${urlMap.size}`);
}

run().catch(err => {
    console.error('❌ Pipeline failed:', err);
});
