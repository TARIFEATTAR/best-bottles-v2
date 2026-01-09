
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

async function listComponents() {
    console.log('--- Listing Sanity Components ---');

    const glasses = await client.fetch('*[_type == "glassOption"]{name, _id}');
    glasses.forEach(g => console.log(`Group: Glass | Name: ${g.name} | ID: ${g._id}`));

    console.log('\n--- Cap Options ---');
    const caps = await client.fetch('*[_type == "capOption"]{name, _id}');
    caps.forEach(c => console.log(`Group: Cap | Name: ${c.name} | ID: ${c._id}`));

    console.log('\n--- Fitment Variants ---');
    const fitments = await client.fetch('*[_type == "fitmentVariant"]{name, _id}');
    fitments.forEach(f => console.log(`Group: Fitment | Name: ${f.name} | ID: ${f._id}`));
}

listComponents().catch(console.error);
