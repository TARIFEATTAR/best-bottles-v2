# Design: `modeling-bottles-in-blender` (global skill)

- **Status:** Revised draft — rev 2 (2026-08-26), pending approval. Supersedes the approved design of 2026-08-25.
- **Provenance note:** the approved 2026-08-25 design document was not recoverable (it was never committed; the session container that held it is gone). This document reconstructs that design from its known architecture and applies the six corrections from the 2026-08-26 revision brief. Items that could not be recovered verbatim are marked `[RECONSTRUCTED — confirm]`. The six corrections themselves are applied exactly as briefed and are marked `[REV-1]` … `[REV-6]`.

---

## 1. Purpose

A global skill that turns product evidence (photographs, dimension sheets, physical samples, AI-generated schematics) into accurate, delivery-ready 3D bottle models in Blender — bottles, vials, jars, and their closures — with explicit provenance for every modeled decision and QA gates before handoff.

## 2. Scope and triggering `[REV-4]`

The SKILL.md frontmatter description owns "when to use" entirely (the body never restates it).

**In scope — trigger assertively on any of these, even when the user never says "skill":**
- Blender work of any kind on packaging/containers
- 3D model / mesh / geometry creation or revision for a bottle, vial, jar, or closure
- GLB / glTF export of product models
- Closure fitment checked in 3D (cap, sprayer, pump, roller, dropper on a neck finish)
- Bottle/vial/jar modeling in any 3D context

**Explicitly out of scope — stated in the description:**
- 2D image work of any kind: PSD preparation, background removal, compositing, layered paper-doll imagery, product-photo cleanup. Those tasks are product-render-adjacent but must NOT invoke this skill (they belong to the 2D image-prep skills).

The earlier broad triggers "packaging" and "product-render" are removed from the description; the 3D qualifiers above replace them.

## 3. Core architecture (unchanged from approved design)

These four pillars are preserved exactly; the rev-2 corrections extend them without altering them.

### 3.1 Acceptance classes
Every build targets a declared acceptance class, set in the bottle brief before modeling starts, and QA judges against that class — never against an implicit ideal. `[RECONSTRUCTED — confirm class names]` The classes are:
- **Exact** — dimensionally faithful to a specific identified product; every critical dimension from manufacturer data or measured sample.
- **Probable** — faithful to a confidently identified product family; some dimensions from secondary sources.
- **Representative** — correct type, style, and proportions; not claimed to match a specific SKU.
- **Concept** — deliberate design exploration; no fidelity claim.

### 3.2 Layered model separation
The model is built and kept as separated, named components (body, liquid, closure, collar, labels …), never a fused mesh, so downstream consumers can toggle, swap, and material-assign per component.

### 3.3 Adapter pattern
The skill core is project-agnostic. Project-specific conventions (naming, export contracts, catalogs, fingerprint systems) live in adapter references — `best-bottles-adapter.md` is the first adapter. The core routes to the active adapter; with no adapter active, the core's neutral defaults apply and QA reports what a missing adapter leaves unvalidated.

### 3.4 Non-blocking uncertainty
Unknowns never halt the build. The workflow proceeds on the best available evidence, records each uncertainty in the brief with its resolution path, and surfaces all of them in QA — the model ships annotated, not blocked.

## 4. Operating principles

1. Evidence before geometry: no profile segment is modeled before its evidence source is classified (§5).
2. Provenance is recorded at the moment of decision, not backfilled.
3. Real-world units (mm) throughout; scale is never "fixed in export."
4. Components stay separated and named per the active adapter (§3.2, §3.3).
5. Uncertainty is annotated, never blocking (§3.4).
6. **Finish invariance under family scaling `[REV-3]`:** when scaling a body within a bottle family, the neck finish is a fixed dimensional module and is **never** scaled with the body. Sizes sharing a finish (e.g. 20-400 across 30 ml and 60 ml) must produce dimensionally identical finish geometry. Validation compares finish dimensions (T, E, I, finish height, thread turns) against the finish standard (SPI/GPI/CETIE), independent of body scale.
7. QA validates against the declared acceptance class and the active delivery contract (§7), and says explicitly what it could not validate.

