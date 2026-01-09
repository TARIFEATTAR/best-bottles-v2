
import fs from 'fs';
import path from 'path';

const inventoryPath = path.resolve('./inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

interface ComponentSet {
    glass: string;
    cap: string;
    fitment: string;
    base: string;
}

function extractComponents(name: string, description: string): ComponentSet {
    const text = (name + " " + description).toLowerCase();

    let base = "Unknown Design";
    if (text.includes("empire")) base = "Empire design";
    else if (text.includes("cylinder")) base = "Cylinder design";
    else if (text.includes("royal")) base = "Royal design";
    else if (text.includes("bell")) base = "Bell design";
    else if (text.includes("square")) base = "Square design";
    else if (text.includes("tulip")) base = "Tulip design";
    else if (text.includes("flair")) base = "Flair design";

    let glass = "Clear Glass";
    if (text.includes("frosted")) glass = "Frosted Glass";
    else if (text.includes("amber")) glass = "Amber Glass";
    else if (text.includes("cobalt") || text.includes("blue")) glass = "Cobalt Glass";
    else if (text.includes("emerald") || text.includes("green")) glass = "Emerald Glass";

    let cap = "Standard Cap";
    if (text.includes("shiny gold")) cap = "Shiny Gold Cap";
    else if (text.includes("matte gold")) cap = "Matte Gold Cap";
    else if (text.includes("shiny silver")) cap = "Shiny Silver Cap";
    else if (text.includes("matte silver")) cap = "Matte Silver Cap";
    else if (text.includes("shiny black")) cap = "Shiny Black Cap";
    else if (text.includes("matte black")) cap = "Matte Black Cap";
    else if (text.includes("faux leather")) cap = "Faux Leather Cap";
    else if (text.includes("pink dot")) cap = "Pink Dot Cap";
    else if (text.includes("black dot")) cap = "Black Dot Cap";
    else if (text.includes("silver dot")) cap = "Silver Dot Cap";
    else if (text.includes("copper")) cap = "Copper Cap";

    let fitment = "None";
    if (text.includes("metal roller") || text.includes("metal ball")) fitment = "Metal Roller";
    else if (text.includes("plastic roller") || (text.includes("roll-on") && !text.includes("metal"))) fitment = "Plastic Roller";
    else if (text.includes("reducer")) fitment = "Reducer";
    else if (text.includes("dropper")) fitment = "Dropper";
    else if (text.includes("bulb sprayer")) fitment = "Bulb Sprayer";
    else if (text.includes("spray pump") || text.includes("fine mist spray")) fitment = "Spray Pump";
    else if (text.includes("treatment pump") || text.includes("lotion pump")) fitment = "Treatment Pump";

    return { base, glass, cap, fitment };
}

async function analyzeScrape() {
    console.log('--- Analyzing Scrape for Component Modularity ---');

    const results: Record<string, Set<string>> = {
        bases: new Set(),
        glasses: new Set(),
        caps: new Set(),
        fitments: new Set()
    };

    const grouped: Record<string, Set<string>> = {};

    inventory.forEach((item: any) => {
        const comps = extractComponents(item.name, item.description);

        results.bases.add(comps.base);
        results.glasses.add(comps.glass);
        results.caps.add(comps.cap);
        results.fitments.add(comps.fitment);

        if (!grouped[comps.base]) grouped[comps.base] = new Set();
        grouped[comps.base].add(`${comps.glass} + ${comps.fitment} + ${comps.cap}`);
    });

    console.log('\n📊 Statistics:');
    console.log(`Bases found: ${results.bases.size}`);
    console.log(`Glass types: ${results.glasses.size}`);
    console.log(`Cap types: ${results.caps.size}`);
    console.log(`Fitment types: ${results.fitments.size}`);

    console.log('\n🔍 Sample Grouping (Empire):');
    if (grouped['Empire design']) {
        Array.from(grouped['Empire design']).forEach(c => console.log(`  - ${c}`));
    }
}

analyzeScrape().catch(console.error);
