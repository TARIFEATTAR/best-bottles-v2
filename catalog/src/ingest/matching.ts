/**
 * Entity matching and deduplication.
 *
 * Two rules govern this module:
 *   - never silently merge uncertain entities
 *   - never create a duplicate just because a name differs
 *
 * Matching runs over ranked signals. A strong signal (catalog id, GTIN, an
 * exact SKU, a Shopify id) matches outright. Weak signals (a decoded SKU
 * shape + capacity + neck, a normalised name) only *propose* a match, which is
 * routed to review rather than applied.
 */

import { catalogId, type ItemKind } from '../domain/ids.ts';
import { decodeSku } from './normalizers/sku.ts';

export interface MatchCandidateIndex {
  byCatalogId: Map<string, string>;
  bySku: Map<string, string>;
  byExternalId: Map<string, string>;
  /** weak key -> catalog ids sharing it */
  byWeakKey: Map<string, string[]>;
}

export interface MatchSignals {
  catalogId?: string;
  sku?: string;
  externalIds?: Array<{ system: string; externalId: string }>;
  kind?: ItemKind | 'unknown';
  capacityMl?: number;
  neckFinishCode?: string;
  displayName?: string;
}

export type MatchDecision =
  | { outcome: 'matched'; catalogId: string; signal: string; confidence: number }
  | { outcome: 'new'; signal: string }
  | { outcome: 'ambiguous'; candidates: string[]; signal: string; reason: string };

export function emptyIndex(): MatchCandidateIndex {
  return { byCatalogId: new Map(), bySku: new Map(), byExternalId: new Map(), byWeakKey: new Map() };
}

export function indexItem(
  index: MatchCandidateIndex,
  entry: { catalogId: string; sku?: string; signals?: MatchSignals; externalIds?: Array<{ system: string; externalId: string }> },
): void {
  index.byCatalogId.set(entry.catalogId, entry.catalogId);
  if (entry.sku) index.bySku.set(normaliseSku(entry.sku), entry.catalogId);
  for (const ext of entry.externalIds ?? []) {
    index.byExternalId.set(externalKey(ext.system, ext.externalId), entry.catalogId);
  }
  const weak = weakKey(entry.signals ?? { sku: entry.sku });
  if (weak) {
    const list = index.byWeakKey.get(weak) ?? [];
    if (!list.includes(entry.catalogId)) list.push(entry.catalogId);
    index.byWeakKey.set(weak, list);
  }
}

export function matchItem(index: MatchCandidateIndex, signals: MatchSignals): MatchDecision {
  if (signals.catalogId && index.byCatalogId.has(signals.catalogId)) {
    return { outcome: 'matched', catalogId: signals.catalogId, signal: 'catalog_id', confidence: 1 };
  }

  for (const ext of signals.externalIds ?? []) {
    const hit = index.byExternalId.get(externalKey(ext.system, ext.externalId));
    if (hit) return { outcome: 'matched', catalogId: hit, signal: `external:${ext.system}`, confidence: 0.98 };
  }

  if (signals.sku) {
    const hit = index.bySku.get(normaliseSku(signals.sku));
    if (hit) return { outcome: 'matched', catalogId: hit, signal: 'sku', confidence: 0.95 };
  }

  // Weak attribute matching is a fallback for rows with NO stable key. A row
  // that carries a SKU which matched nothing is a new item, not an ambiguous
  // one: shape + capacity + neck are shared by dozens of legitimate variants
  // that differ only by glass colour or cap finish. Treating those collisions
  // as ambiguity would route the whole catalog to manual review and teach
  // operators to ignore the queue.
  if (!signals.sku) {
    const weak = weakKey(signals);
    const candidates = weak ? index.byWeakKey.get(weak) ?? [] : [];
    if (candidates.length > 0) {
      return {
        outcome: 'ambiguous',
        candidates,
        signal: 'weak:shape+capacity+neck',
        reason:
          candidates.length === 1
            ? 'Row has no SKU but its attributes match an existing item. Confirm before merging.'
            : `Row has no SKU and its attributes match ${candidates.length} existing items. Needs review.`,
      };
    }
  }

  return { outcome: 'new', signal: signals.sku ? 'sku' : 'none' };
}

/**
 * Detect duplicate SKUs *within* one source. The legacy master spreadsheet
 * carries repeated SKU rows; those must collapse to one item rather than
 * racing each other through the pipeline.
 */
export function findDuplicateKeys(keys: string[]): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const key of keys) {
    const k = normaliseSku(key);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/** Mint the catalog id for a genuinely new item. */
export function mintCatalogId(kind: ItemKind, sourceSystem: string, naturalKey: string): string {
  return catalogId(kind, { sourceSystem, naturalKey });
}

export function normaliseSku(sku: string): string {
  return sku.trim().replace(/[\s_]+/g, '').toUpperCase();
}

/**
 * The weak identity key: decoded shape + capacity + neck finish. Deliberately
 * excludes colour and cap descriptors, because those are exactly the fields
 * legacy sources disagree about - including them would hide real duplicates.
 */
export function weakKey(signals: MatchSignals): string | undefined {
  const decoded = signals.sku ? decodeSku(signals.sku) : undefined;
  const shape = decoded?.shape;
  const capacity = signals.capacityMl ?? decoded?.capacityMl;
  const neck = signals.neckFinishCode ?? decoded?.neckFinishToken;
  if (!shape || capacity === undefined) return undefined;
  return [shape.toLowerCase(), capacity, neck ?? '?'].join('|');
}

function externalKey(system: string, externalId: string): string {
  return `${system}::${externalId.trim().toLowerCase()}`;
}
