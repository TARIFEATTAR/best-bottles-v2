# Repository audit and gap analysis

Deliverables **A** (repository audit) and **B** (gap analysis) for the Commerce
Knowledge Catalog. Everything here was established by reading this repository,
not from assumption. Where a claim comes from a measurement, the command that
produced it is given.

---

## A. Repository audit

### A.1 What the application actually is

`ARCHITECTURE.md` in the repository root describes a Shopify Hydrogen / Remix /
Convex / Oxygen platform. **That system does not exist in this repository.** It
is a forward-looking rebuild plan for a different repo
(`best-bottles-hydrogen`), and none of its directory structure, Convex schema,
or Hydrogen routes are present. Reading it as a description of the current
system is the single easiest way to get this codebase wrong.

What is actually here:

| Layer | Reality |
|---|---|
| Framework | Vite 6 + React 18 SPA, TypeScript. No SSR, no server, no API routes. |
| Routing | Hand-rolled `view` state machine in `App.tsx` (a `useState` union of ~24 view names). No router library. |
| Hosting | Vercel static hosting; `vercel.json` rewrites everything to `index.html`. |
| Auth + user data | Supabase (`lib/supabase.ts`) — `profiles`, `favorites`, `orders`, `chat_history`, `carts`. |
| CMS / configurator data | Sanity project `gv4os6ef`, dataset `production` (`src/lib/sanity.ts`, `sanity-studio/`). |
| Commerce | Shopify Storefront API called **directly from the browser** in `components/ShopifyProductGrid.tsx`; `@shopify/hydrogen-react`'s `ShopifyProvider` wraps the app in `index.tsx`. |
| Product catalogue | Static JSON committed to the repo: `inventory.json`, `data/*.json`. |
| AI | Google Gemini (`@google/genai`), ElevenLabs, Tavus CVI avatar. |
| Media pipeline | `bottle-image-pipeline/` — 3,333 PNGs plus a Supabase `product_images` table. |
| Tests | **None.** No test runner, no test files. `npm run build` runs `eslint` then `vite build`. |

### A.2 Where product data lives today — five parallel stores

There is no single source of truth. There are five, and they disagree.

| # | Store | Scale | Role today |
|---|---|---|---|
| 1 | `inventory.json` | 461 rows | The catalogue the site renders from. Flat: `sku, name, description, imageUrl, price, bulkPrice, capacity, color, category, subCategory, neckFinish, material, minOrderQty`. |
| 2 | `data/complete_products.json` | 2,274 rows / 2,270 distinct SKUs | The master spreadsheet, already decomposed into `family, type_code, bottle_shape, capacity_ml, applicator, color, cap_color, neck_thread, use_case`. The richest structural source. |
| 3 | `data/verified_products.json` | 261 rows / 260 distinct SKUs | A human-verified subset, with material, pricing tiers, MOQ and image URLs. |
| 4 | `data/scraped_products.json` | 739 rows / 472 distinct SKUs | A scrape of bestbottles.com. Adds `heightWithCap`, `width`, price ladders. |
| 5 | Sanity `product` / `glassOption` / `capOption` / `fitmentVariant` | small | Powers the Paper Doll configurator only. Carries `shopifyProductId`, `sku`, layer images, and `compatibleFitments` / `compatibleGlassOptions` reference arrays. |

Plus 9 root-level `.xlsx` files and 5 more under `data/`, several of which are
the upstream of the JSON above (`Golden_Record_BestBottles.xlsx`,
`BB_MasterList_ZD_V1.ods`, `AI_Ready_Product_Database*.xlsx`), and 85 one-off
scripts in `scripts/` (67 `.ts`, 8 `.js`, 7 `.py`) that read and write these
stores ad hoc.

**Union of distinct SKUs across the four JSON sources: 2,551.**

```
python3 -c "import json,re;
def n(s): return re.sub(r'[\s_]+','',str(s)).strip().upper()
u=set()
for f in ['inventory.json','data/complete_products.json','data/verified_products.json','data/scraped_products.json']:
    u |= {n(r['sku']) for r in json.load(open(f)) if r.get('sku')}
print(len(u))"
```

### A.3 What is canonical today

Nothing is, formally. In practice:

