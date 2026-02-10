
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const csvPath = '/Users/jordanrichter/Projects/Clients/Best Bottles/bestbottles_inventory_complete.csv';
const outPath = '/Users/jordanrichter/Projects/Clients/Best Bottles/product_families.json';

const fileContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
});

const families: Record<string, any[]> = {};

records.forEach((record: any) => {
    // Heuristic: Extract base name from Description
    // Pattern: "Shape design Capacity Material bottle"
    // We'll split by " with " or "." or "," to find the base characteristic part.

    const desc = record.Description || "";

    // Clean up
    let baseName = desc.split(/ with /i)[0]; // Split at " with "
    baseName = baseName.split(", price")[0]; // Split at ", price" if exists
    baseName = baseName.split(".")[0];       // Split at first period if it comes before "with"

    // Refine: Remove trailing commas or spaces
    baseName = baseName.trim().replace(/,$/, '');

    // fallback if description is empty (unlikely)
    if (!baseName) baseName = record.Item_Name || record.SKU;

    // Key creation: Normalize
    const key = baseName.toLowerCase().replace(/\s+/g, ' ').trim();

    if (!families[key]) {
        families[key] = [];
    }
    families[key].push(record);
});

// Convert to array for easier inspection
const familyList = Object.keys(families).map(key => ({
    familyName: key,
    count: families[key].length,
    variants: families[key].map(r => ({
        sku: r.SKU,
        component: r.Included_Component,
        url: r.Product_URL,
        image: r.Image_URL
    }))
})).sort((a, b) => b.count - a.count);

console.log(`Created ${familyList.length} families from ${records.length} products.`);
console.log("Top 5 largest families:");
familyList.slice(0, 5).forEach(f => console.log(`- ${f.familyName} (${f.count} variants)`));

fs.writeFileSync(outPath, JSON.stringify(familyList, null, 2));
