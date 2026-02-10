
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);

async function analyze(file) {
    const image = sharp(file);
    const metadata = await image.metadata();

    // Get trimmed bounds
    const { data, info } = await image.trim().toBuffer({ resolveWithObject: true });

    console.log(`\nFile: ${path.basename(file)}`);
    console.log(`Canvas: ${metadata.width} x ${metadata.height}`);
    console.log(`Content: ${info.width} x ${info.height}`);
    console.log(`Trim Offset: -${info.trimOffsetLeft}, -${info.trimOffsetTop}`);
}

(async () => {
    for (const f of files) {
        await analyze(f);
    }
})();
