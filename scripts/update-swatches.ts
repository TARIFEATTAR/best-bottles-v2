
import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Client
const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef',
    dataset: 'demo',
    token: process.env.SANITY_API_TOKEN, // Requires Editor token
    useCdn: false,
    apiVersion: '2024-01-01',
});

async function uploadImage(fileName: string) {
    const filePath = join(__dirname, 'assets', fileName);
    console.log(`Uploading ${fileName}...`);
    try {
        const asset = await client.assets.upload('image', createReadStream(filePath), {
            filename: fileName,
        });
        console.log(`✅ Uploaded ${fileName}: ${asset._id}`);
        return asset._id;
    } catch (err) {
        console.error(`❌ Failed to upload ${fileName}:`, err);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Swatch Image Update...');

    // 1. Upload Images
    const amberAssetId = await uploadImage('amber-glass.png'); // Use for Amber Glass
    const goldAssetId = await uploadImage('gold-cap.png');     // Use for Gold Cap
    // We'll use the black cap from the amber-black-cap image if needed, but for now let's just do these two key ones

    if (!amberAssetId || !goldAssetId) {
        console.error("Failed to upload assets. Aborting.");
        process.exit(1);
    }

    // 2. Fetch Options to find IDs
    const glassOptions = await client.fetch(`*[_type == "glassOption" && demoOnly == true]`);
    const capOptions = await client.fetch(`*[_type == "capOption" && demoOnly == true]`);

    // 3. Update Amber Glass
    const amberOption = glassOptions.find((g: any) => g.name === 'Amber');
    if (amberOption) {
        console.log(`Updating Amber Glass (${amberOption._id})...`);
        await client.patch(amberOption._id)
            .set({
                swatchImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: amberAssetId }
                }
            })
            .commit();
        console.log("✅ Amber Glass updated.");
    } else {
        console.warn("⚠️ Amber Glass option not found.");
    }

    // 4. Update Gold Cap
    const goldOption = capOptions.find((c: any) => c.name === 'Gold');
    if (goldOption) {
        console.log(`Updating Gold Cap (${goldOption._id})...`);
        await client.patch(goldOption._id)
            .set({
                swatchImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: goldAssetId }
                }
            })
            .commit();
        console.log("✅ Gold Cap updated.");
    } else {
        console.warn("⚠️ Gold Cap option not found.");
    }

    console.log("✨ Swatch update complete!");
}

run();
