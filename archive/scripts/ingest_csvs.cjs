const fs = require('fs');
const path = require('path');
// Use absolute path to ensure we find it
const Papa = require('./bottle-image-pipeline/node_modules/papaparse/papaparse.js');

const importsDir = path.join(__dirname, 'imports');
const reportFile = path.join(__dirname, 'ingestion_report.json');

// --- Helper: Find Header Row ---
function findHeaderRow(lines) {
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].toLowerCase();
        // Strong signals
        if (line.includes('inventory id') || line.includes('item code') || line.includes('sku') || line.includes('product id')) {
            // Must also look like a header (have multiple columns or expected fields)
            if (line.includes('title') || line.includes('desc') || line.includes('cap') || line.includes('glass') || line.includes('color')) {
                return i;
            }
            // Fallback: if it just has "Inventory ID" and commas
            if (line.includes(',')) return i;
        }
    }
    return 0; // Default to first row if nothing found
}

// --- Helper: Flexible Column Finder ---
function getColValue(row, headers, keywords) {
    if (!row || !headers) return null;

    // Find index of column matching one of the keywords
    let colIndex = -1;
    for (const keyword of keywords) {
        colIndex = headers.findIndex(h => h && h.toLowerCase().includes(keyword.toLowerCase()));
        if (colIndex !== -1) break;
    }

    if (colIndex === -1) return null;
    let val = row[colIndex] ? row[colIndex].trim() : null;
    // Clean: if value is too long, it's likely a description
    if (val && val.length > 40) {
        // Try to rescue simple colors/shapes if buried in text
        const shortMatch = val.match(/^(Blue|Clear|Amber|Green|Frosted|Black|White|Gold|Silver|Red|Pink)/i);
        if (shortMatch) return shortMatch[0];
        return null;
    }
    return val;
}

function normalizeKey(str) {
    if (!str) return 'unknown';
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return clean.length > 50 ? clean.substring(0, 50) : clean;
}

// --- Main Ingestion Logic ---
function run() {
    const fileNames = fs.readdirSync(importsDir).filter(f => f.endsWith('.csv') && !f.startsWith('.'));

    const registry = {
        products: [],
        bottles: new Map(), // Key: composite string -> Object
        caps: new Map(),
        fitments: new Map()
    };

    fileNames.forEach(fileName => {
        const filePath = path.join(importsDir, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // 1. Find Header Row manually to skip metadata
        const lines = fileContent.split(/\r\n|\n|\r/);
        const headerRowIndex = findHeaderRow(lines);

        // 2. Parse with Papa, skipping up to header
        // We pass the string starting from headerRowIndex
        const csvContentToParse = lines.slice(headerRowIndex).join('\n');

        const parsed = Papa.parse(csvContentToParse, {
            header: false, // We will manually map headers to be safer
            skipEmptyLines: true
        });

        if (parsed.errors.length > 0) {
            console.warn(`Warning: Errors parsing ${fileName}:`, parsed.errors[0]);
        }

        const rows = parsed.data;
        if (rows.length < 2) return; // Header + Data minimum

        const headers = rows[0];
        const dataRows = rows.slice(1);

        console.log(`Processing ${fileName}: Found ${dataRows.length} rows (Header at line ${headerRowIndex})`);

        dataRows.forEach(row => {
            // --- Extract SKU ---
            const sku = getColValue(row, headers, ['inventory id', 'item code', 'product id', 'inv id']);
            if (!sku || !sku.trim()) return;

            // --- Extract Product Title ---
            const title = getColValue(row, headers, ['product title', 'description', 'final name']) || `Product ${sku}`;

            // --- Extract Components ---
            // Bottle
            const bottleMaterial = getColValue(row, headers, ['material', 'material of container']) || 'Glass';
            const bottleColor = getColValue(row, headers, ['glass color', 'color of container', 'color']) || 'Clear';
            const bottleCapacity = getColValue(row, headers, ['capacity', 'capacity (ml)', 'ml', 'size']) || 'Unknown';
            const bottleShape = getColValue(row, headers, ['shape', 'bottle shape']) || 'Round';

            const bottleKey = normalizeKey(`${bottleMaterial}-${bottleColor}-${bottleShape}-${bottleCapacity}`);
            const bottleName = `${bottleColor} ${bottleShape} ${bottleMaterial} Bottle (${bottleCapacity})`;

            if (!registry.bottles.has(bottleKey) && bottleKey !== 'unknown') {
                registry.bottles.set(bottleKey, {
                    _id: bottleKey,
                    type: 'bottle',
                    name: bottleName,
                    material: bottleMaterial,
                    color: bottleColor,
                    capacity: bottleCapacity,
                    shape: bottleShape
                });
            }

            // Cap
            const capColor = getColValue(row, headers, ['lid color', 'cap color', 'color of cap']) || 'White';
            const capType = getColValue(row, headers, ['cap type', 'type of cap', 'closure']) || 'Cap';

            const capKey = normalizeKey(`${capColor}-${capType}`);
            const capName = `${capColor} ${capType}`;

            if (!registry.caps.has(capKey) && capKey !== 'unknown') {
                registry.caps.set(capKey, {
                    _id: capKey,
                    type: 'cap',
                    name: capName,
                    color: capColor,
                    style: capType
                });
            }

            // Fitment (Applicator)
            const applicator = getColValue(row, headers, ['applicator', 'applicator modifier', 'pump/sprayer']) || 'None';
            let fitmentKey = null;

            if (applicator.toLowerCase() !== 'none' && applicator.trim() !== '') {
                fitmentKey = normalizeKey(applicator);
                const fitmentName = applicator;

                if (!registry.fitments.has(fitmentKey)) {
                    registry.fitments.set(fitmentKey, {
                        _id: fitmentKey,
                        type: 'fitment',
                        name: fitmentName
                    });
                }
            }

            // Product
            registry.products.push({
                _type: 'product',
                title: title,
                sku: sku,
                references: {
                    bottle: bottleKey,
                    cap: capKey,
                    fitment: fitmentKey
                },
                sourceFile: fileName
            });

        });
    });

    // Convert definitions to arrays for report
    const report = {
        stats: {
            totalProducts: registry.products.length,
            uniqueBottles: registry.bottles.size,
            uniqueCaps: registry.caps.size,
            uniqueFitments: registry.fitments.size
        },
        bottles: Array.from(registry.bottles.values()),
        caps: Array.from(registry.caps.values()),
        fitments: Array.from(registry.fitments.values()),
        productsSample: registry.products.slice(0, 10) // First 10
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log('Report generated at:', reportFile);
}

run();
