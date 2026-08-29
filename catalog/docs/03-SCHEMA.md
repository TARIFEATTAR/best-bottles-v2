# Schema reference

Deliverable **D**. The authoritative definitions are
`catalog/migrations/*.sql` (Postgres) and `catalog/src/domain/types.ts`
(TypeScript). This document explains the shape and the reasoning; it does not
restate every column.

Naming: every object is prefixed `catalog_` so nothing collides with the
existing application tables (`profiles`, `favorites`, `orders`, `carts`,
`chat_history`, `product_images`).

---

## Entity relationship overview

```
                        catalog_source ──┐
                              │          │
                              ▼          │
                    catalog_import_batch │
                              │          │
                    ┌─────────┴────────┐ │
                    ▼                  ▼ │
          catalog_raw_record   catalog_fact_assertion ◀─┐
              (immutable)               │               │
                                        ▼               │
                                catalog_conflict ───────┘
                                        │
                              catalog_field_resolution
                                        │
   ┌────────────────────────────────────▼─────────────────────────────────┐
   │                            catalog_item                              │
   │              catalog_id (PK) · kind · sku · lifecycle                │
   └──┬───────┬───────┬───────┬────────┬────────┬────────┬────────┬───────┘
      │       │       │       │        │        │        │        │
      ▼       ▼       ▼       ▼        ▼        ▼        ▼        ▼
  bottle_  closure_ attribute use_case commerce media_  external_ render_
   spec     spec     _value   _fitness    │      asset     id      spec
                                          ▼
                                  catalog_price_break

   catalog_compatibility_edge      source_id ──▶ catalog_item ◀── target_id
   catalog_configuration           container_id / closure_id ──▶ catalog_item
   catalog_configuration_component component_id ──▶ catalog_item

   catalog_knowledge_entry ──▶ catalog_knowledge_subject ──▶ catalog_item
   catalog_customer_question ──▶ catalog_knowledge_entry
   catalog_review ──▶ catalog_review_interpretation
   catalog_term_synonym                    (standalone)
```

---

## Identity

### `catalog_item`

The one row per identifiable thing. 2,530 rows after the legacy migration.

| Column | Notes |
|---|---|
| `catalog_id` PK | `BB-KKK-XXXXXXXXXX`, enforced by a check constraint. Opaque. Never encodes specifications. |
| `kind` | 16-value enum: bottle, jar, vial, closure, cap, dropper, reducer, insert, rollerball, sprayer, pump, liner, accessory, packaging, kit, configuration. |
| `sku` UNIQUE | The Best Bottles merchandising SKU. A **business key**, not identity — a corrected cap colour changes it. |
| `lifecycle` | draft / active / inactive / discontinued / archived. Nothing is hard-deleted. |
| `verification` | unverified / needs_review / verified / conflicting. |
| `anchor_source`, `anchor_key` UNIQUE | The (source, natural key) the id was minted from. **Frozen** — changing it would change identity. Also the idempotency key: re-importing the same row cannot mint a second id. |
| `internal_notes` | Never appears in any `catalog_public_*` view. |

**Why the anchor is a unique key.** It is what makes ingestion idempotent
without a database round trip: `catalogId(kind, anchor)` is a pure function, so
a re-import resolves to the same id offline, and the unique constraint is the
database's independent guarantee of the same thing.

### `catalog_external_id`

Shopify, Sanity, marketplace, GTIN and supplier identifiers, as *mappings*.
`unique (system, external_id)`.

> An external id only identifies a row if it is unique **within its source**.
> The ingestion pipeline checks this per batch and excludes any repeating id
> from matching — the master spreadsheet's `inventory_id` column repeats
> (80 SKUs share `10`) and is excluded automatically, with a batch warning.

---

## Specifications

### `catalog_bottle_spec` (kind ∈ bottle, jar, vial)

Capacity, dimensions with tolerances, material, glass colour, finish, neck
finish, food/cosmetic safety, origin, manufacturer.

Two rules run through it:

- **One canonical unit per measurement.** `nominal_capacity_ml`,
  `height_without_closure_mm`, `diameter_mm`. Imperial is derived on read
  (`displayLength`, `displayVolume` in `domain/units.ts`). There is no
  `height_in` column to drift out of sync.
- **`NULL` means unknown.** `food_safe` is `boolean` and nullable precisely so
  that "we have not established this" is distinguishable from "no".

Tolerance is a sibling column (`height_with_closure_tol_mm`) because the source
sheets genuinely state `83 ±1 mm`, and dropping the tolerance loses real
engineering information.

