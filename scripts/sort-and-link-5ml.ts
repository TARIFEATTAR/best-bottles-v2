
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

async function sortAndLink5ml() {
    console.log('🕵️‍♀️ Starting 5ml Asset Detective...');

    // 1. Fetch all files from Supabase bucket root
    const { data: files, error } = await supabase.storage.from(BUCKET).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });

    if (error || !files) {
        console.error('Error listing files:', error);
        return;
    }

    console.log(`📂 Found ${files.length} files in bucket.`);

    // 2. Classify and Link
    for (const file of files) {
        const name = file.name;
        // Example: "1. GBCylAmb5WhtSht-Layer2.png" (Bottle)
        // Example: "1. GBCylAmb5WhtSht-Layer4.png" (Cap/Fitment)

        // Skip non-pngs
        if (!name.endsWith('.png')) continue;

        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

        // A. DETECT BOTTLES (Layer 2 seems to be the standard bottle layer based on user info)
        if (name.includes('Layer2') || name.includes('Layer3')) {
            // Is it Amber, Clear, or Blue?
            if (name.includes('GBCylAmb')) {
                console.log(`   🏺 Found Amber Bottle: ${name}`);
                await uploadImageToSanity('glass-cyl-5ml-gbcylamb', publicUrl);
            } else if (name.includes('GBCylBlu')) {
                console.log(`   🏺 Found Cobalt Bottle: ${name}`);
                await uploadImageToSanity('glass-cyl-5ml-gbcylblu', publicUrl);
            } else if (name.includes('GBCyl') && !name.includes('Amb') && !name.includes('Blu')) {
                // Assuming GBCyl... without Amb/Blu is Clear
                console.log(`   🏺 Found Clear Bottle: ${name}`);
                await uploadImageToSanity('glass-cyl-5ml-gbcyl', publicUrl);
            }
        }

        // B. DETECT CAPS (Look for SKU parts in filename)
        if (name.toLowerCase().includes('layer')) {
            // Logic: If filename contains "BlkSht" (Black Shiny), link to that cap option
            await checkAndLinkCap(name, 'BlkSht', 'cap-std-blksht', publicUrl);
            await checkAndLinkCap(name, 'BlkMt', 'cap-std-blkmt', publicUrl);
            await checkAndLinkCap(name, 'GlSh', 'cap-std-glsh', publicUrl);
            await checkAndLinkCap(name, 'GlMt', 'cap-std-glmt', publicUrl);
            await checkAndLinkCap(name, 'SlSh', 'cap-std-slsh', publicUrl);
            await checkAndLinkCap(name, 'SlMt', 'cap-std-slmt', publicUrl);
            await checkAndLinkCap(name, 'WhtSht', 'cap-std-whtsht', publicUrl);
            await checkAndLinkCap(name, 'Cop', 'cap-std-cop', publicUrl);
        }

        // C. DETECT FITMENTS
        if (name.toLowerCase().includes('spray') || name.toLowerCase().includes('spry')) {
            // It's a sprayer
            console.log(`   🔫 Found Sprayer: ${name}`);
            await uploadImageToSanity('fitment-cyl-5ml-spry', publicUrl);
        } else if (name.toLowerCase().includes('roll') && !name.toLowerCase().includes('mtl')) {
            // Plastic Roller
            console.log(`   ⚪ Found Plastic Roller: ${name}`);
            await uploadImageToSanity('fitment-cyl-5ml-roll', publicUrl);
        } else if (name.toLowerCase().includes('mtlroll')) {
            // Metal Roller
            console.log(`   🔘 Found Metal Roller: ${name}`);
            await uploadImageToSanity('fitment-cyl-5ml-mtlroll', publicUrl);
        }
    }

    console.log('✨ All Assets Linked!');
}

async function checkAndLinkCap(filename, skuPart, sanityId, url) {
    // Only link if the filename explicitly contains the cap SKU part AND it's a specific layer known to be separate
    // For safety, we can just check if it contains the text. 
    // BUT we must avoid the bottle layer (Layer2) which ALSO contains the full SKU.
    if (filename.includes(skuPart) && !filename.includes('Layer2') && !filename.includes('bottle')) {
        console.log(`   🧢 Found Cap (${skuPart}): ${filename}`);
        await uploadImageToSanity(sanityId, url);
    }
}

async function uploadImageToSanity(documentId, imageUrl) {
    try {
        // Fetch the image blob
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const bufferImage = Buffer.from(buffer);

        // Upload to Sanity Asset
        const asset = await sanity.assets.upload('image', bufferImage, {
            filename: documentId
        });

        // Patch the Document
        await sanity.patch(documentId)
            .set({
                layerImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: asset._id }
                }
            })
            .commit();

        console.log(`      -> Linked to Sanity Doc: ${documentId}`);
    } catch (e) {
        console.error(`      -> Error linking ${documentId}:`, e.message);
    }
}

sortAndLink5ml().catch(console.error);
