# The master knowledge catalog, and what AI agents actually need from it

The goal: one canonical knowledge system holding everything about Best Bottles
and Nemat International, so that any agent — Grace on the storefront, an
internal employee assistant, an executive analyst, a future marketplace bot —
has complete access to product truth instantly.

The goal is right. The framing "cram in everything and give total access" is
the part that needs care, and the reason is not theoretical. It is measured, in
this business, on this catalog.

---

## 1. The evidence that storage is not the bottleneck

`docs/reviews/audit-2026-08-06/GRACE-ACCURACY-TOOL-AUDIT.md` in the storefront
repo is a live audit of Grace against production Convex. Its verdict:

> **Overall score: 76/100 · Production-ready for conversational use? NO**
>
> Grace's *reasoning, safety, and communication are production-grade, and every
> fact she successfully retrieves is exact* — but she has **no exact-SKU lookup
> tool bound**, so **73% of SKU lookups fail**, producing false "we don't carry
> that" on in-stock products and at least one misattributed price; and she has
> **no policy tool**, so policy answers are fabricated.

Four of six NO-GO criteria failed. Read the middle clause again: *every fact
she successfully retrieves is exact*. The data was there and it was right.

**Not one of those failures would have been fixed by adding more data.** They
were failures of retrieval binding, of vocabulary, and of contradiction. That
is what a master catalog has to solve, and it is a harder problem than storage.

The worst symptom is worth naming precisely, because it is the one that costs
money: **a false negative — telling a customer "we don't carry that" about a
product that is in stock.** An agent that knows nothing says "let me check."
An agent with incomplete retrieval over a complete catalog says "we don't have
it," confidently, and the customer leaves. Completeness of *storage* without
completeness of *retrieval* makes the failure mode worse, not better.

---

## 2. What a master catalog actually is: four layers

Not one pile. Four layers, each with a different rule.

```
  ┌────────────────────────────────────────────────────────────────┐
  │ 4. AGENT TOOL SURFACE     deterministic functions, not a corpus │
  │    searchCatalog · getProductBySku · checkCompatibility ·       │
  │    getPolicy · comparProducts · answerProductQuestion           │
  └───────────────────────────┬────────────────────────────────────┘
                              │ every answer carries provenance
  ┌───────────────────────────┴────────────────────────────────────┐
  │ 3. GOVERNED KNOWLEDGE     FAQs, policy, buying advice, use      │
  │    cases, terminology.  Review-gated; AI drafts cannot publish  │
  └───────────────────────────┬────────────────────────────────────┘
                              │
  ┌───────────────────────────┴────────────────────────────────────┐
  │ 2. TYPED FACTS + PROVENANCE   every value knows its source,     │
  │    its confidence, and whether a human verified it.             │
  │    Disagreements become conflicts, not overwrites.              │
  └───────────────────────────┬────────────────────────────────────┘
                              │
  ┌───────────────────────────┴────────────────────────────────────┐
  │ 1. IDENTITY SPINE   one permanent id per thing. Everything —    │
  │    specs, media, prices, knowledge, channel ids — hangs off it. │
  └────────────────────────────────────────────────────────────────┘
```

Layers 1–3 are built (`catalog/migrations/0001`–`0006`). Layer 4 is the part
that turns a good database into an agent's memory, and it is where the Grace
audit says the current system is failing.

**The rule that makes it work: agents call functions, they do not read the
corpus.** The storefront team already wrote this constraint down —

> *"OpenAI is the reasoning, conversation, voice, and orchestration layer; it is
> not the product database."*
> *"Never bulk-inject or upload the 2,330-row product catalog to OpenAI File
> Search."*

That is exactly right, and the audit explains why. Semantic search over 2,330
product rows returns *plausible* rows. "What is the case quantity of
GBCylAmb5RollBlkSh" needs an *exact* row. Vector similarity cannot guarantee
exactness, and when it misses, the model fills the gap. Every product fact an
agent states must come from an indexed lookup with a citation, not from
retrieved context it is trusted to read correctly.

Vector search still has a job — over layer 3, the prose. "What's your return
window", "which bottle suits a thick oud oil" are genuinely semantic. Facts are
looked up; guidance is retrieved. Keeping those two paths separate is the
single most important design decision in the whole system.

---

## 3. The three failure classes that block "instant total access"

All three are documented in your own repo. All three are catalog problems, and
the catalog foundation already addresses each — but they need wiring.

### 3.1 Retrieval binding — the question shape has no tool

73% of SKU lookups failed because no exact-SKU tool was bound. Policy answers
were fabricated because no policy tool existed.

