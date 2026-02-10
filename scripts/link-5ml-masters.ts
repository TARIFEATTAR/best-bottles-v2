
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import 'dotenv/config';

// Initialize Clients
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const sanity = createSanityClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H', // Hardcoded for reliability
    apiVersion: '2024-01-01',
    useCdn: false,
});

const BUCKET = 'bottle-images';

// The "Master Map" - Exact Filenames from User Screenshot
const MAPPING: Record<string, string> = {
    // GLASS
    '5ml-GBCylClr-Bottle.png': 'glass-cyl-5ml-gbcyl',
    '5ml-GBCylAmr-Bottle.png': 'glass-cyl-5ml-gbcylamb', // Handle "Amr" typo
    '5ml-GBCylBlu-Bottle.png': 'glass-cyl-5ml-gbcylblu',

    // FITMENTS
    '5ml-Roll-On-Bottle-Plastic.png': 'fitment-cyl-5ml-roll',
    '5ml-Roll-On-Bottle-Metal.png': 'fitment-cyl-5ml-mtlroll',

    // CAPS - Standard
    'Shiney-Black-RollOn-Cap-5ml.png': 'cap-std-blksht', // Handle "Shiney" typo
    'Shiney-Gold-RollOn-Cap-5ml.png': 'cap-std-glsh',
    'Shiney-Silver-RollOn-Cap-5ml.png': 'cap-std-slsh',

    'Matte-Gold-RollOn-Cap-5ml.png': 'cap-std-glmt',
    'Matte-Silver-RollOn-Cap-5ml.png': 'cap-std-slmt',
    'Matt-Silver-RollOn-Cap-5ml.png': 'cap-std-slmt', // Handle "Matt" typo

    '5ml-Flat-Blk-Cap.png': 'cap-std-blkmt',
    '5ml-Flat-Wht-Cap.png': 'cap-std-whtsht',
    'Copper-RollOn-Cap-5ml.png': 'cap-std-cop',

    // CAPS - New Patterned
    'Black-Dots-RollOn-Cap-5ml.png': 'cap-std-blkdot',
    'Pink-Dots-RollOn-Cap-5ml.png': 'cap-std-pnkdot',
};

async function linkAllMasters() {
    console.log('🔗 Starting Master Linker...');

    for (const [filename, docId] of Object.entries(MAPPING)) {
        await checkAndLink(filename, docId);
    }

    console.log('✨ Master Linker Complete!');
}

async function checkAndLink(filename: string, docId: string) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const publicUrl = data.publicUrl;

    const check = await fetch(publicUrl, { method: 'HEAD' });
    if (!check.ok) return; // Silent skip

    console.log(`   ✅ Found ${filename} -> Linking to ${docId}`);

    try {
        const response = await fetch(publicUrl);
        const buffer = await response.arrayBuffer();
        const bufferImage = Buffer.from(buffer);

        const asset = await sanity.assets.upload('image', bufferImage, { filename });

        await sanity.patch(docId)
            .set({
                layerImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
            })
            .commit();

        console.log(`      -> Linked successfully!`);
    } catch (e: any) {
        console.error(`      ❌ Error linking ${filename}:`, e.message);
    }
}

linkAllMasters().catch(console.error);
