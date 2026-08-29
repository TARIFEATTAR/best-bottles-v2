/**
 * Reconcile the legacy live site against the storefront (Convex) catalog.
 *
 *   node --experimental-strip-types catalog/src/cli/reconcile-storefront.ts \
 *     --scrape <bestbottles_raw_website_data.json> \
 *     --convex <Nemat_Product_Catalog.csv> \
 *     [--out catalog/out/storefront-reconciliation]
 *
 * Answers the two questions that block a 100/100 Grace accuracy audit:
 *
 *   1. COVERAGE  — is there any SKU the live site sells that the storefront
 *                  catalog cannot resolve? Every one of those is a guaranteed
 *                  false "we don't carry that", which the 2026-08-06 audit
 *                  identified as the top defect class.
 *   2. FIDELITY  — where the same SKU exists in both, do the facts Grace
 *                  quotes (capacity, neck thread, height, diameter, price)
 *                  actually agree?
 *
 * The join key is `websiteSku`, which both sides carry natively.
 *
 * This reads files only. It does not need network access, a Convex credential,
 * or a live scrape — which matters because the scrape it consumes was taken
 * from a host this environment cannot reach.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseLength, parseVolumeMl } from '../domain/units.ts';
import { parseNeckFinish, neckFinishesMate } from '../domain/vocab.ts';
import { normaliseSku } from '../ingest/matching.ts';

interface ScrapeRow {
  websiteSku?: string; productUrl?: string; itemName?: string; itemDescription?: string;
  capacity?: string; heightWithCap?: string; heightWithoutCap?: string; diameter?: string;
  neckThreadSize?: string; price1pc?: number | string; imageUrl?: string;
}

type CsvRow = Record<string, string>;

/** Fields Grace states as fact, and how to read them from each side. */
const COMPARED_FIELDS = [
  { field: 'capacityMl', scrape: (r: ScrapeRow) => parseVolumeMl(r.capacity), convex: (r: CsvRow) => parseVolumeMl(r.capacityMl || r.capacity), kind: 'number' as const },
  { field: 'heightWithCap', scrape: (r: ScrapeRow) => mm(r.heightWithCap), convex: (r: CsvRow) => mm(r.heightWithCap), kind: 'number' as const },
  { field: 'heightWithoutCap', scrape: (r: ScrapeRow) => mm(r.heightWithoutCap), convex: (r: CsvRow) => mm(r.heightWithoutCap), kind: 'number' as const },
  { field: 'diameter', scrape: (r: ScrapeRow) => mm(r.diameter), convex: (r: CsvRow) => mm(r.diameter), kind: 'number' as const },
  { field: 'neckThreadSize', scrape: (r: ScrapeRow) => r.neckThreadSize, convex: (r: CsvRow) => r.neckThreadSize, kind: 'neck' as const },
  { field: 'price1pc', scrape: (r: ScrapeRow) => num(r.price1pc), convex: (r: CsvRow) => num(r.webPrice1pc), kind: 'money' as const },
];

/** Dimensions are bare numbers on both sides; the column name supplies mm. */
function mm(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || String(raw).trim() === '') return undefined;
  const withUnit = parseLength(String(raw).trim().match(/(mm|cm|in)$/i) ? String(raw) : `${String(raw).trim()}mm`);
  return withUnit?.value;
}

function num(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || String(raw).trim() === '') return undefined;
  const n = Number(String(raw).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

/** RFC4180-ish CSV reader: handles quoted fields containing commas and newlines. */
function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((v) => v !== ''));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const scrapePath = arg('scrape');
const convexPath = arg('convex');
const specsPath = arg('specs');
const outDir = resolve(arg('out') ?? 'catalog/out/storefront-reconciliation');

if (!scrapePath || !convexPath) {
  console.error('Usage: reconcile-storefront.ts --scrape <live.json> --convex <catalog.csv> [--out <dir>]');
  process.exit(2);
}

const scrape = JSON.parse(readFileSync(scrapePath, 'utf8')) as ScrapeRow[];
const convex = parseCsv(readFileSync(convexPath, 'utf8'));

const scrapeBySku = new Map<string, ScrapeRow>();
const scrapeDupes: string[] = [];
for (const r of scrape) {
  if (!r.websiteSku?.trim()) continue;
  const k = normaliseSku(r.websiteSku);
  if (scrapeBySku.has(k)) scrapeDupes.push(k);
  else scrapeBySku.set(k, r);
}

const convexBySku = new Map<string, CsvRow>();
const convexDupes: string[] = [];
const convexMissingGraceSku: string[] = [];
for (const r of convex) {
  if (!r.websiteSku?.trim()) continue;
  const k = normaliseSku(r.websiteSku);
  if (convexBySku.has(k)) convexDupes.push(k);
  else convexBySku.set(k, r);
  if (!r.graceSku?.trim()) convexMissingGraceSku.push(k);
}

