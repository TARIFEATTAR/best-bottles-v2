
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function collapseCylinder9ml() {
    console.log('🚀 Collapsing 100+ Cylinder 9ml SKUs into ONE Master Product...');

    // 1. Define the Master Product
    const masterProduct = {
        _type: 'product',
        title: '9ml Cylinder Roll-on Application',
        slug: { _type: 'slug', current: '9ml-cylinder-roll-on-collection' },
        description: 'The industry standard 9ml cylinder bottle, available in 5 premium glass finishes and multiple cap styles.',
        basePrice: 0.50, // Base price for clear/plastic
        sku: 'MASTER-CYL-9ML'
    };

    // 2. Define the Variants (Glass)
    const glassFinishes = [
        { name: 'Clear Glass', skuPart: 'GBCyl', priceMod: 0 },
        { name: 'Amber Glass', skuPart: 'GBCylAmb', priceMod: 0.10 },
        { name: 'Cobalt Glass', skuPart: 'GBCylBlu', priceMod: 0.15 },
        { name: 'Frosted Glass', skuPart: 'GBCylFrst', priceMod: 0.12 },
        { name: 'Swirl Glass', skuPart: 'GBCylSwrl', priceMod: 0.20 }
    ];

    // 3. Define Fitments
    const fitments = [
        { name: 'Plastic Roller', skuPart: 'Roll', type: 'roller' },
        { name: 'Metal Roller', skuPart: 'MtlRoll', type: 'roller' }
    ];

    // 4. Create Glass Option Docs
    const glassRefs = [];
    for (const finish of glassFinishes) {
        // We'll use a placeholder image for now, to be replaced by the sync script
        const doc = await client.createOrReplace({
            _id: `glass-cyl-9ml-${finish.skuPart.toLowerCase()}`,
            _type: 'glassOption',
            name: finish.name,
            priceModifier: finish.priceMod
        });
        glassRefs.push(doc._id);
        console.log(`  ✅ Created Glass Option: ${finish.name}`);
    }

    // 5. Create Fitment Docs
    const fitmentRefs = [];
    for (const fit of fitments) {
        const doc = await client.createOrReplace({
            _id: `fitment-cyl-9ml-${fit.skuPart.toLowerCase()}`,
            _type: 'fitmentVariant',
            name: fit.name,
            type: fit.type
        });
        fitmentRefs.push(doc._id);
        console.log(`  ✅ Created Fitment: ${fit.name}`);
    }

    // 6. Create Cap Docs (Standard Set)
    const caps = [
        'Shiny Gold', 'Matte Gold', 'Shiny Silver', 'Matte Silver',
        'Black Shiny', 'Black Matte', 'White', 'Copper', 'Black Dot', 'Pink Dot'
    ];
    const capRefs = [];
    for (const cap of caps) {
        const doc = await client.createOrReplace({
            _id: `cap-std-${cap.toLowerCase().replace(/\s+/g, '-')}`,
            _type: 'capOption',
            name: `${cap} Cap`
        });
        capRefs.push(doc._id);
    }
    console.log(`  ✅ Created ${caps.length} Standard Caps`);

    // 7. Create/Update Master Product
    const createdProduct = await client.createOrReplace({
        _id: 'product-master-cyl-9ml',
        ...masterProduct,
        defaultGlass: { _type: 'reference', _ref: glassRefs[0] },
        glassOptions: glassRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        fitmentVariants: fitmentRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        capOptions: capRefs.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        categories: [
            { _type: 'reference', _ref: 'category-travel-samples', _key: 'travel' }
        ]
    });

    console.log(`\n🎉 MASTER PRODUCT CREATED: ${createdProduct.title} (${createdProduct._id})`);

    // 8. (Optional) Soft-delete old individual SKUs? 
    // We won't delete yet to be safe, but we can tag them as "legacy".
}

collapseCylinder9ml().catch(console.error);
