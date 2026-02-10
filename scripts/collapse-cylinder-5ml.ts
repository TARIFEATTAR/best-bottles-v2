
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H', // Using provided token
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function collapseCylinder5ml() {
    console.log('🚀 Collapsing 5ml Cylinder SKUs into ONE Master Product...');

    // 1. Define the Master Product
    const masterProduct = {
        _type: 'product',
        title: '5ml Cylinder Collection',
        slug: { _type: 'slug', current: '5ml-cylinder-collection' },
        description: 'The versatile 5ml cylinder bottle, perfect for serums, perfumes, and essential oils. Available in Amber, Cobalt, and Clear glass with multiple applicator options.',
        basePrice: 0.45,
        sku: 'MASTER-CYL-5ML' // The "Base" SKU
    };

    // 2. Define the Variants (Glass)
    const glassFinishes = [
        { name: 'Clear Glass', skuPart: 'GBCyl', priceMod: 0 },
        { name: 'Amber Glass', skuPart: 'GBCylAmb', priceMod: 0.10 },
        { name: 'Cobalt Blue Glass', skuPart: 'GBCylBlu', priceMod: 0.15 }
    ];

    // 3. Define Fitments
    const fitments = [
        { name: 'Plastic Roller', skuPart: 'Roll', type: 'Roller' },
        { name: 'Metal Roller', skuPart: 'MtlRoll', type: 'Roller' },
        { name: 'Fine Mist Sprayer', skuPart: 'Spry', type: 'Spray' }
    ];

    // 4. Create Glass Option Docs
    const glassRefs = [];
    for (const finish of glassFinishes) {
        const doc = await client.createOrReplace({
            _id: `glass-cyl-5ml-${finish.skuPart.toLowerCase()}`,
            _type: 'glassOption',
            name: finish.name,
            skuPart: finish.skuPart,
            priceModifier: finish.priceMod
        });
        glassRefs.push(doc._id);
        console.log(`  ✅ Created Glass Option: ${finish.name}`);
    }

    // 5. Create Fitment Docs
    const fitmentRefs = [];
    for (const fit of fitments) {
        const doc = await client.createOrReplace({
            _id: `fitment-cyl-5ml-${fit.skuPart.toLowerCase()}`,
            _type: 'fitmentVariant',
            name: fit.name,
            skuPart: fit.skuPart,
            type: fit.type
        });
        fitmentRefs.push(doc._id);
        console.log(`  ✅ Created Fitment: ${fit.name}`);
    }

    // 6. Create Cap Docs (Standard Set - Reusing standard caps if possible, or creating new specific ones)
    // For 5ml, we likely use the same caps as 9ml (13-415 neck?). 
    // I'll create generic "Standard Cap" options that can be shared if the neck size is the same, 
    // but for safety I'll prefix them with 'cap-std' which we used for 9ml.
    const caps = [
        { name: 'Shiny Gold Cap', skuPart: 'GlSh' },
        { name: 'Matte Gold Cap', skuPart: 'GlMt' },
        { name: 'Shiny Silver Cap', skuPart: 'SlSh' },
        { name: 'Matte Silver Cap', skuPart: 'SlMt' },
        { name: 'Black Shiny Cap', skuPart: 'BlkSht' }, // Note: check capitalization in your images "BlkSht" vs "BlkSh"
        { name: 'Black Matte Cap', skuPart: 'BlkMt' },
        { name: 'White Cap', skuPart: 'WhtSht' },
        { name: 'Copper Cap', skuPart: 'Cop' },
        { name: 'Black Dots Cap', skuPart: 'BlkDot' },
        { name: 'Pink Dots Cap', skuPart: 'PnkDot' }
    ];

    const capRefs = [];
    for (const cap of caps) {
        const doc = await client.createOrReplace({
            _id: `cap-std-${cap.skuPart.toLowerCase()}`,
            _type: 'capOption',
            name: cap.name,
            skuPart: cap.skuPart
        });
        capRefs.push(doc._id);
    }
    console.log(`  ✅ Created/Updated ${caps.length} Standard Caps`);

    // 7. Create/Update Master Product
    const createdProduct = await client.createOrReplace({
        _id: 'product-master-cyl-5ml',
        ...masterProduct,
        defaultGlass: { _type: 'reference', _ref: glassRefs[0] }, // Default to Clear
        glassOptions: glassRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        fitmentVariants: fitmentRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        capOptions: capRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        categories: [
            { _type: 'reference', _ref: 'category-travel-samples', _key: 'travel' }
        ]
    });

    console.log(`\n🎉 MASTER PRODUCT CREATED: ${createdProduct.title} (${createdProduct._id})`);
}

collapseCylinder5ml().catch(console.error);
