/**
 * Import batches and immutable raw records.
 *
 * Every ingestion run produces exactly one ImportBatch and one RawRecord per
 * source row. RawRecords keep the original payload verbatim and are never
 * updated - if a parser improves, we reprocess the raw records rather than
 * re-reading a file that may have moved or changed.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { SourceKind } from '../domain/vocab.ts';

export interface SourceDescriptor {
  /** Stable machine name, e.g. 'legacy-inventory-json'. Part of the identity anchor. */
  id: string;
  label: string;
  kind: SourceKind;
  /** File path, URL or connection description. */
  locator: string;
  /** Bumped when the parser for this source changes, so reprocessing is detectable. */
  parserVersion: string;
}

export interface RawRecord {
  rawId: string;
  batchId: string;
  sourceId: string;
  /** Where in the source, e.g. 'row 412' or an array index. */
  locator: string;
  /** The source's own key for this row, when it has one. */
  sourceKey?: string;
  payload: Record<string, unknown>;
  checksum: string;
  ingestedAt: string;
  parserVersion: string;
}

export type BatchOutcome = 'created' | 'updated' | 'unchanged' | 'conflicted' | 'needs_review' | 'rejected';

export interface ImportBatch {
  batchId: string;
  source: SourceDescriptor;
  startedAt: string;
  finishedAt?: string;
  /** Who or what ran the import. */
  actor: string;
  counts: Record<BatchOutcome | 'discovered' | 'parsed', number>;
  warnings: string[];
  errors: string[];
}

export function startBatch(source: SourceDescriptor, actor: string): ImportBatch {
  return {
    batchId: `BB-BAT-${randomUUID()}`,
    source,
    startedAt: new Date().toISOString(),
    actor,
    counts: { discovered: 0, parsed: 0, created: 0, updated: 0, unchanged: 0, conflicted: 0, needs_review: 0, rejected: 0 },
    warnings: [],
    errors: [],
  };
}

export function makeRawRecord(input: {
  batch: ImportBatch;
  locator: string;
  sourceKey?: string;
  payload: Record<string, unknown>;
}): RawRecord {
  const canonical = JSON.stringify(input.payload, Object.keys(input.payload).sort());
  const checksum = createHash('sha256').update(canonical).digest('hex');
  return {
    rawId: `BB-RAW-${createHash('sha256').update(`${input.batch.source.id}::${input.locator}::${checksum}`).digest('hex').slice(0, 20)}`,
    batchId: input.batch.batchId,
    sourceId: input.batch.source.id,
    locator: input.locator,
    sourceKey: input.sourceKey,
    payload: input.payload,
    checksum,
    ingestedAt: new Date().toISOString(),
    parserVersion: input.batch.source.parserVersion,
  };
}

export function finishBatch(batch: ImportBatch): ImportBatch {
  return { ...batch, finishedAt: new Date().toISOString() };
}

export function summariseBatch(batch: ImportBatch): string {
  const c = batch.counts;
  return [
    `${batch.source.label} (${batch.source.id})`,
    `  discovered ${c.discovered}  parsed ${c.parsed}  rejected ${c.rejected}`,
    `  created ${c.created}  updated ${c.updated}  unchanged ${c.unchanged}`,
    `  conflicted ${c.conflicted}  needs review ${c.needs_review}`,
    batch.warnings.length ? `  warnings ${batch.warnings.length}` : '',
    batch.errors.length ? `  errors ${batch.errors.length}` : '',
  ].filter(Boolean).join('\n');
}
