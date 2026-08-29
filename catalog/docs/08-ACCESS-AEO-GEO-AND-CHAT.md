# Access, AEO/GEO, and the Grace chat surface

Where the knowledge catalog lives, how each consumer reaches it, how it feeds
answer-engine and generative-engine optimisation, and what the standalone Grace
chat surface needs to be trustworthy.

---

## 1. Where it is stored

Three stores, three jobs. The mistake to avoid is putting the same fact in more
than one of them.

| Store | Holds | Why there |
|---|---|---|
| **Postgres (Supabase)** — `catalog_*`, 30 tables | canonical facts, provenance, conflicts, compatibility graph, completeness, media approval, governed knowledge | needs check constraints, referential integrity, RLS, and indexed range queries over a 15k-edge graph. Nothing else in the stack does all four. |
| **Convex `precise-raccoon-123`** | the serving projection the storefront reads reactively | it is already there, already fast, already wired to the PDP. It should stop being where facts are *authored* and become where they are *published*. |
| **Sanity `gh97irjh`** | editorial prose, Paper Doll layer artwork, imagery | a CMS is right for content and wrong for a compatibility graph |

Object storage (Sanity CDN / Vercel Blob) holds the bytes; the catalog holds the
*record* of each asset — its approval state, origin (photograph vs render), and
which configuration it depicts.

**The flow is one-directional.** Authoring and reconciliation happen in the
catalog; a sync job projects the publishable subset into Convex; the storefront
reads Convex. Shopify and feeds are further consumers. Nothing writes back up
the chain without going through the conflict machinery.

```
   sources ──▶ CATALOG (Postgres) ──▶ Convex ──▶ storefront / Grace
   spreadsheets   canonical facts      serving      PDP, search, chat
   live PDP       provenance           projection
   Convex         conflicts                    └──▶ Shopify, feeds, JSON-LD
   suppliers      completeness
   measurements   knowledge
```

---

## 2. How each consumer reaches it

Everything goes through one of three doors. There is no fourth.

**Door 1 — public views, for anything customer-facing.**
Seven `catalog_public_*` views (`_item`, `_bottle`, `_closure`, `_price`,
`_media`, `_compatibility`, `_knowledge`). They expose only `active` /
`discontinued` items and only approved media, and they exclude `unit_cost`,
`supplier_id`, `supplier_part_number` and `internal_notes` by construction. RLS
is on for all 30 tables with `anon` revoked, so the exclusion is structural, not
a matter of remembering.

**Door 2 — deterministic tools, for agents.** See §3.

**Door 3 — operator views, internal only.** `catalog_item_completeness`,
`catalog_health`, `catalog_orphan_report`, `catalog_field_provenance`,
`catalog_convex_drift`. These answer "what don't we know" and "where did this
come from", and they are how the catalog gets more complete over time.

---

## 3. How AI agents access it

**Agents call functions. Agents do not read the corpus.** This is the single
rule that keeps an agent honest, and it is already the storefront team's stated
constraint.

Two retrieval paths, deliberately separate:

| Question type | Path | Example |
|---|---|---|
| **Fact** | indexed lookup → structured row + provenance | "how tall is GBCylAmb5RollBlkSh", "what caps fit this", "case quantity" |
| **Guidance** | vector search over governed knowledge only | "which bottle suits a thick oud oil", "what's your return window" |

Facts must never come from a vector store. Similarity returns plausible rows;
an exact-SKU question needs the exact one, and when similarity misses, the model
fills the gap. Guidance must never come from raw prose either — only from
`catalog_knowledge_entry` rows that are `approved`, in date, and have a named
reviewer.

### The tool surface

Grace already has the fact tools: `searchCatalog`, `getProductBySku`,
`getProductGroup`, `checkCompatibility`, `compareProducts`,
`getBottleComponents`, `getPriceStats`, `getCatalogStats`, `getPolicy`,
`getFamilyOverview`. Four question shapes still have no tool, and each maps to a
view that already exists:

| Missing tool | Backed by | Answers |
|---|---|---|
| `findCompatibleContainers` | `catalog_public_compatibility` | "which bottles take this reducer" |
| `getKnowledgeGaps` | `catalog_item_completeness` | "what don't we know about this bottle" |
| `getFactProvenance` | `catalog_field_provenance` | "where did this measurement come from" |
| `validateConfiguration` | `validateConfiguration()` | "does this build actually work" |

### The response contract

Every tool returns facts with three pieces of metadata, and the agent is
instructed to respect them:

