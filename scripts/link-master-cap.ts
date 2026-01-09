
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import 'dotenv/config';

// Initialize Clients
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const sanity = createSanityClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

const BUCKET = 'bottle-images';
const FILENAME = '5mlCylinder-Black-Cap.png';
const SANITY_DOC_ID = 'cap-std-blksht';

async function linkMasterCap() {
    console.log(`🔗 Linking Master Cap: ${FILENAME}...`);

    // 1. Get Public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(FILENAME);
    const publicUrl = data.publicUrl;
    console.log(`   🌍 URL: ${publicUrl}`);

    // Verify it exists (HEAD request)
    const check = await fetch(publicUrl, { method: 'HEAD' });
    if (!check.ok) {
        console.error('❌ Error: Could not verify file existence. Did you upload it to the root of bottle-images bucket?');
        return;
    }

    // 2. Upload to Sanity
    try {
        const response = await fetch(publicUrl);
        const buffer = await response.arrayBuffer();
        const bufferImage = Buffer.from(buffer);

        const asset = await sanity.assets.upload('image', bufferImage, {
            filename: FILENAME
        });

        // 3. Patch Document
        await sanity.patch(SANITY_DOC_ID)
            .set({
                layerImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: asset._id }
                }
            })
            .commit();

        console.log(`✅ Success! Black Caps will now use the Master Image.`);
    } catch (e) {
        console.error('❌ Upload Failed:', e);
    }
}

linkMasterCap().catch(console.error);
