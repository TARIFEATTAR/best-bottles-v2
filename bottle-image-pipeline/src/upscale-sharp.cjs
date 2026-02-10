const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_ROOT = path.resolve(__dirname, '../OUTPUT_CLEAN/CLEAN_AMBER_SPRAY');
const OUTPUT_ROOT = path.resolve(__dirname, '../OUTPUT_UPSCALED');
const SCALE_FACTOR = 2; // 2x upscale (1500px -> 3000px)

// Ensure output root exists
if (!fs.existsSync(OUTPUT_ROOT)) {
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
}

async function upscaleImage(inputPath, outputPath) {
    const metadata = await sharp(inputPath).metadata();
    const newWidth = Math.round(metadata.width * SCALE_FACTOR);
    const newHeight = Math.round(metadata.height * SCALE_FACTOR);

    await sharp(inputPath)
        .resize(newWidth, newHeight, {
            kernel: 'lanczos3',  // High-quality resampling
            fit: 'fill'
        })
        .sharpen({   // Subtle sharpening to crisp edges
            sigma: 0.5,
            m1: 0.5,
            m2: 0.5
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(outputPath);
}

async function processDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const newRelPath = path.join(relativePath, entry.name);
        const targetPath = path.join(OUTPUT_ROOT, newRelPath);

        if (entry.isDirectory()) {
            if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
            await processDirectory(fullPath, newRelPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {

            if (fs.existsSync(targetPath)) {
                console.log(`⏩ Skipping ${entry.name} (exists)`);
                continue;
            }

            console.log(`✨ Upscaling: ${entry.name}`);
            try {
                await upscaleImage(fullPath, targetPath);
                console.log(`   ✅ Done`);
            } catch (err) {
                console.error(`   ❌ Failed: ${err.message}`);
            }
        }
    }
}

async function main() {
    console.log("🚀 Sharp Upscale (Lanczos3 + Sharpening)");
    console.log(`📂 Input:  ${INPUT_ROOT}`);
    console.log(`📂 Output: ${OUTPUT_ROOT}`);
    console.log(`📐 Scale:  ${SCALE_FACTOR}x\n`);

    const start = Date.now();
    await processDirectory(INPUT_ROOT);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`\n✅ Complete! (${elapsed}s)`);
    console.log("Upscaled images are in: OUTPUT_UPSCALED/");
}

main().catch(console.error);
