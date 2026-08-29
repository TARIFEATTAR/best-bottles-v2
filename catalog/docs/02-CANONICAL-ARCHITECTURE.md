# Canonical architecture and risks

Deliverables **C** (proposed canonical architecture) and **G** (risks).

> **Correction.** The first version of this document argued the catalog could
> become canonical cheaply because "Shopify is a destination, not a source" and
> nothing else claimed the role. There is a claimant: the live storefront's
> Convex catalog (`precise-raccoon-123`, ~2,325 products), in a separate
> repository. The Shopify argument still stands; it does not transfer to
> Convex. The resulting decision — catalog canonical for knowledge, Convex as
> the serving layer — and the alternative that was rejected are in
> [`05-CONVEX-STOREFRONT.md`](05-CONVEX-STOREFRONT.md).

---

## C.1 Current state

```
    ┌───────────┐  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
    │inventory  │  │data/*.json     │  │29 .xlsx / .ods   │  │3,333 PNGs +  │
    │.json (461)│  │(2,274 / 261 /  │  │spreadsheets      │  │product_images│
    │           │  │ 739 rows)      │  │                  │  │(Supabase)    │
    └─────┬─────┘  └───────┬────────┘  └────────┬─────────┘  └──────┬───────┘
          │                │                    │                   │
          │        ┌───────┴────────────────────┴───────────────────┘
          │        │   85 ad-hoc scripts in scripts/ — no batch record,
          │        │   no provenance, no reversibility
          │        ▼
          │   ┌──────────┐        ┌──────────────────────┐
          │   │  Sanity  │        │ Shopify (near empty; │
          │   │  (small) │        │ demo fallback in UI) │
          │   └────┬─────┘        └──────────┬───────────┘
          │        │                         │
          ▼        ▼                         ▼
    ┌──────────────────────────────────────────────────────┐
    │              Vite React SPA (browser)                 │
    │   reads all four directly; no service layer           │
    └──────────────────────────────────────────────────────┘

Five parallel stores. Nothing is canonical. Every fix must be applied
five times or it regresses.
```

## C.2 Proposed catalog state

```
   INGESTION                    CANONICAL CORE                CONSUMERS
   ─────────                    ──────────────                ─────────

 spreadsheets ─┐
 supplier CSV ─┤   ┌────────────────────────────────┐
 Shopify      ─┤   │  catalog_raw_record (immutable)│
 scrape       ─┼──▶│  catalog_import_batch          │
 measurements ─┤   │  catalog_fact_assertion        │──┐
 PDFs / images─┤   │      "source S claims F = V"   │  │
 support inbox─┘   └────────────────────────────────┘  │
                                                        │ resolve
                                ┌───────────────────────▼──────────────────┐
                                │            CANONICAL CATALOG             │
                                │                                          │
                                │  catalog_item        identity, lifecycle │
                                │  bottle_spec         typed container     │
                                │  closure_spec        typed closure       │
                                │  attribute_value     governed extension  │
                                │  compatibility_edge  the relation graph  │
                                │  configuration       buildable assembly  │
                                │  commerce            price / stock       │
                                │  media_asset         approved imagery    │
                                │  use_case_fitness    intent, not physics │
                                │  knowledge_entry     reviewed answers    │
                                │  external_id         channel MAPPINGS    │
                                │                                          │
                                │  catalog_conflict    unresolved disputes │
                                └───────────────────────┬──────────────────┘
                                                        │
                    ┌───────────────────────────────────┴──────────────────┐
                    │              QUERY / SERVICE LAYER                   │
                    │  catalog_public_item / _bottle / _closure / _price   │
                    │  _media / _compatibility / _knowledge                │
                    │  (internal: _completeness, _health, _provenance)     │
                    └───────────────────────────────────┬──────────────────┘
                                                        │
      ┌──────────┬──────────┬──────────┬────────────┬───┴────┬─────────────┐
      ▼          ▼          ▼          ▼            ▼        ▼             ▼
   Website    Shopify    Search    AI agents   Configurator Google    Support /
   (SPA)      (sync)                (Grace)                 Merchant  wholesale
```

