/**
 * The ingestion pipeline.
 *
 *   SOURCE -> RAW -> PARSE -> NORMALISE -> MATCH -> VALIDATE
 *          -> CONFLICT DETECT -> STAGING -> (review) -> CANONICAL
 *
 * Everything up to STAGING runs here and is pure: given the same inputs it
 * produces the same output, so a run can be repeated, diffed and reviewed
 * before anything is promoted to the canonical catalog.
 *
 * The pipeline never writes canonical values directly. It emits FactAssertions,
 * and canonical values are derived from them by `domain/provenance.ts`. That is
 * what makes an import incapable of silently overwriting better data.
 */

import type { ItemKind } from '../domain/ids.ts';
import {
  assertionId,
  resolveItem,
  type ResolvedField,
} from '../domain/provenance.ts';
import type {
  BottleSpec,
  CatalogItem,
  ClosureSpec,
  CommerceRecord,
  Conflict,
  ExternalId,
  ExternalSystem,
  FactAssertion,
  MediaAsset,
} from '../domain/types.ts';
import type { Measurement } from '../domain/units.ts';
import type { NeckFinish } from '../domain/vocab.ts';
import type { ItemBundle } from '../domain/completeness.ts';
import {
  finishBatch,
  makeRawRecord,
  startBatch,
  type ImportBatch,
  type RawRecord,
  type SourceDescriptor,
} from './batch.ts';
import {
  emptyIndex,
  indexItem,
  matchItem,
  mintCatalogId,
  normaliseSku,
  type MatchCandidateIndex,
} from './matching.ts';

/** What a source adapter produces for one source row. */
export interface ParsedRow {
  locator: string;
  /** The source's own stable key. Usually the SKU. Rows without one are rejected. */
  sourceKey?: string;
  payload: Record<string, unknown>;
  kind: ItemKind | 'unknown';
  sku?: string;
  displayName?: string;
  externalIds?: Array<{ system: ExternalSystem; externalId: string; url?: string }>;
  media?: Array<{ storageUrl: string; assetType: MediaAsset['assetType']; origin: MediaAsset['origin'] }>;
  facts: Array<{ field: string; value: unknown; unit?: string; confidence?: number }>;
  /** Problems the adapter already knows about, e.g. an unmappable column. */
  warnings?: string[];
}

export interface SourceAdapter {
  source: SourceDescriptor;
  read: () => ParsedRow[] | Promise<ParsedRow[]>;
}

export interface StagedItem {
  item: CatalogItem;
  bottle?: BottleSpec;
  closure?: ClosureSpec;
  commerce: CommerceRecord[];
  media: MediaAsset[];
  externalIds: ExternalId[];
  assertions: FactAssertion[];
  conflicts: Conflict[];
  /** Fields that no source supplied but the schema knows about. */
  resolved: Map<string, ResolvedField>;
}

export interface PipelineResult {
  batches: ImportBatch[];
  rawRecords: RawRecord[];
  items: StagedItem[];
  conflicts: Conflict[];
  /** Rows that could not be matched confidently and must be reviewed by a human. */
  review: Array<{ sourceId: string; locator: string; sku?: string; reason: string; candidates?: string[] }>;
  rejected: Array<{ sourceId: string; locator: string; reason: string }>;
  /** Values a normaliser refused to guess at, so the vocabulary can be extended. */
  unmapped: Array<{ sourceId: string; field: string; raw: string; count: number }>;
}

