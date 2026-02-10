
import fs from 'fs';
import path from 'path';

const inventoryPath = path.resolve('./inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

async function categorizeInventory() {
    console.log('--- Proposed Organized Collections ---');

    const families: Record<string, { count: number, variations: Set<string> }> = {};
    const useCases: Record<string, number> = {
        'Perfumery & Sprays': 0,
        'Oils & Droppers': 0,
        'Roll-ons & Samples': 0,
        'Specialty & Decorative': 0
    };

    inventory.forEach((item: any) => {
        const text = (item.name + " " + item.description).toLowerCase();

        // Family Detection
        let family = "Other Designs";
        if (text.includes("empire")) family = "Empire Design";
        else if (text.includes("cylinder")) family = "Cylinder Design";
        else if (text.includes("royal")) family = "Royal Design";
        else if (text.includes("bell")) family = "Bell Design";
        else if (text.includes("square")) family = "Square Design";
        else if (text.includes("tulip")) family = "Tulip Design";
        else if (text.includes("flair")) family = "Flair Design";
        else if (text.includes("octagonal") || text.includes("tola")) family = "Tola/Octagonal Design";
        else if (text.includes("heart")) family = "Heart Design";

        if (!families[family]) families[family] = { count: 0, variations: new Set() };
        families[family].count++;
        families[family].variations.add(item.capacity || 'N/A');

        // Use Case Detection
        if (text.includes("spray") || text.includes("atomizer") || text.includes("bulb")) useCases['Perfumery & Sprays']++;
        if (text.includes("dropper") || text.includes("reducer")) useCases['Oils & Droppers']++;
        if (text.includes("roll-on") || text.includes("roller") || text.includes("vial")) useCases['Roll-ons & Samples']++;
        if (text.includes("heart") || text.includes("tassel") || text.includes("leather")) useCases['Specialty & Decorative']++;
    });

    console.log('\n🏛️ Families (Blueprints):');
    Object.entries(families).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
        console.log(`- ${name.padEnd(25)}: ${data.count} items | Sizes: ${Array.from(data.variations).join(', ')}`);
    });

    console.log('\n🧴 Use Cases (Navigation):');
    Object.entries(useCases).forEach(([name, count]) => {
        console.log(`- ${name.padEnd(25)}: ${count} items`);
    });
}

categorizeInventory().catch(console.error);