**Neck finish is structured, not a string:**

| Column | Example |
|---|---|
| `neck_style` | `gpi` / `metric` / `special` |
| `neck_diameter_mm` | `18` |
| `neck_series` | `415` |
| `neck_code` (indexed) | `18-415` |

`18-415` and `18-400` share a diameter and never mate; `17mm` is a different
geometry from `17-415`. Storing the parts is what lets the rule engine be
strict about that.

### `catalog_closure_spec`

Closures are first-class items with their own neck finish — the neck they
*mate with*. That symmetry is what makes the compatibility rule a simple
equality on `neck_code` plus style.

Kind-specific fields (`orifice_mm`, `dip_tube_length_mm`, `liner_type`,
`tamper_evident`, `child_resistant`) are typed columns because they are
query targets; anything rarer goes in the attribute layer.

### `catalog_attribute_definition` / `catalog_attribute_value`

The governed extension point. Adding "shoulder radius" needs a definition row,
not a migration:

```sql
insert into catalog_attribute_definition (key, label, data_type, unit, applies_to)
values ('shoulder_radius_mm', 'Shoulder radius', 'measurement', 'mm',
        array['bottle']::catalog_item_kind[]);
```

Deliberately **not** open EAV:

- `key` must be declared before a value can reference it (FK, `on delete restrict`).
- A `measurement` attribute must declare a unit (check constraint).
- An `enum` attribute must declare its allowed values (check constraint).
- A value occupies **exactly one** of `value_text` / `value_number` /
  `value_boolean` (check constraint) — so numbers stay numbers and stay
  comparable.
- Domain-critical fields stay in the typed tables above, where they are indexed
  and constrained.

---

## Relationships

### `catalog_compatibility_edge`

| Column | Notes |
|---|---|
| `relationship_id` PK | Deterministic hash of (source, relation, target) — re-inference is idempotent. |
| `relation` | compatible_with, incompatible_with, accepts, requires, fits_into, suitable_for, replaces, variant_of |
| `status` | verified / likely / unverified / conditional / incompatible |
| `confidence` | 0..1 |
| `basis` | `rule:neck-finish-match:13-415`, `physical-test`, `supplier-spec`, … |
| `condition`, `notes`, `verified_by`, `verified_at` | |

Four constraints carry the domain rules:

```sql
catalog_edge_no_self_loop                 source_id <> target_id
catalog_edge_verified_needs_verifier      verified ⇒ verified_by and verified_at
catalog_edge_rules_stay_likely            basis like 'rule:%' ⇒ likely and confidence ≤ 0.60
catalog_edge_conditional_needs_condition  conditional ⇒ condition is not null
```

### `catalog_configuration` (+ `_component`)

A buildable assembly: container + closure + ordered components. A configuration
is itself a `catalog_item` of kind `configuration`, so it can carry its own
media, price and Shopify mapping — which is what lets a photographed assembly be
linked to the exact build it depicts.

### `catalog_use_case_fitness`

`(catalog_id, use_case) → recommended | acceptable | conditional | not_recommended`
plus a rationale. A negative or conditional claim **must** carry a rationale
(check constraint) — an unexplained "not recommended" is useless to a customer
and worse than useless to an AI assistant.

---

## Provenance

### `catalog_source`

Registry with a precedence `rank`. Seeded:

| source | kind | rank |
|---|---|---|
| `physical-measurement` | physical_measurement | 100 |
| `verified-products` | employee_verification | 90 |
| `master-spreadsheet` | internal_spreadsheet | 50 |
| `legacy-inventory-json` | legacy_database | 40 |
| `website-scrape` | website_scrape | 30 |

Rank is the *default* when sources disagree. The disagreement is still recorded.

### `catalog_import_batch`

One row per ingestion run: discovered / parsed / created / updated / unchanged /
conflicted / needs_review / rejected, plus `warnings[]` and `errors[]`.

### `catalog_raw_record` — append-only

The original payload, verbatim, with a `checksum` and the `parser_version` that
read it. Update and delete are rewritten to no-ops:

```sql
create rule catalog_raw_record_no_update as on update to catalog_raw_record do instead nothing;
create rule catalog_raw_record_no_delete as on delete to catalog_raw_record do instead nothing;
```

So a parser improvement reprocesses history instead of re-reading a file that
may have moved. The checksum is order-independent (keys sorted before hashing),
so a reordered export is correctly recognised as unchanged.