- `verification` — `verified` / `unverified` / `conflicting`
- `confidence` — 0..1
- `source` — where it came from, for citation

A `likely` compatibility must be spoken as "the threads match, we haven't
tested it" — never as a fit guarantee. A `conflicting` field should be spoken
with a hedge or escalated, never asserted. This is what turns "the agent said
so" into "the catalog says so, and here is why."

### Permissions

Public Grace, employees and executives get *the same tools* through *different
scopes*, deny-by-default. Cost and supplier terms live in the same catalog and
are simply unreachable through the public surface. "Total access" means every
*authorised* question is instantly answerable — not one undifferentiated
corpus.

---

## 4. Website integration

The website becomes a consumer, like every other channel.

**Product pages** render from `catalog_public_bottle` / `_closure` / `_price` /
`_media` (via the Convex projection). Two rules that change what the page looks
like:

- **Unknown renders as unknown.** No blank cell that reads as zero, no invented
  default. "Diameter: not yet published" is honest and, as §6 shows, currently
  applies to most of the catalog.
- **Compatibility renders with its status.** "Fits" and "threads match, not yet
  tested" are different claims and must look different.

**Specification tables, compatibility sections and FAQs** all come from the same
records the agent reads. That is the property that makes the agent and the page
agree — today they can disagree, which is how a customer reads "white cap" on
the page while Grace says "clear".

**Policy pages must render *from* the knowledge entry**, not be where the policy
lives. Today `src/app/terms/page.tsx` and `shipping-returns/page.tsx` hold
policy text in JSX, which is exactly why Grace fabricated policy answers before
`getPolicy` existed: **an agent cannot read JSX**. One source, two consumers.

---

## 5. AEO and GEO

Answer Engine Optimisation (being the cited answer in AI search) and Generative
Engine Optimisation (being retrievable and quotable by LLMs) are both downstream
of the same property: **structured, attributable, machine-readable facts.** A
knowledge catalog is close to the ideal input.

### Emit JSON-LD from the catalog, not by hand

Generate `Product`, `Offer`, `QuantitativeValue`, `FAQPage` and `BreadcrumbList`
directly from `catalog_public_*`. Because the catalog knows what it does not
know, the emitter can follow one rule that hand-written structured data usually
breaks:

> **Only emit a claim the catalog can support.** No `AggregateRating` without
> real reviews. No `availability` without a `stock_status`. No `height` without
> a measured value.

Unsupported structured data is worse than none — it is a trust penalty when it
contradicts the page.

### What actually wins AEO

Answer engines cite pages that answer a *specific* question with a *specific*
fact. The catalog's advantage over a competitor's PDP is exactly the data that
is currently missing:

- exact dimensions with tolerances (`83 ±1 mm`, not "about 3 inches")
- neck finish as a spec, not prose
- **compatibility as an explicit relationship** — almost nobody publishes "these
  17 caps fit this bottle" as structured data, and it is the highest-intent
  question in this category
- case quantity, MOQ, lead time — the B2B qualifiers buyers filter on

`catalog_term_synonym` is the AEO lever most people miss. Customers search
"attar bottle", "roll-on bottle", "perfume sample vial". Canonical terms mapped
to real search language, seeded from actual logs, is what makes a page match the
question as asked.

### What wins GEO

- **Answer the question in the first sentence**, then support it. Retrieval
  favours self-contained passages.
- **One durable URL per fact-bearing entity** — the catalog's stable slug per
  item and per configuration.
- **Cite your own sources.** Pages that reference ASTM, FDA 21 CFR, GPI
  standards read as part of a credible reference graph. The legacy site's
  `/faq.php` already does this with HTS codes; preserve it.
- **Publish the comparison and compatibility content** that only someone with a
  real catalog can produce.

A caution the SEO audit already raised: `NEXT_PUBLIC_SITE_URL` defaulting to the
staging origin would tell search engines the wrong canonical host. Structured
data amplifies whatever canonical you emit — including a wrong one.

---

## 6. The Grace chat surface

The plan for a clean Claude/ChatGPT-style chat with Grace is right, and the
backend for it largely exists (`EmployeeKnowledgeWorkspace`, the Responses
adapter, the tool registry). What determines whether it is trusted is not the
UI.

**Ship these with it:**

1. **Citations, visible.** Every product fact carries a source chip — "Convex ·
   verified" or "live site · unverified". The internal workspace already has
   source-labelled answers; the customer-facing surface should not be less
   honest.
