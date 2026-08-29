/**
 * Ingest every legacy Best Bottles dataset in this repository through the
 * pipeline and write a staged catalog plus operational reports.
 *
 *   node --experimental-strip-types catalog/src/cli/ingest.ts
 *
 * Nothing here touches Supabase, Sanity or Shopify. It produces the staging
 * artefacts a human reviews before promotion, under catalog/out/.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { summariseBatch } from '../ingest/batch.ts';
import { allLegacyAdapters } from '../ingest/sources/legacy.ts';
import { runPipeline, toBundle, type StagedItem } from '../ingest/pipeline.ts';
import { inferNeckFinishEdges } from '../domain/compatibility.ts';
import { summariseHealth, scoreCompleteness } from '../domain/completeness.ts';
import type { BottleSpec, CatalogItem, ClosureSpec } from '../domain/types.ts';

const repoRoot = resolve(import.meta.dirname, '../../..');
const outDir = resolve(repoRoot, 'catalog/out');

const main = async (): Promise<void> => {
  mkdirSync(outDir, { recursive: true });

  const result = await runPipeline(allLegacyAdapters(repoRoot), { actor: 'catalog/src/cli/ingest.ts' });

  const containers = result.items
    .filter((s): s is StagedItem & { bottle: BottleSpec } => Boolean(s.bottle))
    .map((s) => ({ item: s.item as CatalogItem, spec: s.bottle }));
  const closures = result.items
    .filter((s): s is StagedItem & { closure: ClosureSpec } => Boolean(s.closure))
    .map((s) => ({ item: s.item as CatalogItem, spec: s.closure }));

  const edges = inferNeckFinishEdges({ containers, closures });
  const edgesByItem = new Map<string, typeof edges>();
  for (const edge of edges) {
    for (const id of [edge.sourceCatalogId, edge.targetCatalogId]) {
      const list = edgesByItem.get(id) ?? [];
      list.push(edge);
      edgesByItem.set(id, list);
    }
  }

  const bundles = result.items.map((s) => toBundle(s, edgesByItem.get(s.item.catalogId) ?? []));
  const health = summariseHealth(bundles);
  const completeness = bundles.map((bundle) => scoreCompleteness(bundle));

  write('batches.json', result.batches);
  write('items.json', result.items.map(({ resolved, ...rest }) => ({ ...rest, resolvedFields: [...resolved.keys()] })));
  write('conflicts.json', result.conflicts);
  write('compatibility-edges.json', edges);
  write('review-queue.json', result.review);
  write('rejected.json', result.rejected);
  write('unmapped-values.json', result.unmapped);
  write('completeness.json', completeness);
  write('catalog-health.json', health);

  console.log('=== Import batches ===');
  for (const batch of result.batches) console.log(summariseBatch(batch));

  console.log('\n=== Catalog health ===');
  console.log(`  total items            ${health.totalItems}`);
  console.log(`  production ready       ${health.productionReady}`);
  console.log(`  incomplete             ${health.incomplete}`);
  console.log(`  average completeness   ${(health.averageScore * 100).toFixed(1)}%`);
  console.log(`  by kind                ${JSON.stringify(health.byKind)}`);

  console.log('\n=== Top catalog gaps ===');
  for (const gap of health.missingByField.slice(0, 12)) {
    console.log(`  ${String(gap.count).padStart(5)}  ${gap.label} (${gap.field})`);
  }

  console.log('\n=== Data quality ===');
  console.log(`  open conflicts         ${result.conflicts.filter((c) => c.status === 'open').length}`);
  console.log(`  needs manual review    ${result.review.length}`);
  console.log(`  rejected rows          ${result.rejected.length}`);
  console.log(`  inferred compatibility ${edges.length} edges (all "likely", none verified)`);

  if (result.unmapped.length) {
    console.log('\n=== Values the normalisers refused to guess (top 10) ===');
    for (const entry of result.unmapped.slice(0, 10)) {
      console.log(`  ${String(entry.count).padStart(5)}  [${entry.sourceId}] ${entry.raw}`);
    }
  }

  console.log(`\nStaging artefacts written to ${outDir}`);
};

function write(name: string, value: unknown): void {
  writeFileSync(resolve(outDir, name), `${JSON.stringify(value, replacer, 2)}\n`, 'utf8');
}

function replacer(_key: string, value: unknown): unknown {
  return value instanceof Map ? Object.fromEntries(value) : value;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
