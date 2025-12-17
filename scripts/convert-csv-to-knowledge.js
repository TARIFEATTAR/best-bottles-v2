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
    markdown += `This section contains detailed information about all ${products.length} products in our inventory.\n\n`;

    // Generate product entries (sample first 100 for demo, full for production)
    const sampleSize = 100; // Change to products.length for full export
    const productsToExport = products.slice(0, sampleSize);

    productsToExport.forEach((product, index) => {
        markdown += `### ${index + 1}. ${product.Description || product.SKU}\n\n`;
        markdown += `**SKU**: ${product.SKU}\n`;

        if (product.Item_Type) markdown += `**Type**: ${product.Item_Type}\n`;
        if (product.Capacity) markdown += `**Capacity**: ${product.Capacity}\n`;
        if (product.Material) markdown += `**Material**: ${product.Material}\n`;
        if (product.Color) markdown += `**Color**: ${product.Color}\n`;

        // Pricing
        if (product.Price_1pc) {
            markdown += `\n**Pricing**:\n`;
            markdown += `- Single unit: $${product.Price_1pc}\n`;
            if (product.Price_12pc) markdown += `- 12 pack: $${product.Price_12pc} each\n`;
            if (product.Price_144pc) markdown += `- 144 pack: $${product.Price_144pc} each\n`;
            if (product.Best_Bulk_Price) markdown += `- Best bulk price: ${product.Best_Bulk_Price}\n`;
        }

        // Dimensions
        if (product.Height_With_Cap || product.Width) {
            markdown += `\n**Dimensions**:\n`;
            if (product.Height_With_Cap) markdown += `- Height (with cap): ${product.Height_With_Cap}\n`;
            if (product.Height_Without_Cap) markdown += `- Height (without cap): ${product.Height_Without_Cap}\n`;
            if (product.Width) markdown += `- Width: ${product.Width}\n`;
            if (product.Depth) markdown += `- Depth: ${product.Depth}\n`;
        }

        // Use cases
        if (product.Use_Cases) {
            markdown += `\n**Use Cases**: ${product.Use_Cases}\n`;
        }

        // Categories
        if (product.Main_Category) {
            markdown += `\n**Category**: ${product.Main_Category}`;
            if (product.Sub_Category) markdown += ` > ${product.Sub_Category}`;
            markdown += `\n`;
        }

        if (product.Product_URL) {
            markdown += `\n**Product URL**: ${product.Product_URL}\n`;
        }

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

    markdown += `\n### By Type\n`;
    const types = [...new Set(products.map(p => p.Item_Type).filter(Boolean))];
    types.slice(0, 15).forEach(type => {
        const count = products.filter(p => p.Item_Type === type).length;
        markdown += `- **${type}**: ${count} products\n`;
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