2. **A visible unknown state.** "We haven't published that dimension — want me
   to have someone measure it?" is a good answer and creates a
   `catalog_customer_question` row. This is the opposite of the false negative.
3. **A correction affordance.** One click from any answer to "this is wrong",
   landing in `catalog_knowledge_corrections` / `catalog_conflict` as a pending
   review. Never auto-mutating the catalog. The gateway plan already specifies
   this.
4. **Zero-result logging.** Every query that returns nothing becomes a candidate
   `catalog_term_synonym` row. The chat is your best source of real customer
   vocabulary; not capturing it wastes the highest-value signal you have.
5. **Streaming, and tool transparency without mechanics.** Showing "checking the
   catalog…" is good. Reciting "I can run at most two searches" is the
   documented failure — internal mechanics stay invisible.

**One deployment caution.** The audit's scope note records that the "staging"
alias resolved to the same deployment and Convex production backend that was
promoted the day before. A chat surface that can read live production data needs
a genuinely separate staging backend, or every test conversation is a production
read.

---

## 7. Getting the Grace audit to 100/100

You asked whether this needs another HTML scrape. **Measured answer: no.**

I ran the reconciliation (`catalog/src/cli/reconcile-storefront.ts`) over the
scrape already committed in the storefront repo
(`data/bestbottles_raw_website_data.json`, 2,285 live PDP records) against
`Nemat_Product_Catalog.csv`:

**Coverage is already solved.**

| | |
|---|---|
| live site distinct SKUs | 2,285 |
| storefront distinct SKUs | 2,315 |
| resolvable in both | **2,281 — 99.8% of live** |
| live-only (would be a false "we don't carry that") | **4** |
| storefront-only (orphans) | 34 |
| duplicate SKUs in the storefront export | 2 |

The audit's "73% of SKU lookups fail" was a **tool-binding** defect — no
exact-SKU tool was bound — not missing products. `getProductBySku` fixed the
cause. Four live-only SKUs is a morning's work, not a scrape.

**Fidelity is the wall, and it is severe.** On the SKUs that do resolve, the
storefront catalog holds almost none of the physical specs Grace is asked for:

| Field | Storefront export | Live PDP | Internal spec library |
|---|---|---|---|
| `heightWithCap` | **0.6%** | 97.9% | 99.4% |
| `heightWithoutCap` | **0.6%** | 91.7% | 79.0% |
| `diameter` | **0.2%** | 55.8% | 99.4% |
| `bottleWeightG` | **0.0%** | — | 78.3% |
| `caseQuantity` | **0.0%** | — | 74.2% |
| `neckThreadSize` | 97.5% | 97.5% | 95.8% |

Grace cannot answer "how tall is this bottle" for essentially the whole
catalogue — and the same gap makes the Madison image pipeline emit `MISSING`
placeholders, which is why gpt-image-2 invents bottle proportions.

**The data is not lost, and the two sources are complementary** — the live PDP
is strong on heights, the spec library on diameter, weight and case quantity.

> **10,890 values across 2,299 SKUs are recoverable right now, with no new
> scrape.** Written to `catalog/out/storefront-reconciliation/spec-backfill-candidates.json`,
> each carrying its source and rank (live PDP 65 outranks the spec library 50).

Only **706 values across all fields genuinely need physical measurement** —
mostly `caseQuantity` (360) and `bottleWeightG` (164).

`convex/backfillPhysicalSpecs.ts` was written to do exactly this job, fills only
NULLs, and per `docs/data_alignment/README.md` appears never to have run.

### Order of work

1. **Run the spec backfill.** Biggest single accuracy gain available; no scrape,
   no new tooling.
2. **Fix the export path.** The few populated values are malformed —
   `"27 ±0.5 mm Item Diameter: 19 ±"` — truncated concatenations, so whatever
   generates `Nemat_Product_Catalog.csv` is mangling multi-field cells.
3. **Import the 4 live-only SKUs; resolve the 34 orphans.**
4. **Load the 106 field contradictions and the 1,429 Master-vs-Convex
   mismatches** as conflicts and work them.
5. **Bind the four missing tools** (§3).
6. **Make the audit a release gate** with an explicit criterion: *no "we don't
   carry it" on any in-stock SKU*, run against a sampled SKU list every deploy.
7. **Then** consider a fresh scrape — to re-verify after backfill, not to
   discover. And note it cannot run from a cloud session until the network
   policy allows `bestbottles.com`.
