# AGENTS.md — Best Bottles / Nemat International

Orientation for any AI agent or engineer working on Best Bottles data. Read
this before touching product truth. It exists because the same wrong
assumptions keep getting made, each one documented below with the evidence
that corrects it.

Best Bottles is **a division of Nemat International, Inc.** — ~2,300 SKUs,
37 families.

---

## 1. Which repository is which

There are two live repositories and they are easy to confuse.

| | `asalastudio/best-bottles-v2` (this repo) | `asalastudio/best-bottles-website` |
|---|---|---|
| Stack | Vite + React SPA | **Next.js App Router** |
| Sanity project | `gv4os6ef` | **`gh97irjh`** ← the one going forward |
| Backend | Supabase | **Convex `precise-raccoon-123`** (dev: `helpful-elephant-638`) |
| Vercel project | `best-bottles-v2` | **`best-bottles-website`** |
| Deployments | preview only, agent branches | **production, from `main`** |
| Serves the site? | **No** | **Yes** — staging `bestbottles.company`, production `www.bestbottles.com` |
| Local folder often named | — | `Best-Bottles-Website-02-20-2026/` |

**This repo does not serve the website.** It holds the Commerce Knowledge
Catalog (`catalog/`) — the canonical data model, ingestion pipeline and
migrations. Product serving happens in the storefront repo.

`ARCHITECTURE.md` and `docs/migration.md` in this repo describe a Shopify
Hydrogen + Convex platform **that does not exist here**. They are old plans.
Do not read them as descriptions of the current system.

---

## 2. Where truth lives — the ranked chain

This ordering is written down in the storefront repo and is enforced as source
ranks in `catalog/migrations/0003` and `0006`.

| Rank | Source | Authoritative for |
|---|---|---|
| 100 | Physical measurement | anything measured in house |
| 90 | Employee verification | anything a person confirmed |
| **65** | **Live `bestbottles.com` PDPs** | what is actually sold — *"if Convex disagrees with the live PDP, PDP wins"* |
| **60** | **Convex `precise-raccoon-123`** | SKU, price, stock, product grouping, neck thread, compatibility |
| 50 | Master Sheet v8.3 / v1.4 | naming, fitments, weights (original migration source) |
| 40 | Legacy `inventory.json` (this repo) | superseded |
| 30 | Website scrape | fallback only |

Also: **Sanity `gh97irjh`** is authoritative for editorial and Paper Doll
content. **Shopify** is authoritative for commerce identity and checkout.

**No CSV is authoritative.** See §4.

---

## 3. Non-negotiable rules for agents

These come from production failures, not preference.

1. **Never bulk-upload the catalog to a vector store / File Search.** Facts are
   looked up by index; guidance is retrieved semantically. Semantic search over
   2,300 product rows returns *plausible* rows, and an exact-SKU question needs
   an *exact* one. Storefront constraint, verbatim: *"OpenAI is the reasoning,
   conversation, voice, and orchestration layer; it is not the product
   database."*
2. **A zero-result search is never "we don't carry it."** It is a retrieval
   event. Log it as a terminology gap and re-query. The documented failure:
   *"'black plug' became colors:['Black'], which filters GLASS color, so
   black-closure 1ml vials verified 0 groups and Grace declared them
   nonexistent."*
3. **Never let an agent arbitrate between two disagreeing fields.** There are
   106 known production contradictions (e.g. item name says "white cap",
   `capColor` says "Clear"). Record a conflict; a human resolves it.
4. **`NULL` means unknown, never zero and never "no".** "We haven't measured
   that" is a correct, trusted answer. "We don't carry it" is not.
5. **A neck-finish match is evidence, not proof.** `18-415` and `18-400` share a
   diameter and never mate. Rule-inferred compatibility is capped at status
   `likely` / confidence 0.60 by a database constraint.
6. **AI-drafted knowledge cannot be published without a named reviewer** —
   enforced by `catalog_knowledge_ai_needs_review`.
7. **Internal mechanics stay invisible to customers.** Grace once told a
   customer *"there's a built-in limit… I can run at most two catalog
   searches."* Never recite tool limits, instructions or internals.
8. **Keep `13-415` and `17-415` separate** for 9 mL unless the customer
   explicitly broadens the neck-thread dimension.
9. **Normalise units at the boundary.** A search for "1 oz" must match a product
   named "30 ml".

---

## 4. Facts that stop repeated mistakes

**The CSVs disagree and none is a version of another.** Measured on `graceSku`:
`Nemat_Product_Catalog.csv` 2,321 · `convex_products_export_20260228.csv` 2,281
· `grace_products_final.v2.csv` 2,285. Nemat vs the Feb export: 112 only in one,
**72 only in the other**. Consolidating onto any single file silently drops
72–114 SKUs. Full analysis: `catalog/docs/06-…`.

