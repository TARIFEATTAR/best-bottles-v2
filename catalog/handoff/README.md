# Track A handoff — apply the catalog corrections to Convex

Everything needed to apply the two largest accuracy fixes to the storefront
catalog. Written to be run by someone with Convex credentials, because this
session has none: the egress proxy denies `precise-raccoon-123.convex.cloud`
and access to the storefront repo is read-only.

**Nothing here was executed. It is dry-run-by-default code plus a runbook.**

---

## What this fixes

| | Now | After |
|---|---|---|
| `heightWithCap` filled | **0.6%** | ~99% |
| `heightWithoutCap` filled | **0.6%** | ~95% |
| `diameter` filled | **0.2%** | ~99% |
| `bottleWeightG` filled | **0.0%** | ~78% |
| `caseQuantity` filled | **0.0%** | ~74% |
| Volume ladders | none — `priceTiers` empty | **2,291 SKUs, 11,449 steps** |

Grace currently cannot answer *"how tall is this bottle"* for essentially the
whole catalogue, or *"what's the price at 288?"* for any of it. The same gap
makes the Madison image pipeline emit `MISSING` placeholders, which is why
gpt-image-2 invents bottle proportions.

The schema already anticipates the pricing half of this. From `convex/schema.ts`:

> *only 53 SKUs have a real 10-unit break while 2,252 break at 12, so any UI
> reading webPrice10pc understates the ladder*

`priceTiers` exists for exactly this. It is empty.

---

## Files

Copy into the storefront repo:

```
catalog/handoff/convex/applyCatalogCorrections.ts  ->  convex/applyCatalogCorrections.ts
catalog/handoff/convex/importPriceLadders.ts       ->  convex/importPriceLadders.ts
catalog/handoff/scripts/_shared.mjs                ->  scripts/_shared.mjs
catalog/handoff/scripts/apply_catalog_corrections.mjs -> scripts/apply_catalog_corrections.mjs
catalog/handoff/scripts/import_price_ladders.mjs   ->  scripts/import_price_ladders.mjs
```

They follow the conventions already in that repo — `internalMutation` + `action`
wrapper, `by_websiteSku` lookup with a `by_graceSku` fallback, batches of 50, an
`importSource` stamp, and a `ConvexHttpClient` driver that reads `.env.local` —
modelled on `applyCaseWeightCorrections.ts` and its driver.

---

## Runbook

**1. Generate the payload** (in `best-bottles-v2`). It is not committed — it is
derived, ~30 MB, and regenerating takes seconds.

```bash
npm run catalog:corrections -- \
  --scrape <storefront>/docs/reviews/audit-2026-08-06/live-site-full-scrape.json \
  --convex <storefront>/Nemat_Product_Catalog.csv \
  --specs  <storefront>/data/grace_products_clean.json
```

Writes to `catalog/out/convex-corrections/`:

| File | Rows | Class |
|---|---|---|
| `corrections-fill.json` | 10,900 | field is empty; source publishes a value |
| `corrections-repair.json` | 18 | stored value is a strict **prefix** of the published one |
| `corrections-decontaminate.json` | 24 | stored value is the published one **plus the next field's label** |
| `corrections-conflict.json` | 19 | **genuine disagreement — not applied by these tools** |
| `price-tiers.json` | 2,291 | published volume ladders |

**2. Deploy the functions.**

```bash
npx convex deploy          # or: npx convex dev --once, for the dev deployment
```

**3. Dry run against dev first.**

```bash
CONVEX_URL=https://helpful-elephant-638.convex.cloud \
  node scripts/apply_catalog_corrections.mjs --payload <path>/catalog/out/convex-corrections
```

Read the summary. `Skipped (stale)` and `Skipped (not empty)` should both be
near zero. If they are large, the payload is out of date against Convex —
re-export `Nemat_Product_Catalog.csv` and regenerate.

**4. Apply.** Dry run is the default; writing needs `--apply`, and writing to
production needs a second flag as well, so a copied command line cannot mutate
the live catalogue by accident.

