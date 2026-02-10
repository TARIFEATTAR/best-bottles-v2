
import PSD from 'psd';
import fs from 'fs';
import path from 'path';

// Configuration
const INPUT_DIR = path.join(process.cwd(), 'input_psds');
const OUTPUT_DIR = path.join(process.cwd(), 'output_components');

// Ensure directories exist
if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Layer name mappings
const LAYER_MAPPINGS = [
    { keywords: ['bottle', 'glass', 'base', 'body'], outputName: 'base-bottle' },
    { keywords: ['black cap', 'cap black', 'blk cap', 'blksht'], outputName: 'cap-black' },
    { keywords: ['white cap', 'cap white', 'wht cap', 'whtsht'], outputName: 'cap-white' },
    { keywords: ['roller', 'fitment', 'roll'], outputName: 'fitment' },
    { keywords: ['metal'], outputName: 'metal-roller' },
    { keywords: ['plastic'], outputName: 'plastic-roller' },
    { keywords: ['spray', 'spry', 'mist'], outputName: 'sprayer' },
    { keywords: ['pump'], outputName: 'pump' }
];

/**
 * Recursively find all PSD files in a directory
 */
function findPsdFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findPsdFiles(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.psd')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Recursively collect all layers from PSD tree
 */
function collectLayers(node, results = []) {
    // If this node is a layer (not a group) and is visible
    if (node.type === 'layer' && !node.isFolder) {
        results.push(node);
    }

    // If it has children, recurse
    if (node.children && node.children.length > 0) {
        for (const child of node.children()) {
            collectLayers(child, results);
        }
    }

    return results;
}

/**
 * Determine output filename based on layer name
 */
function getOutputName(layerName) {
    const lowerName = (layerName || '').toLowerCase();

    for (const mapping of LAYER_MAPPINGS) {
        if (mapping.keywords.some(k => lowerName.includes(k))) {
            return mapping.outputName;
        }
    }

    // Fallback: sanitize the layer name
    return lowerName.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'layer';
}

/**
 * Main function to process all PSDs in the input directory
 */
async function processAllPSDs() {
    console.log('🔍 Scanning for PSD files in:', INPUT_DIR);

    const psdFiles = findPsdFiles(INPUT_DIR);

    if (psdFiles.length === 0) {
        console.log('⚠️  No PSD files found. Place your .psd files (or folders) in "input_psds".');
        return;
    }

    console.log(`📁 Found ${psdFiles.length} PSD files to process.\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const filepath of psdFiles) {
        const result = await processSinglePSD(filepath);
        if (result) successCount++;
        else errorCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Complete: ${successCount} succeeded, ${errorCount} failed`);
    console.log('='.repeat(50));
}

/**
 * Process a single PSD file
 */
async function processSinglePSD(filepath) {
    const filename = path.basename(filepath);
    const sku = path.basename(filename, path.extname(filename));

    console.log(`📦 Processing: ${sku}`);

    try {
        // Parse PSD file
        const psd = await PSD.open(filepath);
        const tree = psd.tree();

        // Create output folder
        const productOutputDir = path.join(OUTPUT_DIR, sku);
        if (!fs.existsSync(productOutputDir)) {
            fs.mkdirSync(productOutputDir, { recursive: true });
        }

        // Get all descendants (layers)
        const descendants = tree.descendants();

        if (!descendants || descendants.length === 0) {
            // Fallback: export the composite image
            console.log(`   ⚠️  No layers found, exporting composite...`);
            const compositePath = path.join(productOutputDir, 'composite.png');
            await psd.image.saveAsPng(compositePath);
            console.log(`   ✓ Saved composite.png`);
            return true;
        }

        // Track exported names to avoid duplicates
        const exportedNames = new Map();
        let exportedCount = 0;

        for (const layer of descendants) {
            // Skip folders/groups
            if (layer.isGroup()) {
                continue;
            }

            // Export this layer
            const layerName = layer.name;
            let baseName = getOutputName(layerName);

            // Handle duplicates by adding a number
            if (exportedNames.has(baseName)) {
                const count = exportedNames.get(baseName) + 1;
                exportedNames.set(baseName, count);
                baseName = `${baseName}-${count}`;
            } else {
                exportedNames.set(baseName, 1);
            }

            const outputFilename = `${baseName}.png`;
            const outputPath = path.join(productOutputDir, outputFilename);

            try {
                await layer.saveAsPng(outputPath);
                console.log(`   ✓ ${layerName} → ${outputFilename}`);
                exportedCount++;
            } catch (saveErr) {
                // Some layers might not be exportable
                // console.log(`   ⚠️  Could not export "${layerName}": ${saveErr.message}`);
            }
        }

        if (exportedCount === 0) {
            // Fallback to composite
            console.log(`   ⚠️  No individual layers exported, saving composite...`);
            const compositePath = path.join(productOutputDir, 'composite.png');
            await psd.image.saveAsPng(compositePath);
            console.log(`   ✓ Saved composite.png`);
        }

        return true;

    } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        return false;
    }
}

// Run
processAllPSDs();
