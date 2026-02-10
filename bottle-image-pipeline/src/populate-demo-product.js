import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01'
});

async function populateDemoProduct() {
    console.log('🚀 Populating Ultimate 5ml Amber Product...');

    // 1. Fetch Specific Components Logic
    // We want specifically the components for the 5ml Amber Cylinder

    // Glass: Just the 5ml Amber Cylinder
    const glassOptions = await client.fetch(`*[_type == "glassOption" && skuPart match "GBCylAmb5*"]{_id, skuPart, name}`);

    // Caps: Fetch Standard Caps (for Rollers) AND Flat Caps AND Overcaps (if defined as caps)
    // Note: Spray "Overcaps" are usually linked to the fitment, but if you have distinct cap docs for them, include them.
    const capOptions = await client.fetch(`*[_type == "capOption" && (skuPart match "*5*" || skuPart match "*Flat*")]{_id, skuPart, name}`);

    // Fitments: Fetch ALL mechanisms (Rollers, Sprayers, Plugs)
    const fitmentVariants = await client.fetch(`*[_type == "fitmentVariant"]{_id, skuPart, name, type}`);

    // ---------------------------------------------------------
    // DEDUPLICATION LOGIC
    // ---------------------------------------------------------
    // We likely have multiple docs for the same physical component due to the SKU-based sync.
    // We need to group them by a "unique identifier" (like the base SKU part) and pick one.

    const getUniqueComponents = (items, keyFn) => {
        const seen = new Set();
        return items.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    // 1. DEDUPLICATE GLASS
    // They are all "5ml Amber Cylinder", so we likely just want 1.
    // We'll group by the first 9 chars of name/SKU or just take the first one if they are truly identical.
    // Let's rely on the "Glass: GBCylAmb5" prefix.
    const uniqueGlass = getUniqueComponents(glassOptions, (g) => {
        // Example SKU: GBCylAmb5BlkSht -> Base: GBCylAmb5 (first 9 chars)
        // Adjust substring length based on your actual SKU structure for "Glass Bottle Cylinder Amber 5ml"
        return g.skuPart ? g.skuPart.substring(0, 9) : g._id;
    });

    // 2. DEDUPLICATE CAPS
    // Group by Name or simplified SKU.
    // Example: "Black Matte Cap" should appear once.
    const uniqueCaps = getUniqueComponents(capOptions, (c) => c.name || c.skuPart);

    // 3. DEDUPLICATE FITMENTS (Aggressive)
    // We only want unique MECHANISMS. e.g. "Metal Roller", "Plastic Roller", "Gold Mist Sprayer", etc.
    // We shouldn't care about the SKU suffix for the viewer.
    const uniqueFitments = getUniqueComponents(fitmentVariants, (f) => {
        // Key: Type + Name (first 15 chars to ignore minor variations)
        const type = f.type || 'Unknown';
        const name = (f.name || '').substring(0, 15);
        return `${type}-${name}`;
    });


    console.log(`\n📦 Deduplicated Components:`);
    console.log(`   - Glass: ${glassOptions.length} -> ${uniqueGlass.length} (e.g., ${uniqueGlass[0]?.name})`);
    console.log(`   - Caps: ${capOptions.length} -> ${uniqueCaps.length}`);
    console.log(`   - Fitments: ${fitmentVariants.length} -> ${uniqueFitments.length}`);

    // ---------------------------------------------------------

    // 2. Define the Demo Product ID
    const DEMO_PRODUCT_ID = 'demo-5ml-amber-ultimate';

    // 3. Construct References using UNIQUE lists
    const glassRefs = uniqueGlass.map(g => ({ _type: 'reference', _ref: g._id, _key: g._id }));
    const capRefs = uniqueCaps.map(c => ({ _type: 'reference', _ref: c._id, _key: c._id }));
    const fitmentRefs = uniqueFitments.map(f => ({ _type: 'reference', _ref: f._id, _key: f._id }));

    // 4. Create the Master Product
    await client.createOrReplace({
        _id: DEMO_PRODUCT_ID,
        _type: 'product',
        title: '5ml Amber Cylinder Collection',
        slug: { _type: 'slug', current: '5ml-amber-collection' },
        basePrice: 1.25,
        sku: '5ML-AMB-COLL',

        defaultGlass: glassRefs.length > 0 ? { _type: 'reference', _ref: uniqueGlass[0]._id } : undefined,

        glassOptions: glassRefs,
        capOptions: capRefs,
        fitmentVariants: fitmentRefs,

        description: 'The ultimate configurator for the 5ml Amber Cylinder. Choose between Roller, Sprayer, or Flat Cap.'
    });

    console.log(`\n✅ Ultimate Product Created!`);
    console.log(`👉 View it at: http://localhost:5173/product/5ml-amber-collection`);
}

populateDemoProduct();
