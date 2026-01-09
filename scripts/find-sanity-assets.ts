
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

async function findEmpireAssets() {
    console.log('--- Searching for Empire Assets in Sanity ---');
    const assets = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename match "*Emp*"]{originalFilename, _id}');
    console.log(`Found ${assets.length} assets.`);
    assets.forEach(a => console.log(`ID: ${a._id} | Filename: ${a.originalFilename}`));
}

findEmpireAssets().catch(console.error);
