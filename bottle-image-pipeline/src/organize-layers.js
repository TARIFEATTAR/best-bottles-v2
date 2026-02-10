
import fs from 'fs';
import path from 'path';

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'output_components');
const ORGANIZED_DIR = path.join(process.cwd(), 'organized_components');

// SKU pattern mappings - derive component type from SKU name
const SKU_PATTERNS = {
    // Cap types
    'BlkSht': { capType: 'cap-black' },
    'WhtSht': { capType: 'cap-white' },
    'BlkSh': { capType: 'cap-black-shiny' },
    'BlkMt': { capType: 'cap-black-matte' },
    'WhtSh': { capType: 'cap-white-shiny' },
    'SlSh': { capType: 'cap-silver-shiny' },
    'SlMt': { capType: 'cap-silver-matte' },
    'SlDot': { capType: 'cap-silver-dot' },
    'GlSh': { capType: 'cap-gold-shiny' },
    'GlMt': { capType: 'cap-gold-matte' },
    'CuMt': { capType: 'cap-copper-matte' },
    'BluMt': { capType: 'cap-blue-matte' },
    'PinkDot': { capType: 'cap-pink-dot' },
    'BlkDot': { capType: 'cap-black-dot' },

    // Roller types
    'RollMtl': { hasFitment: true, fitmentType: 'roller-metal' },
    'Roll': { hasFitment: true, fitmentType: 'roller-plastic' },

    // Spray types
    'Spry': { hasFitment: true, fitmentType: 'sprayer' },
    'Pump': { hasFitment: true, fitmentType: 'pump' }
};

/**
 * Parse SKU name to extract component information
 */
function parseSkuName(skuFolderName) {
    const result = {
        sku: skuFolderName,
        capType: 'cap-unknown',
        hasFitment: false,
        fitmentType: null
    };

    // Determine fitment and cap type from SKU patterns
    for (const [pattern, config] of Object.entries(SKU_PATTERNS)) {
        if (skuFolderName.toLowerCase().includes(pattern.toLowerCase())) {
            if (config.capType) result.capType = config.capType;
            if (config.hasFitment) {
                result.hasFitment = true;
                result.fitmentType = config.fitmentType;
            }
        }
    }

    return result;
}

/**
 * Rename files in a folder based on file size heuristics and keywords
 */
function organizeFolder(folderPath, skuInfo) {
    const files = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.png'))
        .map(f => ({
            name: f,
            path: path.join(folderPath, f),
            size: fs.statSync(path.join(folderPath, f)).size
        }))
        .sort((a, b) => b.size - a.size); // Sort by size, largest first

    if (files.length === 0) return null;

    const result = {
        sku: skuInfo.sku,
        bottle: null,
        cap: null,
        fitment: null,
        other: []
    };

    // 1. Identify Bottle (Largest file > 40KB)
    if (files.length > 0 && files[0].size > 40000) {
        result.bottle = {
            originalName: files[0].name,
            newName: 'bottle.png',
            size: files[0].size
        };
    }

    // 2. Identify Fitment (Check keywords first, then size)
    const fitmentKeywords = ['sprayer', 'pump', 'fitment', 'roller', 'metal-roller', 'plastic-roller'];
    const fitmentFile = files.find(f => fitmentKeywords.some(k => f.name.toLowerCase().includes(k)));

    if (fitmentFile) {
        result.fitment = {
            originalName: fitmentFile.name,
            newName: `${skuInfo.fitmentType || 'fitment'}.png`,
            size: fitmentFile.size
        };
    } else if (skuInfo.hasFitment && files.length > 1) {
        // Fallback: If SKU says we should have a fitment but no keyword match, 
        // take the second largest non-background file
        const candidates = files.filter(f =>
            f.size > 5000 &&
            f.name !== 'background.png' &&
            (!result.bottle || f.name !== result.bottle.originalName)
        );
        if (candidates.length > 0) {
            result.fitment = {
                originalName: candidates[0].name,
                newName: `${skuInfo.fitmentType || 'fitment'}.png`,
                size: candidates[0].size
            };
        }
    }

    // 3. Identify Cap (Check keywords first, then size)
    const capKeywords = ['cap-black', 'cap-white', 'cap-black-dot', 'cap-black-short', 'cap-white-short', 'cap'];
    const capFile = files.find(f =>
        capKeywords.some(k => f.name.toLowerCase().includes(k)) &&
        (!result.fitment || f.name !== result.fitment.originalName) &&
        (!result.bottle || f.name !== result.bottle.originalName)
    );

    if (capFile) {
        result.cap = {
            originalName: capFile.name,
            newName: `${skuInfo.capType}.png`,
            size: capFile.size
        };
    } else {
        // Fallback: Take the next largest file that hasn't been used
        const candidates = files.filter(f =>
            f.size > 3000 &&
            f.name !== 'background.png' &&
            (!result.bottle || f.name !== result.bottle.originalName) &&
            (!result.fitment || f.name !== result.fitment.originalName)
        );
        if (candidates.length > 0) {
            result.cap = {
                originalName: candidates[0].name,
                newName: `${skuInfo.capType}.png`,
                size: candidates[0].size
            };
        }
    }

    return result;
}

/**
 * Main function
 */
async function organizeAllFolders() {
    console.log('🔍 Scanning output_components folder...\n');

    if (!fs.existsSync(ORGANIZED_DIR)) {
        fs.mkdirSync(ORGANIZED_DIR, { recursive: true });
    }

    const folders = fs.readdirSync(OUTPUT_DIR)
        .filter(f => fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory());

    console.log(`📁 Found ${folders.length} product folders\n`);

    const manifest = [];
    let processed = 0;

    for (const folder of folders) {
        const folderPath = path.join(OUTPUT_DIR, folder);
        const skuInfo = parseSkuName(folder);
        const organized = organizeFolder(folderPath, skuInfo);

        if (!organized) continue;

        const newFolderPath = path.join(ORGANIZED_DIR, folder);
        if (!fs.existsSync(newFolderPath)) {
            fs.mkdirSync(newFolderPath, { recursive: true });
        }

        // Copy and rename files
        if (organized.bottle) {
            fs.copyFileSync(path.join(folderPath, organized.bottle.originalName), path.join(newFolderPath, organized.bottle.newName));
        }
        if (organized.cap) {
            fs.copyFileSync(path.join(folderPath, organized.cap.originalName), path.join(newFolderPath, organized.cap.newName));
        }
        if (organized.fitment) {
            fs.copyFileSync(path.join(folderPath, organized.fitment.originalName), path.join(newFolderPath, organized.fitment.newName));
        }

        manifest.push({
            sku: folder,
            bottle: organized.bottle?.newName || null,
            cap: organized.cap?.newName || null,
            fitment: organized.fitment?.newName || null
        });

        processed++;
        if (processed % 50 === 0) console.log(`   Processed ${processed}/${folders.length}...`);
    }

    const manifestPath = path.join(ORGANIZED_DIR, '_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Complete!`);
    console.log(`   📁 Organized: ${processed} products`);
    console.log(`   📄 Manifest: ${manifestPath}`);
}

organizeAllFolders();
