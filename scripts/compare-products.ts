
import { createClient } from '@sanity/client';
import 'dotenv/config';

const SANITY_PROJECT_ID = 'gv4os6ef';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H';

const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function compareProducts() {
    console.log('--- Comparing Empire vs Cylinder ---');

    const empire = await client.fetch('*[_type == "product" && slug.current == "gbemp50anspblk"][0]');
    console.log('Empire design 50 ml:');
    console.log(JSON.stringify(empire, null, 2));

    const cylinder = await client.fetch('*[_type == "product" && slug.current == "9ml-cylinder-design"][0]');
    if (!cylinder) {
        // Try another one
        const anyProduct = await client.fetch('*[_type == "product"][0]');
        console.log('\nAny other product found:');
        console.log(JSON.stringify(anyProduct, null, 2));
    } else {
        console.log('\n9ml Cylinder Design:');
        console.log(JSON.stringify(cylinder, null, 2));
    }
}

compareProducts().catch(console.error);