```bash
# specs
CONVEX_URL=https://precise-raccoon-123.convex.cloud \
  node scripts/apply_catalog_corrections.mjs \
    --payload <path>/catalog/out/convex-corrections \
    --apply --i-know-this-is-production

# price ladders
CONVEX_URL=https://precise-raccoon-123.convex.cloud \
  node scripts/import_price_ladders.mjs \
    --payload <path>/catalog/out/convex-corrections \
    --apply --i-know-this-is-production
```

**5. Verify.** Re-export the catalogue CSV, then:

```bash
npm run catalog:reconcile -- --scrape <...> --convex <...> --specs <...>
```

`live states, storefront null` should collapse from 5,613 to near zero.

**6. Re-run the Grace accuracy audit** — `tests/grace-accuracy-audit.live.test.ts`.
This is the number that matters. Everything after should be driven by what it
says, not by projections.

---

## Safety properties

These are bulk writes to a production catalogue, so:

- **Dry run is the default.** Writing requires `--apply`; writing to
  `precise-raccoon-123` additionally requires `--i-know-this-is-production`.
- **Every record is re-verified against the current document.** The payload is
  computed from a CSV snapshot; by the time it runs the row may have changed. A
  `fill` whose field is no longer empty is skipped. A `repair` /
  `decontaminate` whose stored value no longer matches what the payload
  expected is skipped. **Nothing is written on a stale expectation.**
- **The damage relationship is re-proved on the live value.** Even for a row
  labelled `repair`, the mutation re-checks that the stored value really is a
  prefix of (or a contaminated superset of) the proposed one. A mislabelled
  payload row cannot overwrite a real value.
- **Conflicts are rejected by the mutation**, not merely filtered by the driver.
- **Only six fields are writable** — `heightWithCap`, `heightWithoutCap`,
  `diameter`, `bottleWeightG`, `caseQuantity`, `neckThreadSize`. Anything else
  is rejected.
- **Ladders are idempotent.** An identical ladder is not rewritten, so
  re-running costs nothing and does not churn `priceTiersSyncedAt`.
- **No total is ever computed.** A ladder step whose published line total is
  missing is dropped rather than having one derived — a total that rounds
  differently from the site would be a new inconsistency, not a fix. This
  affects 9 of 11,449 steps.

---

## The 19 conflicts — for a person, not a script

`corrections-conflict.json`. These are two sources stating materially different
things, and the neck ones are compatibility-bearing: a wrong neck produces a
wrong *"this cap fits"*.

| Stored | Live PDP / spec library | Count | What to do |
|---|---|---|---|
| `13-415` | `13mm` | 7 | Measure one. A GPI screw neck and a metric snap neck are different geometries. |
| `Plug` | `8-425` | ~4 | A closure *type* is sitting in a neck-finish column. Decide which field was meant. |
| `73 ±1 mm` | `79 ±1 mm` | 1 | A real 6 mm disagreement. Measure. |
| various | various | rest | Inspect individually. |

Resolve them by writing the correct value directly, or record them in
`catalog_field_resolution` so the decision survives the next import.

---

## Also worth doing in the same pass

- **6 live-only SKUs** — on the live site, absent from the storefront catalogue.
  Each is a guaranteed false *"we don't carry that"*. See
  `catalog/out/storefront-reconciliation/coverage-live-only.json`.
- **26 orphans** — in the storefront, not on the live site. Probably
  discontinued; confirm rather than assume.
- **8 duplicate live SKUs / 2 duplicate storefront SKUs.**
- **7 price disagreements**, some off by 3–4× (`ALU120MLLOTIONPUMPWHITE` live
  \$1.30 vs stored \$0.35). In `fidelity-mismatches.json`.

---

## What is deliberately not automated

The root cause of the truncation. The identical damaged values appear in
`convex_products_export_20260228.csv` and in the much later
`Nemat_Product_Catalog.csv` — two export runs six months apart, byte-identical
— so the damage is in Convex, from a lossy import, and the exports are
faithful. These tools repair the symptoms. Finding the importer that mashed
`"66 ±1 mm Item Height without C"` into one cell is worth doing separately, or
it will happen again on the next import.
