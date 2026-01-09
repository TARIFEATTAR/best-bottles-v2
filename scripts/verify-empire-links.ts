
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function verifyEmpire() {
    console.log('--- Verifying Empire Modular Links ---');
    const query = `*[_type == "product" && title match "Empire" && title match "Modular"][0]{
        title,
        "glass": glassOptions[]->name,
        "caps": capOptions[]->name,
        "fitments": fitmentVariants[]->name,
        "categories": categories[]->title
    }`;
    const data = await client.fetch(query);
    console.log(JSON.stringify(data, null, 2));
}

verifyEmpire().catch(console.error);