- **Shopify is canonical for nothing yet.** The store is close to empty —
  `ShopifyProductGrid` ships a `DEMO_PRODUCTS` fallback with the comment
  "shown because your Shopify catalog is currently empty". Shopify is a
  destination, not a source. This is the single most important audit finding,
  because it means the catalog can be designed with Shopify as a *consumer*
  without unpicking an established dependency.
- **`inventory.json` is canonical for the live site**, by default rather than
  by decision.
- **Sanity is canonical for configurator layer imagery** and for the small
  amount of hand-curated compatibility that exists.
- **The spreadsheets are canonical for specifications**, in the sense that they
  are where humans put new knowledge — but they reach the site only through a
  hand-run script.

### A.4 Data quality: five concrete defects found

These are not hypothetical risks. Each was reproduced against the committed data.

**1. The `inventory_id` column in the master spreadsheet is not an identifier.**
It holds capacity values. 80 distinct SKUs share the id `10`, 75 share `15`,
51 share `30`. 2,240 rows carry an `inventory_id`; only 1,552 values are
distinct. Anything that joins on it silently merges unrelated products.

**2. The legacy `category` column is site navigation, not item type.**
`inventory.json` has 168 rows in category `Closures`. Many are whole bottles —
`GB3TPlGl` is "Octagonal style 3 ml glass bottle with shiny gold cap", filed
under Closures. Item type cannot be derived from this column.

**3. The `neck_thread` column mixes thread specifications with category labels.**
Real values (`18-415`, `13-415`, `17-415`, `20-400`) sit alongside `Apothecary`,
`Jars`, `Vials`, `Decorative Hearts`, `5ml Elegant`, `Aluminum`, and
`13-415 Atomizers`. 121 rows across the master and verified sets carry a
non-specification value in a specification column.

**4. Materials, colours and cap finishes are unnormalised free text.**
`material` in `inventory.json` alone spells the same fact as `clear glass`,
`Clear glass`, `Clear Glass`, `glass`, `Glass`. `cap_color` in the master set
has **71 distinct values** for what is roughly a dozen colours crossed with three
finishes — `Blk`, `ShnBlk`, `BlkSh`, `Black` are all one colour.

**5. Duplicate SKUs inside a single source.**
`complete_products.json` has 2,274 rows but 2,270 distinct SKUs:
`GBDiva46DrpSl`, `GBDiva46DrpGl`, `GBDiva46DrpCu`, `GBCylAmb5MtlRollBlkSh`.

### A.5 What the SKU grammar already gives us

The legacy SKU is attribute-encoded and consistent enough to decode:

```
GBCylAmb5RollMtlBlkSh
│ │   │  │ │   │  └── cap finish        Sh   shiny
│ │   │  │ │   └───── cap colour        Blk  black
│ │   │  │ └───────── fitment material  Mtl  metal
│ │   │  └─────────── applicator        Roll roller ball
│ │   └────────────── capacity          5    ml
│ └────────────────── glass colour      Amb  amber (absent ⇒ flint)
└──────────────────── family            GBCyl glass bottle, cylinder
```

Type codes: `GB` (2,018), `LB` (231), `CJ` (19), `ALU` (6), plus `CP` for
closure parts. 39 families, 17 shapes, 30 applicator tokens. This is a real
asset: it is how a scrape row with nothing but a SKU can be resolved against a
spreadsheet row, and it is why component decomposition is recoverable rather
than a from-scratch data-entry project.

### A.6 Media and rendering

- `bottle-image-pipeline/` holds 3,333 PNGs organised by SKU-shaped folder
  names (`GBCylAmb5RollMtlBlkSh/`), with `OUTPUT_CLEAN/`, `OUTPUT_UPSCALED/`
  and `organized_components/` variants. Folder naming is inconsistent
  (`1. GBCyl5BlkSht`, `DSC03954.`, `Bell in blue`).
- Supabase `product_images` (`bottle-image-pipeline/database-setup.sql`) tracks
  `sku, bottle_shape, original_color, capacity_ml, cap_type, original_image_url,
  enhanced_image_url, nobg_image_url, branded_bg_url, variation_urls,
  processing_status`. It is a **parallel product model** keyed on SKU text.
- Sanity `glassOption` / `capOption` / `fitmentVariant` each carry an
  `image_url` pointing at Supabase storage, plus hidden `assembly_offset_x/y`.
- Paper Doll layers are 600×1063 PNGs stacked at (0,0).

There is no record anywhere of which image is *approved*, which build a render
depicts, or which asset a derived asset came from.

