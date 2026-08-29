import { internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Apply physical-spec corrections produced by the catalog reconciler.
 *
 * Payload: catalog/out/convex-corrections/corrections-{fill,repair,decontaminate}.json
 * from `npm run catalog:corrections` in the best-bottles-v2 repo.
 *
 * Three accepted change classes, and one that is rejected outright:
 *
 *   fill           the field is empty; the source publishes a value
 *   repair         the stored value is a strict PREFIX of the published one
 *                  ("Ground" vs "Ground glass neck with glass stopper")
 *   decontaminate  the stored value is the published one plus the NEXT field's
 *                  label ("66 ±1 mm Item Height without C")
 *   conflict       REJECTED. Two sources state materially different values
 *                  (13-415 vs 13mm is a GPI screw neck vs a metric snap neck).
 *                  These are compatibility-bearing and must be decided by a
 *                  person, not a batch job.
 *
 * SAFETY: every record is re-verified against the CURRENT document before it is
 * written. The payload is computed from a CSV snapshot, so by the time it runs
 * the row may have changed. A `fill` whose field is no longer empty is skipped;
 * a `repair`/`decontaminate` whose stored value no longer matches what the
 * payload expected is skipped. Nothing is written on a stale expectation.
 *
 * Run via driver: node scripts/apply_catalog_corrections.mjs [--apply]
 * Dry run is the default.
 */

type Correction = {
    websiteSku: string;
    graceSku?: string;
    field: string;
    current: string | null;
    proposed: string;
    changeType: "fill" | "repair" | "decontaminate" | "conflict";
    source: string;
    sourceRank: number;
};

const IMPORT_SOURCE = "catalog_reconciler_corrections_20260829";

/** Only these columns may be written by this mutation. */
const ALLOWED_FIELDS = new Set([
    "heightWithCap",
    "heightWithoutCap",
    "diameter",
    "bottleWeightG",
    "caseQuantity",
    "neckThreadSize",
]);

const ALLOWED_CLASSES = new Set(["fill", "repair", "decontaminate"]);

/** bottleWeightG and caseQuantity are numeric in the schema; the rest are strings. */
const NUMERIC_FIELDS = new Set(["bottleWeightG", "caseQuantity"]);

export const applyBatchMutation = internalMutation({
    args: { records: v.array(v.any()), dryRun: v.boolean() },
    handler: async (ctx, args) => {
        const records = args.records as Correction[];
        let matched = 0;
        let unmatched = 0;
        let written = 0;
        let rejectedClass = 0;
        let rejectedField = 0;
        let skippedStale = 0;
        let skippedNotEmpty = 0;
        const counts: Record<string, number> = {};
        const unmatchedSkus: string[] = [];
        const staleSamples: string[] = [];

        for (const rec of records) {
            if (!ALLOWED_CLASSES.has(rec.changeType)) { rejectedClass++; continue; }
            if (!ALLOWED_FIELDS.has(rec.field)) { rejectedField++; continue; }
            if (!rec.websiteSku || typeof rec.proposed !== "string" || rec.proposed.trim() === "") {
                unmatched++;
                continue;
            }

            let doc = await ctx.db
                .query("products")
                .withIndex("by_websiteSku", (q) => q.eq("websiteSku", rec.websiteSku))
                .first();

            if (!doc && rec.graceSku) {
                doc = await ctx.db
                    .query("products")
                    .withIndex("by_graceSku", (q) => q.eq("graceSku", rec.graceSku as string))
                    .first();
            }

            if (!doc) {
                unmatched++;
                if (unmatchedSkus.length < 50) unmatchedSkus.push(rec.websiteSku);
                continue;
            }
            matched++;

            // Re-verify against what the document holds RIGHT NOW.
            const liveRaw = (doc as unknown as Record<string, unknown>)[rec.field];
            const live = liveRaw === null || liveRaw === undefined ? "" : String(liveRaw).trim();

            if (rec.changeType === "fill") {
                if (live !== "") {
                    skippedNotEmpty++;
                    if (staleSamples.length < 30) staleSamples.push(`${rec.websiteSku}.${rec.field} no longer empty`);
                    continue;
                }
            } else {
                const expected = (rec.current ?? "").trim();
                if (live !== expected) {
                    skippedStale++;
                    if (staleSamples.length < 30) staleSamples.push(`${rec.websiteSku}.${rec.field} expected ${JSON.stringify(expected)} found ${JSON.stringify(live)}`);
                    continue;
                }
                // Re-prove the damage relationship on the live value, so a
                // mislabelled payload row cannot overwrite a real value.
                const lo = live.toLowerCase();
                const po = rec.proposed.trim().toLowerCase();
                const isRepair = po.startsWith(lo) && po.length > lo.length;
                const isDecon = lo.startsWith(po) && lo.length > po.length;
                if (!(isRepair || isDecon)) {
                    skippedStale++;
                    if (staleSamples.length < 30) staleSamples.push(`${rec.websiteSku}.${rec.field} not provably damaged`);
                    continue;
                }
            }

            let value: unknown = rec.proposed.trim();
            if (NUMERIC_FIELDS.has(rec.field)) {
                const n = Number(String(value).replace(/[^0-9.\-]/g, ""));
                if (!Number.isFinite(n)) { skippedStale++; continue; }
                value = n;
            }

            counts[rec.field] = (counts[rec.field] ?? 0) + 1;
            written++;

            if (!args.dryRun) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await ctx.db.patch(doc._id, { [rec.field]: value, importSource: IMPORT_SOURCE } as any);
            }
        }

        return {
            matched, unmatched, written, rejectedClass, rejectedField,
            skippedStale, skippedNotEmpty, counts,
            unmatchedSample: unmatchedSkus, staleSample: staleSamples,
        };
    },
});

type ApplyBatchResult = {
    matched: number; unmatched: number; written: number;
    rejectedClass: number; rejectedField: number;
    skippedStale: number; skippedNotEmpty: number;
    counts: Record<string, number>;
    unmatchedSample: string[]; staleSample: string[];
};

export const applyBatch = action({
    args: { records: v.array(v.any()), batchIndex: v.number(), dryRun: v.boolean() },
    handler: async (ctx, args): Promise<ApplyBatchResult & { batchIndex: number }> => {
        const r: ApplyBatchResult = await ctx.runMutation(
            internal.applyCatalogCorrections.applyBatchMutation,
            { records: args.records, dryRun: args.dryRun },
        );
        return { batchIndex: args.batchIndex, ...r };
    },
});
