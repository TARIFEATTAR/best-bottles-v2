# Best Bottles Commerce Knowledge Catalog

The canonical, structured, machine-readable record of what Best Bottles sells:
bottles, closures, components, their specifications, what fits what, where each
fact came from, and what we still do not know.

The website is one interface to this. Shopify is one interface to this. Grace
and any future AI agent are one interface to this. **The catalog is the source
of truth.**

---

## Why this exists

Before this, product knowledge lived in five places that disagreed: a 461-row
`inventory.json` the site renders from, three JSON datasets under `data/`
totalling 3,274 rows, 29 spreadsheets, a small Sanity dataset for the
configurator, and 85 one-off scripts that moved data between them with no
record of what wrote what.

The catalog replaces that with one model that can answer:

- What closures fit this bottle — and have we actually tested that, or do the
  threads merely match?
- Which 9 ml bottles are available in amber?
- Where did this height measurement come from, and when?
- What technical information are we still missing about this bottle?
- Which approved hero image belongs to this SKU?

And, critically, it is designed to hold **incomplete** data. You do not need
perfect spreadsheets to start. You feed it whatever you find — supplier
spreadsheets, Shopify exports, measurements, PDFs, photography metadata,
customer questions — and it tells you what is still missing, without you having
to redesign anything each time.

---

## Quick start

```bash
npm run catalog:ingest          # ingest the legacy data; writes reports to catalog/out/
npm run catalog:test            # 74 unit and integration tests
npm run catalog:verify-schema   # apply migrations to a scratch DB and assert the guarantees
```

`catalog:ingest` and `catalog:test` need only Node 22 — no new dependencies were
added to the project. `catalog:verify-schema` needs a local PostgreSQL 14+.

To create the schema for real, run `catalog/migrations/*.sql` in order against
the Supabase project. Every object is `catalog_`-prefixed; nothing existing is
altered.

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/01-AUDIT-AND-GAP-ANALYSIS.md`](docs/01-AUDIT-AND-GAP-ANALYSIS.md) | What the repository actually contains, the five parallel stores, five concrete data defects, and a capability-by-capability gap analysis |
| [`docs/02-CANONICAL-ARCHITECTURE.md`](docs/02-CANONICAL-ARCHITECTURE.md) | Current vs proposed architecture, source-of-truth boundaries, the two decisions everything rests on, and the risk register |
| [`docs/03-SCHEMA.md`](docs/03-SCHEMA.md) | Entity relationships, table-by-table reasoning, and the constraints that encode domain rules |
| [`docs/04-MIGRATION-AND-PLAN.md`](docs/04-MIGRATION-AND-PLAN.md) | How legacy data moves in without loss, field-by-field mapping, what gets retired when, and the phased plan |
| [`docs/HOWTO.md`](docs/HOWTO.md) | Runbooks: import a supplier spreadsheet, add an attribute, add a compatibility relationship, resolve a conflict, extend a vocabulary, add a consumer |

---

## Layout

```
catalog/
├── migrations/          Postgres schema, applied in filename order
├── src/
│   ├── domain/          the model, independent of storage and of any source
│   │   ├── ids.ts           canonical identifiers
│   │   ├── units.ts         one canonical unit per measurement
│   │   ├── vocab.ts         governed vocabularies, neck-finish parsing
│   │   ├── types.ts         core entities
│   │   ├── provenance.ts    fact assertions, conflict resolution
│   │   ├── compatibility.ts the relationship graph
│   │   └── completeness.ts  what is missing, and how much it matters
│   ├── ingest/          source → raw → parse → normalise → match → conflict → staging
│   │   ├── pipeline.ts      orchestration
│   │   ├── batch.ts         import batches, immutable raw records
│   │   ├── mapping.ts       reusable field-mapping profiles
│   │   ├── matching.ts      entity matching and deduplication
│   │   ├── normalizers/     SKU grammar decoding
│   │   └── sources/         one adapter per source system
│   └── cli/ingest.ts    run the pipeline, write reports
├── tests/               74 TypeScript tests + SQL guarantee checks
├── scripts/             verify-schema.sh
└── out/                 staging output (gitignored, regenerable)
```

---

## The ideas that matter

### Identity is opaque and permanent

`BB-BTL-8T4XKQ2M1P`. It encodes nothing about the product, so a corrected cap
colour, a new photograph or a Shopify migration cannot move it. The SKU
(`GBCylAmb5RollBlkSh`) stays as a business key. Shopify ids, GTINs and supplier
part numbers are *mappings*, in `catalog_external_id`.

Ids are derived deterministically from the (source, natural key) an item was
first seen under, so re-importing the same row resolves to the same id instead
of creating a duplicate — without a database round trip.

### Canonical values are derived from provenance, not written

An importer never writes a height. It writes an assertion: *source
`website-scrape`, at `data/scraped_products.json[412]`, claims
`bottle.heightWithoutClosureMm` is 106.* The canonical value is resolved from
all assertions for that field, by explicit human resolution, then source rank,
then confidence, then recency.

When sources disagree materially the field still resolves — but a conflict is
opened and the item is flagged. **An import cannot silently overwrite a better
value.** A test asserts exactly that: *a later, weaker source cannot overwrite a
stronger one.*

The first run over the legacy data opened 1,105 real conflicts.

### A neck-finish match is evidence, not proof

`18-415` and `18-400` share a diameter and never mate. Thread pitch, liner
thickness and skirt depth decide whether a closure actually seats.

So rule inference writes `likely` at confidence ≤ 0.60 with a `basis` naming the
rule. Only a human or a physical test may write `verified`, and the row must
name the verifier. **Both rules are database constraints**, so no code path can
route around them. The first run produced 14,788 inferred edges. Every one is
`likely`. None are verified — which is the honest state of the world.

### Unknown stays unknown

`NULL` means *we have not established this*. Nothing defaults. `food_safe` is
nullable so "we have not checked" is distinguishable from "no". Normalisers
return `undefined` rather than guessing, and every value they refuse is
reported so the vocabulary grows deliberately.

That is what makes the completeness report honest — and the report is the point.
Today it says: 2,530 items, average 51.4 % complete, 2,530 missing an approved
hero image, 2,368 missing dimensions, 2,006 missing pricing.

### Nothing imported is public until a human promotes it

Items land `draft` / `unverified`; media lands unapproved. The seven
`catalog_public_*` views expose only `active` and `discontinued` items and only
approved media. RLS is on for all 30 catalog tables with `anon` revoked from
every one, so cost, supplier and provenance data is unreachable from the browser
by construction rather than by remembering to omit a column.

---

## Current state

Measured by `npm run catalog:ingest` against the four committed legacy datasets:

| | |
|---|---|
| Distinct source SKUs | 2,551 |
| Catalog items | 2,530 |
| Queued for manual classification | 21 |
| Rejected (data lost) | **0** |
| Open conflicts | 1,105 |
| Inferred compatibility edges | 14,788 — all `likely`, none verified |
| Average completeness | 51.4 % |
| Production ready | 0 |

Zero production-ready items is the correct answer today, not a failure: no item
has an approved hero image yet, because approval has never been recorded
anywhere. The catalog's job at this stage is to say so precisely.

---

## What this phase deliberately does not include

No embeddings or semantic search, no channel feed transformers, no configurator
UI, no admin UI, no live Shopify sync. The schema supports all of them; they are
sequenced in [`docs/04-MIGRATION-AND-PLAN.md`](docs/04-MIGRATION-AND-PLAN.md).
The foundation has to be trustworthy before anything is built on it.
