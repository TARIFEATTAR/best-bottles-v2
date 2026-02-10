const fs = require('fs');
const path = require('path');

const MAIN_CSV = path.join(__dirname, '../uploaded_clean_map.csv');
const NEW_CSV = path.join(__dirname, '../new_spray_map.csv');

function updateCsv() {
    console.log('🔄 Merging CSVs...');

    if (!fs.existsSync(MAIN_CSV) || !fs.existsSync(NEW_CSV)) {
        console.error('❌ Missing CSV files.');
        return;
    }

    const mainContent = fs.readFileSync(MAIN_CSV, 'utf8').trim().split('\n');
    const newContent = fs.readFileSync(NEW_CSV, 'utf8').trim().split('\n');

    if (mainContent.length < 1) return;

    const header = mainContent[0];
    const newRows = newContent; // new_spray_map likely doesn't have header? Or does it?
    // Check if new_spray_map has header. My upload script DID NOT write a header.
    // It just pushed rows.

    // Let's parse new rows to get their SKUs
    const newSkus = new Set();
    const cleanNewRows = [];

    for (const row of newRows) {
        if (!row.trim()) continue;
        const sku = row.split(',')[0];
        newSkus.add(sku);
        cleanNewRows.push(row);
    }

    console.log(`📦 New Batch contains ${newSkus.size} SKUs.`);

    // Filter Main CSV
    // Keep Header
    // Keep rows where SKU is NOT in newSkus
    const filteredMain = [header];

    // Start from index 1
    for (let i = 1; i < mainContent.length; i++) {
        const row = mainContent[i];
        if (!row.trim()) continue;
        const sku = row.split(',')[0];

        if (!newSkus.has(sku)) {
            filteredMain.push(row);
        }
    }

    console.log(`🔻 Removed old entries. Main now has ${filteredMain.length - 1} rows.`);

    // Append New Rows
    const finalContent = filteredMain.concat(cleanNewRows).join('\n');

    fs.writeFileSync(MAIN_CSV, finalContent + '\n');
    console.log(`✅ Updated ${MAIN_CSV} with clean data.`);
}

updateCsv();