The move that matters: **the systems that serve product data become consumers,
not sources of truth.**

For Shopify this is free: the store is close to empty and the UI ships a demo
fallback for it. For the live storefront's Convex catalog it is not free — that
catalog is populated, curated and serving customers today — so it is a real
decision rather than a default, taken in
[`05-CONVEX-STOREFRONT.md`](05-CONVEX-STOREFRONT.md).

The reasoning is the same in both cases. A system that cannot express "this fit
is likely, not verified", or "this height came from a 2024 scrape and a person
has never checked it", should not be the place those facts live. It should be
where they are published.

## C.3 Source-of-truth boundaries

| Data | Canonical owner | Everything else |
|---|---|---|
| Item identity, specifications, compatibility, media approval, product knowledge | **Catalog** | consumes |
| Live storefront reads; storefront-only fields (`paperDollFamilyKey`, prompt-assembly inputs) | **Convex** (`precise-raccoon-123`) | catalog maps and reconciles, see doc 05 |
| Cart, checkout, payment, orders, fulfilment | **Shopify** | catalog does not model these |
| Editorial copy, journal, brand assets, Paper Doll layer artwork | **Sanity** | catalog references assets by URL/id, does not copy them |
| User accounts, favourites, chat history | **Supabase (existing app tables)** | untouched by this work |
| Live inventory counts | **Shopify / ERP** | catalog stores the last-synced snapshot and says when it was taken |

The rule: the catalog owns *what a thing is*. Convex owns *what the site
serves*. Shopify owns *the transaction*. Sanity owns *how we talk about it*.

Two Sanity projects exist — `gv4os6ef` (this repo) and `gh97irjh` (the
storefront). Any statement about "the Sanity data" must say which.

## C.4 The two decisions that shape everything else

### Decision 1 — canonical values are derived, not written

An importer never writes `bottle_spec.height_without_closure_mm`. It writes a
`catalog_fact_assertion`: *source `website-scrape`, at
`data/scraped_products.json[412]`, on 2026-08-29, claims
`bottle.heightWithoutClosureMm` is 106.*

The canonical value is then resolved from all assertions for that field, in
this order: an explicit human resolution, then source rank, then confidence,
then recency. When two assertions disagree materially, the field still resolves
so the catalog stays usable — but a `catalog_conflict` is opened and the item
is flagged `conflicting`.

This is what makes "where did this come from?" answerable, and it is the
mechanism that makes *last import wins* structurally impossible. A test asserts
it directly:

> "a later, weaker source cannot overwrite a stronger one"

**Alternative considered:** write canonical values directly and keep a change
log. Rejected — a change log tells you a value changed, not which of five
disagreeing sources is right, and it cannot answer the disagreement without a
human replaying history.

### Decision 2 — a neck-finish match is evidence, not proof

Thread pitch, liner thickness, shoulder clearance and cap skirt depth all decide
whether a closure actually seats. `18-415` and `18-400` share a diameter and
never mate. A `17mm` snap neck is not a `17-415` screw neck.

So rule inference writes `status = 'likely'` with `confidence ≤ 0.60` and a
`basis` naming the rule. Only a human or a physical test may write `verified`,
and the row must name the verifier. **This is enforced by database
constraints**, not by convention:

```sql
constraint catalog_edge_rules_stay_likely
  check (basis not like 'rule:%' or (status = 'likely' and confidence <= 0.60))
constraint catalog_edge_verified_needs_verifier
  check (status <> 'verified' or (verified_by is not null and verified_at is not null))
```

The first run produced 14,788 inferred edges. Every one is `likely`. Zero are
verified, which is the honest state of the world today.

## C.5 Why Postgres/Supabase and not Sanity or Shopify

