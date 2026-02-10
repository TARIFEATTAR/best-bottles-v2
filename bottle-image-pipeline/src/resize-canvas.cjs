
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetSize = 1500;
const inputDir = process.argv[2];

if (!inputDir) {
    console.error("Please provide an input directory.");
    process.exit(1);
}

async function processFile(filePath) {
    const filename = path.basename(filePath);
    if (!filename.toLowerCase().endsWith('.png')) return;

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // If already correct size, skip
        if (metadata.width === targetSize && metadata.height === targetSize) {
            console.log(`✅ ${filename} is already ${targetSize}x${targetSize}`);
            return;
        }

        console.log(`🔄 Resizing ${filename} (${metadata.width}x${metadata.height}) -> 1500x1500 canvas...`);

        // Create canvas and composite
        // We trim first to find true center of content, then place on canvas
        const buffer = await image
            .trim() // Optional: trim transparency to ensure visual centering
            .resize({
                width: targetSize,
                height: targetSize,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

        fs.writeFileSync(filePath, buffer);
        console.log(`✨ Saved ${filename}`);

    } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
    }
}

async function main() {
    const files = fs.readdirSync(inputDir);
    for (const file of files) {
        await processFile(path.join(inputDir, file));
    }
}

main();
