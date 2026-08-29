# Migration strategy and implementation plan

Deliverables **E** (migration strategy) and **F** (implementation plan).

---

## E. Migration strategy

### E.1 Principle: additive, reversible, and proven before promotion

Nothing in this phase deletes, rewrites or repoints an existing store. The
catalog is created alongside the current five stores; the site keeps reading
`inventory.json` and Sanity exactly as it does today. Cutover happens per
consumer, later, when the catalog earns it.

The migration therefore has three separable stages, and only the first is done:

```
  STAGE 1  ingest & stage        ← done, and asserted by tests
  STAGE 2  review & promote      ← operator work, needs the P2 tooling
  STAGE 3  cut consumers over    ← per consumer, one at a time
```

### E.2 Stage 1 — ingest and stage (complete)

`npm run catalog:ingest` reads all four legacy JSON datasets through the
pipeline and writes staging artefacts to `catalog/out/` (gitignored; 29 MB,
regenerates in about ten seconds).

| Source | Rows | Registered as | Rank |
|---|---|---|---|
| `data/scraped_products.json` | 739 | `website_scrape` | 30 |
| `inventory.json` | 461 | `legacy_database` | 40 |
| `data/complete_products.json` | 2,274 | `internal_spreadsheet` | 50 |
| `bb-convex-production` | ~2,325 | `legacy_database` | 60 — *registered, not yet ingested* |
| `bb-live-pdp` | — | `website_scrape` | 65 — *registered, not yet ingested* |
| `data/verified_products.json` | 261 | `employee_verification` | 90 |

The two storefront sources are registered by migration `0006_convex_channel.sql`
but have no adapter yet: this environment has no Convex credential and the
storefront repository is not present. Their ranks are already correct, so
ingesting them later needs no re-ranking. See
[`05-CONVEX-STOREFRONT.md`](05-CONVEX-STOREFRONT.md).

Adapters run in ascending rank order, but order does not decide outcomes —
source rank does. Reversing the order produces the same canonical values, which
is exactly the property that makes a re-import safe.

**Result: 2,551 distinct source SKUs → 2,530 catalog items + 21 review entries
+ 0 rejected rows.**

The 21 review entries are rows whose item kind could not be determined from the
SKU grammar or the product name (e.g. `Alu500`, `20-400cp1ozShortBlk`). They are
not dropped and not guessed at — they are queued in
`catalog/out/review-queue.json` for a human to classify.

**No-loss is asserted, not assumed.** `catalog/tests/ingest.test.ts` runs the
pipeline against the real committed files and asserts:

> the set of distinct source SKUs == the set of item SKUs ∪ the set of
> review-queue SKUs, with zero rejected rows

If a future parser change starts dropping rows, that test fails.

### E.3 What each legacy field maps to

| Legacy field | Canonical destination | Notes |
|---|---|---|
| `sku` | `catalog_item.sku` + identity anchor | business key, not identity |
| `name` | `catalog_item.display_name` | conflicts recorded (271 found) |
| `description` | `catalog_item.short_description` | conflicts recorded (389 found) |
| `capacity` / `capacity_ml` / `capacity_oz` | `bottle_spec.nominal_capacity_ml` | ml preferred over rounded oz |
| `neckFinish` / `neck_thread` | `bottle_spec.neck_*` / `closure_spec.neck_*` | category labels rejected + reported |
| `material` | `bottle_spec.material` | via alias table |
| `color` / `cap_color` | `bottle_spec.glass_colour` / `closure_spec.colour_label` | via alias table |
| `bottle_shape` | `bottle_spec.shape` | |
| `family` / `parent` | `catalog_item.family` | |
| `applicator` | drives `kind` classification and `closure_kind` | |
| `price` / `price_1pc` | `catalog_commerce` → `catalog_price_break` | |
| `bulkPrice` (`"2500pc @ $2.30"`) | a second `catalog_price_break` | parsed, not stored as text |
| `minOrderQty` / `min_order_qty` | `catalog_commerce.minimum_order_quantity` | |
| `imageUrl` / `image_url` | `catalog_media_asset` | **always `approved = false`** |
| `productUrl` | `catalog_external_id` (`website_url`) | |
| `inventory_id` | `catalog_external_id` (`legacy_inventory_id`) | **excluded from matching** — not unique |
| Convex `_id` / `graceSku` / group id | `catalog_external_id` (`convex_product` / `grace_sku` / `convex_product_group`) | joins on `websiteSku`; adapter pending |
| Convex `capStyle` / `trimColor` / `paperDollFamilyKey` / `graceDescription` | governed attributes | storefront-specific; does not widen the core tables |
| `use_case` free text | `catalog_use_case_fitness` | structured where the vocabulary recognises it |
| `category` / `subCategory` | *deliberately not mapped* | site navigation, not item type — see audit §A.4 |
| everything else | `catalog_raw_record.payload` | preserved verbatim, nothing is thrown away |

