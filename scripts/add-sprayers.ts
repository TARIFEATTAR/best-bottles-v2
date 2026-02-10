
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const sanity = createSanityClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

const BUCKET = 'bottle-images';

// Sprayer Color Sets: [Name, SKU Part, Pump File, Cap File]
const SPRAYERS = [
    { name: 'Black Mist Sprayer', skuPart: 'SpryBlk', pumpFile: 'GBCylBlu5SpryBlkSh.png', capFile: 'GBCylBlu5SpryBlk-Cap.png' },
    { name: 'Blue Mist Sprayer', skuPart: 'SpryBlu', pumpFile: 'GBCylBlu5SpryBluSh.png', capFile: 'GBCylBlu5SpryBluSh-Cap.png' },
    { name: 'Gold Shiny Sprayer', skuPart: 'SpryGlSh', pumpFile: 'GBCylBlu5SpryShineyGoldSh.png', capFile: 'GBCylBlu5SpryShineyGoldSh-Cap.png' },
    { name: 'Gold Matte Sprayer', skuPart: 'SpryGlMt', pumpFile: 'GBCylBlu5SpryMatteGoldSh.png', capFile: 'GBCylBlu5SpryMatteGoldSh-Cap.ng.png' },
    { name: 'Silver Matte Sprayer', skuPart: 'SprySlMt', pumpFile: 'GBCylBlu5SpryMatte-SilverSh.png', capFile: 'GBCylBlu5SpryMatte-SilverSh-Cap.png' },
];

async function uploadImageToSanity(filename: string): Promise<string | null> {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const publicUrl = data.publicUrl;

    const check = await fetch(publicUrl, { method: 'HEAD' });
    if (!check.ok) {
        console.log(`   ⚠️ File not found: ${filename}`);
        return null;
    }

    const response = await fetch(publicUrl);
    const buffer = await response.arrayBuffer();
    const bufferImage = Buffer.from(buffer);

    const asset = await sanity.assets.upload('image', bufferImage, { filename });
    return asset._id;
}

async function main() {
    console.log('🚀 Creating Colored Sprayer Fitments...\n');

    const fitmentIds: string[] = [];

    for (const spray of SPRAYERS) {
        const docId = `fitment-cyl-5ml-${spray.skuPart.toLowerCase()}`;
        console.log(`📦 Creating: ${spray.name} (${docId})`);

        // Upload Pump Image
        console.log(`   Uploading pump: ${spray.pumpFile}`);
        const pumpAssetId = await uploadImageToSanity(spray.pumpFile);

        // Upload Overcap Image
        console.log(`   Uploading overcap: ${spray.capFile}`);
        const capAssetId = await uploadImageToSanity(spray.capFile);

        // Create/Update the Fitment Document
        const doc: any = {
            _id: docId,
            _type: 'fitmentVariant',
            name: spray.name,
            skuPart: spray.skuPart,
            type: 'Spray',
        };

        if (pumpAssetId) {
            doc.layerImage = { _type: 'image', asset: { _type: 'reference', _ref: pumpAssetId } };
        }
        if (capAssetId) {
            doc.overcapImage = { _type: 'image', asset: { _type: 'reference', _ref: capAssetId } };
        }

        await sanity.createOrReplace(doc);
        fitmentIds.push(docId);
        console.log(`   ✅ Created!\n`);
    }

    // Update the 5ml Cylinder Master Product to include these new fitments
    console.log('🔗 Updating 5ml Cylinder Master Product with new sprayer fitments...');

    // First, get the current product
    const product = await sanity.fetch(`*[_id == "product-master-cyl-5ml"][0]`);
    if (product) {
        // Keep existing fitments (rollers) and add new sprayers
        const existingFitments = product.fitmentVariants || [];
        const newFitmentRefs = fitmentIds.map(id => ({ _type: 'reference', _ref: id, _key: id }));

        // Merge without duplicates
        const allFitmentRefs = [...existingFitments];
        for (const ref of newFitmentRefs) {
            if (!allFitmentRefs.some(f => f._ref === ref._ref)) {
                allFitmentRefs.push(ref);
            }
        }

        await sanity.patch('product-master-cyl-5ml')
            .set({ fitmentVariants: allFitmentRefs })
            .commit();

        console.log(`✅ Added ${fitmentIds.length} sprayer fitments to product.\n`);
    }

    console.log('✨ Sprayer Setup Complete!');
}

main().catch(console.error);
