const fs = require('fs');
const path = require('path');

const importsDir = '/Users/jordanrichter/Projects/Clients/Best Bottles/imports';

try {
    const files = fs.readdirSync(importsDir).filter(file => file.endsWith('.csv') && !file.startsWith('.'));

    const headers = {};

    files.forEach(file => {
        const content = fs.readFileSync(path.join(importsDir, file), 'utf8');
        const firstLine = content.split('\n')[0];
        headers[file] = firstLine;
    });

    console.log(JSON.stringify(headers, null, 2));

} catch (err) {
    console.error('Error reading headers:', err);
}