**The fix is a coverage discipline, not a bigger model.** Enumerate the question
shapes the business receives, and assert that each has a tool that answers it
deterministically. The current surface (`searchCatalog`, `getProductBySku`,
`getProductGroup`, `checkCompatibility`, `compareProducts`,
`getBottleComponents`, `getPriceStats`, `getPolicy`, `getFamilyOverview`) has
grown to cover the gaps the audit found — which is the right response, and
should become a standing test rather than a one-off fix.

Question shapes still worth checking for coverage:

| Shape | Example | Tool |
|---|---|---|
| Exact identity | "specs for GBCylAmb5RollBlkSh" | `getProductBySku` ✅ (added after audit) |
| Structured filter | "amber, 6–12 ml, 13-415, in stock" | `searchCatalog` ✅ |
| Compatibility | "what caps fit this bottle" | `checkCompatibility` ✅ |
| **Reverse compatibility** | "which bottles take this reducer" | ⚠️ verify |
| **Completeness** | "what don't we know about this bottle" | ❌ `catalog_item_completeness` exists, no tool |
| **Provenance** | "where did this height come from" | ❌ `catalog_field_provenance` exists, no tool |
| Policy | "what's the return window" | `getPolicy` ✅ (added after audit) |
| **Configuration validity** | "does this build work" | ❌ `validateConfiguration()` exists, no tool |
| **Company/Nemat facts** | "who owns Best Bottles" | ❌ see §4 |

The last four are the gap between "answers product questions" and "knows
everything about the company."

### 3.2 Vocabulary mismatch — the customer's words don't hit your data

Three documented instances, each producing a false negative:

- *"searches for '1 oz' miss products named '30 ml'"* — unit mismatch.
- *"'black plug' became colors:['Black'] in Refine, which filters GLASS
  color, so black-closure 1ml vials verified 0 groups and Grace declared them
  nonexistent"* — **a closure colour filtered as a glass colour.** The catalog
  had the product. The agent said it didn't exist.
- Neck-thread breadth: 9 mL `13-415` and `17-415` must stay separate unless the
  customer broadens.

These are not model failures. They are **missing vocabulary infrastructure**,
and the catalog already has the three pieces that fix them:

| Failure | Catalog mechanism |
|---|---|
| "1 oz" vs "30 ml" | `domain/units.ts` — one canonical unit, normalise at the boundary, convert on read |
| closure colour vs glass colour | separate typed fields: `bottle_spec.glass_colour` vs `closure_spec.colour_label`. They are different columns, so they cannot be conflated by a filter |
| "black plug", "roll-on", "attar bottle" | `catalog_term_synonym` — canonical term ↔ colloquial ↔ search query, with `observed_count` |

`catalog_term_synonym` is the piece with no data in it yet, and it is the
highest-leverage empty table in the system. It should be seeded from real search
and support logs, not invented. Every zero-result query is a row that belongs in
it.

**A zero-result search should never be reported to a customer as absence.** The
Refine fix already encodes this — *"a 0-group verify means the filter is wrong,
not the catalog"* — and it should be a system-wide rule: zero results is a
retrieval event that gets logged as a terminology gap, and the agent says "let
me look at that differently," never "we don't carry it."

### 3.3 Internal contradiction — two fields that disagree

`field-contradictions-prod.json`: **106 contradictions in production.** Example:

```json
{ "graceSku": "GB-CYL-CLR-28ML-MRL-02",
  "issue": "cap_color_contradiction",
  "detail": "Item name says \"white\" closure but capColor says \"Clear\". Grace reports capColor." }
```

The product name says white cap; the structured field says clear; Grace reports
the field. The customer reads the name. Someone is wrong and nobody knows who.

An agent must never be the component that picks between two disagreeing fields.
That is what `catalog_conflict` is for: the disagreement is recorded, the item
is flagged `conflicting`, one value is served with reduced confidence, and a
human resolves it durably in `catalog_field_resolution`. These 106 are
assertion-shaped already and should be loaded as conflicts on day one —
alongside the 1,429 Master-v8.3-vs-Convex mismatches from doc 06.

---

## 4. Scope: Nemat International, not just bottles

Best Bottles is *a division of Nemat International, Inc.* — 2,300 SKUs, 37
families. A company-wide knowledge catalog is broader than the packaging
catalog in two directions.

### More kinds of product

Nemat's own lines (fragrance oils, attars) fit the existing model without
redesign: they are catalog items with different `kind` values and different
typed specs. `catalog_item_kind` is an enum, extended by migration. The
identity, provenance, conflict, media and knowledge machinery is unchanged.

What would need adding: a `fragrance_spec` table alongside `bottle_spec` and
`closure_spec` (concentration, carrier, olfactory family, notes, IFRA status,
shelf life, allergen declarations). Same pattern, new table — **not** columns
bolted onto `catalog_item`.

### Things that are not products at all

