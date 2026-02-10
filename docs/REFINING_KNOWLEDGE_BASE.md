# Refining the Knowledge Base for Accuracy

## Overview

This guide walks you through systematically improving the accuracy of the Best Bottles RAG system by:
1. Identifying data quality issues
2. Fixing product data
3. Enhancing domain knowledge rules
4. Testing improvements

## Step 1: Analyze Current Data Quality

Run the analysis script to identify issues:

```bash
npm run analyze:products
```

This will show you:
- Products missing closure types
- Potential incorrect closure type mappings (e.g., perfume with dropper)
- Products with wrong capacity ranges
- Missing use cases
- Distribution statistics

## Step 2: Identify Specific Issues

### Common Issues Found

1. **Perfume products with dropper/vial closures**
   - Should be spray atomizer
   - Check if these are actually sample vials (should have "sample" in use cases)

2. **Beard oil products with roll-on closures**
   - Should be dropper
   - These are incorrect mappings

3. **Perfume products <5ml without "sample" use case**
   - Should either be marked as samples or have larger capacity

4. **Missing closure types**
   - Products without closure type can't be properly recommended

## Step 3: Fix Product Data

### Option A: Fix via Enrichment Logic

Edit `src/knowledge/enrichProducts.js` to improve closure type detection:

```javascript
// Improve closure type detection patterns
const CLOSURE_PATTERNS = [
  { pattern: /spray|sprayer|mist|atomizer/i, closure: "spray" },
  { pattern: /roll[-\s]?on|roller/i, closure: "roll-on" },
  { pattern: /dropper|dropper\s*bottle/i, closure: "dropper" },
  { pattern: /pump|lotion\s*pump|treatment\s*pump/i, closure: "pump" },
  { pattern: /screw\s*cap|cap|plug/i, closure: "screw-cap" },
  { pattern: /glass\s*stopper/i, closure: "glass-stopper" },
  // Add more specific patterns
];
```

### Option B: Manual Data Correction

If you need to manually fix specific products, create a correction script:

```javascript
// src/scripts/fixProducts.js
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const enrichedPath = resolve(process.cwd(), "data/curated/products_enriched.json");

const corrections = {
  // SKU: { closureType: "correct-type", useCases: ["updated", "use", "cases"] }
  "SKU123": { closureType: "spray", useCases: ["perfume"] },
  "SKU456": { closureType: "dropper", useCases: ["beard-oil"] }
};

const fixProducts = async () => {
  const data = JSON.parse(await readFile(enrichedPath, "utf8"));
  
  data.products.forEach(product => {
    if (corrections[product.sku]) {
      const fix = corrections[product.sku];
      if (fix.closureType) product.closureType = fix.closureType;
      if (fix.useCases) product.useCases = fix.useCases;
      console.log(`Fixed ${product.sku}`);
    }
  });
  
  await writeFile(enrichedPath, JSON.stringify(data, null, 2), "utf8");
  console.log("Products fixed!");
};

await fixProducts();
```

## Step 4: Enhance Domain Knowledge Rules

Edit `src/knowledge/useCaseKnowledge.js` to add more rules:

### Add More Use Case Mappings

```javascript
closureTypes: {
  // Existing...
  "hair-serum": ["dropper"],
  "face-serum": ["dropper"],
  "body-oil": ["pump", "dropper"], // Can be either
  "shampoo": ["pump"],
  "conditioner": ["pump"],
  // Add more as you discover patterns
}
```

### Add More Avoid Mappings

```javascript
avoidMappings: {
  // Existing...
  "hair-serum": ["roll-on", "spray"],
  "face-serum": ["roll-on", "spray"],
  // Add more to prevent wrong recommendations
}
```

### Improve Clarifying Questions

```javascript
export const getClarifyingQuestions = (query) => {
  const lower = query.toLowerCase();
  const questions = [];

  // Add more specific clarifying questions
  if (lower.includes("oil") && !lower.includes("essential") && !lower.includes("beard")) {
    questions.push("What type of oil are you looking for? We have options for beard oil (dropper), face oil (dropper), and essential oils (dropper or cap).");
  }

  // ... existing logic
};
```

## Step 5: Improve System Prompt

Edit `src/knowledge/queryHandler.js` to strengthen the system prompt:

### Add More Explicit Examples

```javascript
const SYSTEM_PROMPT = `...

