
import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Client (Must use Editor Token)
const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef',
    dataset: 'demo',
    token: process.env.SANITY_API_TOKEN,
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
    console.log('🚀 Starting Texture/Overlay Image Update...');

    // 1. Upload Texture
    // Reuse the amber glass photo as a "texture" for now, or use a specific seamless pattern if we had one.
    const amberPatternId = await uploadImage('amber-glass.png');
    const goldPatternId = await uploadImage('gold-cap.png');

    if (!amberPatternId || !goldPatternId) {
        console.error("Failed to upload assets. Aborting.");
        process.exit(1);
    }

    // 2. Fetch Options to find IDs
    const glassOptions = await client.fetch(`*[_type == "glassOption" && demoOnly == true]`);
    const capOptions = await client.fetch(`*[_type == "capOption" && demoOnly == true]`);

    // 3. Update Amber Glass - Set OVERLAY Image
    const amberOption = glassOptions.find((g: any) => g.name === 'Amber');
    if (amberOption) {
        console.log(`Updating Amber Glass Overlay (${amberOption._id})...`);
        await client.patch(amberOption._id)
            .set({
                overlayImage: { // Note: using overlayImage field for the bottle texture
                    _type: 'image',
                    asset: { _type: 'reference', _ref: amberPatternId }
                }
            })
            .commit();
        console.log("✅ Amber Glass Overlay updated.");
    } else {
        console.warn("⚠️ Amber Glass option not found.");
    }

    // 4. Update Gold Cap - Set OVERLAY Image
    const goldOption = capOptions.find((c: any) => c.name === 'Gold');
    if (goldOption) {
        console.log(`Updating Gold Cap Overlay (${goldOption._id})...`);
        await client.patch(goldOption._id)
            .set({
                overlayImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: goldPatternId }
                }
            })
            .commit();
        console.log("✅ Gold Cap Overlay updated.");
    } else {
        console.warn("⚠️ Gold Cap option not found.");
    }

    console.log("✨ Texture update complete!");
}

run();