Policy, certifications, HTS/tariff codes, MSDS sheets, company facts, supplier
terms. Today, on the storefront, **policy lives in React components** —
`src/app/terms/page.tsx`, `src/app/shipping-returns/page.tsx`. That is precisely
why Grace fabricated policy answers before `getPolicy` existed: **an agent
cannot read JSX.** Truth that lives only in a rendered component is invisible to
every consumer that is not a browser.

The fix is not to make these catalog items. It is to let knowledge attach to
subjects that are not items. `catalog_knowledge_subject` currently requires a
`catalog_id` foreign key; it needs a scoped subject instead:

```sql
-- proposed: knowledge can be about the company, a category, or an item
alter table catalog_knowledge_subject
  add column subject_scope text not null default 'item'
    check (subject_scope in ('item','category','family','company','policy_area')),
  add column subject_ref text,          -- 'nemat-international', 'closures', '13-415'
  alter column catalog_id drop not null,
  add constraint knowledge_subject_resolvable
    check ((subject_scope = 'item') = (catalog_id is not null));
```

Then "what is your return window", "is Best Bottles part of Nemat", "what's the
HTS code for glass bottles" are all governed knowledge entries with a named
reviewer and an effective date — retrievable by the same tool, citable the same
way, and **impossible to publish as an unreviewed AI draft** (already enforced
by `catalog_knowledge_ai_needs_review`).

Policy pages should then render *from* the knowledge entry rather than being the
place it lives. One source, two consumers: the page and the agent.

---

## 5. What "instant total access" should mean in practice

Four properties. The first three exist; the fourth is the work.

**1. Every fact is attributable.** An agent can always answer "where did this
come from?" — `catalog_field_provenance` returns source, rank, locator and
observation date per field. This is what separates a knowledge system from a
plausible-sounding one.

**2. Unknown is a first-class answer.** `NULL` means *we have not established
this*. An agent saying "we haven't measured that — I can find out" is correct
behaviour and is trusted. It is the opposite of the false-negative failure: one
admits a gap in *our knowledge*, the other asserts a gap in *our inventory*.

**3. Confidence is visible.** A `likely` compatibility edge is not a fit
guarantee. The public view carries `status` precisely so a consumer cannot
lose that distinction by accident.

**4. Coverage is tested, not assumed.** The audit is the model: a live harness
that asks real questions and scores whether the agent retrieved or invented.
That should run on every deploy, not once. A "76/100, not production ready"
verdict is only useful if it is repeatable.

### The permission dimension

The gateway plan already gets this right and it should not be diluted in
pursuit of "total access": public Grace, employees and executives get *the same
grounded tools* through *different scopes*, deny-by-default, with logically
separated document stores. Cost, supplier terms and margin are internal facts
that live in the same catalog and are unreachable through the public surface —
in this schema, by RLS and the `catalog_public_*` views rather than by
remembering to omit a column.

"Total access" means every *authorised* question is answerable instantly. It
does not mean one undifferentiated corpus.

---

## 6. Build order

Sequenced so each step is useful alone.

**Now — make the existing truth reachable**
1. Load the two known contradiction sets as conflicts: 106 production field
   contradictions, 1,429 Master-v8.3-vs-Convex mismatches. Both are already
   assertion-shaped.
2. Extract policy from JSX into `catalog_knowledge_entry`; render the pages from
   it. Removes the fabrication surface permanently.
3. Seed `catalog_term_synonym` from real search and support logs. Log every
   zero-result query as a candidate row.

**Next — close the tool gaps**
4. Add tools for the four uncovered shapes: reverse compatibility, completeness,
   provenance, configuration validity.
5. Make the accuracy audit a standing release gate with a false-negative
   criterion: *no "we don't carry it" on any in-stock SKU*, tested against a
   sampled SKU list.

**Then — widen the scope**
6. Knowledge subject scopes (§4) — company, category, policy area.
7. Nemat product kinds and `fragrance_spec`.
8. Ingest supplier documents, certifications, MSDS as sources with provenance.

**Ongoing — the loop**
9. Customer questions ingest to `catalog_customer_question`, rank by
   `observed_count`, become reviewed knowledge, get republished. The catalog
   gets more complete because people used it.

---

## 7. The honest summary

You already have most of the data. Convex holds a 61-field product record with
its own `dataGrade` and `verified` flags. The audit found that every fact Grace
retrieved was exact.

What is missing is not volume. It is:

- **binding** — a tool for every question shape, tested;
- **vocabulary** — the customer's words mapped to your fields;
- **arbitration** — one answer where fields disagree, with a human deciding;
- **reach** — truth that currently lives in JSX, spreadsheets and people's heads
  brought into the same governed layer as the specs.

Get those four right over a 2,300-SKU catalog and agents will feel like they
know everything. Skip them and add ten times the data, and they will confidently
tell a customer you do not sell a bottle that is sitting in the warehouse.
