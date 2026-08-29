#!/usr/bin/env node
/**
 * Import published volume price ladders into products.priceTiers.
 *
 * Dry run by default:
 *   node scripts/import_price_ladders.mjs --payload <dir>
 * Write:
 *   node scripts/import_price_ladders.mjs --payload <dir> --apply --i-know-this-is-production
 */
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { loadEnvLocal, convexUrl, runMode, loadPayload, banner } from "./_shared.mjs";

loadEnvLocal();
const URL = convexUrl();
const { dryRun } = runMode(URL);

const argIdx = process.argv.indexOf("--payload");
const dir = argIdx >= 0 ? process.argv[argIdx + 1] : "catalog/out/convex-corrections";
const records = loadPayload(path.join(dir, "price-tiers.json"));

banner({ url: URL, dryRun, count: records.length, what: "SKUs with a published ladder" });

const client = new ConvexHttpClient(URL);
const BATCH = 50;
const totals = {
    matched: 0, unmatched: 0, written: 0, skippedNoLadder: 0,
    skippedUnchanged: 0, stepsWritten: 0, stepsDroppedNoTotal: 0,
};
const unmatchedSamples = [];

for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const batchIndex = Math.floor(i / BATCH);
    const r = await client.action(api.importPriceLadders.applyBatch, {
        records: batch, batchIndex, dryRun,
    });
    for (const k of Object.keys(totals)) totals[k] += r[k] ?? 0;
    for (const s of r.unmatchedSample ?? []) if (unmatchedSamples.length < 30) unmatchedSamples.push(s);
    process.stdout.write(
        `batch ${String(batchIndex).padStart(3)} [${i + batch.length}/${records.length}] matched=${r.matched} write=${r.written} unchanged=${r.skippedUnchanged}\n`,
    );
}

console.log(`\n─── Summary (${dryRun ? "DRY RUN" : "APPLIED"}) ───`);
console.log(`Matched:             ${totals.matched}`);
console.log(`Unmatched SKUs:      ${totals.unmatched}`);
console.log(`${dryRun ? "Would update" : "Updated"}:       ${totals.written} products`);
console.log(`${dryRun ? "Would write" : "Wrote"}:         ${totals.stepsWritten} ladder steps`);
console.log(`Unchanged:           ${totals.skippedUnchanged}  — identical ladder already stored (idempotent)`);
console.log(`No usable ladder:    ${totals.skippedNoLadder}`);
if (totals.stepsDroppedNoTotal) {
    console.log(`Steps without a published line total: ${totals.stepsDroppedNoTotal} (skipped, never computed)`);
}
if (unmatchedSamples.length) {
    console.log("\nSample unmatched SKUs:");
    for (const s of unmatchedSamples.slice(0, 10)) console.log(`  - ${s}`);
}
if (dryRun) console.log("\nNothing was written. Re-run with --apply --i-know-this-is-production to write.");