## 5. Profile evidence hierarchy `[REV-1]`

Marking inferred *dimensions* is not sufficient — drift happens in the profile curves *between* measured points, where an AI-drawn shoulder or heel quietly becomes the build profile. Therefore every **profile segment** (heel, sidewall, shoulder, neck root, finish, closure surfaces …) is interpreted under an explicit evidence hierarchy:

1. **Measured** — silhouette extraction from calibrated original photographs.
2. **Visual** — direct visual interpretation of original photographs (uncalibrated).
3. **AI-inferred** — AI-generated inferred schematic.
4. **Assumed** — symmetry, convention, or analogy to a reference bottle.

Rules:
- An AI schematic may supply a profile segment **only** when no original photograph shows that region (e.g. an occluded back face, an under-cap detail). It **never** overrides a measured silhouette.
- Provenance is tracked **per profile segment**, not only per dimension. Each segment in the bottle brief records its source class (1–4 above) and the specific evidence item.
- QA reports list AI-inferred segments and assumed segments **distinctly** (two separate lists, not one "inferred" bucket).

This hierarchy is normative in `references/inferred-schematics.md` (how AI sheets are commissioned, calibrated, and constrained) and `references/blender-modeling.md` (how the build consumes segments by source class).

**Acceptance:** for a bottle with both photos and an AI sheet, the workflow demonstrably builds profiles from the photo silhouette and uses the AI sheet only for occluded views, and the brief shows per-segment provenance.

## 6. Bottle brief (schema)

The brief is the single working record for a build. Fields:

- Identity: product/SKU, family, declared **acceptance class**.
- Evidence register: every evidence item with type, date, calibration status.
- Dimensions: value, unit, tolerance, **provenance class** per dimension.
- **Profile segments `[REV-1]`:** named segment list; per segment: evidence source class (§5), evidence item reference, notes.
- Finish: standard designation (e.g. 20-400), source standard (SPI/GPI/CETIE), fixed-module flag `[REV-3]`.
- **`delivery_contract` `[REV-2]`:** the technical requirements of the consuming application — component/mesh naming and separation, up axis, origin and floor convention, unit scale, triangle budget, interior cavity requirement, UV conventions, file format, compression and size budget. Populated from the active adapter or supplied directly; may be absent (see §7).
- **Component reuse record `[REV-5]`:** when a component is reused from a prior build and the active project has **no** geometry-fingerprint system, reuse is recorded as an explicit **file path plus content hash** in the brief. The skill does not invent a fingerprint scheme for a project that lacks one; fingerprints remain a project-native mechanism that the adapter routes to when the project provides it.
- Uncertainty log: open unknowns, chosen interim resolution, escalation path (§3.4).

## 7. Delivery contract and QA `[REV-2]`

The model is validated not in the abstract but against what will consume it.

- QA validates the **exported artifact** against the active `delivery_contract`, field by field.
- If no contract is on file, QA reports **"no delivery contract on file"** as a distinct finding — it never silently passes delivery validation.
- QA also reports (per §5): AI-inferred segment list, assumed segment list; (per §4.6) finish-standard comparison result; (per §6) reuse records.

Normative detail lives in `references/qa-and-handoff.md`.

### 7.1 Best Bottles configurator GLB contract (in `best-bottles-adapter.md`)

- Named meshes, matched **case-insensitively by substring**: `body`, `liquid`, `cap`/`sprayer`/`pump`/`roller`/`dropper`, `collar`, `label_front`, `label_back`.
- +Z up; base at Z=0; real-mm scale.
- 10–40k triangles.
- Interior cavity modeled.
- Flat 0–1 UVs on label meshes.
- Draco-compressed GLB, ~45 KB per bottle target.

