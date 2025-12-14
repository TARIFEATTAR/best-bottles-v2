
import fs from 'fs';
import path from 'path';

const inventoryPath = path.resolve('./inventory.json');
const rawData = fs.readFileSync(inventoryPath, 'utf8');
const inventory = JSON.parse(rawData);

let rollOnCount = 0;
let vialCount = 0;
let closureCount = 0;
let sprayCount = 0;
let otherCount = 0;
let keptCount = 0;

const cleanedInventory = inventory.map(item => {
    // Only check name and description for keywords, NOT the potentially messy category
    const text = (item.name + " " + item.description).toLowerCase();

    // Logic for categorization
    // 1. Roll-ons (High priority)
    if (text.includes('roll-on') || text.includes('roll on') || text.includes('roller ball') || text.includes('rollerball') || text.includes('roll-ball')) {
        item.category = "Roll-ons";
        rollOnCount++;
    }
    // 2. Vials
    else if (text.includes('vial')) {
        item.category = "Oil Vials";
        vialCount++;
    }
    // 3. Spay Bottles
    else if (text.includes('spray')) {
        item.category = "Vintage Bottles"; // Or just 'Bottles' or 'Spray Bottles' depending on user pref. 'Vintage Bottles' matches Finder.
        sprayCount++;
    }
    // 4. Closures / Accessories
    else if (
        text.includes(' cap') || text.includes('closure') || text.includes('pump') ||
        text.includes('dropper') || text.includes('lid')
    ) {
        item.category = "Closures";
        closureCount++;
    }
    // 5. Default cleanup for the messy category
    else if (item.category === "Perfume Vials, Bottles, Roll on bottles and Decorative glass Bottles") {
        item.category = "Glass Bottles & Vials";
        otherCount++;
    } else {
        keptCount++;
    }

    // Ensure numeric types if needed, though JSON keeps them as is. 
    // User mentioned 'large data set with tags'.

    return item;
});

console.log(`Summary of Categorization:
Roll-ons: ${rollOnCount}
Vials: ${vialCount}
Vintage/Sprays: ${sprayCount}
Closures: ${closureCount}
Others (Cleaned): ${otherCount}
Kept Original: ${keptCount}
Total items: ${cleanedInventory.length}`);

fs.writeFileSync(inventoryPath, JSON.stringify(cleanedInventory, null, 2));
console.log("Updated inventory.json successfully.");
