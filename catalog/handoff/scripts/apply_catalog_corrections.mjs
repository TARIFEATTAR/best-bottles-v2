#!/usr/bin/env node
/**
 * Apply spec corrections (fill / repair / decontaminate) to products.
 *
 * Dry run by default:
 *   node scripts/apply_catalog_corrections.mjs --payload <dir>
 * Write:
 *   node scripts/apply_catalog_corrections.mjs --payload <dir> --apply --i-know-this-is-production
 *
 * `conflict` rows are never loaded here and are rejected by the mutation even
 * if they were. They need a human decision — see the handoff README.
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

const records = [
    ...loadPayload(path.join(dir, "corrections-fill.json")),
    ...loadPayload(path.join(dir, "corrections-repair.json")),
    ...loadPayload(path.join(dir, "corrections-decontaminate.json")),
];

banner({ url: URL, dryRun, count: records.length, what: "corrections (fill + repair + decontaminate)" });

const client = new ConvexHttpClient(URL);
const BATCH = 50;
const totals = {
    matched: 0, unmatched: 0, written: 0, rejectedClass: 0,
    rejectedField: 0, skippedStale: 0, skippedNotEmpty: 0,
};
const fieldTotals = {};
const staleSamples = [];
const unmatchedSamples = [];

for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const batchIndex = Math.floor(i / BATCH);
    const r = await client.action(api.applyCatalogCorrections.applyBatch, {
        records: batch, batchIndex, dryRun,
    });
    for (const k of Object.keys(totals)) totals[k] += r[k] ?? 0;
    for (const [k, v] of Object.entries(r.counts ?? {})) fieldTotals[k] = (fieldTotals[k] ?? 0) + v;
    for (const s of r.staleSample ?? []) if (staleSamples.length < 30) staleSamples.push(s);
    for (const s of r.unmatchedSample ?? []) if (unmatchedSamples.length < 30) unmatchedSamples.push(s);
    process.stdout.write(
        `batch ${String(batchIndex).padStart(3)} [${i + batch.length}/${records.length}] matched=${r.matched} write=${r.written} stale=${r.skippedStale + r.skippedNotEmpty}\n`,
    );
}

console.log(`\n─── Summary (${dryRun ? "DRY RUN" : "APPLIED"}) ───`);
console.log(`Matched:            ${totals.matched}`);
console.log(`Unmatched SKUs:     ${totals.unmatched}`);
console.log(`${dryRun ? "Would write" : "Wrote"}:        ${totals.written} fields`);
console.log(`Skipped (not empty):${String(totals.skippedNotEmpty).padStart(6)}  — a fill whose field already has a value`);
console.log(`Skipped (stale):    ${String(totals.skippedStale).padStart(6)}  — stored value changed since the payload was built`);
if (totals.rejectedClass) console.log(`Rejected (class):   ${totals.rejectedClass}  — conflicts are never auto-applied`);
if (totals.rejectedField) console.log(`Rejected (field):   ${totals.rejectedField}  — field not on the allow-list`);
console.log("\nBy field:");
for (const [k, v] of Object.entries(fieldTotals).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(18)} +${v}`);
}
if (staleSamples.length) {
    console.log("\nSample skipped (re-generate the payload if these are many):");
    for (const s of staleSamples.slice(0, 10)) console.log(`  - ${s}`);
}
if (unmatchedSamples.length) {
    console.log("\nSample unmatched SKUs:");
    for (const s of unmatchedSamples.slice(0, 10)) console.log(`  - ${s}`);
}
if (dryRun) console.log("\nNothing was written. Re-run with --apply --i-know-this-is-production to write.");
