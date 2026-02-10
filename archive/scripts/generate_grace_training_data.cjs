const fs = require('fs');
const path = require('path');
// Use absolute path
const Papa = require('./bottle-image-pipeline/node_modules/papaparse/papaparse.js');

const importsDir = path.join(__dirname, 'imports');
const outputFile = path.join(__dirname, 'Grace_Training_Master_Clean.csv');

// --- Helper: Find Header Row ---
function findHeaderRow(lines) {
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].toLowerCase();
        // Look for strong signals that this is the main header
        if (line.includes('inventory id') || line.includes('item code') || line.includes('sku') || line.includes('product id')) {
            // Must also look like a header (e.g., have description columns)
            if (line.includes('title') || line.includes('desc') || line.includes('cap') || line.includes('glass') || line.includes('color')) {
                return i;
            }
        }
    }
    return 0; // Default to first row
}

// --- Helper: Flexible Column Finder ---
function getColValue(row, headers, keywords) {
    if (!row || !headers) return null;

    let colIndex = -1;
    for (const keyword of keywords) {
        colIndex = headers.findIndex(h => h && h.toLowerCase().includes(keyword.toLowerCase()));
        if (colIndex !== -1) break;
    }

    if (colIndex === -1) return null;
    let val = row[colIndex] ? row[colIndex].trim() : null;

    // Clean: if value is absurdly long, it's likely a description snippet, not a trait.
    if (val && val.length > 50) {
        // Try to recover simple traits if buried
        const shortMatch = val.match(/^(Blue|Clear|Amber|Green|Frosted|Black|White|Gold|Silver|Red|Pink|Round|Square|Oval)/i);
        if (shortMatch) return shortMatch[0];
        return null;
    }
    return val;
}

// --- Helper: Get Full Description (for training context) ---
function getDescription(row, headers) {
    if (!row || !headers) return "";
    let colIndex = -1;
    // Prioritize descriptive columns
    const keywords = ['meta description', 'product title', 'description', 'final name', 'product attributes'];
    for (const keyword of keywords) {
        colIndex = headers.findIndex(h => h && h.toLowerCase().includes(keyword));
        if (colIndex !== -1) return row[colIndex] || "";
    }
    return "";
}

// --- Main Logic ---
function run() {
    const fileNames = fs.readdirSync(importsDir).filter(f => f.endsWith('.csv') && !f.startsWith('.'));

    // Master List
    const masterList = [];

    fileNames.forEach(fileName => {
        const filePath = path.join(importsDir, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        const lines = fileContent.split(/\r\n|\n|\r/);
        const headerRowIndex = findHeaderRow(lines);
        const csvContentToParse = lines.slice(headerRowIndex).join('\n');

        // Parse
        const parsed = Papa.parse(csvContentToParse, {
            header: false,
            skipEmptyLines: true
        });

        const rows = parsed.data;
        if (rows.length < 2) return;

        const headers = rows[0];
        const dataRows = rows.slice(1);

        dataRows.forEach(row => {
            // 1. SKU (Identifier)
            let sku = getColValue(row, headers, ['inventory id', 'item code', 'product id', 'inv id']);
            if (!sku || !sku.trim()) return;

            // Clean SKU: Remove garbage rows that are actually headers or questions
            sku = sku.trim();
            if (sku.toLowerCase().includes('complete?') ||
                sku.toLowerCase() === 'glass' ||
                sku.length < 3 ||
                sku.toLowerCase().includes('inventory id')) return;

            // 2. Core Traits (What is it?)
            const material = getColValue(row, headers, ['material', 'material of container']) || 'Glass'; // default to glass if unknown, usually safe for this client
            const color = getColValue(row, headers, ['glass color', 'color of container', 'color']) || 'Clear';
            const capacity = getColValue(row, headers, ['capacity', 'capacity (ml)', 'ml', 'size']) || 'Unknown';
            const shape = getColValue(row, headers, ['shape', 'bottle shape']) || 'Round';

            const capColor = getColValue(row, headers, ['lid color', 'cap color', 'color of cap']) || 'White';
            const capType = getColValue(row, headers, ['cap type', 'type of cap', 'closure']) || 'Cap';
            const applicator = getColValue(row, headers, ['applicator', 'applicator modifier', 'pump/sprayer']) || 'None';

            // 3. Rich Context (Description for LLM)
            const rawDescription = getDescription(row, headers);

            // 4. Target URL (Critical for Grace to redirect users)
            const targetUrl = getColValue(row, headers, [
                'product url', 'seo url', 'url', 'seo url (generated)', 'generated url', 'page title modifier'
            ]) || '';

            // 5. Construct a "Natural Language" Summary for Grace
            const naturalDescription = `A ${color} ${shape} ${material} bottle with a capacity of ${capacity}. It features a ${capColor} ${capType} and ${applicator === 'None' ? 'no specific applicator' : applicator}. SKU: ${sku}.`;

            masterList.push({
                SKU: sku,
                ProductName: `${color} ${shape} bottle (${capacity})`, // Short display name
                Category: 'Bottle', // Can refine this later if needed
                Material: material,
                Color: color,
                Capacity: capacity,
                Shape: shape,
                Cap_Color: capColor,
                Cap_Type: capType,
                Applicator: applicator,
                Full_Description: rawDescription.replace(/[\r\n]+/g, " "), // Clean newlines
                Target_URL: targetUrl, // Added for navigation
                Training_Context: naturalDescription, // Optimized for vector search / LLM
                Source_File: fileName
            });
        });
    });

    // Write Master CSV
    const csv = Papa.unparse(masterList);
    fs.writeFileSync(outputFile, csv);
    console.log(`Master training file generated with ${masterList.length} records at: ${outputFile}`);
}

run();
