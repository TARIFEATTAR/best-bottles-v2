# The Convex storefront catalog

**This document corrects a material omission in the first version of the
audit.** That version said Best Bottles product data lived in five stores and
that nothing was canonical. There is a sixth store, it is live, and it is the
closest thing to a canonical product catalog that currently exists.

---

## What was missed, and why

Every Convex reference *inside this repository* is forward-looking:
`ARCHITECTURE.md` proposes a Hydrogen + Convex rebuild, and `docs/migration.md`
is a Supabase→Convex translation table. There is no `convex/` directory, no
`convex` dependency in any `package.json`, no `_generated` API, and no
`graceSku`, `websiteSku` or deployment id anywhere in the tree. A search of the
whole repository returns nothing.

So on repository evidence alone, the conclusion "Convex is aspirational" was
defensible. It was also wrong, because **the live storefront is a different
repository**, and this one is not it.

The evidence is in the `madison-hero-sync` pipeline documentation, which
describes a running production system.

---

## What actually exists

```
Convex production     precise-raccoon-123.convex.cloud     ~2,325 product rows
Convex dev            helpful-elephant-638.convex.cloud
Sanity project        gh97irjh, dataset "production"
Storefront repo       Best-Bottles-Website-02-20-2026/     Next.js App Router
Live PDP              src/app/products/[slug]/page.tsx
Catalog CSV           Nemat_Product_Catalog.csv            2,321 SKUs
```

Note the Sanity project id: **`gh97irjh`**. This repository uses **`gv4os6ef`**.
They are two different Sanity projects. Any statement about "the Sanity data"
has to say which one.

### The Convex tables

| Table | Fields referenced by the pipeline |
|---|---|
| `products` | `websiteSku`, `graceSku`, `imageUrl`, `imageUrlCapOff`, `applicator`, `capStyle`, `capColor`, `trimColor`, `heightWithCap`, `heightWithoutCap`, `diameter`, `widthMm`, `depthMm`, `graceDescription` |
| `productGroups` | `slug`, `heroImageUrl`, `paperDollFamilyKey` |

Public mutation `setVariantImages()`; export queries in
`convex/exportEnrichedCatalog.ts` (`exportEnriched`, `exportEnrichedPage` —
the paginated one is required because the full catalog exceeds Convex's 16 MB
read limit); backfill mutations including
`backfillTrimColorFromDescription.ts`.

### Two SKU keys

| Key | Format | Example |
|---|---|---|
| `products.websiteSku` | shorthand camelcase | `GBEmp50AnSpTslRed` |
| `products.graceSku` | canonical hyphenated | `GB-EMP-CLR-50ML-AST-RED` |
| `productGroups.slug` | URL path | `empire-50ml-clear-18-415-antiquespray-tassel` |

**`websiteSku` uses exactly the grammar this repository's SKUs use.** That is
the single most useful fact in this document: it means the 2,530 items already
ingested here join to the storefront catalog directly, with no fuzzy matching.
`catalog/tests/graceSku.test.ts` asserts the join on both documented pairs.

`graceSku` is attribute-encoded — type, family, colour, capacity, applicator,
cap colour. It is a *second business key*, mapped as
`catalog_external_id.system = 'grace_sku'`, and for the same reason as
`websiteSku` it is not identity: correcting a cap colour rewrites it.

---

## What this changes about the architecture

### Convex is not "Shopify-like empty" — the earlier framing was wrong

The first version of the architecture document argued that the catalog could
become canonical cheaply because Shopify was near-empty and nothing else
claimed the role. Half of that still holds: Shopify *is* near-empty, and the
SPA in this repository *does* ship a `DEMO_PRODUCTS` fallback.

But the storefront pipeline states plainly:

> **Source of truth is BB Convex production (`precise-raccoon-123`) — NOT
> the CSV.** The CSV is incomplete; Convex is complete (or correctable via
> backfill mutations).

So this is not a vacuum. Introducing the knowledge catalog without deciding its
relationship to Convex would create exactly the duplicate-source-of-truth
failure the catalog exists to end — and it would be the *seventh* store, not
the first.