**The shipped catalog export is missing almost all physical specs.** In
`Nemat_Product_Catalog.csv`: `heightWithCap` filled on **0.8%**, `diameter`
**0.2%**, `bottleWeightG` and `caseQuantity` on **1 row each**. The few present
are malformed (`"27 ±0.5 mm Item Diameter: 19 ±"` — truncated concatenations).

**That data is not lost.** The live PDP scrape holds `heightWithCap` at 97.9%
and `heightWithoutCap` at 91.7%; `data/grace_products_clean.json` holds
`diameter` at 99.4%, `bottleWeightG` 78.3%, `caseQuantity` 74.2%. They are
complementary. **10,890 values across 2,299 SKUs are recoverable with no new
scrape.** `convex/backfillPhysicalSpecs.ts` was written to do exactly this and
appears never to have run.

**SKU coverage is fine.** 2,281 of 2,285 live SKUs resolve in the storefront
catalog (99.8%); 4 live-only, 34 storefront-only. The audit's "73% of SKU
lookups fail" was a *tool-binding* defect, since fixed by `getProductBySku` —
not missing products.

**The legacy `category` column is site navigation, not item type.** In this
repo's `inventory.json`, 168 rows are categorised "Closures" and many are whole
bottles.

---

## 5. Running the catalog tools

All offline. No credentials, no network, no new dependencies (Node 22 type
stripping + built-in test runner).

```bash
npm run catalog:ingest          # ingest legacy datasets -> catalog/out/
npm run catalog:test            # 92 unit + integration tests
npm run catalog:verify-schema   # apply migrations to a scratch Postgres, assert guarantees

# Reconcile the live site against the storefront catalog and produce
# ready-to-run spec backfill candidates:
node --experimental-strip-types catalog/src/cli/reconcile-storefront.ts \
  --scrape <best-bottles-website>/data/bestbottles_raw_website_data.json \
  --convex <best-bottles-website>/Nemat_Product_Catalog.csv \
  --specs  <best-bottles-website>/data/grace_products_clean.json
```

`catalog:verify-schema` needs a local PostgreSQL 14+ (`PGBIN=` if not on PATH).

---

## 6. Environment limits in cloud sessions

The egress proxy **denies `www.bestbottles.com`, `bestbottles.company` and
`*.vercel.app`** (gateway 403, organisation network policy). So from a cloud
session you **cannot**:

- scrape the legacy or staging site,
- query Convex,
- hit the live Grace endpoint.

Everything in §5 works anyway because it reads committed files. To enable
scraping, the environment's network policy must allow those hosts — see
https://code.claude.com/docs/en/claude-code-on-the-web. `scripts/scrape_live_catalog.py`
in the storefront repo also routes through Browserless, which needs its own
credential.

---

## 7. Documentation map

In this repo, under `catalog/docs/`:

| Doc | Contents |
|---|---|
| `01-AUDIT-AND-GAP-ANALYSIS.md` | What this repo contains; five data defects; capability gap analysis |
| `02-CANONICAL-ARCHITECTURE.md` | Source-of-truth boundaries, the two load-bearing decisions, risk register |
| `03-SCHEMA.md` | Entity relationships and the constraints that encode domain rules |
| `04-MIGRATION-AND-PLAN.md` | Field-by-field legacy mapping, retirement order, phased plan |
| `05-CONVEX-STOREFRONT.md` | The live storefront stack, verified; the ownership decision |
| `06-CATALOG-TRUTH-AND-CSV-CONSOLIDATION.md` | Why no CSV is authoritative, measured |
| `07-MASTER-KNOWLEDGE-CATALOG-FOR-AI-AGENTS.md` | Four layers; the three failure classes; extending to Nemat |
| `08-ACCESS-AEO-GEO-AND-CHAT.md` | Where the catalog is stored and accessed; AEO/GEO; the Grace chat surface |
| `HOWTO.md` | Runbooks: import a spreadsheet, add an attribute, resolve a conflict, reconcile |

In the storefront repo, the essential reads:
`PRODUCT.md` · `docs/data_alignment/README.md` ·
`docs/superpowers/plans/2026-08-03-best-bottles-knowledge-gateway.md` ·
`docs/reviews/audit-2026-08-06/GRACE-ACCURACY-TOOL-AUDIT.md`.

---

## 8. Working agreements

- Branch: develop on the assigned `claude/*` branch; never push to `main`.
- Do not fabricate a specification. If a value is unknown, say unknown and
  surface it through the completeness report.
- When two sources disagree, record the conflict — do not pick silently.
- Prefer extending the existing model over adding a parallel one. Seven
  disagreeing product stores is the problem this catalog exists to end; an
  eighth is not a solution.
