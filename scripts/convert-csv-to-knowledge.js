#!/usr/bin/env node

/**
 * Convert Best Bottles CSV inventory to ElevenLabs Knowledge Base format
 * This creates a structured knowledge base from your 2000+ product inventory
 */

import fs from 'fs';
import path from 'path';

// Input and output paths
const CSV_PATH = '/Users/jordanrichter/Projects/Clients/Best Bottles/bestbottles_inventory_complete.csv';
const OUTPUT_PATH = '/Users/jordanrichter/Projects/Clients/Best Bottles/best-bottles-v2/ELEVENLABS_PRODUCT_KNOWLEDGE.md';

// Parse CSV
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const products = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Handle quoted fields with commas
        const values = [];
        let currentValue = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });

        products.push(product);
    }

    return products;
}

// Generate markdown knowledge base
function generateKnowledgeBase(products) {
    let markdown = `# Best Bottles - Complete Product Knowledge Base
## Auto-generated from inventory data

**Total Products**: ${products.length}
**Last Updated**: ${new Date().toISOString()}

---

## Product Categories

`;

    // Group by category
    const categories = {};
    products.forEach(product => {
        const category = product.Main_Category || 'Uncategorized';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(product);
    });

    // Generate category overview
    markdown += `### Available Categories:\n\n`;
    Object.keys(categories).forEach(category => {
        markdown += `- **${category}**: ${categories[category].length} products\n`;
    });

    markdown += `\n---\n\n## Product Database\n\n`;
    markdown += `This section contains detailed information about products in our inventory. Products are grouped by family/type to help you understand available variants (Sizes, Colors, Caps).\n\n`;


    // --- SMART GROUPING LOGIC ---
    // We will group products that share similar descriptions or SKU roots

    // 1. Helper to clean product names for grouping
    // e.g. "9ml Roll On Blue" -> "Roll On Bottle"
    const getGroupKey = (product) => {
        const desc = (product.Description || "").toLowerCase();

        // Manual grouping rules based on common patterns
        if (desc.includes('roll') && desc.includes('on')) return "Roll-On Bottles";
        if (desc.includes('vial') || desc.includes('dram')) return "Sample Vials";
        if (desc.includes('dropper')) return "Dropper Bottles";
        if (desc.includes('spray') || desc.includes('atomizer')) return "Sprayers & Atomizers";
        if (desc.includes('pump') || desc.includes('lotion')) return "Lotion Pumps & Bottles";
        if (desc.includes('jar') || desc.includes('cream')) return "Cream Jars";
        if (desc.includes('heart')) return "Decorative Heart Bottles";
        if (desc.includes('octagonal') || desc.includes('tola')) return "Octagonal Tola Bottles";

        return "Other Products"; // Fallback
    };

    // 2. Group products
    const groupings = {};
    products.forEach(product => {
        const key = getGroupKey(product);
        if (!groupings[key]) groupings[key] = [];
        groupings[key].push(product);
    });

    // 3. Generate Knowledge Base by Group
    Object.keys(groupings).sort().forEach((groupName) => {
        const groupProducts = groupings[groupName];

        markdown += `### ${groupName}\n\n`;
        markdown += `There are **${groupProducts.length}** variants available in this category.\n\n`;

        // Consolidate attributes for the summary
        const sizes = [...new Set(groupProducts.map(p => p.Capacity).filter(Boolean))];
        const colors = [...new Set(groupProducts.map(p => p.Color).filter(Boolean))];
        const materials = [...new Set(groupProducts.map(p => p.Material).filter(Boolean))];

        markdown += `**Available Sizes**: ${sizes.join(', ') || 'N/A'}\n`;
        markdown += `**Available Colors**: ${colors.join(', ') || 'N/A'}\n`;
        markdown += `**Materials**: ${materials.join(', ') || 'N/A'}\n\n`;

        markdown += `#### Product Variants:\n\n`;

        // List individual items concisely
        groupProducts.forEach((p) => {
            let features = [];
            if (p.Capacity) features.push(p.Capacity);
            if (p.Color) features.push(p.Color);
            if (p.Item_Type) features.push(p.Item_Type);

            // Extract cap type from description if possible
            let capInfo = "Standard Cap";
            if (p.Description.toLowerCase().includes('black cap')) capInfo = "Black Cap";
            if (p.Description.toLowerCase().includes('white cap')) capInfo = "White Cap";
            if (p.Description.toLowerCase().includes('gold cap')) capInfo = "Gold Cap";
            if (p.Description.toLowerCase().includes('silver cap')) capInfo = "Silver Cap";
            if (p.Description.toLowerCase().includes('dropper')) capInfo = "Dropper";
            if (p.Description.toLowerCase().includes('sprayer')) capInfo = "Sprayer";

            markdown += `- **${p.Description}** (SKU: ${p.SKU})\n`;
            markdown += `  - Details: ${features.join(', ')} with ${capInfo}\n`;
            // Pricing removed to ensure focus on product specs
        });

        markdown += `\n---\n\n`;
    });

    // Add search guide
    markdown += `\n## Product Search Guide\n\n`;
    markdown += `When customers ask about products, use this information to help them find the right bottle:\n\n`;
    markdown += `### By Capacity\n`;
    const capacities = [...new Set(products.map(p => p.Capacity).filter(Boolean))].sort();
    capacities.slice(0, 20).forEach(cap => {
        const count = products.filter(p => p.Capacity === cap).length;
        markdown += `- **${cap}**: ${count} products\n`;
    });

    markdown += `\n### By Material\n`;
    const materials = [...new Set(products.map(p => p.Material).filter(Boolean))];
    materials.forEach(mat => {
        const count = products.filter(p => p.Material === mat).length;
        markdown += `- **${mat}**: ${count} products\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `## Conversation Guidelines\n\n`;
    markdown += `When helping customers:\n\n`;
    markdown += `1. **Ask about their needs**: What will they store? What quantity? What aesthetic?\n`;
    markdown += `2. **Narrow down options**: Use capacity, material, and type to filter\n`;
    markdown += `3. **Provide 2-3 recommendations**: Don't overwhelm with too many choices\n`;
    markdown += `4. **Mention pricing**: Always include bulk discount information\n`;
    markdown += `5. **Suggest related products**: Cross-sell complementary items\n\n`;

    markdown += `## Bulk Pricing Guidelines\n\n`;
    markdown += `Most products offer bulk discounts:\n`;
    markdown += `- Small quantities (1-11): Regular price\n`;
    markdown += `- Medium quantities (12-143): ~5-10% discount\n`;
    markdown += `- Large quantities (144+): ~15-20% discount\n`;
    markdown += `- Custom quantities (1000+): Contact for special pricing\n\n`;

    markdown += `---\n\n`;
    markdown += `*This knowledge base was auto-generated from the Best Bottles inventory CSV file.*\n`;
    markdown += `*For the most up-to-date information, please refer to bestbottles.com*\n`;

    return markdown;
}

// Main execution
try {
    console.log('📦 Parsing CSV file...');
    const products = parseCSV(CSV_PATH);
    console.log(`✅ Parsed ${products.length} products`);

    console.log('📝 Generating knowledge base...');
    const markdown = generateKnowledgeBase(products);

    console.log('💾 Writing to file...');
    fs.writeFileSync(OUTPUT_PATH, markdown, 'utf-8');

    console.log(`✅ Knowledge base created: ${OUTPUT_PATH}`);
    console.log(`📊 File size: ${(markdown.length / 1024).toFixed(2)} KB`);
    console.log('\n🎉 Done! You can now use this file to train your ElevenLabs AI agent.');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