### A.7 Compatibility knowledge today

Only in Sanity, and only as untyped reference arrays:
`capOption.compatibleFitments[]`, `fitmentVariant.compatibleGlassOptions[]`,
`product.glassOptions[] / fitmentVariants[] / capOptions[]`. There is no
status, no confidence, no evidence, no verifier, and no way to distinguish
"we tested this" from "the threads look the same". `data/roll-on-9ml-cylinder.json`
encodes a full `skuMatrix` for one product family by hand.

### A.8 Technical debt and risks carried by the current setup

| Item | Consequence |
|---|---|
| `ARCHITECTURE.md` describes a system that does not exist | Anyone onboarding builds the wrong mental model. |
| Shopify Storefront token used in browser code | It is a public token, so not a breach, but all catalogue querying is client-side and unbounded. |
| 85 ad-hoc scripts mutating Sanity and Supabase | No batch record, no reversibility, no idea which script last wrote a value. |
| No tests anywhere | No safety net for any data change. |
| Five parallel product stores | Every fix has to be applied five times, or it regresses. |
| `types.ts` `Product` is all strings (`price: string`, `capacity: string`) | Nothing is queryable or comparable without re-parsing. |
| 29 `.xlsx`/`.ods` files and two stale copies (`archive/`, `backup_20251204_125831/`) | Knowledge exists but is not reachable by any system. |
| `bestbottles-intelligence/` monorepo with committed `.next/` build output | A second, partly-built Next.js + Sanity implementation of the same domain. |

---

## B. Gap analysis

Classification per required capability. **EXISTS** / **PARTIAL** / **MISSING**
describe the state before this change; the action column states what was done
or what is proposed.

### B.1 Canonical data foundation

| Capability | State | Action |
|---|---|---|
| Canonical item model | MISSING | **Built** — `catalog_item` + typed specs. |
| Stable machine identity | MISSING (SKU used as identity) | **Built** — `BB-KKK-XXXXXXXXXX`, `catalog/src/domain/ids.ts`. |
| SKU as a business key | EXISTS | **Reused** — kept, demoted from identity. |
| SKU grammar decoding | PARTIAL (implicit in scripts) | **Built** — `catalog/src/ingest/normalizers/sku.ts`. |
| Bottle specification model | PARTIAL (strings) | **Refactored** — `catalog_bottle_spec`, canonical mm/ml. |
| Closure/component model | PARTIAL (Sanity `fitmentVariant`) | **Refactored** — `catalog_closure_spec` as first-class items. |
| Governed attributes | MISSING | **Built** — `catalog_attribute_definition` + `_value`. |
| Material / finish / colour vocabulary | MISSING | **Built** — `catalog/src/domain/vocab.ts` with alias tables. |
| Canonical units | MISSING | **Built** — `catalog/src/domain/units.ts`, one stored value. |
| Lifecycle + soft delete | PARTIAL (Sanity `status`) | **Refactored** — `catalog_lifecycle_state`. |

### B.2 Relationships and configuration

| Capability | State | Action |
|---|---|---|
| Compatibility relationships | PARTIAL (untyped Sanity arrays) | **Refactored** — `catalog_compatibility_edge`. |
| Compatibility status / confidence | MISSING | **Built** — verified / likely / conditional / incompatible. |
| Compatibility evidence | MISSING | **Built** — `basis`, `verified_by`, `verified_at`. |
| Neck-finish rule inference | MISSING | **Built** — capped at `likely` / 0.60 by a DB constraint. |
| Configuration model | PARTIAL (`skuMatrix` JSON for one family) | **Built** — `catalog_configuration` + components. |
| Configuration validation | MISSING | **Built** — `validateConfiguration()`. |
| Use-case / intent model | MISSING (prose only) | **Built** — `catalog_use_case_fitness`. |

### B.3 Provenance and quality

| Capability | State | Action |
|---|---|---|
| Source registry | MISSING | **Built** — `catalog_source` with precedence rank. |
| Fact-level provenance | MISSING | **Built** — `catalog_fact_assertion`. |
| Conflict detection | MISSING (last write wins) | **Built** — `catalog_conflict`; 1,105 real conflicts found. |
| Conflict resolution | MISSING | **Built** — `catalog_field_resolution`. |
| Verification state | PARTIAL (a `verified` boolean) | **Refactored** — 4-state enum. |
| Completeness scoring | MISSING | **Built** — `catalog_item_completeness`. |
| Missing-data reporting | MISSING | **Built** — `catalog_health`, per-item `missing_fields`. |
| Audit history | MISSING | **Built** — `catalog_audit_event`. |

