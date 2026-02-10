
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function alignEmpire() {
    console.log('🚀 Aligning Empire Design with Modular Scrape Data...');

    // 1. Define Components for Empire 50ml
    const glasses = [{ name: 'Empire 50ml Clear Glass', base: 'Empire' }];
    const fitments = [
        { name: 'Reducer' },
        { name: 'Dropper' },
        { name: 'Bulb Sprayer' },
        { name: 'Spray Pump' },
        { name: 'Treatment Pump' }
    ];
    const caps = [
        { name: 'Black Faux Leather Cap' },
        { name: 'Shiny Copper Collar Cap' },
        { name: 'Shiny Silver Collar Cap' },
        { name: 'Matte Silver Collar Cap' },
        { name: 'Clear Overcap' }
    ];

    // 2. Upsert Components and collect Refs
    async function upsertComponent(type: string, data: any) {
        const doc = {
            _type: type,
            _id: `${type}-${data.name.toLowerCase().replace(/\s+/g, '-')}`,
            ...data
        };
        console.log(`  Upserting ${type}: ${data.name}...`);
        return client.createOrReplace(doc);
    }

    const glassRefs = await Promise.all(glasses.map(g => upsertComponent('glassOption', g)));
    const fitmentRefs = await Promise.all(fitments.map(f => upsertComponent('fitmentVariant', f)));
    const capRefs = await Promise.all(caps.map(c => upsertComponent('capOption', c)));

    // 3. Update Master Product
    const productId = 'product-gbemp50anspblk';
    console.log(`\n📦 Linking components to Product: ${productId}...`);

    await client.patch(productId)
        .set({
            title: 'Empire design 50 ml (Modular)',
            glassOptions: glassRefs.map(g => ({ _type: 'reference', _ref: g._id, _key: g._id })),
            fitmentVariants: fitmentRefs.map(f => ({ _type: 'reference', _ref: f._id, _key: f._id })),
            capOptions: capRefs.map(c => ({ _type: 'reference', _ref: c._id, _key: c._id })),
            defaultGlass: { _type: 'reference', _ref: glassRefs[0]._id }
        })
        .commit();

    console.log('✅ Empire design successfully modularized in Sanity.');
}

alignEmpire().catch(console.error);
