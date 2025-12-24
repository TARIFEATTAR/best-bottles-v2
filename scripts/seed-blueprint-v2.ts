
/**
 * Sanity Seeding Script for Blueprint Builder V2 Demo
 * 
 * Usage:
 *   SANITY_API_TOKEN=your_token_here npx tsx scripts/seed-blueprint-v2.ts
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIG ---
const PROJECT_ID = 'gv4os6ef'; // From .env
const DATASET = 'demo';
const TOKEN = process.env.SANITY_API_TOKEN;

const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/assets/blueprint');

if (!TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN environment variable is required.');
    process.exit(1);
}

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    token: TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false, // We need fresh data
});

async function uploadImage(filename: string) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    console.log(`Uploading ${filename}...`);
    return client.assets.upload('image', buffer, { filename });
}

async function main() {
    console.log('🚀 Starting Blueprint V2 Seeding...');

    try {
        // 1. Upload Assets
        console.log('\n--- Uploading Assets ---');
        const bottleOutlineAsset = await uploadImage('bottle-outline-with-cap.svg');
        const bottleOutlineNoCapAsset = await uploadImage('bottle-outline-no-cap.svg');
        const capOutlineAsset = await uploadImage('cap-outline.svg');
        const measurementsAsset = await uploadImage('measurements-overlay.svg');

        console.log('✅ Assets uploaded.');

        // 2. Create Options
        console.log('\n--- Creating Options ---');

        // Glass Options
        const glassOptions = [
            { id: 'glass-clear', name: 'Clear', colorHex: '#f0f4f8' },
            { id: 'glass-frosted', name: 'Frosted', colorHex: '#e8e8e8' },
            { id: 'glass-amber', name: 'Amber', colorHex: '#b87333' },
            { id: 'glass-cobalt', name: 'Cobalt', colorHex: '#1e40af' },
            { id: 'glass-emerald', name: 'Emerald', colorHex: '#047857' },
            { id: 'glass-swirl', name: 'Swirl', colorHex: '#c4b5a0' },
        ];

        const glassDocs = [];
        for (const opt of glassOptions) {
            const doc = await client.createOrReplace({
                _id: `demo-${opt.id}`,
                _type: 'glassOption',
                name: opt.name,
                colorHex: opt.colorHex,
                demoOnly: true,
                // Note: In a real app complexity, overlays might be specific per options, 
                // but here we just use the bottle outline for simplicity or maybe no overlay 
                // if the canvas handles the color. The schema asks for 'overlayImage'.
                // Since our demo dynamically colors the SVG, we might not strictly need distinct overlays 
                // for every color if we use the mask approach.
                // However, let's link the basic outline as a placeholder if needed.
                overlayImage: {
                    _type: 'image',
                    asset: { _ref: bottleOutlineNoCapAsset._id }
                }
            });
            glassDocs.push(doc);
            console.log(`Created Glass: ${opt.name}`);
        }

        // Roller Options
        const rollerOptions = [
            { id: 'roller-plastic', name: 'Plastic' },
            { id: 'roller-metal', name: 'Metal' },
        ];

        const rollerDocs = [];
        for (const opt of rollerOptions) {
            const doc = await client.createOrReplace({
                _id: `demo-${opt.id}`,
                _type: 'rollerOption',
                name: opt.name,
                demoOnly: true,
                overlayImage: {
                    _type: 'image',
                    asset: { _ref: bottleOutlineNoCapAsset._id } // Placeholder
                }
            });
            rollerDocs.push(doc);
            console.log(`Created Roller: ${opt.name}`);
        }

        // Cap Options
        const capOptions = [
            { id: 'cap-gold', name: 'Gold', finish: 'Polished' },
            { id: 'cap-silver', name: 'Silver', finish: 'Polished' },
            { id: 'cap-copper', name: 'Copper', finish: 'Brushed' },
            { id: 'cap-rose-gold', name: 'Rose Gold', finish: 'Polished' },
            { id: 'cap-black', name: 'Black', finish: 'Matte' },
            { id: 'cap-white', name: 'White', finish: 'Matte' },
        ];

        const capDocs = [];
        for (const opt of capOptions) {
            const doc = await client.createOrReplace({
                _id: `demo-${opt.id}`,
                _type: 'capOption',
                name: opt.name,
                finish: opt.finish,
                demoOnly: true,
                overlayImage: {
                    _type: 'image',
                    asset: { _ref: capOutlineAsset._id }
                }
            });
            capDocs.push(doc);
            console.log(`Created Cap: ${opt.name}`);
        }

        // 3. Create Bottle Model
        console.log('\n--- Creating Bottle Model ---');

        const bottleModel = await client.createOrReplace({
            _id: 'demo-bottle-blueprint-v2',
            _type: 'bottleModel',
            name: '9ml Roll-on (Blueprint V2)',
            demoOnly: true,
            dimensions: {
                heightWithCap: 83,
                heightWithoutCap: 70,
                diameter: 20,
                thread: '17-415'
            },
            outlineImage: {
                _type: 'image',
                asset: { _ref: bottleOutlineAsset._id }
            },
            measurementsOverlay: {
                _type: 'image',
                asset: { _ref: measurementsAsset._id }
            },
            glassOptions: glassDocs.map(d => ({ _type: 'reference', _ref: d._id, _key: d._id })),
            rollerOptions: rollerDocs.map(d => ({ _type: 'reference', _ref: d._id, _key: d._id })),
            capOptions: capDocs.map(d => ({ _type: 'reference', _ref: d._id, _key: d._id }))
        });

        console.log(`✅ Created Bottle Model: ${bottleModel.name}`);
        console.log('🎉 Seeding Complete!');

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

main();