**Acceptance:** a Best Bottles run exports a GLB that passes an automated check against every contract field; a run with no contract reports the gap.

## 8. Evidence research `[REV-6]`

`references/evidence-research.md` keeps its workflow steps **category-based**: visual search, manufacturer catalogs, distributors, standards bodies, design registries. Named vendors appear only in a dated example list headed **"current as of 2026-08"**, so staleness is visible and updating vendors is a one-edit change.

Candidate grading:
- **Exact** requires manufacturer-published dimensions **or** a measured physical sample.
- Marketplace-listed dimensions alone cap a candidate at **Probable**, regardless of visual match quality.

## 9. File plan

```
modeling-bottles-in-blender/
├── SKILL.md                       # concise router, <500 lines; "when to use" lives
│                                  # entirely in frontmatter description (§2)
└── references/
    ├── evidence-research.md       # §8; category-based steps + dated vendor examples
    ├── inferred-schematics.md     # §5; AI-sheet rules under the evidence hierarchy
    ├── blender-modeling.md        # build workflow; consumes segments by source class;
    │                              # finish-module invariance (§4.6)
    ├── qa-and-handoff.md          # §7; contract validation, distinct AI/assumed lists,
    │                              # reuse records (path + hash)
    └── best-bottles-adapter.md    # §7.1 GLB contract; project-native fingerprints,
                                   # catalogs, naming
```

Large references carry a table of contents at the top.

## 10. Verification tests (documentation-TDD)

Existing six `[RECONSTRUCTED — confirm wording; the set of six is preserved per the approved design]`:
1. **Trigger (positive):** a 3D bottle-modeling request that never names the skill triggers it.
2. **Acceptance class:** a build declares its class in the brief before modeling and QA judges against it.
3. **Inferred-dimension marking:** dimensions not directly evidenced are marked inferred in the brief and surfaced in QA.
4. **Layer/adapter separation:** output components are separated and named per the active adapter; core stays project-agnostic with no adapter.
5. **Non-blocking uncertainty:** an unresolvable unknown is logged and annotated; the build completes.
6. **Pilot build:** the 30 ml pilot bottle builds end-to-end and passes QA.

New in rev 2:
7. **Per-segment provenance `[REV-1]`:** with photos and an AI sheet both present, profiles come from the photo silhouette; the AI sheet supplies only occluded regions; the brief shows per-segment source classes.
8. **Trigger (negative) `[REV-4]`:** a 2D product-image task (PSD prep / background removal / compositing / paper-doll imagery) does **not** trigger the skill.

Additional acceptance check tied to `[REV-3]` (validated inside test 6's family-scaling step): scaling the pilot 30 ml body to 60 ml leaves finish T/E/I dimensions, finish height, and thread turns unchanged.

---

## Revision log — rev 2 (2026-08-26)

| # | Correction | Where applied |
|---|------------|---------------|
| 1 | Per-segment profile evidence hierarchy (Measured > Visual > AI-inferred > Assumed); AI sheets only for unphotographed regions; distinct QA lists | §5, §6, §7, tests 7 |
| 2 | `delivery_contract` brief field; QA validates export against it or reports "no delivery contract on file"; Best Bottles GLB contract specified | §6, §7, §7.1 |
| 3 | Neck finish is a fixed module, never scaled with body; validated against SPI/GPI/CETIE independent of body scale | §4.6, §10 |
| 4 | Triggers tightened to 3D/Blender contexts; 2D image work excluded in description; negative trigger test added | §2, test 8 |
| 5 | Reuse without fingerprint infrastructure recorded as file path + content hash; fingerprints stay project-native via adapter | §6 |
| 6 | Category-based research steps; vendors in dated example list; Exact grade requires manufacturer dims or measured sample; marketplace dims cap at Probable | §8 |
