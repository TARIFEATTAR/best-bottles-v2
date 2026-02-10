
import { createClient } from '@sanity/client';
import 'dotenv/config';

const SANITY_PROJECT_ID = 'gv4os6ef';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = 'skIh0rcb7rQH1HK9TTUWAZiEO1GynIAnFmwYL4DO236bH5w7tlK1rQ0tQnueYWtFZ1tlDZ2FFkdtZlEhfsj6V3fofITsgpZNIm7k6vh4zPjBBq2UiNGTYMNNCCZsgU0UV7nwAJruTIwfssEcA1rfve2dRmrYKIpuuX2dwjhk47JuKCLzRuxl';

const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function findEmpireComponents() {
    console.log('--- Searching for Empire components ---');

    const glasses = await client.fetch('*[(_type == "glassOption" || _type == "capOption" || _type == "fitmentVariant") && (name match "Empire*" || title match "Empire*" || label match "Empire*")]');
    console.log(`Found ${glasses.length} potential components:`);
    console.log(JSON.stringify(glasses, null, 2));
}

findEmpireComponents().catch(console.error);