const liveOnly = [...scrapeBySku.keys()].filter((k) => !convexBySku.has(k));
const convexOnly = [...convexBySku.keys()].filter((k) => !scrapeBySku.has(k));
const both = [...scrapeBySku.keys()].filter((k) => convexBySku.has(k));

interface Mismatch { websiteSku: string; graceSku?: string; field: string; live: unknown; convex: unknown; note?: string }
const mismatches: Mismatch[] = [];
const missingOnConvex: Mismatch[] = [];

for (const sku of both) {
  const s = scrapeBySku.get(sku)!;
  const c = convexBySku.get(sku)!;
  for (const spec of COMPARED_FIELDS) {
    const live = spec.scrape(s);
    const cvx = spec.convex(c);
    if (live === undefined && cvx === undefined) continue;
    if (cvx === undefined) {
      // The live site publishes a fact the storefront does not hold.
      missingOnConvex.push({ websiteSku: sku, graceSku: c.graceSku, field: spec.field, live, convex: cvx });
      continue;
    }
    if (live === undefined) continue;

    let agrees: boolean;
    if (spec.kind === 'neck') {
      agrees = neckFinishesMate(parseNeckFinish(String(live)), parseNeckFinish(String(cvx)))
        || String(live).trim().toLowerCase() === String(cvx).trim().toLowerCase();
    } else if (spec.kind === 'money') {
      agrees = Math.abs(Number(live) - Number(cvx)) < 0.005;
    } else {
      // Published dimensions carry a real tolerance; treat <1 mm as agreement.
      agrees = Math.abs(Number(live) - Number(cvx)) < 1;
    }
    if (!agrees) mismatches.push({ websiteSku: sku, graceSku: c.graceSku, field: spec.field, live, convex: cvx });
  }
}

