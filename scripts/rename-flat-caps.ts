
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H', // Using provided token
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function renameFlatCaps() {
    console.log('📝 Renaming Caps to trigger "Flat" logic...');

    // Rename Black Matte -> Flat Black Cap
    await client.patch('cap-std-blkmt')
        .set({ name: 'Flat Black Cap' })
        .commit();

    // Rename White -> Flat White Cap
    await client.patch('cap-std-whtsht')
        .set({ name: 'Flat White Cap' })
        .commit();

    console.log('✅ Caps Renamed! "Includes Flat" logic will now work.');
}

renameFlatCaps().catch(console.error);