**EXAMPLES OF CORRECT RECOMMENDATIONS:**

✅ Customer: "I need a perfume bottle"
   Response: "We have many perfume bottles in different sizes and styles. What size are you looking for? We have spray atomizers in 10ml, 30ml, 50ml, and 100ml sizes."

✅ Customer: "I need a 30ml perfume bottle"
   Response: "Here are our 30ml spray atomizer bottles perfect for perfume: [list products with spray atomizer, 30ml capacity]"

❌ WRONG: Recommending 1ml dropper vials for "perfume bottle"
❌ WRONG: Recommending roll-on for "beard oil"
❌ WRONG: Recommending 1ml bottle when customer asks for "perfume bottle"

...`;
```

## Step 6: Rebuild and Test

After making changes:

```bash
# 1. Re-enrich products (if you changed enrichment logic)
node src/knowledge/enrichProducts.js

# 2. Rebuild knowledge base
npm run kb:build

# 3. Regenerate embeddings
npm run kb:embeddings

# 4. Re-index vector store
npm run kb:index

# 5. Export updated dataset
npm run rag:export

# 6. Test improvements
npm run rag:test-suite

# 7. Review HTML report
open reports/test_suite_results.html
```

## Step 7: Iterative Refinement Process

1. **Run analysis** → `npm run analyze:products`
2. **Identify top issues** → Focus on highest-impact problems first
3. **Make targeted fixes** → Fix 5-10 products or add 1-2 rules
4. **Rebuild knowledge base** → Steps 1-5 above
5. **Test changes** → `npm run rag:test-suite`
6. **Review results** → Check HTML report for improvements
7. **Repeat** → Continue iterating

## Priority Fixes

### High Priority (Fix First)
1. ✅ Perfume products with dropper/vial (unless samples)
2. ✅ Beard oil products with roll-on
3. ✅ Products missing closure types
4. ✅ Generic "perfume bottle" queries not asking for clarification

### Medium Priority
1. Products with incorrect use cases
2. Missing capacity information
3. Products with wrong material classifications

### Low Priority
1. Missing related products
2. Incomplete descriptions
3. Missing images

## Testing Strategy

### 1. Run Full Test Suite
```bash
npm run rag:test-suite
```

### 2. Test Specific Scenarios
```bash
npm run rag:chat
# Then test:
# - "I need a perfume bottle"
# - "Do you have beard oil bottles?"
# - "What bottles do you have for lotion?"
```

### 3. Review HTML Report
- Check each question's response
- Verify correct closure types are recommended
- Ensure clarifying questions are asked when needed
- Look for patterns in failures

## Monitoring Improvements

Track these metrics over time:
- **Source relevance rate** (should increase)
- **Product mention rate** (should increase)
- **Response accuracy** (manual review)
- **Clarifying questions asked** (should increase for ambiguous queries)

## Quick Reference: Files to Edit

| File | What to Edit | When |
|------|--------------|------|
| `src/knowledge/enrichProducts.js` | Closure type detection, use case extraction | Fixing product data issues |
| `src/knowledge/useCaseKnowledge.js` | Domain rules, mappings | Adding accuracy rules |
| `src/knowledge/queryHandler.js` | System prompt | Improving assistant behavior |
| `data/curated/products_enriched.json` | Product data | Manual corrections (rare) |

## Example: Fixing Perfume Bottle Issue

1. **Identify**: Run `npm run analyze:products` → See "Perfume products with dropper/vial: X"

2. **Investigate**: Check if these are actually samples:
   ```bash
   # Check products
   node -e "
   const data = require('./data/curated/products_enriched.json');
   const issues = data.products.filter(p => 
     p.useCases?.includes('perfume') && p.closureType === 'dropper'
   );
   issues.forEach(p => console.log(\`\${p.sku}: \${p.name} - Use cases: \${p.useCases?.join(', ')}\`));
   "
   ```

3. **Fix**: 
   - If they're samples → Add "sample" to use cases
   - If they're not samples → Change closure type to "spray" or fix enrichment logic

4. **Rebuild**: Run rebuild steps above

5. **Test**: Verify with `npm run rag:test-suite`

## Next Steps

1. Run `npm run analyze:products` to see current state
2. Pick the top 3 issues to fix
3. Make targeted changes
4. Rebuild and test
5. Review results and iterate