Anything the normalisers could not interpret is preserved in the immutable raw
record and reported in `catalog/out/unmapped-values.json`, so it can be
recovered when the vocabulary grows.

### E.4 Stage 2 — review and promote (the operator's work)

Items land `lifecycle = 'draft'`, `verification = 'unverified'`, media
`approved = false`. Nothing imported is publicly visible. Promotion is:

1. Work the review queue (21 items) — classify the unclassifiable.
2. Work the conflict queue (1,105) — highest-value first:
   `commerce.unitPrice` (389) and `bottle.material` (34) matter more than
   `item.shortDescription` (389), which is mostly wording.
3. Extend the vocabularies from `unmapped-values.json` and re-run — ingestion
   is idempotent, so re-running is free.
4. Approve one hero image per item.
5. Promote items to `active` once `catalog_item_completeness.production_ready`
   is true.

Nothing here needs to complete before the catalog is useful. A partially
reviewed catalog with honest completeness scores is more valuable than the
current five stores with none.

### E.5 Stage 3 — cut consumers over, one at a time

Order matters. Each step is independently reversible because the old store is
still there.

| Order | Consumer | Cut when |
|---|---|---|
| 0 | **Convex reconciliation** | as soon as a credential exists — it is a *read*, and it tells you how far apart the two catalogs actually are before anything else is decided |
| 1 | Catalog health reporting | immediately — it has no dependants |
| 2 | Product spec tables on the site | enough items are `active` |
| 3 | Compatibility display on PDPs | verified edges exist for the top families |
| 4 | `inventory.json` read path | site reads `catalog_public_*` instead |
| 5 | Grace / AI retrieval | reads deterministic catalog facts, not prose |
| 6 | Shopify sync (catalog → Shopify) | conflict workflow has a UI |
| 7 | Product feeds | after Shopify |

### E.6 What gets retired, and when

| Asset | Disposition |
|---|---|
| `inventory.json` | Retire after step 4. Keep the file as a registered source until then. |
| `data/*.json` | Retire after step 4; they remain registered sources. |
| 29 `.xlsx` / `.ods` files | Become *inputs* to the ingestion pipeline rather than stores. Do not retire — they are where humans put new knowledge. |
| 85 scripts in `scripts/` | Retire progressively. Any script that *writes* Sanity or Supabase product data should be replaced by a pipeline source before step 4, otherwise it reintroduces the duplicate-source-of-truth risk (G.1). Read-only inspection scripts can stay. |
| Sanity `product` / `glassOption` / `capOption` / `fitmentVariant` | **Keep.** Sanity stays canonical for Paper Doll layer artwork and editorial. Mapped via `catalog_external_id.system = 'sanity_document'`. |
| Supabase `product_images` | **Keep for now**, mapped via `supabase_product_image`. Fold into `catalog_media_asset` during P2, once approval state has an owner. |
| `bestbottles-intelligence/` | Decide explicitly: it is a second partial implementation of the same domain, with `.next/` build output committed. Either fold it in or delete it — leaving it is the most likely source of future divergence *within this repo*. |
| Convex storefront catalog | **Keep.** Recommended role is the serving layer for the live site, fed by the catalog rather than authored in. Not a retirement — a change of ownership, and one the team has to agree to. See doc 05. |
| `Nemat_Product_Catalog.csv` (2,321 SKUs) | Already demoted by the storefront pipeline itself. Becomes an ingestion input, not a store. |
| `archive/`, `backup_20251204_125831/` | Stale copies. Delete once their SKUs are confirmed present in the catalog. |
| `ARCHITECTURE.md` | **Correct or clearly label it.** It describes a Hydrogen/Convex system that does not exist here, and it is the most misleading document in the repository. |

### E.7 Rollback

Stage 1 has nothing to roll back — it writes only to `catalog/out/`.

For the database: every migration creates only `catalog_`-prefixed objects, so
rollback is `drop` of those objects. No existing table, view, policy or trigger
is altered. Verify with `npm run catalog:verify-schema`, which applies all five
migrations to a throwaway database.

---

## F. Implementation plan

### P0 — Canonical foundation ✅ delivered

