
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_ROOT = path.resolve(__dirname, '../OUTPUT_CLEAN/CLEAN_AMBER_SPRAY');
const OUTPUT_ROOT = path.resolve(__dirname, '../OUTPUT_UPSCALED/CLEAN_AMBER_SPRAY');
const UPSCALE_BIN = path.join(__dirname, '../bin/realesrgan-ncnn-vulkan');
const SCALE_FACTOR = 2; // 2x upscale usually safer for product geometry than 4x

// Ensure output root exists
if (!fs.existsSync(OUTPUT_ROOT)) {
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
}

async function upscaleDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        // Calculate relative path to mirror structure
        const relPath = path.relative(INPUT_ROOT, fullPath);
        const targetPath = path.join(OUTPUT_ROOT, relPath);

        if (entry.isDirectory()) {
            if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
            await upscaleDirectory(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {

            if (fs.existsSync(targetPath)) {
                console.log(`⏩ Skipping ${entry.name} (already exists)`);
                continue;
            }

            console.log(`✨ Upscaling ${entry.name}...`);
            try {
                // RealESRGAN command
                // -i input -o output -s scale -n model
                // model 'realesrgan-x4plus' is generally best for general images
                const cmd = `"${UPSCALE_BIN}" -i "${fullPath}" -o "${targetPath}" -s ${SCALE_FACTOR} -n realesrgan-x4plus`;
                execSync(cmd, { stdio: 'inherit' });
            } catch (err) {
                console.error(`❌ Failed to upscale ${entry.name}:`, err.message);
                // Fallback: Copy original if upscale fails so pipeline doesn't break
                fs.copyFileSync(fullPath, targetPath);
            }
        }
    }
}

async function main() {
    console.log("🚀 Starting Bulk AI Upscale...");

    console.log(`📂 Input: ${INPUT_ROOT}`);
    console.log(`📂 Output: ${OUTPUT_ROOT}`);

    await upscaleDirectory(INPUT_ROOT);

    console.log("\n✅ Upscale Complete!");
    console.log("To use these files, update your upload script to point to OUTPUT_UPSCALED");
}

main();
