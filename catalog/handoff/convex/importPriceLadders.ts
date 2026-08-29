import { internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Import published volume price ladders from the live PDP into
 * `products.priceTiers`.
 *
 * Payload: catalog/out/convex-corrections/price-tiers.json from
 * `npm run catalog:corrections` in the best-bottles-v2 repo.
 *
 * WHY: the schema already defines `priceTiers` and already notes that
 * webPrice10pc understates the ladder — "only 53 SKUs have a real 10-unit
 * break while 2,252 break at 12". The live site publishes the whole ladder:
 * 2,291 SKUs across 106 distinct quantity breakpoints, 2,243 of them with a
 * 144-unit break. Without this, any quote beyond 12 units is extrapolation,
 * which the Grace instructions explicitly forbid.
 *
 * Shape matches the schema validator exactly: { minQty, totalPrice, unitPrice }.
 * A step whose published line total is absent is skipped rather than having a
 * total computed for it — a derived total that rounds differently from the
 * site would be a new inconsistency, not a fix.
 *
 * Run via driver: node scripts/import_price_ladders.mjs [--apply]
 * Dry run is the default.
 */

type LadderStep = { minQuantity: number; unitPrice: number; totalPrice?: number };
type LadderRecord = {
    websiteSku: string;
    graceSku?: string;
    minimumPurchaseUsd?: number;
    priceTiers: LadderStep[];
};

const IMPORT_SOURCE = "live_pdp_price_ladders_20260829";

export const applyBatchMutation = internalMutation({
    args: { records: v.array(v.any()), dryRun: v.boolean() },
    handler: async (ctx, args) => {
        const records = args.records as LadderRecord[];
        let matched = 0;
        let unmatched = 0;
        let written = 0;
        let skippedNoLadder = 0;
        let skippedUnchanged = 0;
        let stepsWritten = 0;
        let stepsDroppedNoTotal = 0;
        const unmatchedSkus: string[] = [];

        for (const rec of records) {
            if (!rec.websiteSku || !Array.isArray(rec.priceTiers) || rec.priceTiers.length < 2) {
                skippedNoLadder++;
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

            const tiers = rec.priceTiers
                .filter((t) => {
                    const ok = Number.isFinite(t.minQuantity) && t.minQuantity >= 1
                        && Number.isFinite(t.unitPrice) && t.unitPrice >= 0;
                    if (!ok) return false;
                    if (!Number.isFinite(t.totalPrice as number)) { stepsDroppedNoTotal++; return false; }
                    return true;
                })
                .sort((a, b) => a.minQuantity - b.minQuantity)
                .map((t) => ({
                    minQty: t.minQuantity,
                    unitPrice: t.unitPrice,
                    totalPrice: t.totalPrice as number,
                }));

            if (tiers.length < 2) { skippedNoLadder++; continue; }

            // Idempotent: an identical ladder is not rewritten, so re-running
            // costs nothing and does not churn priceTiersSyncedAt.
            const existing = (doc as unknown as { priceTiers?: Array<{ minQty: number; unitPrice: number; totalPrice: number }> }).priceTiers;
            if (existing && existing.length === tiers.length
                && existing.every((e, i) => e.minQty === tiers[i].minQty
                    && e.unitPrice === tiers[i].unitPrice
                    && e.totalPrice === tiers[i].totalPrice)) {
                skippedUnchanged++;
                continue;
            }

            written++;
            stepsWritten += tiers.length;

            if (!args.dryRun) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await ctx.db.patch(doc._id, {
                    priceTiers: tiers,
                    priceTiersSyncedAt: Date.now(),
                    importSource: IMPORT_SOURCE,
                } as any);
            }
        }

        return {
            matched, unmatched, written, skippedNoLadder, skippedUnchanged,
            stepsWritten, stepsDroppedNoTotal, unmatchedSample: unmatchedSkus,
        };
    },
});

type ApplyBatchResult = {
    matched: number; unmatched: number; written: number;
    skippedNoLadder: number; skippedUnchanged: number;
    stepsWritten: number; stepsDroppedNoTotal: number;
    unmatchedSample: string[];
};

export const applyBatch = action({
    args: { records: v.array(v.any()), batchIndex: v.number(), dryRun: v.boolean() },
    handler: async (ctx, args): Promise<ApplyBatchResult & { batchIndex: number }> => {
        const r: ApplyBatchResult = await ctx.runMutation(
            internal.importPriceLadders.applyBatchMutation,
            { records: args.records, dryRun: args.dryRun },
        );
        return { batchIndex: args.batchIndex, ...r };
    },
});