export async function runPipeline(
  adapters: SourceAdapter[],
  options: { actor?: string; resolutions?: Record<string, Record<string, string>> } = {},
): Promise<PipelineResult> {
  const actor = options.actor ?? 'catalog-cli';
  const index: MatchCandidateIndex = emptyIndex();

  const batches: ImportBatch[] = [];
  const rawRecords: RawRecord[] = [];
  const assertionsByItem = new Map<string, FactAssertion[]>();
  const itemSeeds = new Map<string, { kind: ItemKind; sku?: string; displayName?: string; anchor: { sourceSystem: string; naturalKey: string } }>();
  const externalIdsByItem = new Map<string, ExternalId[]>();
  const mediaByItem = new Map<string, MediaAsset[]>();
  const review: PipelineResult['review'] = [];
  const rejected: PipelineResult['rejected'] = [];
  const unmappedCounts = new Map<string, { sourceId: string; field: string; raw: string; count: number }>();

  for (const adapter of adapters) {
    const batch = startBatch(adapter.source, actor);
    const rows = await adapter.read();
    batch.counts.discovered = rows.length;

    // An external id is only an identifier if it is unique within its source.
    // The legacy master spreadsheet proves why this guard is needed: its
    // `inventory_id` column actually holds capacity values, so 80 distinct
    // SKUs share the id "10". Matching on it would silently merge unrelated
    // products. Non-unique external ids are still recorded as mappings, they
    // are just not allowed to decide identity.
    const unusableExternalIds = findNonUniqueExternalIds(rows);
    for (const [system, count] of summariseBySystem(unusableExternalIds)) {
      batch.warnings.push(
        `External id system "${system}" is not unique in this source (${count} repeated values); ` +
          'excluded from entity matching.',
      );
    }

    // Duplicate source keys within one batch collapse onto one item rather than
    // racing; the second and later rows are recorded as additional assertions.
    const seenKeys = new Set<string>();

    for (const row of rows) {
      const raw = makeRawRecord({ batch, locator: row.locator, sourceKey: row.sourceKey, payload: row.payload });
      rawRecords.push(raw);

      if (!row.sourceKey) {
        batch.counts.rejected += 1;
        rejected.push({ sourceId: adapter.source.id, locator: row.locator, reason: 'No stable source key (SKU) on this row.' });
        continue;
      }
      if (row.kind === 'unknown') {
        batch.counts.needs_review += 1;
        review.push({
          sourceId: adapter.source.id,
          locator: row.locator,
          sku: row.sku,
          reason: 'Item kind could not be determined from the SKU grammar or name. Classify manually.',
        });
        continue;
      }

      batch.counts.parsed += 1;
      for (const warning of row.warnings ?? []) {
        const key = `${adapter.source.id}::${warning}`;
        const entry = unmappedCounts.get(key) ?? { sourceId: adapter.source.id, field: 'warning', raw: warning, count: 0 };
        entry.count += 1;
        unmappedCounts.set(key, entry);
      }

      const matchableExternalIds = (row.externalIds ?? []).filter(
        (ext) => !unusableExternalIds.has(externalKey(ext.system, ext.externalId)),
      );

      const decision = matchItem(index, {
        sku: row.sku,
        externalIds: matchableExternalIds,
        kind: row.kind,
        capacityMl: numericFact(row, 'bottle.nominalCapacityMl'),
        neckFinishCode: neckCodeFact(row),
        displayName: row.displayName,
      });

      let targetId: string;
      if (decision.outcome === 'matched') {
        targetId = decision.catalogId;
        batch.counts.updated += 1;
      } else if (decision.outcome === 'ambiguous') {
        // Never silently merge. Mint a distinct id and flag for a human.
        targetId = mintCatalogId(row.kind, adapter.source.id, row.sourceKey);
        batch.counts.needs_review += 1;
        review.push({
          sourceId: adapter.source.id,
          locator: row.locator,
          sku: row.sku,
          reason: decision.reason,
          candidates: decision.candidates,
        });
      } else {
        targetId = mintCatalogId(row.kind, adapter.source.id, row.sourceKey);
        batch.counts.created += 1;
      }

      if (!itemSeeds.has(targetId)) {
        itemSeeds.set(targetId, {
          kind: row.kind,
          sku: row.sku,
          displayName: row.displayName,
          anchor: { sourceSystem: adapter.source.id, naturalKey: row.sourceKey },
        });
      }

      const facts = assertionsByItem.get(targetId) ?? [];
      for (const fact of row.facts) {
        if (fact.value === undefined || fact.value === null || fact.value === '') continue;
        facts.push({
          assertionId: assertionId({
            catalogId: targetId,
            field: fact.field,
            sourceId: adapter.source.id,
            sourceLocator: row.locator,
            value: fact.value,
          }),
          catalogId: targetId,
          field: fact.field,
          value: fact.value,
          unit: fact.unit,
          sourceId: adapter.source.id,
          sourceKind: adapter.source.kind,
          sourceLocator: row.locator,
          importBatchId: batch.batchId,
          observedAt: raw.ingestedAt,
          confidence: fact.confidence ?? 0.7,
        });
      }
      assertionsByItem.set(targetId, facts);

      if (row.externalIds?.length) {
        const list = externalIdsByItem.get(targetId) ?? [];
        for (const ext of row.externalIds) {
          if (!list.some((e) => e.system === ext.system && e.externalId === ext.externalId)) {
            list.push({ catalogId: targetId, system: ext.system, externalId: ext.externalId, url: ext.url });
          }
        }
        externalIdsByItem.set(targetId, list);
      }

      if (row.media?.length) {
        const list = mediaByItem.get(targetId) ?? [];
        for (const asset of row.media) {
          if (list.some((m) => m.storageUrl === asset.storageUrl)) continue;
          list.push({
            assetId: `BB-AST-${normaliseSku(asset.storageUrl).slice(-24)}`,
            catalogId: targetId,
            assetType: asset.assetType,
            storageUrl: asset.storageUrl,
            origin: asset.origin,
            // Legacy imagery has never been through an approval step. Saying so
            // is what lets "missing approved hero image" be a real report.
            approved: false,
            version: 1,
          });
        }
        mediaByItem.set(targetId, list);
      }

      if (decision.outcome !== 'ambiguous') {
        indexItem(index, {
          catalogId: targetId,
          sku: row.sku,
          signals: { sku: row.sku, capacityMl: numericFact(row, 'bottle.nominalCapacityMl'), neckFinishCode: neckCodeFact(row) },
          externalIds: matchableExternalIds,
        });
      }

      if (seenKeys.has(normaliseSku(row.sourceKey))) {
        batch.warnings.push(`Duplicate source key ${row.sourceKey} at ${row.locator}; merged into ${targetId}.`);
      }
      seenKeys.add(normaliseSku(row.sourceKey));
    }

    batches.push(finishBatch(batch));
  }

  const items: StagedItem[] = [];
  const allConflicts: Conflict[] = [];
  const now = new Date().toISOString();

  for (const [id, seed] of itemSeeds) {
    const assertions = assertionsByItem.get(id) ?? [];
    const { fields, conflicts } = resolveItem(assertions, options.resolutions?.[id] ?? {});
    allConflicts.push(...conflicts);

    const item: CatalogItem = {
      catalogId: id,
      kind: seed.kind,
      sku: seed.sku,
      displayName: stringField(fields, 'item.displayName') ?? seed.displayName ?? seed.sku ?? id,
      slug: slugify(stringField(fields, 'item.displayName') ?? seed.displayName ?? seed.sku ?? id),
      shortDescription: stringField(fields, 'item.shortDescription'),
      family: stringField(fields, 'item.family'),
      lifecycle: 'draft',
      verification: conflicts.length > 0 ? 'conflicting' : 'unverified',
      identityAnchor: seed.anchor,
      createdAt: now,
      updatedAt: now,
    };

    items.push({
      item,
      bottle: buildBottleSpec(id, seed.kind, fields),
      closure: buildClosureSpec(id, seed.kind, fields),
      commerce: buildCommerce(id, fields),
      media: mediaByItem.get(id) ?? [],
      externalIds: externalIdsByItem.get(id) ?? [],
      assertions,
      conflicts,
      resolved: fields,
    });
  }

  for (const batch of batches) {
    batch.counts.conflicted = allConflicts.filter((c) => c.assertions.some((a) => a.importBatchId === batch.batchId)).length;
  }

  return {
    batches,
    rawRecords,
    items,
    conflicts: allConflicts,
    review,
    rejected,
    unmapped: [...unmappedCounts.values()].sort((a, b) => b.count - a.count),
  };
}

