# Which catalog file is the truth?

Asked directly: *"We have to check and make sure what the ultimate truth is for
the CSV. We have a lot of disparate files everywhere and need to consolidate
everything into the most updated and truthful."*

Short answer, measured rather than assumed:

> **No CSV is the truth, and none of them can be.** They are dated partial
> exports that have drifted apart in *both* directions — each holds SKUs the
> others lack. The truth chain the storefront repository already established is
> live PDP → Convex → Master v8.3 → exports, and the CSVs sit at the bottom of
> it.

Every number below was produced by reading the files in
`asalastudio/best-bottles-website` at commit `b5cb2c8`.

---

## 1. The truth chain the storefront repo already declares

These are not my conclusions — they are written down in the storefront repo,
and they are consistent with each other.

| Rank | System | What it is authoritative for | Stated in |
|---|---|---|---|
| 1 | **Live bestbottles.com PDPs** | what is actually sold | `docs/data_alignment/README.md`: *"the live bestbottles.com PDP catalog … (legacy PHP, source of truth for what we actually sell)"* |
| 2 | **Convex `precise-raccoon-123`** | SKU, price, stock, product grouping, neck thread, compatibility | `docs/superpowers/plans/2026-08-03-best-bottles-knowledge-gateway.md`: *"Convex is authoritative for SKU, price, stock, product grouping, neck thread, and compatibility claims."* Also `PRODUCT.md`: *"Convex controls catalog."* |
| 3 | **Master Sheet v8.3 / v1.4** | naming, fitments, weights — the original migration source | `seo-audit-2026-05-23/00-discovery/00-discovery-brief.md`: *"Canonical product spec from Abbas — older but authoritative on naming, fitments, weights"* |
| 4 | **The CSV exports** | nothing — they are snapshots | see §2 |

Sanity is authoritative for editorial and Paper Doll content; Shopify for
commerce identity and checkout. Neither claims the catalog.

This ordering agrees with the ranks already seeded in
`catalog/migrations/0006_convex_channel.sql` (`bb-live-pdp` 65 above
`bb-convex-production` 60), which were set before this evidence was read.

---

## 2. The CSVs disagree with each other, in both directions

If the files were successive versions, each would be a superset of the last.
They are not. Measured on `graceSku`:

| File | Rows | Distinct graceSku |
|---|---|---|
| `Nemat_Product_Catalog.csv` | 2,321 | 2,321 |
| `data/convex_products_export_20260228.csv` | 2,281 | 2,281 |
| `data/grace_products_final.v2.csv` | 2,285 | 2,285 |

| Comparison | In both | Only in A | Only in B |
|---|---|---|---|
| Nemat **vs** Feb Convex export | 2,209 | **112** | **72** |
| Nemat **vs** grace_final.v2 | 2,207 | **114** | **78** |

The right-hand column is the finding. Nemat is not simply "newer" — 72 SKUs
present in the February Convex export are **absent** from it, and 78 present in
`grace_products_final.v2` are absent from it. Consolidating onto any one of
these files silently drops between 72 and 114 SKUs.

Two further signals:

- `grace_products_final.v2.csv` stamps every row `csvLastUpdatedAt =
  2026-06-24T22:18:29.034Z` and leaves **`convexSyncedAt` empty on all 2,285
  rows**. That sync was never recorded as having run.
- `path/to/your/convex_products.csv` (2,281 rows) is a byte-identical sibling
  of the February export, committed into a literal `path/to/your/` directory —
  a stray shell placeholder that became a real path.

## 3. The CSV structurally cannot hold the truth

`Nemat_Product_Catalog.csv` carries **30 columns**. Convex `products` defines
**61 fields**.

Absent from the CSV entirely: `priceTiers`, `priceTiersSyncedAt`, `components`,
`fitmentStatus`, `assemblyType`, `componentGroup`, `graceDescription`,
`useCaseDescription`, `dataGrade`, `verified`, `importSource`, `productGroupId`,
all five `shopify*` fields, all seven `paperDoll*` fields, `depthMm`, `widthMm`,
`caseWeightG`, `imageUrlCapOff`.

So the CSV cannot express the price ladder, the compatibility components, the
paper-doll readiness, the Shopify linkage, or — most pointedly — its own
`dataGrade` and `verified` flags. **A file that cannot record whether a row is
verified is not a candidate source of truth.** It is a report.

