# Runbooks

Task-shaped instructions for extending the catalog. Each one is a complete
recipe — a future engineer or coding agent should not need to reverse-engineer
anything.

---

## How to import a supplier spreadsheet

**1. Register the source.** Sources declare their kind, which decides how their
claims rank against everyone else's when they disagree.

```sql
insert into catalog_source (source_id, label, kind, locator, parser_version, rank)
values ('acme-glass', 'Acme Glass price list', 'supplier_feed',
        'imports/acme-2026-q1.xlsx', '1.0.0', 70);
```

Pick `kind` honestly. A supplier's own spec sheet is `manufacturer_spec` (80);
their price list is `supplier_feed` (70); something you measured is
`physical_measurement` (100). Getting this wrong is how a scraped number ends
up beating a measured one.

**2. Map the columns.** Most spreadsheets need no new code — add the supplier's
header spellings to `GENERIC_SPREADSHEET_PROFILE` in
`catalog/src/ingest/mapping.ts`:

```ts
{ field: 'bottle.heightWithoutClosureMm',
  headers: ['height', 'bottle height', 'h (mm)', 'height mm', 'Hgt'],
  coerce: asMillimetres, confidence: 0.8 },
```

Header matching ignores case, spacing and punctuation, so `Height (mm)`,
`height_mm` and `HEIGHT MM` all hit the same rule. The first matching header
wins, so list them in priority order.

If the supplier needs its own profile, copy `GENERIC_SPREADSHEET_PROFILE` and
export a new `MappingProfile`.

**3. Write the adapter.** About forty lines. `xlsx@0.18.5` is already a
dependency.

```ts
// catalog/src/ingest/sources/acmeGlass.ts
import { readFile, utils } from 'xlsx';
import { applyProfile, GENERIC_SPREADSHEET_PROFILE } from '../mapping.ts';
import { decodeSku } from '../normalizers/sku.ts';
import type { ParsedRow, SourceAdapter } from '../pipeline.ts';

export function acmeGlassAdapter(path: string): SourceAdapter {
  return {
    source: { id: 'acme-glass', label: 'Acme Glass price list', kind: 'supplier_feed',
              locator: path, parserVersion: '1.0.0' },
    read: () => {
      const book = readFile(path);
      const rows = utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]]);
      return rows.map((row, i): ParsedRow => {
        const { mapped, uncoercible } = applyProfile(GENERIC_SPREADSHEET_PROFILE, row);
        const sku = String(row['SKU'] ?? '').trim();
        return {
          locator: `${path}!A${i + 2}`,          // real spreadsheet coordinates
          sourceKey: sku || undefined,           // no key => rejected, not invented
          payload: row,
          kind: decodeSku(sku).kind,
          sku: sku || undefined,
          facts: mapped.map((m) => ({ field: m.field, value: m.value, confidence: m.confidence })),
          warnings: uncoercible.map((u) => `Could not interpret "${u.raw}" as ${u.field}`),
        };
      });
    },
  };
}
```

**4. Run it.** Add the adapter to the list in `catalog/src/cli/ingest.ts` and
run `npm run catalog:ingest`.

**5. Read the report.** Before promoting anything, check:

| Artefact | What to look for |
|---|---|
| stdout batch summary | `rejected` should be 0; `needs review` should be small |
| `catalog/out/unmapped-values.json` | values the normalisers refused — usually means a missing alias |
| `catalog/out/conflicts.json` | where this source disagrees with what you already know |
| `catalog/out/review-queue.json` | rows that could not be classified |
| batch `warnings` | includes any external-id column that is not unique |

Re-running is free: ingestion is idempotent, so fix the mapping and run again.

---

## How to add a new product attribute

**If it is domain-critical** — something you will filter, sort or match on —
give it a typed column. Add a migration:

```sql
-- catalog/migrations/0006_add_shoulder_geometry.sql
alter table catalog_bottle_spec add column shoulder_radius_mm numeric(10,3);
create index catalog_bottle_shoulder_idx on catalog_bottle_spec (shoulder_radius_mm);
```

Then add the field to `BottleSpec` in `catalog/src/domain/types.ts`, a mapping
rule in `mapping.ts`, and a `Requirement` in `completeness.ts` if it should
count towards completeness.

**If it is niche** — a specification only a few items carry — use the governed
attribute layer. No migration:

```sql
insert into catalog_attribute_definition (key, label, data_type, unit, applies_to, description)
values ('shoulder_radius_mm', 'Shoulder radius', 'measurement', 'mm',
        array['bottle']::catalog_item_kind[],
        'Radius of the shoulder curve, for label wrap calculations.');
```

