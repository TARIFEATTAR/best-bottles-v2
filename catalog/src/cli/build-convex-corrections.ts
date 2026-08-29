/**
 * Build a reviewable correction payload for the Convex storefront catalog.
 *
 *   node --experimental-strip-types catalog/src/cli/build-convex-corrections.ts \
 *     --scrape <live-site-full-scrape.json> \
 *     --convex <Nemat_Product_Catalog.csv> \
 *     --specs  <grace_products_clean.json> \
 *     [--out catalog/out/convex-corrections]
 *
 * WHY THIS IS A DATA CORRECTION, NOT AN EXPORTER FIX
 *
 * The working hypothesis was that the CSV exporter truncated multi-field cells
 * ("Ground" where the live site says "Ground glass neck with glass stopper").
 * That was wrong. The same truncated values appear identically in
 * `convex_products_export_20260228.csv` and in the much later
 * `Nemat_Product_Catalog.csv` — two independent export runs, six months apart,
 * producing byte-identical damage. The exports are faithful; **Convex holds the
 * truncated values**, almost certainly from a lossy import.
 *
 * So the fix is upstream of the export: correct the rows in Convex. This tool
 * emits the payload to do that, with every proposed change carrying the source
 * it came from and that source's rank, so a reviewer can see why.
 *
 * Four change classes, deliberately separated because they carry different
 * risk:
 *
 *   fill           a NULL gains a value        — additive, lowest risk
 *   repair         truncation is completed     — stored is a prefix of the
 *                                                published value: provable damage
 *   decontaminate  a foreign field label is stripped back off
 *   conflict       two sources genuinely disagree — NEVER auto-applied
 *
 * Classification lives in `ingest/corrections.ts` and is unit-tested there.
 *
 * Nothing here writes to Convex. It produces a file for review.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { priceLadder, sku as scrapeSkuOf, type LivePdpRow } from '../ingest/sources/livePdp.ts';
import { normaliseSku } from '../ingest/matching.ts';
import { classify, reasonFor, type ChangeType, type Correction } from '../ingest/corrections.ts';

type CsvRow = Record<string, string>;

/** Fields worth correcting, with the sources allowed to supply them, best first. */
const CORRECTABLE = [
  { field: 'heightWithCap', fromLive: true, fromSpecs: true },
  { field: 'heightWithoutCap', fromLive: true, fromSpecs: true },
  { field: 'diameter', fromLive: true, fromSpecs: true },
  { field: 'bottleWeightG', fromLive: false, fromSpecs: true },
  { field: 'caseQuantity', fromLive: false, fromSpecs: true },
  { field: 'neckThreadSize', fromLive: true, fromSpecs: true },
] as const;

const LIVE_RANK = 65;
const SPEC_RANK = 50;

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; }
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((v) => v !== ''));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };

const scrapePath = arg('scrape');
const convexPath = arg('convex');
const specsPath = arg('specs');
const outDir = resolve(arg('out') ?? 'catalog/out/convex-corrections');

if (!scrapePath || !convexPath) {
  console.error('Usage: build-convex-corrections.ts --scrape <live.json> --convex <catalog.csv> [--specs <specs.json>]');
  process.exit(2);
}

const live = JSON.parse(readFileSync(scrapePath, 'utf8')) as LivePdpRow[];
const convex = parseCsv(readFileSync(convexPath, 'utf8'));
const specs = specsPath ? (JSON.parse(readFileSync(specsPath, 'utf8')) as Array<Record<string, unknown>>) : [];

const liveBySku = new Map<string, LivePdpRow>();
for (const r of live) { const k = scrapeSkuOf(r); if (k?.trim() && !liveBySku.has(normaliseSku(k))) liveBySku.set(normaliseSku(k), r); }

const specBySku = new Map<string, Record<string, unknown>>();
for (const r of specs) { const k = String(r.websiteSku ?? ''); if (k.trim() && !specBySku.has(normaliseSku(k))) specBySku.set(normaliseSku(k), r); }

const corrections: Correction[] = [];
const ladderUpdates: Array<{ websiteSku: string; graceSku?: string; minimumPurchaseUsd?: number; priceTiers: Array<{ minQuantity: number; unitPrice: number }> }> = [];