/** Convert a staged item into the shape the completeness scorer expects. */
export function toBundle(staged: StagedItem, edges: ItemBundle['edges'] = []): ItemBundle {
  return {
    item: staged.item,
    bottle: staged.bottle,
    closure: staged.closure,
    commerce: staged.commerce,
    media: staged.media,
    edges,
  };
}

/**
 * External ids that repeat within a single source, and so cannot identify a
 * row. Returned as `system::value` keys.
 */
export function findNonUniqueExternalIds(rows: ParsedRow[]): Set<string> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const ext of row.externalIds ?? []) {
      const key = externalKey(ext.system, ext.externalId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
}

function summariseBySystem(keys: Set<string>): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const key of keys) {
    const system = key.split('::')[0];
    counts.set(system, (counts.get(system) ?? 0) + 1);
  }
  return [...counts.entries()];
}

function externalKey(system: string, externalId: string): string {
  return `${system}::${externalId.trim().toLowerCase()}`;
}

const CONTAINER_KINDS = new Set<ItemKind>(['bottle', 'jar', 'vial']);
const CLOSURE_KINDS = new Set<ItemKind>(['closure', 'cap', 'dropper', 'reducer', 'insert', 'rollerball', 'sprayer', 'pump', 'liner']);

function buildBottleSpec(id: string, kind: ItemKind, fields: Map<string, ResolvedField>): BottleSpec | undefined {
  if (!CONTAINER_KINDS.has(kind)) return undefined;
  return {
    catalogId: id,
    shape: stringField(fields, 'bottle.shape'),
    nominalCapacityMl: numberField(fields, 'bottle.nominalCapacityMl'),
    brimfulCapacityMl: numberField(fields, 'bottle.brimfulCapacityMl'),
    heightWithClosureMm: measurementField(fields, 'bottle.heightWithClosureMm'),
    heightWithoutClosureMm: measurementField(fields, 'bottle.heightWithoutClosureMm'),
    diameterMm: measurementField(fields, 'bottle.diameterMm'),
    openingDiameterMm: measurementField(fields, 'bottle.openingDiameterMm'),
    material: stringField(fields, 'bottle.material') as BottleSpec['material'],
    glassColour: stringField(fields, 'bottle.glassColour') as BottleSpec['glassColour'],
    finish: stringField(fields, 'bottle.finish') as BottleSpec['finish'],
    neckFinish: neckField(fields, 'bottle.neckFinish'),
    countryOfOrigin: stringField(fields, 'bottle.countryOfOrigin'),
    manufacturer: stringField(fields, 'bottle.manufacturer'),
  };
}

