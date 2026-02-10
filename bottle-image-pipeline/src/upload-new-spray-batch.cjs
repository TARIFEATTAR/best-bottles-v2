
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --- UPSCALE CONFIG ---
const UPSCALE_ENABLED = true;  // Set to false to disable upscaling
const SCALE_FACTOR = 2;        // 2x upscale (1500px -> 3000px)

// --- CONFIGURATION ---
const INPUT_DIR = path.join(__dirname, '../OUTPUT_CLEAN/CLEAN_AMBER_SPRAY');
const OUTPUT_CSV = path.join(__dirname, '../new_spray_map.csv');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET_NAME = 'bottle-images';
const STORAGE_PATH = 'clean-1500px';

// --- SUPABASE CLIENT ---
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MAIN FUNCTION ---
async function processDirectory() {
    console.log(`📂 Scanning directory: ${INPUT_DIR}`);

    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
        return;
    }

    const entries = fs.readdirSync(INPUT_DIR, { withFileTypes: true });
    const directories = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    console.log(`🔍 Found ${directories.length} SKU directories.`);

    const csvRows = [];
    // Header
    // CSV Header: SKU,Bottle_URL,Fitment_URL,Cap_URL,Overcap_URL

    for (const sku of directories) {
        console.log(`\n📦 Processing SKU: ${sku}`);
        const skuDir = path.join(INPUT_DIR, sku);
        const files = fs.readdirSync(skuDir).filter(f => f.toLowerCase().endsWith('.png'));

        let bottleUrl = '';
        let fitmentUrl = '';
        let pumpUrl = '';
        let overcapUrl = '';

        // Sort files to ensure consistency
        files.sort();

        // Identify files by name pattern
        const bottleFile = files.find(f => f.toLowerCase().includes('bottle'));
        const fitmentFile = files.find(f => f.toLowerCase().includes('fitment'));
        const pumpFile = files.find(f => f.toLowerCase().includes('pump'));
        const overcapFile = files.find(f => f.toLowerCase().includes('overcap'));

        // --- UPLOAD BOTTLE ---
        if (bottleFile) {
            const filePath = path.join(skuDir, bottleFile);
            const storageKey = `${STORAGE_PATH}/${sku}/${bottleFile}`;
            bottleUrl = await uploadFile(filePath, storageKey);
        }

        // --- UPLOAD FITMENT ---
        if (fitmentFile) {
            const filePath = path.join(skuDir, fitmentFile);
            const storageKey = `${STORAGE_PATH}/${sku}/${fitmentFile}`;
            fitmentUrl = await uploadFile(filePath, storageKey);
        }

        // --- UPLOAD PUMP (for Clear glass) ---
        if (pumpFile) {
            const filePath = path.join(skuDir, pumpFile);
            const storageKey = `${STORAGE_PATH}/${sku}/${pumpFile}`;
            pumpUrl = await uploadFile(filePath, storageKey);
        }

        // --- UPLOAD OVERCAP ---
        if (overcapFile) {
            const filePath = path.join(skuDir, overcapFile);
            const storageKey = `${STORAGE_PATH}/${sku}/${overcapFile}`;
            overcapUrl = await uploadFile(filePath, storageKey);
        }

        // Prepare CSV Row
        // SKU, Bottle, Fitment, Cap, Overcap, Pump
        const row = `${sku},${bottleUrl},${fitmentUrl},,${overcapUrl},${pumpUrl}`;
        csvRows.push(row);
    }

    // Write CSV
    if (csvRows.length > 0) {
        fs.writeFileSync(OUTPUT_CSV, csvRows.join('\n') + '\n');
        console.log(`\n✅ CSV Exported to: ${OUTPUT_CSV}`);
        console.log(`📝 Generated ${csvRows.length} rows.`);
    } else {
        console.log('⚠️ No rows generated.');
    }
}

async function uploadFile(filePath, storageKey) {
    try {
        let fileBuffer = fs.readFileSync(filePath);

        // --- UPSCALE IF ENABLED ---
        if (UPSCALE_ENABLED) {
            const metadata = await sharp(fileBuffer).metadata();
            const newWidth = Math.round(metadata.width * SCALE_FACTOR);
            const newHeight = Math.round(metadata.height * SCALE_FACTOR);

            fileBuffer = await sharp(fileBuffer)
                .resize(newWidth, newHeight, {
                    kernel: 'lanczos3',
                    fit: 'fill'
                })
                .sharpen({ sigma: 0.5, m1: 0.5, m2: 0.5 })
                .png({ quality: 100, compressionLevel: 6 })
                .toBuffer();

            console.log(`   📐 Upscaled: ${metadata.width}x${metadata.height} → ${newWidth}x${newHeight}`);
        }

        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(storageKey, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        // Get Public URL
        const { data: publicData } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(storageKey);

        console.log(`   ⬆️ Uploaded: ${path.basename(filePath)} → ${storageKey}`);
        return publicData.publicUrl;

    } catch (err) {
        console.error(`   ❌ Failed to upload ${filePath}:`, err.message);
        return '';
    }
}

processDirectory();