### B.4 Ingestion

| Capability | State | Action |
|---|---|---|
| Import pipeline | MISSING (85 one-off scripts) | **Built** — `catalog/src/ingest/pipeline.ts`. |
| Import batches | MISSING | **Built** — `catalog_import_batch`. |
| Immutable raw records | MISSING | **Built** — `catalog_raw_record`, append-only by rule. |
| Reusable field mappings | MISSING | **Built** — `catalog/src/ingest/mapping.ts`. |
| Entity matching | MISSING | **Built** — ranked signals, review on ambiguity. |
| Deduplication | MISSING | **Built** — `findDuplicateKeys`, external-id uniqueness guard. |
| Validation at the boundary | MISSING | **Built** — coercers that report rather than guess. |
| One-off scripts in `scripts/` | — | **Deprecate** — see the migration plan. |

### B.5 Media

| Capability | State | Action |
|---|---|---|
| Assets as records | PARTIAL (`product_images`, keyed on SKU text) | **Refactored** — `catalog_media_asset` keyed on `catalog_id`. |
| Approval state | MISSING | **Built** — attributable approval, one approved hero per item. |
| Asset lineage | PARTIAL (`variation_urls` JSON) | **Refactored** — `derived_from_asset_id`. |
| Render vs photograph | MISSING | **Built** — `catalog_asset_origin`. |
| Render parameters | EXISTS (in the pipeline) | **Reuse** — `catalog_render_spec` holds refs, not copies. |
| Paper Doll layers | EXISTS (Sanity) | **Reuse** — `asset_type = 'paper_doll_layer'` + `layer_index`. |

### B.6 Knowledge, channels and consumers

| Capability | State | Action |
|---|---|---|
| FAQ / product knowledge | PARTIAL (`docs/Grace_KB_FAQ.md`, prose) | **Built** — `catalog_knowledge_entry`, review-gated. |
| AI-draft safety | MISSING | **Built** — DB constraint blocks publishing an unreviewed AI draft. |
| Customer terminology | MISSING | **Built** — `catalog_term_synonym`. |
| Question ingestion | MISSING | **Built** — `catalog_customer_question` lifecycle. |
| Review evidence | MISSING | **Built** — evidence and AI interpretation stored separately. |
| Shopify mapping | PARTIAL (`shopifyProductId` on a Sanity doc) | **Refactored** — `catalog_external_id`. |
| Channel feeds | MISSING | **Deferred to P5** — schema is ready, transformers are not built. |
| Public/private separation | MISSING | **Built** — `catalog_public_*` views + RLS deny-by-default. |
| Consumer API layer | MISSING | **Deferred to P4** — the views are the stable contract. |
| Structured search | MISSING | **Partial foundation** — indexes on capacity, neck, colour, material. |
| Semantic search / embeddings | MISSING | **Deferred** — deliberately not built. |

---

## Measured result of the first ingestion run

`npm run catalog:ingest`, over all four legacy datasets:

```
bestbottles.com scrape        discovered 739   created  452  updated 267  review 20
Legacy site catalogue         discovered 461   created   71  updated 389  review  1
Master product spreadsheet    discovered 2274  created 2007  updated 267  review  0
Verified product subset       discovered 261   created    0  updated 261  review  0

total items            2530        (= 2,551 distinct SKUs − 21 unclassifiable)
rejected rows          0
average completeness   51.4%
open conflicts         1105
inferred compatibility 14788 edges, all "likely", none verified
```

No legacy SKU is lost: every one becomes either a catalog item or an explicit
review-queue entry. That invariant is asserted by a test
(`catalog/tests/ingest.test.ts`, "every distinct legacy SKU is either an item
or an explicit review entry") that runs against the real files.

The largest gaps the catalog now reports, which is the point of building it:

| Missing | Items |
|---|---|
| Approved hero image | 2,530 |
| Case quantity | 2,530 |
| Stock status | 2,530 |
| Diameter | 2,368 |
| Height | 2,368 |
| Country of origin | 2,368 |
| Minimum order quantity | 2,069 |
| Pricing | 2,006 |
| Description | 2,006 |
| Glass colour | 912 |