const byField = (rows: Mismatch[]) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.field, (m.get(r.field) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

mkdirSync(outDir, { recursive: true });
const write = (name: string, v: unknown) => writeFileSync(resolve(outDir, name), `${JSON.stringify(v, null, 2)}\n`);

write('coverage-live-only.json', liveOnly.map((k) => ({ websiteSku: k, productUrl: scrapeBySku.get(k)!.productUrl, itemName: scrapeBySku.get(k)!.itemName })));
write('coverage-convex-only.json', convexOnly.map((k) => ({ websiteSku: k, graceSku: convexBySku.get(k)!.graceSku, stockStatus: convexBySku.get(k)!.stockStatus })));
write('fidelity-mismatches.json', mismatches);
write('fidelity-missing-on-convex.json', missingOnConvex);
write('summary.json', {
  generatedAt: new Date().toISOString(),
  sources: { scrape: scrapePath, convex: convexPath },
  counts: {
    liveRows: scrape.length, liveDistinctSku: scrapeBySku.size, liveDuplicateSku: scrapeDupes.length,
    convexRows: convex.length, convexDistinctSku: convexBySku.size, convexDuplicateSku: convexDupes.length,
    convexMissingGraceSku: convexMissingGraceSku.length,
    inBoth: both.length, liveOnly: liveOnly.length, convexOnly: convexOnly.length,
    fieldMismatches: mismatches.length, factsLiveHasConvexLacks: missingOnConvex.length,
  },
  mismatchesByField: Object.fromEntries(byField(mismatches)),
  missingByField: Object.fromEntries(byField(missingOnConvex)),
});

const pct = (n: number, d: number) => (d === 0 ? '0.0' : ((n / d) * 100).toFixed(1));

console.log('=== SKU COVERAGE (the false-negative risk) ===');
console.log(`  live site distinct SKUs      ${scrapeBySku.size}`);
console.log(`  storefront distinct SKUs     ${convexBySku.size}`);
console.log(`  resolvable in both           ${both.length}  (${pct(both.length, scrapeBySku.size)}% of live)`);
console.log(`  LIVE ONLY - unanswerable     ${liveOnly.length}   <-- guaranteed "we don't carry that"`);
console.log(`  storefront only (orphans)    ${convexOnly.length}`);
if (convexMissingGraceSku.length) console.log(`  storefront rows w/o graceSku ${convexMissingGraceSku.length}`);
if (scrapeDupes.length || convexDupes.length) console.log(`  duplicate SKUs  live=${scrapeDupes.length} storefront=${convexDupes.length}`);

console.log('\n=== FACT FIDELITY on the SKUs that do resolve ===');
console.log(`  disagreements                ${mismatches.length}`);
for (const [f, n] of byField(mismatches)) console.log(`    ${String(n).padStart(5)}  ${f}`);
console.log(`  live states, storefront null ${missingOnConvex.length}`);
for (const [f, n] of byField(missingOnConvex)) console.log(`    ${String(n).padStart(5)}  ${f}`);

/* ------------------------------------------------------------------------ *
 * Spec backfill candidates.
 *
 * The storefront export can be missing a physical spec that another source
 * already holds. This assembles, per SKU per field, the best available value
 * and names where it came from, so a backfill run is reviewable rather than a
 * black box. Sources are ranked exactly as catalog_source ranks them:
 * the live PDP (65) outranks the internal spec library (50).
 * ------------------------------------------------------------------------ */

const SPEC_FIELDS = ['heightWithCap', 'heightWithoutCap', 'diameter', 'bottleWeightG', 'caseQuantity', 'neckThreadSize'] as const;

interface SpecRow { websiteSku?: string; [k: string]: unknown }

function fillRate(rows: Array<Record<string, unknown>>, field: string): number {
  const filled = rows.filter((r) => String(r[field] ?? '').trim() !== '').length;
  return rows.length === 0 ? 0 : filled / rows.length;
}

if (specsPath) {
  const specs = JSON.parse(readFileSync(specsPath, 'utf8')) as SpecRow[];
  const specBySku = new Map<string, SpecRow>();
  for (const r of specs) {
    if (r.websiteSku && String(r.websiteSku).trim()) specBySku.set(normaliseSku(String(r.websiteSku)), r);
  }

  const convexRows = [...convexBySku.values()] as unknown as Array<Record<string, unknown>>;
  const scrapeRows = [...scrapeBySku.values()] as unknown as Array<Record<string, unknown>>;
  const specRows = [...specBySku.values()] as unknown as Array<Record<string, unknown>>;

  console.log('\n=== SPEC AVAILABILITY: where the truth actually lives ===');
  console.log('  field               storefront    live PDP    spec library');
  for (const f of SPEC_FIELDS) {
    const a = (fillRate(convexRows, f) * 100).toFixed(1).padStart(6);
    const b = (fillRate(scrapeRows, f) * 100).toFixed(1).padStart(6);
    const c = (fillRate(specRows, f) * 100).toFixed(1).padStart(6);
    console.log(`  ${f.padEnd(20)} ${a}%     ${b}%       ${c}%`);
  }

  // Per SKU, per field: what the storefront lacks and someone else has.
  const candidates: Array<{ websiteSku: string; graceSku?: string; field: string; value: unknown; source: string; sourceRank: number }> = [];
  for (const [sku, c] of convexBySku) {
    for (const f of SPEC_FIELDS) {
      if (String((c as Record<string, unknown>)[f] ?? '').trim() !== '') continue;
      const live = scrapeBySku.get(sku) as Record<string, unknown> | undefined;
      const lib = specBySku.get(sku) as Record<string, unknown> | undefined;
      const liveVal = String(live?.[f] ?? '').trim();
      const libVal = String(lib?.[f] ?? '').trim();
      // Live PDP outranks the internal library, matching catalog_source ranks.
      if (liveVal) candidates.push({ websiteSku: sku, graceSku: c.graceSku, field: f, value: liveVal, source: 'bb-live-pdp', sourceRank: 65 });
      else if (libVal) candidates.push({ websiteSku: sku, graceSku: c.graceSku, field: f, value: libVal, source: 'internal-spec-library', sourceRank: 50 });
    }
  }

  write('spec-backfill-candidates.json', candidates);

  const bySkuCount = new Set(candidates.map((c) => c.websiteSku)).size;
  const perField = new Map<string, number>();
  const perSource = new Map<string, number>();
  for (const c of candidates) {
    perField.set(c.field, (perField.get(c.field) ?? 0) + 1);
    perSource.set(c.source, (perSource.get(c.source) ?? 0) + 1);
  }
  console.log(`\n=== BACKFILL CANDIDATES: ${candidates.length} values across ${bySkuCount} SKUs ===`);
  for (const [f, n] of [...perField.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${f}`);
  console.log('  by source: ' + [...perSource.entries()].map(([s, n]) => `${s}=${n}`).join('  '));

  const stillMissing = SPEC_FIELDS.map((f) => {
    const have = new Set(candidates.filter((c) => c.field === f).map((c) => c.websiteSku));
    const lacking = [...convexBySku.keys()].filter((k) => String((convexBySku.get(k) as Record<string, unknown>)[f] ?? '').trim() === '' && !have.has(k));
    return { field: f, count: lacking.length };
  }).filter((x) => x.count > 0);
  write('spec-still-unknown.json', stillMissing);
  if (stillMissing.length) {
    console.log('\n  still unknown after backfill (needs measurement):');
    for (const x of stillMissing) console.log(`  ${String(x.count).padStart(5)}  ${x.field}`);
  }
}

console.log(`\nReports written to ${outDir}`);