### The consequential decision, and both alternatives

Per the brief: where two approaches produce materially different long-term
systems, document both and recommend one.

**Option A — extend Convex to hold the catalog model.**
One fewer system. The storefront already reads it reactively, the team already
runs backfill mutations against it, and `promptReadiness` shows they are
already thinking in completeness terms.

Against it: Convex has no check constraints, so every guarantee this catalog
enforces in the database — a rule may not claim a verified fit, an AI draft may
not publish unreviewed, an item has at most one approved hero, approval is
attributable — becomes application code that a future mutation can bypass. It
has no row-level security, so the public/private split for cost and supplier
data becomes a discipline rather than a boundary. And a 14,788-edge
compatibility graph with range queries over capacity, neck and material is
relational work.

**Option B — the catalog is canonical for knowledge; Convex is the serving
layer. ← recommended**

The catalog owns *what a thing is*: specifications, compatibility, provenance,
conflicts, media approval, completeness. Convex keeps owning *what the site
serves*: the reactive read layer the Next.js PDP renders from, plus the
storefront-specific fields (`paperDollFamilyKey`, prompt-assembly inputs) that
exist for rendering rather than for truth.

Convex stops being where facts are *authored* and becomes where they are
*published* — the same relationship this architecture already gives Shopify and
Sanity. Nothing about the live PDP has to change to start; Convex is registered
as a ranked ingestion source today, and the write direction is added later.

This is the same argument already made for Shopify, applied consistently. A
system that cannot express "this fit is likely, not verified" or "this height
came from a scrape in 2024" should not be the place those facts live.

### Source precedence

Both storefront sources are registered in `catalog_source` by migration
`0006_convex_channel.sql`:

| Source | Rank | Reasoning |
|---|---|---|
| `physical-measurement` | 100 | |
| `verified-products` | 90 | |
| `bb-live-pdp` | **65** | The pipeline treats the live PDP as the arbiter: *"If Convex disagrees with the live PDP, PDP wins — Convex is wrong."* |
| `bb-convex-production` | **60** | Actively curated and backfilled, so above the spreadsheets — but explicitly not infallible. |
| `master-spreadsheet` | 50 | |
| `legacy-inventory-json` | 40 | |
| `website-scrape` | 30 | |

That ordering is asserted in `catalog/tests/schema_guarantees.sql`: the PDP
must outrank Convex, and neither may outrank a human verification or a physical
measurement.

The consequence is worth stating plainly: Convex data entering the catalog
**competes on the normal conflict rules**. It beats a spreadsheet. It does not
beat something a person measured. Where it disagrees with a higher-ranked
source, a conflict is opened rather than a value overwritten.

---

## What already agrees between the two systems

The storefront arrived at several of the same conclusions independently, which
is a good sign for the model rather than a coincidence:

| Storefront | This catalog |
|---|---|
| `promptReadiness` block: six per-field booleans plus `isReady` | `catalog_item_completeness`: `missing_fields` plus `production_ready` |
| `audit-enriched-catalog.py` exits 1 when SKUs are blocked | `production_ready` gates promotion |
| Dimensions carry tolerance: `"110 ±2 mm"` | `value` + `tolerance` stored separately, same information |
| `trimColor` is parsed from `graceDescription`, not guessed from the SKU suffix | resolvers return `undefined` rather than guessing |
| Hero AI for grid cards, paper-doll for swatch swaps | `catalog_asset_type` distinguishes `hero` from `paper_doll_layer`; `origin` distinguishes `render` from `photograph` |

`CONVEX_PROMPT_READINESS_FIELDS` in
`catalog/src/ingest/normalizers/graceSku.ts` maps the storefront's six gating
fields onto catalog field paths, so an item this catalog calls complete while
the storefront calls it blocked is a detectable disagreement.

One difference is deliberate and should not be reconciled away: the storefront
stores dimensions as display strings (`"110 ±2 mm"`) and re-parses them at
every use — the pipeline docs record a real bug caused by *not* parsing them
(`[NOT IN HUB]` placeholders, and gpt-image-2 inventing bottle proportions).
The catalog parses once at the boundary, via `parseConvexDimension`.

