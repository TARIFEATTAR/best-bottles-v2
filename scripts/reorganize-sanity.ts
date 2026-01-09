
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

const inventoryPath = path.resolve('./inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

const COLLECTIONS = [
    { name: 'The Perfumery Portfolio', slug: 'perfumery', description: 'Exquisite sprayers, atomizers, and bulb spray bottles for fine fragrances.' },
    { name: 'The Apothecary Collection', slug: 'apothecary', description: 'Precision droppers and reducer bottles for oils, serums, and tinctures.' },
    { name: 'The Travel & Sample Set', slug: 'travel-samples', description: 'Compact roll-ons and vials perfect for samples and on-the-go use.' },
    { name: 'The Decorative Series', slug: 'decorative', description: 'Unique artistic designs including Heart, Tola, and Tassel bottles.' }
];

async function setupCollectionsAndLinks() {
    console.log('🚀 Organizing Sanity into Collections & Master Designs...');

    // 1. Create Collections (Categories)
    const collectionMap: Record<string, string> = {};
    for (const coll of COLLECTIONS) {
        const doc = await client.createOrReplace({
            _type: 'category',
            _id: `category-${coll.slug}`,
            title: coll.name,
            slug: { _type: 'slug', current: coll.slug },
            description: coll.description
        });
        collectionMap[coll.slug] = doc._id;
        console.log(`  ✅ Collection Created: ${coll.name}`);
    }

    // 2. Identify and Update Master Products
    console.log('\n📦 Tagging and Categorizing Products...');
    const products = await client.fetch('*[_type == "product"]{_id, title, sku, description}');

    for (const p of products) {
        const text = (p.title + " " + (p.description || "")).toLowerCase();
        const tags: string[] = [];
        const categoryRefs: any[] = [];

        // Logic-based categorization
        if (text.includes("spray") || text.includes("atomizer")) {
            categoryRefs.push({ _type: 'reference', _ref: collectionMap['perfumery'], _key: 'perfumery' });
            tags.push('Fragrance', 'Sprayer');
        }
        if (text.includes("dropper") || text.includes("reducer")) {
            categoryRefs.push({ _type: 'reference', _ref: collectionMap['apothecary'], _key: 'apothecary' });
            tags.push('Essential Oils', 'Dropper');
        }
        if (text.includes("roll-on") || text.includes("roller") || text.includes("vial") || text.includes("9ml")) {
            categoryRefs.push({ _type: 'reference', _ref: collectionMap['travel-samples'], _key: 'travel-samples' });
            tags.push('Roll-on', 'Sample');
        }
        if (text.includes("heart") || text.includes("tassel") || text.includes("tola")) {
            categoryRefs.push({ _type: 'reference', _ref: collectionMap['decorative'], _key: 'decorative' });
            tags.push('Exclusive', 'Decorative');
        }

        if (categoryRefs.length > 0) {
            console.log(`  📝 Updating Product: ${p.title} -> [${tags.join(', ')}]`);
            await client.patch(p._id)
                .set({
                    categories: categoryRefs,
                    tags: tags,
                    status: 'product_published'
                })
                .commit();
        }
    }

    console.log('\n✨ Sanity hierarchy successfully rebuilt!');
}

setupCollectionsAndLinks().catch(console.error);
