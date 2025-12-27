
import { createClient } from '@sanity/client';
import axios from 'axios';

// Sanity Configuration
const PROJECT_ID = 'gv4os6ef';
const DATASET = 'production';
const TOKEN = 'skIh0rcb7rQH1HK9TTUWAZiEO1GynIAnFmwYL4DO236bH5w7tlK1rQ0tQnueYWtFZ1tlDZ2FFkdtZlEhfsj6V3fofITsgpZNIm7k6vh4zPjBBq2UiNGTYMNNCCZsgU0UV7nwAJruTIwfssEcA1rfve2dRmrYKIpuuX2dwjhk47JuKCLzRuxl';

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    token: TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

const CAP_OPTIONS = [
    { name: 'Shiny Gold Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnGl.png' },
    { name: 'Matte Gold Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattGl.png' },
    { name: 'Shiny Silver Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnSl.png' },
    { name: 'Matte Silver Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattSl.png' },
    { name: 'Black Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollBlkDot.png' },
    { name: 'White Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollWhite.png' },
    { name: 'Shiny Black Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnBlk.png' },
    { name: 'Pink Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollPnkDot.png' },
    { name: 'Silver Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollSlDot.png' },
    { name: 'Copper Matte Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollCu.png' },
];

const GLASS_OPTIONS = [
    { name: 'Clear Glass (Metal Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif' },
    { name: 'Clear Glass (Plastic Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9RollBlkDot.gif' },
    { name: 'Amber Glass (Metal Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylAmb9MtlRollShnGl.gif' },
    { name: 'Amber Glass (Plastic Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylAmb9RollShnGl.gif' },
    { name: 'Frosted Glass (Metal Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBTallCylFrst9MtlRollBlkDot.gif' },
    { name: 'Frosted Glass (Plastic Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBTallCylFrst9RollBlkDot.gif' },
    { name: 'Cobalt Glass (Metal Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylBlu9MtlRollBlkDot.gif' },
    { name: 'Cobalt Glass (Plastic Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylBlu9RollBlkDot.gif' },
    { name: 'Swirl Glass (Metal Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylSwrl9MtlRollBlkDot.gif' },
    { name: 'Swirl Glass (Plastic Roller)', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylSwrl9RollBlkDot.gif' },
];

async function uploadImageFromUrl(url: string) {
    console.log(`Uploading: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const asset = await client.assets.upload('image', buffer, {
        filename: url.split('/').pop(),
    });
    return asset._id;
}

async function seed() {
    try {
        console.log('--- Seeding Expanded Data to production ---');

        // 1. Upload Caps
        const capDocIds = [];
        for (const cap of CAP_OPTIONS) {
            const assetId = await uploadImageFromUrl(cap.url);
            const doc = await client.create({
                _type: 'capOption',
                name: cap.name,
                layerImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: assetId },
                },
                previewSwatch: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: assetId },
                }
            });
            console.log(`Created cap: ${cap.name} (${doc._id})`);
            capDocIds.push(doc._id);
        }

        // 2. Upload Glass variants
        const glassDocIds = [];
        for (const glass of GLASS_OPTIONS) {
            const assetId = await uploadImageFromUrl(glass.url);
            const doc = await client.create({
                _type: 'glassOption',
                name: glass.name,
                layerImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: assetId },
                },
                previewSwatch: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: assetId },
                },
                price: 0.75 // Standardize price for demo
            });
            console.log(`Created glass: ${glass.name} (${doc._id})`);
            glassDocIds.push(doc._id);
        }

        // 3. Update the Bottle Blueprint
        const BOTTLE_ID = '62669398-411c-4d71-b0fb-920d9563917e'; // Blue-Print
        await client
            .patch(BOTTLE_ID)
            .set({
                glassOptions: glassDocIds.map(id => ({ _type: 'reference', _ref: id, _key: id })),
                capOptions: capDocIds.map(id => ({ _type: 'reference', _ref: id, _key: id })),
            })
            .commit();

        console.log('--- Successfully Updated Bottle Model ---');
    } catch (err) {
        console.error('Seed failed:', err);
    }
}

seed();
