import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01'
});

const CSV_PATH = path.join(process.cwd(), 'uploaded_clean_map.csv');

// --- HELPER: Intelligent Rename (Ported from PS Script) ---
function formatCleanSku(raw) {
    if (!raw) return "UNKNOWN";
    let s = raw;
    s = s.replace(/GBCyl/g, "GB-CYL-");
    s = s.replace(/Amb5/g, "AMB-05ML-");
    s = s.replace(/MtlRoll/g, "FIT-MTL-RLL-");
    s = s.replace(/PlasRoll/g, "FIT-PLS-RLL-");
    s = s.replace(/Spry/g, "FIT-SPRY-");
    s = s.replace(/BlkSht/g, "BLK-SHT");
    s = s.replace(/BlkSh/g, "BLK-SHY");
    s = s.replace(/BlkMt/g, "BLK-MAT");
    s = s.replace(/SlSh/g, "SLV-SHY");
    s = s.replace(/SlMt/g, "SLV-MAT");
    s = s.replace(/GlSh/g, "GLD-SHY");
    s = s.replace(/GlMt/g, "GLD-MAT");
    s = s.replace(/WhtSh/g, "WHT-SHY");
    s = s.replace(/WhtMt/g, "WHT-MAT");
    s = s.replace(/-+/g, "-");
    s = s.replace(/^-|-$/g, "");
    return s.toUpperCase();
}

function getFitmentCode(sku) {
    if (sku.includes('Spry')) {
        if (sku.includes('Blk')) return 'SPRY-BLK-SHY';
        if (sku.includes('Blu')) return 'SPRY-BLU-MAT';
        if (sku.includes('Gl')) return sku.includes('Mt') ? 'SPRY-GLD-MAT' : 'SPRY-GLD-SHY';
        if (sku.includes('Sl')) return sku.includes('Mt') ? 'SPRY-SLV-MAT' : 'SPRY-SLV-SHY';
        return 'SPRY-STD';
    }
    if (sku.includes('Roll')) {
        if (sku.includes('Mtl') || sku.includes('Metal')) return 'RLL-MTL';
        return 'RLL-PLS';
    }
    return 'UNK';
}