### `catalog_fact_assertion` — the unit of truth

`(catalog_id, field, value, unit, source_id, source_locator, batch_id,
observed_at, confidence)`. `field` is the dotted canonical path, e.g.
`bottle.nominalCapacityMl`. Canonical values are *derived* from these.

### `catalog_conflict` / `catalog_field_resolution`

One conflict row per `(catalog_id, field)` where assertions disagree materially
(numbers compare within 0.5 %, so rounding noise is not a conflict). Resolution
requires an attributed decision — `status <> 'open'` implies `resolved_by` and
`resolved_at` are set. `catalog_field_resolution` makes a decision durable, so
it survives the next import.

The first run over the legacy data opened **1,105** conflicts:

| Field | Conflicts |
|---|---|
| `item.shortDescription` | 389 |
| `commerce.unitPrice` | 389 |
| `item.displayName` | 271 |
| `bottle.material` | 34 |
| `bottle.shape` | 9 |
| `bottle.neckFinish` | 7 |
| `item.family` | 3 |
| `bottle.glassColour` | 2 |
| `bottle.nominalCapacityMl` | 1 |

---

## Media

### `catalog_media_asset`

Assets are records keyed on `catalog_id`, not URL columns on a product.

| Guarantee | Mechanism |
|---|---|
| Approval is attributable | `approved ⇒ approved_by and approved_at` (check) |
| "The" hero image is unambiguous | partial unique index on `(catalog_id)` where `asset_type='hero' and approved` |
| A render is never passed off as a photograph | `origin` enum: photograph / render / derived / unknown |
| Lineage is traceable | `derived_from_asset_id` self-reference |
| An asset can name the build it shows | `shows_configuration_id` |
| Paper Doll layers keep their order | `asset_type='paper_doll_layer'` + `layer_index` |

All 2,530 items currently report a missing approved hero image. That is
accurate: legacy imagery has never been through an approval step, and saying so
is what makes the report worth reading.

### `catalog_render_spec`

Holds *references* into the existing rendering system (`geometry_ref`,
`material_preset`, `camera_preset`, `studio_preset`, `render_version`), not
copies of geometry. The image pipeline stays authoritative for how a render is
produced; the catalog records which preset belongs to which item.

---

## Knowledge

### `catalog_knowledge_entry`

FAQ, technical note, comparison, buying advice, compatibility explanation, and
so on. `status` ∈ proposed / in_review / approved / retired;
`authored_by` ∈ human / ai_draft.

**An AI draft cannot be published without a named reviewer** — a check
constraint, not a code path:

```sql
constraint catalog_knowledge_ai_needs_review
  check (status <> 'approved' or authored_by = 'human' or reviewed_by is not null)
```

`catalog_public_knowledge` exposes approved, in-date entries only.

### `catalog_customer_question`

The ingestion lifecycle from the brief:
`ingested → normalised → duplicate → linked → answer_proposed → answer_approved`
(or `discarded`), with `observed_count` so the catalog can rank which knowledge
gaps actually cost money.

### `catalog_review` / `catalog_review_interpretation`

The customer's own words in `catalog_review`; AI-derived themes and sentiment in
a separate table with `derived_by` and `model_ref`. Generated interpretation
can never overwrite customer evidence, because it is not stored in the same row.

### `catalog_term_synonym`

`canonical_term ↔ synonym` with a kind (colloquial / search_query / trade_term /
misspelling) and `observed_count`. Feeds onsite search, SEO and query
understanding.

---

## Read surface and security

Seven public views — `catalog_public_item`, `_bottle`, `_closure`, `_price`,
`_media`, `_compatibility`, `_knowledge` — each `security_invoker = off`,
selecting only publishable columns and only publishable rows
(`lifecycle in ('active','discontinued')`, `approved` media, `approved`
knowledge).

Four operator views — `catalog_item_completeness`, `catalog_health`,
`catalog_orphan_report`, `catalog_field_provenance`.

RLS is enabled on all 30 catalog tables and `anon` / `authenticated` are revoked
from every one. A `catalog_operator` role holds the internal grants.

Asserted by `catalog/tests/schema_guarantees.sql`:

- no `catalog_public_*` view may contain `unit_cost`, `supplier_id`,
  `supplier_part_number`, `internal_notes`, `anchor_source` or `anchor_key`;
- `anon` must hold no direct table grant on any `catalog_*` table;
- a `draft` item must not appear in `catalog_public_item`;
- an unapproved asset must not appear in `catalog_public_media`.