## 4. Convex and Master v8.3 still disagree, and it is already quantified

`docs/reviews/master-v83-vs-convex-mismatches-2026-08-04.csv` — **1,429
field-level mismatches**, keyed on `graceSku`, dated 2026-08-04:

| Field | Mismatches |
|---|---|
| `category` | 418 |
| `capStyle` | 219 |
| `family` | 207 |
| `capColor` | 204 |
| `diameter` | 134 |
| `dataGrade` | 116 |
| `heightWithCap` | 82 |
| `heightWithoutCap` | 40 |
| `caseQuantity` | 9 |

This is the real consolidation backlog. It is already in exactly the shape the
catalog's conflict model consumes: `(graceSku, field, convex_value,
master_value)` maps one-to-one onto `catalog_fact_assertion` +
`catalog_conflict`.

Worth noting what the top of that list means. `category` and `family` lead it —
those are *classification* disagreements, not measurement drift. Sample row:
`GB-CYL-BLU-5ML-ATM-BLU` is `family=Atomizer, category=Metal Atomizer` in Convex
and `family=Cylinder, category=Glass Bottle` in Master v8.3. Both are defensible
readings; neither is a typo. That is a taxonomy decision someone has to make,
not a data-cleaning task — and it is the same defect class this repo's audit
found in `inventory.json`, where the `category` column was site navigation
rather than item type.

## 5. Prior parity work, and what it establishes

`docs/data_alignment/README.md` records an April 2026 crawl reconciling the live
site against Convex:

- `sitemap.xml` listed 2,636 URLs
- minus 78 soft-404s and 272 discontinued notices → **2,286 effective live products**
- Convex held **2,281**; overlap **2,278 of 2,286 = 99.7% parity**
- 8 products to import, 3 orphans to clean up

That 2,286 figure is exactly the row count of `grace_products_final.csv`, which
identifies it as the live-site snapshot rather than a Convex export. Its `.v2`
sibling is 2,285 — one row different, unexplained.

The remediation is written and, per the README, not yet confirmed as run:
`importMissingLiveProducts.ts`, `fixOrphanProducts.ts`,
`backfillPhysicalSpecs.ts`.

## 6. What consolidation should actually mean

Not "pick the best CSV". The recommendation:

1. **Stop treating any CSV as an input to truth.** Demote every file in §2 to a
   dated report. The storefront pipeline already did this for prompt assembly —
   *"the CSV is no longer the source of truth"* — and the same applies here.
2. **Export Convex fresh** via `convex/exportEnrichedCatalog.ts` /
   `export-enriched.mjs`, which is paginated for the 16 MB read limit. That
   file, regenerated on demand, replaces all the stale exports.
3. **Ingest four sources into the catalog** and let the conflict machinery do
   the consolidation instead of a human merging spreadsheets:
   - Convex production (`bb-convex-production`, rank 60)
   - Live PDP crawl (`bb-live-pdp`, rank 65)
   - Master v8.3 (register as `internal_spreadsheet`, rank 50)
   - the 2026-08-04 mismatch report, which is already assertion-shaped
4. **Work the two queues.** The 1,429 known mismatches, and whatever new
   conflicts the ingest surfaces. Resolutions land in
   `catalog_field_resolution` so they survive the next import — which is the
   thing repeated spreadsheet merges have never given anyone.
5. **Settle the taxonomy question separately** (§4). Atomizer-vs-Cylinder is a
   decision, and 625 of the 1,429 mismatches (`category` + `family`) probably
   collapse once it is made.
6. **Delete nothing yet.** `path/to/your/convex_products.csv` is safe to remove;
   the rest are evidence until their SKUs are confirmed present in the catalog.
   The 72/78 orphan SKUs in §2 are the specific reason not to prune early.

## 7. What is still unknown

- **The live Convex row count.** The pipeline docs say ~2,325; the February
  export says 2,281. Nothing here can query Convex — no credential in this
  environment — so the current number is unverified.
- **Whether the April parity migrations ever ran.** The README describes them
  as pending. If they did, Convex should now hold 2,289; if the count is ~2,325
  something else added rows too.
- **Which of the 2,321 / 2,285 / 2,281 populations is closest to what is
  actually sellable today.** That needs a fresh live-PDP crawl compared against
  a fresh Convex export — the two top-ranked sources, neither of which is a CSV
  in the repo.