| Option | Verdict |
|---|---|
| **Supabase Postgres** | **Chosen.** Already in the stack and already holds app data. Relational integrity, check constraints, RLS, indexed range queries over 2,500+ items and 14,788 edges, and views as a stable read contract. |
| Sanity | Rejected as canonical. It is a content lake: no referential integrity, no check constraints, weak numeric range querying, and a document model unsuited to a 15k-edge graph. Keeps its editorial and Paper Doll role. |
| Shopify metafields | Rejected. Cannot express compatibility status, provenance or completeness; couples the knowledge model to a commerce vendor. |
| A new service / graph DB | Rejected. Premature. A modular monolith on the database already in the stack is the right size for 2,500 items. |

## C.6 What was deliberately not built

Following the brief's instruction not to overbuild:

- No embeddings or semantic search — the structured filters have to be
  trustworthy first.
- No channel transformers (Google Merchant, Amazon, Etsy feeds) — the mapping
  table and public views are in place; the transformers are P5.
- No configurator UI — the data model supports one; the UI is not this phase.
- No admin UI — `catalog_health`, `catalog_item_completeness` and
  `catalog_orphan_report` are the operator surface for now; a UI is P2.
- No live Shopify sync — the mapping and boundary are defined, the sync job is
  P5 and needs the conflict rules settled first.

---

## G. Risks

### G.1 Duplicate source of truth (highest risk)

**The risk.** The catalog becomes yet another store rather than replacing any.
`inventory.json` keeps being edited, scripts keep writing Sanity directly, the
storefront keeps authoring specifications in Convex, and in six months there
are more disagreeing sources than before.

**Why it is real here, and worse than first assessed.** 85 scripts currently
write to Sanity and Supabase with no batch record, and nothing stops them.
Counting the Convex storefront catalog and `Nemat_Product_Catalog.csv`, the
catalog would be the *eighth* store, not the sixth — and one of the existing
seven is live, curated and serving customers. This is now the risk that most
needs an explicit decision rather than a mitigation: see doc 05.

**Mitigation.** The migration plan (doc 04) makes source retirement an explicit,
sequenced deliverable with a defined "read path cut over" step, not a hope. Until
a source is retired it must be registered in `catalog_source` and ingested
through the pipeline, so at minimum its disagreements are visible.

### G.1b Convex divergence

**The risk.** Both the catalog and Convex hold specifications, both get edited,
and they drift. This is the concrete form G.1 takes on day one.

**Mitigation.** Convex is registered as a ranked ingestion source
(`bb-convex-production`, rank 60), so its data competes on the normal conflict
rules rather than being trusted or ignored. `catalog_convex_drift` reports
identity coverage in both directions. `CONVEX_PROMPT_READINESS_FIELDS` aligns
the two completeness models so an item this catalog calls complete while the
storefront calls it blocked is detectable.

**Residual risk, and it is the real one:** none of that stops a person editing a
dimension in Convex. Only the ownership decision in doc 05 does, and that
decision has not been made by the team yet — this work only frames it.

### G.2 Shopify synchronisation

**The risk.** Bidirectional sync without conflict rules corrupts both systems.
Shopify edits made in the admin UI silently overwrite verified specifications;
or the catalog overwrites merchandising copy a marketer wrote in Shopify.

**Mitigation.** Sync is one-directional, catalog → Shopify, for specification
fields. Shopify remains canonical for cart, checkout, orders and live inventory,
which the catalog does not model. Shopify ids live in `catalog_external_id` as
mappings and are never identity. Any inbound Shopify data enters as
`catalog_source` = `shopify` (rank 60) and competes on the normal conflict
rules — it cannot beat a physical measurement. **Do not enable a Shopify→catalog
write path for specifications before the conflict-resolution workflow has a UI.**

### G.3 Unverified imported data presented as fact