function buildClosureSpec(id: string, kind: ItemKind, fields: Map<string, ResolvedField>): ClosureSpec | undefined {
  if (!CLOSURE_KINDS.has(kind)) return undefined;
  return {
    catalogId: id,
    closureKind: stringField(fields, 'closure.closureKind') as ClosureSpec['closureKind'],
    neckFinish: neckField(fields, 'closure.neckFinish') ?? neckField(fields, 'bottle.neckFinish'),
    diameterMm: measurementField(fields, 'closure.diameterMm'),
    heightMm: measurementField(fields, 'closure.heightMm'),
    material: stringField(fields, 'closure.material') as ClosureSpec['material'],
    finish: stringField(fields, 'closure.finish') as ClosureSpec['finish'],
    colourLabel: stringField(fields, 'closure.colourLabel'),
  };
}

function buildCommerce(id: string, fields: Map<string, ResolvedField>): CommerceRecord[] {
  const unitPrice = numberField(fields, 'commerce.unitPrice');
  const breakRaw = fields.get('commerce.priceBreak')?.value as { minQuantity: number; unitPrice: number } | undefined;
  const moq = numberField(fields, 'commerce.minimumOrderQuantity');
  const caseQty = numberField(fields, 'commerce.caseQuantity');
  const lead = numberField(fields, 'commerce.leadTimeDays');
  if (unitPrice === undefined && !breakRaw && moq === undefined && caseQty === undefined && lead === undefined) return [];

  const priceBreaks: CommerceRecord['priceBreaks'] = [];
  if (unitPrice !== undefined) priceBreaks.push({ minQuantity: 1, unitPrice });
  if (breakRaw) priceBreaks.push(breakRaw);
  priceBreaks.sort((a, b) => a.minQuantity - b.minQuantity);

  return [{
    catalogId: id,
    channel: 'retail',
    currency: 'USD',
    priceBreaks,
    minimumOrderQuantity: moq,
    caseQuantity: caseQty,
    leadTimeDays: lead,
  }];
}

function stringField(fields: Map<string, ResolvedField>, key: string): string | undefined {
  const value = fields.get(key)?.value;
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function numberField(fields: Map<string, ResolvedField>, key: string): number | undefined {
  const value = fields.get(key)?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function measurementField(fields: Map<string, ResolvedField>, key: string): Measurement | undefined {
  const value = fields.get(key)?.value;
  if (value && typeof value === 'object' && typeof (value as Measurement).value === 'number') return value as Measurement;
  if (typeof value === 'number') return { value };
  return undefined;
}

function neckField(fields: Map<string, ResolvedField>, key: string): NeckFinish | undefined {
  const value = fields.get(key)?.value;
  if (value && typeof value === 'object' && 'style' in (value as object)) return value as NeckFinish;
  return undefined;
}

function numericFact(row: ParsedRow, field: string): number | undefined {
  const fact = row.facts.find((f) => f.field === field);
  return typeof fact?.value === 'number' ? fact.value : undefined;
}

function neckCodeFact(row: ParsedRow): string | undefined {
  const fact = row.facts.find((f) => f.field === 'bottle.neckFinish' || f.field === 'closure.neckFinish');
  const value = fact?.value as NeckFinish | undefined;
  return value && typeof value === 'object' && 'code' in value ? value.code : undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'item';
}