async function setupCleanDemo() {
    console.log('🏗️  Building Clean Architecture from CSV...');

    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const { data } = Papa.parse(csvContent, { header: true });

    const glasses = new Map();
    const fitments = new Map();
    const caps = new Map();

    // STRICT ZERO OFFSET POLICY
    // We rely on the source PSDs being "Pre-Aligned" (Assembled View).
    const ZERO_OFF_X = 0;
    const ZERO_OFF_Y = 0;

    console.log(`📊 Total rows in CSV: ${data.length}`);

    for (const row of data) {
        if (!row.SKU) continue;

        // DEBUG: Log spray rows specifically
        if (row.SKU.includes('Spry')) {
            console.log(`🔥 Processing SPRAY row: ${row.SKU}`);
            console.log(`   Fitment_URL: ${row.Fitment_URL ? 'YES' : 'NO'}`);
            console.log(`   Overcap_URL: ${row.Overcap_URL ? 'YES' : 'NO'}`);
        }

        // --- GLASS ---
        if (row.Bottle_URL) {
            let glassKey = null;
            let glassName = "";
            let glassType = row.SKU.includes('Spry') ? 'SPRY' : 'ROLL';

            if (row.SKU.includes('Amb')) { glassKey = `GB-CYL-AMB-05ML-${glassType}`; glassName = '5ml Amber Cylinder'; }
            else if (row.SKU.includes('Blu')) { glassKey = `GB-CYL-BLU-05ML-${glassType}`; glassName = '5ml Blue Cylinder'; }
            else if (row.SKU.includes('Clr') || !row.SKU.includes('Amb') && !row.SKU.includes('Blu')) {
                // Default to Clear if no other color specified
                glassKey = `GB-CYL-CLR-05ML-${glassType}`;
                glassName = '5ml Clear Cylinder';
            }

            if (glassKey) {
                if (!glasses.has(glassKey)) {
                    glasses.set(glassKey, {
                        _id: `glass-${glassKey}`,
                        _type: 'glassOption',
                        name: glassName,
                        skuPart: glassKey,
                        image_url: row.Bottle_URL,
                        hexColor: glassName.includes('Amber') ? '#9E5826' : glassName.includes('Blue') ? '#1C3D82' : '#E8E8E8',
                        priceModifier: glassName.includes('Clear') ? 0 : 0.15
                    });
                }
            }
        }

        // --- FITMENTS (ROLLERS & SPRAYERS) ---
        if (row.Fitment_URL) {
            let type = 'roller';
            let fitmentName = 'Fitment';
            if (row.SKU.includes('Roll')) {
                if (row.SKU.includes('Mtl') || row.SKU.includes('Metal')) { type = 'roller'; fitmentName = 'Metal Roller'; }
                else { type = 'roller'; fitmentName = 'Plastic Roller'; }
            }
            // Fix: Check strictly for 'Spry' and capture distinct finishes (Matte vs Shiny, Colors)
            if (row.SKU.includes('Spry')) {
                type = 'sprayer';
                fitmentName = 'Mist Sprayer';

                if (row.SKU.includes('Blk')) {
                    fitmentName = 'Black Shiny Mist Sprayer';
                } else if (row.SKU.includes('Blu')) {
                    fitmentName = 'Blue Matte Mist Sprayer';
                } else if (row.SKU.includes('Gl')) {
                    fitmentName = row.SKU.includes('Mt') ? 'Gold Matte Mist Sprayer' : 'Gold Shiny Mist Sprayer';
                } else if (row.SKU.includes('Sl')) {
                    fitmentName = row.SKU.includes('Mt') ? 'Silver Matte Mist Sprayer' : 'Silver Shiny Mist Sprayer';
                }
            }

            const fitmentKey = `FIT-${getFitmentCode(row.SKU)}`;

            // Check for duplicate fitments to avoid overwriting clean names
            if (!fitments.has(fitmentKey)) {
                fitments.set(fitmentKey, {
                    _id: `fitment-${fitmentKey}`,
                    _type: 'fitmentVariant',
                    name: fitmentName,
                    skuPart: fitmentKey,
                    type: type,
                    image_url: row.Fitment_URL,
                    assembly_offset_x: ZERO_OFF_X,
                    assembly_offset_y: ZERO_OFF_Y
                });
            }
        }

        // --- CAPS ---
        const capUrl = row.Overcap_URL || row.Cap_URL;
        if (capUrl) {
            let capName = "Standard Cap";
            let capKey = "CAP-STD";

            if (row.SKU.includes('BlkSh') || row.SKU.includes('BlkSht')) { capName = 'Black Shiny'; capKey = 'CAP-BLK-SHY'; }
            else if (row.SKU.includes('BlkMt')) { capName = 'Black Matte'; capKey = 'CAP-BLK-MAT'; }
            else if (row.SKU.includes('BluMt')) { capName = 'Blue Matte'; capKey = 'CAP-BLU-MAT'; }
            else if (row.SKU.includes('SlMt')) { capName = 'Silver Matte'; capKey = 'CAP-SLV-MAT'; }
            else if (row.SKU.includes('SlSh')) { capName = 'Silver Shiny'; capKey = 'CAP-SLV-SHY'; }
            else if (row.SKU.includes('GlMt')) { capName = 'Gold Matte'; capKey = 'CAP-GLD-MAT'; }
            else if (row.SKU.includes('GlSh')) { capName = 'Gold Shiny'; capKey = 'CAP-GLD-SHY'; }
            else if (row.SKU.includes('PinkDot')) { capName = 'Pink Polka Dot'; capKey = 'CAP-PNK-DOT'; }
            else if (row.SKU.includes('SlDot')) { capName = 'Silver Polka Dot'; capKey = 'CAP-SLV-DOT'; }
            else if (row.SKU.includes('BlkDot')) { capName = 'Black Polka Dot'; capKey = 'CAP-BLK-DOT'; }
            else if (row.SKU.includes('CuMt')) { capName = 'Copper Matte'; capKey = 'CAP-COP-MAT'; }

            if (row.SKU.includes('Spry')) {
                capName += " Overcap";
                capKey += "-OVR";
            }

            // Only set cap if not already defined OR if new URL is valid and old was broken
            const existingCap = caps.get(capKey);
            const isValidUrl = capUrl && capUrl.endsWith('.png');

            if (!existingCap || (!existingCap.image_url?.endsWith('.png') && isValidUrl)) {
                caps.set(capKey, {
                    _id: `cap-${capKey}`,
                    _type: 'capOption',
                    name: capName,
                    skuPart: capKey,
                    finish: capName.includes('Matte') ? 'Matte' : 'Shiny',
                    image_url: capUrl,
                    assembly_offset_x: ZERO_OFF_X,
                    assembly_offset_y: ZERO_OFF_Y
                });
            }
        }
    }

    console.log(`Found: ${glasses.size} Glass, ${fitments.size} Fitments, ${caps.size} Caps`);

    // DEBUG: Log all fitments with their types
    console.log('\n📋 Fitments Detail:');
    for (const [key, f] of fitments) {
        console.log(`   - ${key}: type="${f.type}", name="${f.name}"`);
    }

    // DEBUG: Log all caps
    console.log('\n📋 Caps Detail:');
    for (const [key, c] of caps) {
        console.log(`   - ${key}: name="${c.name}", hasOVR=${c.skuPart.includes('OVR')}`);
    }

    const transaction = client.transaction();

    for (const doc of glasses.values()) transaction.createOrReplace(doc);
    for (const doc of fitments.values()) transaction.createOrReplace(doc);
    for (const doc of caps.values()) transaction.createOrReplace(doc);

    // Create Product

    // Split Glass Options by Type
    const rollerGlassRefs = Array.from(glasses.values())
        .filter(g => g._id.includes('ROLL'))
        .map(g => ({ _type: 'reference', _ref: g._id, _key: g._id }));

    const sprayGlassRefs = Array.from(glasses.values())
        .filter(g => g._id.includes('SPRY'))
        .map(g => ({ _type: 'reference', _ref: g._id, _key: g._id }));

    // Default to First (Amber - verify exists)
    const defaultRollerGlass = rollerGlassRefs.find(r => r._ref.includes('AMB')) || rollerGlassRefs[0];
    const defaultSprayGlass = sprayGlassRefs.find(r => r._ref.includes('AMB')) || sprayGlassRefs[0];

    // --- 1. ROLLER COLLECTION ---
    const rollerFitments = Array.from(fitments.values())
        .filter(f => f.type === 'roller')
        .map(f => ({ _type: 'reference', _ref: f._id, _key: f._id }));

    const rollerCaps = Array.from(caps.values())
        .filter(c => !c.skuPart.includes('OVR'))
        .map(c => ({ _type: 'reference', _ref: c._id, _key: c._id }));

    console.log(`\n🎯 ROLLER Collection: ${rollerFitments.length} fitments, ${rollerCaps.length} caps, ${rollerGlassRefs.length} glasses`);

    transaction.createOrReplace({
        _id: 'product-05-amb-clean',
        _type: 'product',
        title: '5ml Cylinder Roller Collection',
        slug: { _type: 'slug', current: '5ml-cylinder-roller-collection' },
        basePrice: 1.25,
        sku: 'PROD-05-CYL-RLL',
        defaultGlass: { _type: 'reference', _ref: defaultRollerGlass._id },
        glassOptions: rollerGlassRefs,
        fitmentVariants: rollerFitments,
        capOptions: rollerCaps,
        description: 'Clean Architecture: 1500px Standardized Assets. Zero Offsets. Rollers Only.'
    });

    // --- 2. SPRAY COLLECTION ---
    const sprayFitments = Array.from(fitments.values())
        .filter(f => f.type === 'sprayer')
        .map(f => ({ _type: 'reference', _ref: f._id, _key: f._id }));

    const sprayCaps = Array.from(caps.values())
        .filter(c => c.skuPart.includes('OVR'))
        .map(c => ({ _type: 'reference', _ref: c._id, _key: c._id }));

    console.log(`🎯 SPRAY Collection: ${sprayFitments.length} fitments, ${sprayCaps.length} caps, ${sprayGlassRefs.length} glasses`);

    transaction.createOrReplace({
        _id: 'product-05-amb-spray',
        _type: 'product',
        title: '5ml Cylinder Spray Collection',
        slug: { _type: 'slug', current: '5ml-cylinder-spray-collection' },
        basePrice: 1.45,
        sku: 'PROD-05-CYL-SPRY',
        defaultGlass: { _type: 'reference', _ref: defaultSprayGlass._id },
        glassOptions: sprayGlassRefs,
        fitmentVariants: sprayFitments,
        capOptions: sprayCaps,
        description: 'Clean Architecture: 1500px Standardized Assets. Zero Offsets. Sprayers Only.'
    });

    await transaction.commit();
    console.log('\n✅ Setup Complete. Products created: product-05-amb-clean, product-05-amb-spray');
}

setupCleanDemo().catch(console.error);
