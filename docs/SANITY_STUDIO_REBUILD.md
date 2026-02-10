# Sanity Studio Rebuild Plan

_Goal_: Rebuild the Best Bottles Sanity Studio **inside this repo** using the insights from the intelligence-platform monorepo, while keeping the implementation native to this Vite SPA stack.

## 1. Design Principles

1. **Model the configurator, not the storefront** – Sanity stores the canonical product definition (glass layers, caps, pricing tiers). Rendering logic stays in React.
2. **Layered assets** – Bottle visuals are composed of multiple transparent PNG layers that share a common canvas (outline, glass, cap, overlays).
3. **Composable relationships** – Products reference reusable `glassOption`, `capOption`, and `fitmentVariant` documents instead of duplicating data.
4. **Future e-commerce bridge** – Keep fields ready for Shopify IDs, pricing tiers, and Supabase syncing without depending on the monorepo’s Next.js setup.

## 2. Schema Overview (implemented in `sanity-studio/schemaTypes/`)

| Type | Purpose | Key Fields |
| --- | --- | --- |
| `glassOption` | Bottle body/finish | `layerImage`, `previewSwatch`, `hexColor`, `priceModifier`, `isDefault` |
| `capOption` | Cap/lid variations | `layerImage`, `previewSwatch`, `finish`, `assemblyOffsetY`, `priceModifier`, `shopifyVariantId` |
| `fitmentVariant` | Groups glass options by applicator type | `defaultGlassOption`, `glassOptions[]`, `description` |
| `productViewerBlock` | Object that controls layered rendering | `outlineImage`, `lightingOverlay`, `shadowLayer`, `layerOrder`, `backgroundColor` |
| `product` | Canonical product document | `fitmentVariants[]`, `capOptions[]`, `defaultCap`, `productViewer`, `priceTiers`, `specifications`, `seo` |
| `homepageConfig` | Existing marketing content | Hero/categorization controls |

All schemas now use the Sanity v5 `defineType` / `defineField` APIs and align with the React data structures already present in `src/types.ts` and `src/lib/sanity*.ts`.

## 3. How to Use the New Studio

1. `cd sanity-studio && npm install` (if needed)
2. `npm run dev`
3. Create content in this order:
   1. Glass Options (upload layered PNGs + swatches)
   2. Cap Options (upload matching PNGs, set offsets)
   3. Fitment Variants (group glass options by applicator style)
   4. Products (link fitments/caps, configure viewer, add pricing)
4. Publish entries – the React app can now query `product`, `glassOption`, etc.

## 4. Frontend Integration Checklist

* Update GROQ queries (or Supabase ingestion) to fetch:
  * `product` → `fitmentVariants[]{glassOptions[]{...}}`, `capOptions[]{...}`, `productViewer`
  * `productViewer` images for layered rendering
* Map Sanity references onto the existing TypeScript interfaces in `src/types.ts`
* Use `urlFor()` from `src/lib/sanity.ts` for all images (already compatible with the new schemas)
* Add a dev-only “Sanity Inspector” route or story to inspect raw data before wiring to production pages

## 5. Migration Tips

* Reuse existing Supabase loaders/scripts by pointing them to the new schema IDs.
* When seeding demo data, create everything via the Sanity API (see `scripts/seed-blueprint-v2.ts` for patterns).
* If you need product snapshots from the monorepo, export JSON via the Sanity CLI there and import here _after_ the schemas match.

## 6. Next Steps

1. Wire the React configurator to these new documents.
2. Replace hard-coded product data in components like `ProductDetailConfigurable`.
3. Extend the Studio with structured content for the rest of the site (Journal, Contact, etc.).
4. Consider generating TypeScript types automatically with `sanity codegen` for strict typing.

The new schemas are live in `sanity-studio/schemaTypes/`. Run `npm run dev` inside `sanity-studio` to verify everything compiles and the content studio reflects the new structure.


