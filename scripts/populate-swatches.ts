
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
    console.log('🎨 Starting Swatch Population & Label Fix...');

    // 1. Fix the Misnamed Cap
    try {
        await client.patch('cap-std-slmt')
            .set({ name: 'Matte Silver Dots Cap' })
            .commit();
        console.log('✅ Renamed "Matte Silver Cap" to "Matte Silver Dots Cap"');
    } catch (e) {
        console.log('⚠️ Could not rename matte silver cap (maybe ID changed?)');
    }

    // 2. Populate Glass Swatches
    const glasses = await client.fetch(`*[_type == "glassOption"]`);
    for (const g of glasses) {
        // We set it even if it exists, to ensure it matches the new master images
        if (g.layerImage) {
            await client.patch(g._id).set({ previewSwatch: g.layerImage }).commit();
            console.log(`   🖌️  Updated Swatch for Glass: ${g.name}`);
        }
    }

    // 3. Populate Cap Swatches
    const caps = await client.fetch(`*[_type == "capOption"]`);
    for (const c of caps) {
        if (c.layerImage) {
            await client.patch(c._id).set({ previewSwatch: c.layerImage }).commit();
            console.log(`   🖌️  Updated Swatch for Cap: ${c.name}`);
        }
    }

    console.log('✨ All Done! Refresh the demo to see Real Photo Swatches.');
}

main().catch(console.error);
