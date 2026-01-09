
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H', // Using provided token
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function isolateDemo() {
    console.log('🧪 Isolating 5ml Demo to Clear/Metal-Roller/Black-Cap...');

    const productId = 'product-master-cyl-5ml';

    await client.patch(productId)
        .set({
            // 1. Clear Glass (GBCyl)
            glassOptions: [{ _type: 'reference', _ref: 'glass-cyl-5ml-gbcyl', _key: 'glass-cyl-5ml-gbcyl' }],

            // 2. Metal Roller (MtlRoll) - Matching the user's upload
            fitmentVariants: [{ _type: 'reference', _ref: 'fitment-cyl-5ml-mtlroll', _key: 'fitment-cyl-5ml-mtlroll' }],

            // 3. Black Shiny Cap (BlkSht)
            capOptions: [{ _type: 'reference', _ref: 'cap-std-blksht', _key: 'cap-std-blksht' }]
        })
        .commit();

    console.log('✅ Demo Isolated!');
}

isolateDemo().catch(console.error);