**The risk.** 2,530 items arrive from a scrape and a spreadsheet, and the
website or Grace presents their dimensions to a customer as though they were
measured.

**Mitigation, enforced structurally.**
- Every imported item lands `lifecycle = 'draft'` and
  `verification = 'unverified'`; `catalog_public_item` only exposes `active`
  and `discontinued`, so nothing imported is publicly visible until promoted.
- Every imported asset lands `approved = false`; `catalog_public_media` exposes
  only approved assets.
- `catalog_public_compatibility` carries the `status` column, so a consumer can
  always tell `verified` from `likely`.
- Tests assert all three ("nothing arrives already verified").

**Residual risk:** an operator bulk-promotes drafts to `active` to make the site
look populated. That is a process control, not a schema control. The
`catalog_item_completeness` view exists so promotion can be gated on a
completeness threshold.

### G.4 Incorrect compatibility assumptions

**The risk.** 14,788 rule-inferred edges get treated as a fit guarantee, a
customer buys a cap that does not seat, and the catalog is blamed for it.

**Mitigation.** Rule edges are capped at `likely`/0.60 by a DB constraint;
`closuresFor(..., { minimumStatus: 'verified' })` returns nothing today, which
is correct; `validateConfiguration` reports `likely` as a warning, not a pass.

**Residual risk:** a consumer that ignores the `status` column. The public view
includes it precisely so ignoring it is a visible choice.

### G.5 Incomplete specifications

**The risk.** 2,368 items have no dimensions and 2,530 have no approved hero
image. A naive consumer renders blanks, or worse, a default.

**Mitigation.** `NULL` means unknown throughout; nothing defaults. The
completeness view names exactly what is missing per item and
`recommendedNextAction` names the highest-weight gap. Publishing can be gated on
`production_ready`.

### G.6 Bad legacy data promoted wholesale

**The risk.** The five defects in §A.4 flow through into the canonical catalog.

**Mitigation.** Each is handled explicitly and covered by a test:
`inventory_id` is excluded from matching by the uniqueness guard; the legacy
`category` column is not used for classification; category labels in the neck
column are rejected and reported rather than parsed; materials and colours go
through alias tables; duplicate SKUs inside a source collapse onto one item with
a batch warning.

**Residual risk:** an alias table that maps a value wrongly. Mitigated by the
resolvers returning `undefined` rather than guessing, and by the
`unmapped-values.json` report which lists every value a normaliser refused.

### G.7 Public/private data leakage

**The risk.** `unit_cost`, `supplier_id`, `supplier_part_number` or
`internal_notes` reach the browser through the Supabase anon key.

**Mitigation.** RLS is enabled on all 30 catalog tables and `anon` /
`authenticated` are revoked from every one of them. Public reads go exclusively
through seven `catalog_public_*` views. Two schema guarantees assert this:
no public view may contain an internal column, and `anon` must hold no direct
table grant on any catalog table.

**Residual risk:** a future migration adds a column to a public view without
thinking. The guarantee check catches exactly that, which is why it runs as
`npm run catalog:verify-schema`.

### G.8 Incompatible legacy models

**The risk.** Sanity's `product` / `glassOption` / `capOption` /
`fitmentVariant` model and the Supabase `product_images` model both remain,
diverging from the catalog.

**Mitigation.** Both are mapped, not replaced, in this phase:
`catalog_external_id.system = 'sanity_document' | 'supabase_product_image'`, and
`catalog_render_spec` holds *references* to the rendering system rather than
copying geometry. Retirement is sequenced in doc 04.

### G.9 The migration itself losing data

**The risk.** A SKU present in a legacy file has no representation afterwards.

**Mitigation.** Asserted, not assumed. `catalog/tests/ingest.test.ts` runs the
pipeline over the real committed files and asserts that the set of distinct
source SKUs equals the set of item SKUs plus the set of review-queue SKUs, with
zero rejected rows. 2,551 in, 2,530 items + 21 reviews out.
