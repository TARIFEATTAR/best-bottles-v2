# Best Bottles Data Reference Guide

## Complete Product List Location

### **Primary File: `data/curated/products_enriched.json`** ⭐ RECOMMENDED

This is the **most comprehensive single file** containing all product data with complete information:

- **485 products** (as of last build)
- **All data points**: SKU, name, description, pricing, capacity, dimensions, materials, closure types
- **Enriched fields**: Use cases, related products, searchable text, closure types, capacity ranges
- **Taxonomy**: Category classifications
- **Statistics**: Summary stats for use cases, closure types, capacity ranges

**Structure:**
```json
{
  "generatedAt": "2025-12-05T18:17:29.098Z",
  "recordCount": 485,
  "stats": { ... },
  "products": [
    {
      "id": "...",
      "sku": "Alu500",
      "name": "...",
      "description": "...",
      "url": "...",
      "capacityMl": 500,
      "closureType": "screw-cap",
      "useCases": ["perfume", "attar"],
      "materialsDetailed": ["aluminum"],
      "pricing": [...],
      "taxonomy": { "category": "..." },
      ...
    }
  ]
}
```

### Other Product Files (Less Complete)

1. **`data/curated/products.json`** - Normalized products (before enrichment)
2. **`data/curated/products_classified.json`** - Products with taxonomy (before enrichment)
3. **`data/staging/products_raw.json`** - Raw scraped data (before normalization)
4. **`rag_dataset.json`** - Chunked knowledge base for LLM (derived from enriched products)

## Knowledge Base Files

### **`data/knowledge_base/documents.json`**
- Chunked documents ready for vector search
- Includes products + FAQ + contact + guides
- Used by the RAG system

### **`rag_dataset.json`**
- Complete export for LLM consumption
- Includes system prompt, config, documents, embeddings index
- Best for sharing/backing up the knowledge base

## How to View the Complete Product List

### Option 1: JSON Viewer (Recommended)
```bash
# Open in VS Code or any JSON viewer
code data/curated/products_enriched.json

# Or use jq for formatted output
cat data/curated/products_enriched.json | jq '.products | length'
cat data/curated/products_enriched.json | jq '.products[0]'
```

### Option 2: Export to CSV
```bash
# Create a script to export to CSV for Excel/Google Sheets
node -e "
const data = require('./data/curated/products_enriched.json');
const products = data.products;
const headers = ['SKU', 'Name', 'Capacity (ml)', 'Closure Type', 'Use Cases', 'Price Range', 'URL'];
const rows = products.map(p => [
  p.sku,
  p.name,
  p.capacityMl || '',
  p.closureType || '',
  (p.useCases || []).join('; '),
  p.pricing?.[0]?.price || '',
  p.url
]);
console.log(headers.join(','));
rows.forEach(r => console.log(r.map(c => '\"' + c + '\"').join(',')));
" > products_export.csv
```

### Option 3: Create a Product Browser Script
See `REFINING_KNOWLEDGE_BASE.md` for a script to browse and edit products.

## Refining the Knowledge Base for Accuracy

### Current Issues Identified

1. **Incorrect Closure Type Recommendations**
   - Perfume → Should be spray atomizer (not dropper/vial)
   - Beard oil → Should be dropper (not roll-on)
   - Lotion → Should be pump (not roll-on)

2. **Wrong Size Recommendations**
   - Perfume bottles → Should be 10ml+ (not 1-2ml samples)

3. **Missing Clarifying Questions**
   - Generic "perfume bottle" requests need clarification

### Refinement Process

#### Step 1: Review Product Data Quality

```bash
# Check products with missing closure types
node -e "
const data = require('./data/curated/products_enriched.json');
const missing = data.products.filter(p => !p.closureType);
console.log(\`Products missing closure type: \${missing.length}\`);
missing.slice(0, 10).forEach(p => console.log(\`- \${p.sku}: \${p.name}\`));
"

# Check products with incorrect use case mappings
node -e "
const data = require('./data/curated/products_enriched.json');
const perfumeWithDropper = data.products.filter(p => 
  p.useCases?.includes('perfume') && p.closureType === 'dropper'
);
console.log(\`Perfume products with dropper closure: \${perfumeWithDropper.length}\`);
"
```

#### Step 2: Fix Product Data

1. **Update Closure Types**: Ensure products have correct `closureType` field
2. **Fix Use Cases**: Verify `useCases` array matches actual product use
3. **Add Missing Data**: Fill in gaps in capacity, materials, dimensions

#### Step 3: Enhance Use Case Knowledge

Edit `src/knowledge/useCaseKnowledge.js` to add more rules:
- More use case → closure type mappings
- More capacity expectations
- More material preferences

#### Step 4: Improve System Prompt

Edit `src/knowledge/queryHandler.js` to refine the `SYSTEM_PROMPT`:
- Add more explicit rules
- Add more examples of correct recommendations
- Strengthen warnings about common mistakes

#### Step 5: Rebuild Knowledge Base

After making changes:
```bash
# Re-enrich products (if you edited enrichment logic)
node src/knowledge/enrichProducts.js

# Rebuild knowledge base
npm run kb:build

# Regenerate embeddings
npm run kb:embeddings

# Re-index vector store
npm run kb:index

# Export updated dataset
npm run rag:export
```

#### Step 6: Test Improvements

```bash
# Run test suite
npm run rag:test-suite

# Review HTML report
open reports/test_suite_results.html

# Test specific questions
npm run rag:chat
```

## Recommended Workflow for Refinement

1. **Start with `products_enriched.json`** - This is your source of truth
2. **Identify patterns** - Look for products with incorrect closure types or use cases
3. **Fix data at source** - Update the enrichment logic or manually correct products
4. **Add domain knowledge** - Expand `useCaseKnowledge.js` with more rules
5. **Test thoroughly** - Run test suite and review HTML report
6. **Iterate** - Make small changes, test, repeat

## Quick Reference: File Purposes

| File | Purpose | When to Use |
|------|---------|-------------|
| `data/curated/products_enriched.json` | **Complete product catalog** | Viewing all products, data analysis |
| `data/knowledge_base/documents.json` | Chunked for vector search | RAG system uses this |
| `rag_dataset.json` | Complete export for LLM | Sharing knowledge base |
| `src/knowledge/useCaseKnowledge.js` | Domain rules | Editing accuracy rules |
| `src/knowledge/queryHandler.js` | System prompt | Editing assistant behavior |

## Next Steps

1. **Review `products_enriched.json`** to understand current data quality
2. **Identify products with incorrect closure types** (e.g., perfume with dropper)
3. **Update enrichment logic** in `src/knowledge/enrichProducts.js` if needed
4. **Add more rules** to `useCaseKnowledge.js` based on patterns you find
5. **Test changes** with `npm run rag:test-suite`