---

## What was built for this, and what was not

**Built:**

- `convex_product`, `convex_product_group` and `grace_sku` external-id systems
  (migration `0006`, and `ExternalSystem` in `domain/types.ts`).
- `bb-convex-production` and `bb-live-pdp` registered as ranked sources.
- `cap_style`, `trim_color`, `paper_doll_family_key` and `grace_description`
  declared through the governed attribute layer — storefront-specific fields do
  not widen the core tables.
- `catalog_convex_drift` view: identity coverage in both directions.
- `catalog/src/ingest/normalizers/graceSku.ts`: graceSku codec, legacy→grace
  applicator resolution, Convex dimension parsing, readiness-field mapping.
- 18 tests, plus schema guarantees for the mappings, the drift view and the
  source ranking.

**Not built, and why:** a live Convex ingestion adapter. This environment has
no Convex credential, and the storefront repository is not present. Writing an
adapter against a schema I have only read *about* would be exactly the
fabrication this catalog is designed to prevent.

Everything the adapter needs is in place. When someone runs it with access:

```ts
// catalog/src/ingest/sources/convexStorefront.ts
export function convexStorefrontAdapter(catalogEnrichedJsonPath: string): SourceAdapter {
  return {
    source: {
      id: 'bb-convex-production',                  // already registered, rank 60
      label: 'Best Bottles storefront catalog (Convex precise-raccoon-123)',
      kind: 'legacy_database',
      locator: 'precise-raccoon-123.convex.cloud',
      parserVersion: '0.1.0',
    },
    read: () => rows.map((row, i) => ({
      locator: `convex:products[${i}]`,
      sourceKey: row.websiteSku,                   // joins to this catalog's sku
      payload: row,
      kind: decodeSku(row.websiteSku).kind,
      sku: row.websiteSku,
      externalIds: [
        { system: 'convex_product', externalId: row._id },
        { system: 'grace_sku',      externalId: row.graceSku },
      ],
      facts: [
        { field: 'bottle.heightWithClosureMm',    value: parseConvexDimension(row.heightWithCap) },
        { field: 'bottle.heightWithoutClosureMm', value: parseConvexDimension(row.heightWithoutCap) },
        { field: 'bottle.diameterMm',             value: parseConvexDimension(row.diameter) },
        { field: 'closure.colourLabel',           value: row.capColor },
        // ...
      ].filter((f) => f.value !== undefined),
    })),
  };
}
```

Generate the input with the storefront repo's existing exporter —
`node pipeline/madison-hero-sync/export-enriched.mjs`, which pages at 200 rows
to stay under the 16 MB read limit — then add the adapter to
`catalog/src/cli/ingest.ts`.

Two things to expect on that first run, both of which are the system working:

- **A large number of conflicts.** Convex at rank 60 meets the master
  spreadsheet at 50 and the scrape at 30 on ~2,300 overlapping SKUs. Those
  conflicts are the reconciliation backlog, and they are the most valuable
  output of the run.
- **Roughly 200 items with no storefront row.** This catalog holds 2,530 items
  against the storefront's ~2,325. `catalog_convex_drift` will name them.
  Some will be genuinely retired products; some will be packaging and
  accessories the storefront does not sell as line items; some will be gaps.
  Do not assume which without looking.

## Open questions for the team

1. **Which repository is the future?** This one (Vite SPA, Sanity `gv4os6ef`,
   Supabase) or `Best-Bottles-Website-02-20-2026` (Next.js, Convex, Sanity
   `gh97irjh`)? The audit in doc 01 describes this one. If the other is the
   live site, several of that document's conclusions apply only here.
2. **Two Sanity projects — intentional?** `gv4os6ef` and `gh97irjh` both hold
   Best Bottles product content.
3. **Is `Nemat_Product_Catalog.csv` (2,321 SKUs) the same population as this
   repo's 2,551?** The overlap is the real migration surface and cannot be
   measured from here.
4. **Who owns a specification once both systems are live?** The recommendation
   is the catalog, with Convex as the serving layer — but that is a decision
   for the team, not for this document.
