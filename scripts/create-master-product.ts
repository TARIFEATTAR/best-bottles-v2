
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function main() {
    console.log('🚀 Creating Master 5ml Cylinder Product...\n');

    const rollOnProduct = await client.fetch(`*[_id == "product-master-cyl-5ml"][0]{
        glassOptions,
        defaultGlass,
        capOptions
    }`);

    // Fetch all fitments and filter in JS
    const allFitments = await client.fetch(`*[_type == "fitmentVariant"]{ _id, name }`);
    const relevantFitments = allFitments.filter((f: any) =>
        f.name.includes('Cyl') && f.name.includes('5')
    );

    console.log(`Found ${relevantFitments.length} matching fitments.`);

    const masterProduct = {
        _id: 'product-master-cyl-5ml-combined',
        _type: 'product',
        title: '5ml Cylinder Master Collection',
        slug: { _type: 'slug', current: '5ml-cylinder-master' },
        basePrice: 0.55,
        sku: 'CYL5MASTER',

        defaultGlass: rollOnProduct?.defaultGlass,
        glassOptions: rollOnProduct?.glassOptions || [],
        capOptions: rollOnProduct?.capOptions || [],

        fitmentVariants: relevantFitments.map((f: any) => ({
            _type: 'reference',
            _ref: f._id,
            _key: f._id
        })),
    };

    await client.createOrReplace(masterProduct);
    console.log('✅ Created: 5ml Cylinder Master Collection (slug: 5ml-cylinder-master)');
}

main().catch(console.error);
