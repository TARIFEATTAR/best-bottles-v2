const fs = require('fs');
const path = require('path');

const importsDir = '/Users/jordanrichter/Projects/Clients/Best Bottles/imports';

try {
    const files = fs.readdirSync(importsDir).filter(file => file.endsWith('.csv') && !file.startsWith('.'));

    const results = {};

    files.forEach(file => {
        const content = fs.readFileSync(path.join(importsDir, file), 'utf8');
        const lines = content.split('\r').join('').split('\n'); // Handle both \r\n and \n

        let headerRow = null;
        let headerLineIndex = -1;

        // Look for a line that contains 'sku' AND 'description' (case insensitive), or at least 'glass' or 'cap'
        for (let i = 0; i < Math.min(lines.length, 20); i++) {
            const lowerLine = lines[i].toLowerCase();
            if ((lowerLine.includes('sku') || lowerLine.includes('item code') || lowerLine.includes('item_code')) &&
                (lowerLine.includes('desc') || lowerLine.includes('cap') || lowerLine.includes('glass'))) {
                headerRow = lines[i];
                headerLineIndex = i;
                break;
            }
        }

        // Fallback: Just return the first non-empty line if no specific header found (though unlikely for valid CSVs)
        if (!headerRow) {
            for (let i = 0; i < Math.min(lines.length, 20); i++) {
                if (lines[i].replace(/,/g, '').trim().length > 10) { // arbitrary length to skip empty rows
                    headerRow = "FALLBACK: " + lines[i];
                    headerLineIndex = i;
                    break;
                }
            }
        }

        results[file] = {
            index: headerLineIndex,
            header: headerRow
        };
    });

    console.log(JSON.stringify(results, null, 2));

} catch (err) {
    console.error('Error reading headers:', err);
}
