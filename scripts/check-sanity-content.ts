
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

async function checkSanity() {
    console.log('--- Checking Sanity Documents ---');

    const productCount = await client.fetch('count(*[_type == "product"])');
    console.log(`Products: ${productCount}`);

    const glassCount = await client.fetch('count(*[_type == "glassOption"])');
    console.log(`Glass Options: ${glassCount}`);

    const capCount = await client.fetch('count(*[_type == "capOption"])');
    console.log(`Cap Options: ${capCount}`);

    const fitmentCount = await client.fetch('count(*[_type == "fitmentVariant"])');
    console.log(`Fitment Variants: ${fitmentCount}`);

    console.log('\n--- Checking Empire design 50 ml ---');
    const empire = await client.fetch('*[_type == "product" && slug.current == "gbemp50anspblk"][0]{..., "defaultGlass": defaultGlass->, "defaultCap": defaultCap->}');
    console.log(JSON.stringify(empire, null, 2));

    console.log('\n--- Checking a few glass options ---');
    const glasses = await client.fetch('*[_type == "glassOption"][0..2]');
    console.log(JSON.stringify(glasses, null, 2));
}

checkSanity().catch(console.error);
