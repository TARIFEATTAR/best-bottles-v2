const fs = require('fs');
const path = require('path');

const importsDir = '/Users/jordanrichter/Projects/Clients/Best Bottles/imports';

try {
    const files = fs.readdirSync(importsDir).filter(file => file.endsWith('.csv') && !file.startsWith('.'));

    const results = {};

    files.forEach(file => {
        const content = fs.readFileSync(path.join(importsDir, file), 'utf8');
        const lines = content.split('\r').join('').split('\n');
        let headerIndex = -1;
        let headerLine = "";

        for (let i = 0; i < Math.min(lines.length, 30); i++) {
            const lineVal = lines[i].toLowerCase();
            // Heuristic: Header usually contains "Inventory ID" or "Item Code" AND "Capacity" or "Color"
            if ((lineVal.includes('inventory id') || lineVal.includes('item code') || lineVal.includes('sku')) &&
                (lineVal.includes('capacity') || lineVal.includes('color') || lineVal.includes('description'))) {
                headerIndex = i;
                headerLine = lines[i];
                break;
            }
        }

        // Fallback: Look for just "Inventory ID"
        if (headerIndex === -1) {
            for (let i = 0; i < Math.min(lines.length, 30); i++) {
                if (lines[i].toLowerCase().includes('inventory id')) {
                    headerIndex = i;
                    headerLine = lines[i];
                    break;
                }
            }
        }

        results[file] = { headerIndex, headerLine: headerLine.substring(0, 100) + "..." };
    });

    console.log(JSON.stringify(results, null, 2));

} catch (err) {
    console.error(err);
}