The constraints will hold you to it: a `measurement` must declare a unit, an
`enum` must declare its allowed values, a value must occupy exactly one typed
column, and the key must exist before a value can reference it.

**Rule of thumb:** if a customer would filter by it, type it. If it answers one
engineer's question twice a year, use an attribute.

---

## How to add a compatibility relationship

**By hand, verified.** This is the only way an edge becomes `verified`, and it
must name a verifier.

```sql
insert into catalog_compatibility_edge
  (relationship_id, source_id, relation, target_id, status, confidence,
   basis, notes, verified_by, verified_at)
values
  ('BB-REL-...', 'BB-BTL-8T4XKQ2M1P', 'compatible_with', 'BB-CAP-3JM9WQ0KT2',
   'verified', 1.0, 'physical-test',
   'Seated and leak-tested with perfume oil, 2026-08-29.',
   'jordan@asala.ai', now());
```

Generate `relationship_id` with `relationshipId(source, relation, target)` from
`catalog/src/domain/ids.ts` so re-inference recognises the row instead of
duplicating it.

**Recording an incompatibility is as valuable as recording a fit** — and always
say why:

```sql
-- status 'incompatible' blocks the pairing in validateConfiguration()
-- status 'conditional' REQUIRES a `condition` value (check constraint)
```

**By rule.** `inferNeckFinishEdges()` writes `likely` edges at confidence 0.60
with `basis = 'rule:neck-finish-match:<code>'`. It is idempotent and
`mergeEdges()` never demotes a human verification. Both the TypeScript and the
database refuse to let a rule claim more than that:

```sql
constraint catalog_edge_rules_stay_likely
  check (basis not like 'rule:%' or (status = 'likely' and confidence <= 0.60))
```

**To write a new rule**, follow the shape of `inferNeckFinishEdges` in
`catalog/src/domain/compatibility.ts`: build edges through `makeEdge()` with a
`rule:` basis, and let `mergeEdges()` fold them into what exists.

---

## How to extend a vocabulary

When `unmapped-values.json` shows a value the normalisers refused, add it to
the alias table in `catalog/src/domain/vocab.ts`:

```ts
const MATERIAL_ALIASES: AliasTable<Material> = [
  ['glass', ['glass', 'clear glass', 'flint glass', /* add here */ 'soda-lime glass']],
  ...
];
```

Add an alias only when you are sure of the mapping. A resolver returning
`undefined` is a reported gap; a wrong alias is a silent data error that is
much harder to find later.

Adding a genuinely new *value* (not an alias) also needs the Postgres enum
updating — `alter type catalog_material add value 'ceramic';` — and the enum in
`vocab.ts`.

---

## How to resolve a conflict

Look at what is actually in dispute:

```sql
select source_label, source_kind, source_rank, value, source_locator, observed_at
from catalog_field_provenance
where catalog_id = 'BB-BTL-8T4XKQ2M1P'
  and field = 'bottle.heightWithoutClosureMm'
order by source_rank desc;
```

Then make the decision durable, so the next import does not undo it:

```sql
insert into catalog_field_resolution
  (catalog_id, field, preferred_assertion_id, decided_by, reason)
values
  ('BB-BTL-8T4XKQ2M1P', 'bottle.heightWithoutClosureMm', 'BB-FCT-...',
   'jordan@asala.ai', 'Re-measured three units; the supplier sheet is stale.');

update catalog_conflict
set status = 'resolved', resolved_assertion_id = 'BB-FCT-...',
    resolved_by = 'jordan@asala.ai', resolved_at = now()
where catalog_id = 'BB-BTL-8T4XKQ2M1P'
  and field = 'bottle.heightWithoutClosureMm';
```

If both values are legitimately correct — a tolerance band rather than an error —
use `status = 'accepted_variance'` and say so in `note`.

If the truth is a new measurement, do not edit a value. Add an assertion from
the `physical-measurement` source; it outranks everything and the conflict
resolves itself.

---

## How to add a new consumer

Read from the `catalog_public_*` views, never from the tables. They are the
contract: they exclude cost, supplier and provenance columns, and they exclude
draft items and unapproved media by construction.

| View | Purpose |
|---|---|
| `catalog_public_item` | identity, name, slug, kind, lifecycle |
| `catalog_public_bottle` | container specifications |
| `catalog_public_closure` | closure specifications |
| `catalog_public_price` | price breaks, MOQ, case qty, stock status |
| `catalog_public_media` | approved assets only |
| `catalog_public_compatibility` | edges **with their status** |
| `catalog_public_knowledge` | approved, in-date knowledge only |

