
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

async function checkImageCoverage() {
    console.log('--- Checking Image Coverage in Sanity ---');

    const productsWithImages = await client.fetch('count(*[_type == "product" && (defined(heroImage) || defined(defaultGlass))])');
    const totalProducts = await client.fetch('count(*[_type == "product"])');

    console.log(`Products with Images/Links: ${productsWithImages} / ${totalProducts}`);

    const sample = await client.fetch('*[_type == "product" && defined(defaultGlass)][0..2]{title, "glass": defaultGlass->name}');
    console.log('Sample Linked Products:');
    console.log(JSON.stringify(sample, null, 2));
}

checkImageCoverage().catch(console.error);