| Item | Where |
|---|---|
| Repository audit and gap analysis | `catalog/docs/01-AUDIT-AND-GAP-ANALYSIS.md` |
| Canonical architecture, source-of-truth boundaries, risks | `catalog/docs/02-CANONICAL-ARCHITECTURE.md` |
| Identifier strategy | `catalog/src/domain/ids.ts` |
| Canonical units | `catalog/src/domain/units.ts` |
| Governed vocabularies + neck-finish parsing | `catalog/src/domain/vocab.ts` |
| Core domain model | `catalog/src/domain/types.ts` |
| Provenance and conflict resolution | `catalog/src/domain/provenance.ts` |
| Compatibility graph and configuration validation | `catalog/src/domain/compatibility.ts` |
| Completeness scoring and health | `catalog/src/domain/completeness.ts` |
| Migrations (5 files, 30 tables, 11 views) | `catalog/migrations/` |
| Schema guarantee checks | `catalog/tests/schema_guarantees.sql` |
| 74 unit + integration tests | `catalog/tests/*.test.ts` |

### P1 — Ingestion ✅ largely delivered

Delivered because the migration strategy is unprovable without it.

| Item | Where |
|---|---|
| Pipeline (raw → parse → normalise → match → validate → conflict → staging) | `catalog/src/ingest/pipeline.ts` |
| Import batches, immutable raw records | `catalog/src/ingest/batch.ts` |
| Reusable field-mapping profiles | `catalog/src/ingest/mapping.ts` |
| Entity matching, dedup, external-id uniqueness guard | `catalog/src/ingest/matching.ts` |
| SKU grammar decoder | `catalog/src/ingest/normalizers/sku.ts` |
| Four legacy source adapters | `catalog/src/ingest/sources/legacy.ts` |
| CLI + reports | `catalog/src/cli/ingest.ts` |

**Remaining in P1:**

- A **Convex storefront adapter**. The mappings, source registration, graceSku
  codec, dimension parser and drift view are built and tested; only the adapter
  itself is missing, and it needs a Convex credential. The full contract is
  specified in [`05-CONVEX-STOREFRONT.md`](05-CONVEX-STOREFRONT.md). This is
  the highest-value remaining ingestion work, because it is what quantifies the
  gap between the two catalogs.
- A **loader** that writes staged output into Postgres. Deliberately not built:
  it needs a service-role credential and a decision about who runs it. The
  staging output is already in the shape the tables take.
- **CSV / XLSX adapters.** `xlsx@0.18.5` is already a dependency. The mapping
  profile layer is the hard part and is done; an adapter is ~40 lines
  (`catalog/docs/HOWTO.md` has the recipe).
- **Shopify adapter**, once the Admin API credential question is settled.

### P2 — Catalog operations

| Item | Depends on |
|---|---|
| Loader into Postgres | credential decision |
| Conflict resolution UI (1,105 open) | loader |
| Review queue UI (21 items) | loader |
| Media approval UI | loader |
| Catalog browser: search, filter, item detail with provenance | loader |
| Import review screen | loader |
| Health dashboard over `catalog_health` | loader |
| Fold `product_images` into `catalog_media_asset` | media approval UI |

Extend the existing admin surface rather than starting a new app. Note that
this SPA has no server, so an operator UI needs either a server-side surface or
Supabase RLS policies scoped to the `catalog_operator` role.

### P3 — Knowledge layer

Migrate `docs/Grace_KB_FAQ.md` and the ElevenLabs knowledge docs into
`catalog_knowledge_entry`; seed `catalog_term_synonym` from real search logs;
wire support/chat question capture into `catalog_customer_question`.

### P4 — Consumer APIs

The seven `catalog_public_*` views are the stable contract. On top of them:
`search_catalog`, `get_catalog_item`, `find_compatible_components`,
`validate_configuration`, `compare_products`, `answer_product_question`.

Two rules for the AI tooling, which the schema already supports:
compatibility answers must carry the `status` field, and factual answers must
be able to cite provenance. **Do not build P4 until the conflict queue is worked
and items are promoted** — deterministic APIs over unreviewed data are worse
than no APIs, because they look authoritative.

### P5 — Channel integration

Site read-path cutover, Shopify sync (catalog → Shopify only), JSON-LD /
Schema.org output from `catalog_public_*`, Google Merchant and marketplace
feeds via per-channel transformers.

Only emit structured-data claims the catalog can support: no
`AggregateRating` without real reviews, no `Offer` availability without a
`stock_status`.

---

## Running it

```bash
npm run catalog:ingest          # ingest the legacy data, write staging + reports
npm run catalog:test            # 74 unit and integration tests
npm run catalog:verify-schema   # apply migrations to a scratch DB, assert guarantees
```

`catalog:ingest` and `catalog:test` need only Node 22 (type stripping and the
built-in test runner — no new dependencies). `catalog:verify-schema` needs a
local PostgreSQL 14+; set `PGBIN` if it is not on `PATH`.

To apply the migrations for real, run `catalog/migrations/*.sql` in order
against the Supabase project. They create only `catalog_`-prefixed objects and
alter nothing that exists.