Two obligations for any consumer:

1. **Carry the compatibility `status` through.** A `likely` edge means the
   threads match and nobody has tested it. Presenting that as a fit guarantee is
   how a customer ends up with a cap that does not seat.
2. **Render unknowns as unknown.** `NULL` means we have not established it. Do
   not substitute a default, a zero or an empty string.

---

## How to check catalog health

```sql
select * from catalog_health;

-- what is missing, worst first
select unnest(missing_fields) as field, count(*)
from catalog_item_completeness
group by 1 order by 2 desc;

-- the queue for one operator's afternoon
select catalog_id, score, missing_fields
from catalog_item_completeness
where not production_ready
order by score desc                    -- nearly-complete items are cheapest to finish
limit 50;

-- items with no Shopify mapping, and media with no item
select * from catalog_orphan_report;
```

Offline, without a database: `npm run catalog:ingest` prints the same rollup and
writes `catalog/out/catalog-health.json` and
`catalog/out/completeness.json`.

---

## How to change a parser without losing history

Raw records are append-only and carry the `parser_version` that read them. So:

1. Bump `parserVersion` in the adapter's `SourceDescriptor`.
2. Re-run ingestion. New assertions are produced from the same raw payloads.
3. Old assertions remain, with their old version, and the conflict machinery
   shows you what the change actually altered.

Never edit a `catalog_raw_record`. Update and delete are rewritten to no-ops at
the database level, so an attempt fails silently by design rather than
corrupting ingestion history.

---

## How to reconcile against the Convex storefront catalog

The live site's catalog is in Convex `precise-raccoon-123`, in a separate
repository. Background and the full adapter contract are in
[`05-CONVEX-STOREFRONT.md`](05-CONVEX-STOREFRONT.md); this is the procedure.

**1. Export the storefront catalog.** From the storefront repo, using its
existing paginated exporter (a single-shot export exceeds Convex's 16 MB read
limit):

```bash
node pipeline/madison-hero-sync/export-enriched.mjs
# -> pipeline/madison-hero-sync/catalog-enriched.json
```

**2. Write the adapter** at `catalog/src/ingest/sources/convexStorefront.ts`.
Three rules, all of which the pipeline already supports:

- `sourceKey` is `products.websiteSku` — it uses this repo's SKU grammar, so it
  joins with no fuzzy matching.
- Parse dimensions with `parseConvexDimension`. Convex stores them as display
  strings (`"110 ±2 mm"`); the catalog stores magnitude and tolerance
  separately.
- Emit `graceSku` and the Convex `_id` as **external ids**, never as identity.

**3. Register it** in `catalog/src/cli/ingest.ts` and run
`npm run catalog:ingest`. The source (`bb-convex-production`, rank 60) is
already registered by migration `0006`, so nothing needs re-ranking.

**4. Read the two reports that matter.**

```sql
-- identity coverage, both directions
select drift_kind, count(*) from catalog_convex_drift group by 1;

-- where the storefront disagrees with what we already knew
select field, count(*) from catalog_conflict
where status = 'open'
  and conflict_id in (
    select c.conflict_id from catalog_conflict c
    join catalog_conflict_assertion ca using (conflict_id)
    join catalog_fact_assertion fa using (assertion_id)
    where fa.source_id = 'bb-convex-production')
group by 1 order by 2 desc;
```

Expect a lot of conflicts on the first run — Convex at rank 60 meets the master
spreadsheet at 50 and the scrape at 30 across ~2,300 shared SKUs. That backlog
is the point of the exercise, not a failure of it.

**5. Do not auto-resolve in Convex's favour.** Rank 60 means Convex beats the
spreadsheets and loses to a human verification or a physical measurement. The
storefront's own documentation says the live PDP outranks Convex where the two
disagree, which is why `bb-live-pdp` sits at 65. Resolve conflicts through
`catalog_field_resolution` as usual.

**Ambiguity you will hit:** the legacy applicator token `Spry` maps to either
`SPR` (perfume spray pump) or `FNM` (fine mist sprayer), and nothing in the
legacy SKU distinguishes them. `resolveGraceApplicator` returns
`{ outcome: 'ambiguous' }` rather than picking one. Resolve it from the Convex
row's own `applicator` field — never by defaulting, which would mislabel every
spray SKU in the catalog.
