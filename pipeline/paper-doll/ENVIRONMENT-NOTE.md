# Paper-doll lane — cloud session note (2026-08-29)

This branch's `pipeline/paper-doll/` was created by a **cloud** Claude Code session.
The production handoff assumes the **local** workspace, which was never pushed to
GitHub — none of these exist in any of the three repos this session can see:

- `pipeline/paper-doll/studio-spec.md` (binding contract)
- `pipeline/paper-doll/ledger.csv` (single source of pipeline state)
- `pipeline/paper-doll/master-bottle-manifest.csv`
- `pipeline/paper-doll/captures/`, `cutouts/`
- `Nemat_Product_Catalog.csv` (repo root)
- `~/Projects/Clients/Nemat-International/Best-Bottles-Original-Photoshop-Sources/`

They were deliberately NOT recreated here — the local copies are authoritative.

## Verified from the cloud (2026-08-29)

- Higgsfield MCP API works: both approved pilot jobs are `completed`
  (clear `d39acb64-…`, frosted `b74f5771-…`, model `nano_banana_2`); result URLs
  re-derivable any time via `jobs_wait`. Balance 1,260.9 credits, Ultimate plan.
- **Raw byte transfer is still blocked in the cloud**: the egress proxy 403s the
  Higgsfield CDN (`d8j0ntlcm91z4.cloudfront.net`) and bestbottles.com is
  unreachable directly. Downloading generations, uploading captures, and cutouts
  therefore remain local-machine work, as the handoff states.

## What lives here (cloud-buildable, portable)

- `scripts/composite_master.py` — task-3 compositor. Spec values quoted from the
  handoff are marked HANDOFF in its `SPEC` dict; values the handoff did not state
  numerically (gradient mid-stop position, shadow geometry/opacity/blur) are
  marked ASSUMPTION and must be reconciled against local `studio-spec.md` v1
  before output is final. Requires only Pillow.
- `validation/circle-gamma-lineup.png` — the γ=0.6 founder-gate lineup
  (linear vs compressed, placeholder rectangles, placeholder mm — real dims are
  ledger work, task 2).
- `generated/` — empty; populate locally by downloading the two approved pilot
  PNGs (URLs via `jobs_wait` on the job IDs above).

## Still local-only (blocked in cloud)

Task 1 (April-era reconcile), task 2 (ledger dims — needs the ledger + Convex env),
task 4 (pilot cutout + composite of real generations), task 5 (batching).
To let future cloud sessions carry tasks 2–3, commit the `pipeline/paper-doll/`
workspace (spec, ledger, manifest — not the heavy PSDs) to a repo.