for (const row of convex) {
  const key = row.websiteSku?.trim();
  if (!key) continue;
  const k = normaliseSku(key);
  const liveRow = liveBySku.get(k);
  const specRow = specBySku.get(k);

  for (const spec of CORRECTABLE) {
    const current = (row[spec.field] ?? '').trim();
    const candidates: Array<{ value: string; source: string; rank: number }> = [];
    if (spec.fromLive && liveRow) {
      const v = String((liveRow as unknown as Record<string, unknown>)[spec.field] ?? '').trim();
      if (v) candidates.push({ value: v, source: 'bb-live-pdp', rank: LIVE_RANK });
    }
    if (spec.fromSpecs && specRow) {
      const v = String(specRow[spec.field] ?? '').trim();
      if (v) candidates.push({ value: v, source: 'internal-spec-library', rank: SPEC_RANK });
    }
    if (candidates.length === 0) continue;

    candidates.sort((a, b) => b.rank - a.rank);
    const best = candidates[0];
    const changeType = classify(current, best.value);
    if (changeType === 'fill' && current !== '') continue; // already correct

    corrections.push({
      websiteSku: k,
      graceSku: row.graceSku || undefined,
      field: spec.field,
      current: current === '' ? null : current,
      proposed: best.value,
      changeType,
      source: best.source,
      sourceRank: best.rank,
      reason: reasonFor(changeType),
    });
  }

  if (liveRow) {
    const ladder = priceLadder(liveRow);
    if (ladder.length > 1) {
      ladderUpdates.push({
        websiteSku: k,
        graceSku: row.graceSku || undefined,
        minimumPurchaseUsd: (() => {
          const m = /([0-9]+(?:\.[0-9]+)?)/.exec(String(liveRow.minimumPurchase ?? '').replace(/,/g, ''));
          return m ? Number(m[1]) : undefined;
        })(),
        priceTiers: ladder,
      });
    }
  }
}

const byType = (t: ChangeType) => corrections.filter((c) => c.changeType === t);
const tally = (rows: Correction[]) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.field, (m.get(r.field) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

mkdirSync(outDir, { recursive: true });
const write = (n: string, v: unknown) => writeFileSync(resolve(outDir, n), `${JSON.stringify(v, null, 2)}\n`);

write('corrections-fill.json', byType('fill'));
write('corrections-repair.json', byType('repair'));
write('corrections-decontaminate.json', byType('decontaminate'));
write('corrections-conflict.json', byType('conflict'));
write('price-tiers.json', ladderUpdates);
write('summary.json', {
  generatedAt: new Date().toISOString(),
  sources: { live: scrapePath, convex: convexPath, specs: specsPath ?? null },
  note: 'Truncation is present identically in two exports six months apart, so it originates in Convex, not the exporter. These are data corrections.',
  counts: {
    fill: byType('fill').length,
    repair: byType('repair').length,
    decontaminate: byType('decontaminate').length,
    conflict: byType('conflict').length,
    skusWithPriceLadder: ladderUpdates.length,
    priceBreakRows: ladderUpdates.reduce((n, l) => n + l.priceTiers.length, 0),
  },
  byField: {
    fill: Object.fromEntries(tally(byType('fill'))),
    repair: Object.fromEntries(tally(byType('repair'))),
    decontaminate: Object.fromEntries(tally(byType('decontaminate'))),
    conflict: Object.fromEntries(tally(byType('conflict'))),
  },
});

console.log('=== CONVEX CORRECTION PAYLOAD ===');
console.log(`  fill      ${String(byType('fill').length).padStart(6)}   NULL -> value (safe to auto-apply)`);
for (const [f, n] of tally(byType('fill'))) console.log(`      ${String(n).padStart(5)}  ${f}`);
console.log(`  repair    ${String(byType('repair').length).padStart(6)}   truncated -> complete (provably damage)`);
for (const [f, n] of tally(byType('repair'))) console.log(`      ${String(n).padStart(5)}  ${f}`);
console.log(`  reclaim   ${String(byType('decontaminate').length).padStart(6)}   value + foreign label -> value (cell contamination)`);
for (const [f, n] of tally(byType('decontaminate'))) console.log(`      ${String(n).padStart(5)}  ${f}`);
console.log(`  conflict  ${String(byType('conflict').length).padStart(6)}   genuine disagreement (DO NOT auto-apply)`);
for (const [f, n] of tally(byType('conflict'))) console.log(`      ${String(n).padStart(5)}  ${f}`);
console.log(`\n  price ladders  ${ladderUpdates.length} SKUs, ${ladderUpdates.reduce((n, l) => n + l.priceTiers.length, 0)} break rows`);
console.log(`\nWritten to ${outDir}`);
