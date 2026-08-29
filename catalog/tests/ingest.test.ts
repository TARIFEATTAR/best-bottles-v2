import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import { decodeSku } from '../src/ingest/normalizers/sku.ts';
import {
  emptyIndex,
  findDuplicateKeys,
  indexItem,
  matchItem,
  normaliseSku,
} from '../src/ingest/matching.ts';
import {
  GENERIC_SPREADSHEET_PROFILE,
  applyProfile,
  asPrice,
  parsePriceBreak,
} from '../src/ingest/mapping.ts';
import { makeRawRecord, startBatch, summariseBatch } from '../src/ingest/batch.ts';
import { findNonUniqueExternalIds, runPipeline, type ParsedRow, type SourceAdapter } from '../src/ingest/pipeline.ts';
import { allLegacyAdapters } from '../src/ingest/sources/legacy.ts';

const repoRoot = resolve(import.meta.dirname, '../..');

/* ---------------------------------------------------------- SKU grammar */

describe('SKU decoding', () => {
  test('decodes a full glass-bottle SKU', () => {
    const d = decodeSku('GBCylAmb5RollMtlBlkSh');
    assert.equal(d.kind, 'bottle');
    assert.equal(d.typeCode, 'GB');
    assert.equal(d.shape, 'Cylinder');
    assert.equal(d.colourToken, 'AMB');
    assert.equal(d.capacityMl, 5);
    assert.equal(d.applicatorToken, 'ROLL');
  });

  test('treats an absent colour token as the default, not as missing data', () => {
    const d = decodeSku('GBCyl5RollCuMatt');
    assert.equal(d.colourToken, undefined);
    assert.equal(d.capacityMl, 5);
    assert.equal(d.shape, 'Cylinder');
  });

  test('reads an ounce capacity as ounces and a bare number as millilitres', () => {
    assert.equal(decodeSku('GBBstnAmb2ozMtlRollonGl').capacityMl, 59.15);
    assert.equal(decodeSku('GBCyl50AnSpLvn').capacityMl, 50);
  });

  test('prefers the longest applicator token', () => {
    assert.equal(decodeSku('GBBstnAmb2ozMtlRollonGl').applicatorToken, 'MTLROLLON');
    assert.equal(decodeSku('GBCylAmb5RollSlSh').applicatorToken, 'ROLL');
  });

  test('classifies closure parts by their applicator token', () => {
    assert.equal(decodeSku('CPRoll13-415BlackDot').kind, 'rollerball');
    assert.equal(decodeSku('CP13-415SpryBlkMt').kind, 'sprayer');
    assert.equal(decodeSku('CP18-415BlkLthr').kind, 'cap');
    assert.equal(decodeSku('CP18-415MtSl').neckFinishToken, '18-415');
  });

  test('classifies packaging and accessories away from the product catalogue', () => {
    assert.equal(decodeSku('Box-4x4x4').kind, 'packaging');
    assert.equal(decodeSku('RecloseableBags9x12').kind, 'packaging');
    assert.equal(decodeSku('FunnelMetalSl').kind, 'accessory');
  });

  test('classifies jars and aluminium containers', () => {
    assert.equal(decodeSku('CreamJarBlu3').kind, 'jar');
    assert.equal(decodeSku('Alu250mlSprayBlack').kind, 'bottle');
    assert.equal(decodeSku('Alu250mlSprayBlack').capacityMl, 250);
  });

  test('reports rather than guesses when the grammar does not apply', () => {
    const d = decodeSku('SOMETHING-ELSE-99');
    assert.equal(d.kind, 'unknown');
    assert.ok(d.unparsed.length > 0);
  });
});

/* ------------------------------------------------------------- mapping */

describe('field mapping profiles', () => {
  test('accept the same field under different supplier headers', () => {
    for (const header of ['Bottle Height', 'Height', 'H (mm)', 'height_mm']) {
      const { mapped } = applyProfile(GENERIC_SPREADSHEET_PROFILE, { [header]: '106 mm' });
      const height = mapped.find((m) => m.field === 'bottle.heightWithoutClosureMm');
      assert.deepEqual(height?.value, { value: 106 }, header);
    }
  });

  test('report a header that is present but uncoercible instead of dropping it', () => {
    const { mapped, uncoercible } = applyProfile(GENERIC_SPREADSHEET_PROFILE, { 'Neck Finish': 'Apothecary' });
    assert.equal(mapped.length, 0);
    assert.equal(uncoercible[0].field, 'bottle.neckFinish');
    assert.equal(uncoercible[0].raw, 'Apothecary');
  });

  test('parse the legacy price and bulk-price formats', () => {
    assert.equal(asPrice('$2.80'), 2.8);
    assert.deepEqual(parsePriceBreak('2500pc @ $2.30'), { minQuantity: 2500, unitPrice: 2.3 });
    assert.deepEqual(parsePriceBreak('1,200pc @ $0.86'), { minQuantity: 1200, unitPrice: 0.86 });
    assert.equal(parsePriceBreak('call for pricing'), undefined);
  });

  test('treat "none" and blanks as absent rather than as the string "none"', () => {
    const { mapped } = applyProfile(GENERIC_SPREADSHEET_PROFILE, { Name: 'None', SKU: '  ' });
    assert.equal(mapped.length, 0);
  });
});

/* ------------------------------------------------------------ matching */

describe('entity matching', () => {
  test('matches on an exact SKU regardless of case and spacing', () => {
    const index = emptyIndex();
    indexItem(index, { catalogId: 'BB-BTL-1', sku: 'GBCylAmb5RollBlkSh' });
    const decision = matchItem(index, { sku: ' gbcylamb5rollblksh ' });
    assert.equal(decision.outcome, 'matched');
    assert.equal(decision.outcome === 'matched' && decision.catalogId, 'BB-BTL-1');
  });

  test('a distinct SKU is a new item, not an ambiguous one', () => {
    // Amber and clear 5 ml cylinders share shape, capacity and neck. Treating
    // that as ambiguity would route the whole catalogue to manual review.
    const index = emptyIndex();
    indexItem(index, { catalogId: 'BB-BTL-1', sku: 'GBCylAmb5RollBlkSh', signals: { sku: 'GBCylAmb5RollBlkSh' } });
    assert.equal(matchItem(index, { sku: 'GBCyl5RollBlkSh' }).outcome, 'new');
  });

  test('a keyless row whose attributes match an existing item goes to review', () => {
    const index = emptyIndex();
    indexItem(index, { catalogId: 'BB-BTL-1', sku: 'GBCylAmb5RollBlkSh', signals: { sku: 'GBCylAmb5RollBlkSh' } });
    const decision = matchItem(index, { capacityMl: 5, neckFinishCode: undefined, displayName: 'a 5ml cylinder' });
    // No SKU and no decodable shape -> no weak key -> genuinely new.
    assert.equal(decision.outcome, 'new');
  });

  test('matches on an external id before falling back to the SKU', () => {
    const index = emptyIndex();
    indexItem(index, { catalogId: 'BB-BTL-1', sku: 'OLD-SKU', externalIds: [{ system: 'shopify_variant', externalId: 'gid://123' }] });
    const decision = matchItem(index, { sku: 'RENAMED-SKU', externalIds: [{ system: 'shopify_variant', externalId: 'gid://123' }] });
    assert.equal(decision.outcome, 'matched');
    assert.equal(decision.outcome === 'matched' && decision.signal, 'external:shopify_variant');
  });

  test('finds duplicate keys within a source', () => {
    const dupes = findDuplicateKeys(['A1', 'a1', 'B2', 'C3', 'c3', 'C3']);
    assert.deepEqual(dupes, [{ key: 'C3', count: 3 }, { key: 'A1', count: 2 }]);
  });

  test('normalises SKUs consistently', () => {
    assert.equal(normaliseSku(' gb_cyl amb5 '), 'GBCYLAMB5');
  });
});

/* -------------------------------------------------- external id guarding */

describe('external id uniqueness guard', () => {
  test('flags an id column that repeats across rows', () => {
    const rows: ParsedRow[] = [
      { locator: 'r1', payload: {}, kind: 'bottle', facts: [], externalIds: [{ system: 'legacy_inventory_id', externalId: '10' }] },
      { locator: 'r2', payload: {}, kind: 'bottle', facts: [], externalIds: [{ system: 'legacy_inventory_id', externalId: '10' }] },
      { locator: 'r3', payload: {}, kind: 'bottle', facts: [], externalIds: [{ system: 'gtin', externalId: '5901234123457' }] },
    ];
    const unusable = findNonUniqueExternalIds(rows);
    assert.ok(unusable.has('legacy_inventory_id::10'));
    assert.ok(!unusable.has('gtin::5901234123457'));
  });
});

/* --------------------------------------------------------------- batches */

describe('import batches and raw records', () => {
  test('a raw record checksums its payload so reprocessing is detectable', () => {
    const batch = startBatch(
      { id: 's', label: 'S', kind: 'supplier_feed', locator: 'f.csv', parserVersion: '1.0.0' },
      'tester',
    );
    const a = makeRawRecord({ batch, locator: 'row 1', payload: { sku: 'X', height: 106 } });
    const b = makeRawRecord({ batch, locator: 'row 1', payload: { height: 106, sku: 'X' } });
    const c = makeRawRecord({ batch, locator: 'row 1', payload: { sku: 'X', height: 108 } });
    assert.equal(a.checksum, b.checksum, 'key order must not change the checksum');
    assert.notEqual(a.checksum, c.checksum);
  });

  test('summarises counts for an import review', () => {
    const batch = startBatch({ id: 's', label: 'Supplier A', kind: 'supplier_feed', locator: 'f.csv', parserVersion: '1.0.0' }, 'tester');
    batch.counts.discovered = 10;
    batch.counts.created = 7;
    assert.match(summariseBatch(batch), /Supplier A/);
    assert.match(summariseBatch(batch), /discovered 10/);
  });
});

/* -------------------------------------------------------------- pipeline */

const adapterOf = (id: string, kind: 'website_scrape' | 'physical_measurement', rows: ParsedRow[]): SourceAdapter => ({
  source: { id, label: id, kind, locator: `${id}.json`, parserVersion: '1.0.0' },
  read: () => rows,
});

describe('pipeline', () => {
  const row = (over: Partial<ParsedRow>): ParsedRow => ({
    locator: 'r1',
    sourceKey: 'GBCylAmb5RollBlkSh',
    payload: {},
    kind: 'bottle',
    sku: 'GBCylAmb5RollBlkSh',
    facts: [],
    ...over,
  });

  test('one SKU seen in two sources becomes one item, not two', async () => {
    const result = await runPipeline([
      adapterOf('scrape', 'website_scrape', [row({ facts: [{ field: 'bottle.nominalCapacityMl', value: 5 }] })]),
      adapterOf('measured', 'physical_measurement', [row({ locator: 'r2', facts: [{ field: 'bottle.nominalCapacityMl', value: 5 }] })]),
    ]);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].assertions.length, 2);
  });

  test('a later, weaker source cannot overwrite a stronger one', async () => {
    const result = await runPipeline([
      adapterOf('measured', 'physical_measurement', [row({ facts: [{ field: 'bottle.nominalCapacityMl', value: 5.2 }] })]),
      adapterOf('scrape', 'website_scrape', [row({ locator: 'r2', facts: [{ field: 'bottle.nominalCapacityMl', value: 5 }] })]),
    ]);
    assert.equal(result.items[0].bottle?.nominalCapacityMl, 5.2);
    assert.equal(result.items[0].conflicts.length, 1);
    assert.equal(result.items[0].item.verification, 'conflicting');
  });

  test('a row with no stable key is rejected, not invented', async () => {
    const result = await runPipeline([adapterOf('scrape', 'website_scrape', [row({ sourceKey: undefined })])]);
    assert.equal(result.items.length, 0);
    assert.equal(result.rejected.length, 1);
  });

  test('an unclassifiable row goes to review rather than becoming a bottle', async () => {
    const result = await runPipeline([adapterOf('scrape', 'website_scrape', [row({ kind: 'unknown' })])]);
    assert.equal(result.items.length, 0);
    assert.equal(result.review.length, 1);
  });

  test('imported media is never marked approved', async () => {
    const result = await runPipeline([
      adapterOf('scrape', 'website_scrape', [row({ media: [{ storageUrl: 'https://x/y.gif', assetType: 'hero', origin: 'photograph' }] })]),
    ]);
    assert.equal(result.items[0].media[0].approved, false);
  });

  test('re-running the pipeline is idempotent', async () => {
    const adapters = () => [adapterOf('scrape', 'website_scrape', [row({ facts: [{ field: 'bottle.nominalCapacityMl', value: 5 }] })])];
    const first = await runPipeline(adapters());
    const second = await runPipeline(adapters());
    assert.deepEqual(
      first.items.map((i) => i.item.catalogId),
      second.items.map((i) => i.item.catalogId),
    );
    assert.deepEqual(
      first.items[0].assertions.map((a) => a.assertionId),
      second.items[0].assertions.map((a) => a.assertionId),
    );
  });
});

/* -------------------------------------- end to end over the real repo data */

describe('migration of the real legacy datasets', () => {
  test('every distinct legacy SKU is either an item or an explicit review entry', async () => {
    const result = await runPipeline(allLegacyAdapters(repoRoot));

    const sourceSkus = new Set<string>();
    for (const raw of result.rawRecords) {
      if (raw.sourceKey) sourceSkus.add(normaliseSku(raw.sourceKey));
    }

    const itemSkus = new Set(result.items.map((i) => normaliseSku(i.item.sku ?? '')));
    const reviewSkus = new Set(result.review.map((r) => normaliseSku(r.sku ?? '')));
    const rejectedCount = result.rejected.length;

    const unaccounted = [...sourceSkus].filter((sku) => !itemSkus.has(sku) && !reviewSkus.has(sku));

    assert.equal(rejectedCount, 0, 'no legacy row should lack a SKU');
    assert.deepEqual(unaccounted, [], 'no legacy SKU may vanish during migration');
    assert.equal(sourceSkus.size, itemSkus.size + reviewSkus.size);
  });

  test('produces a catalogue of the expected scale and shape', async () => {
    const result = await runPipeline(allLegacyAdapters(repoRoot));
    assert.ok(result.items.length > 2400, `expected >2400 items, got ${result.items.length}`);
    assert.ok(result.items.every((i) => i.item.catalogId.startsWith('BB-')));
    assert.ok(result.items.some((i) => i.item.kind === 'cap'), 'closures must be classified separately from bottles');
    assert.ok(result.items.some((i) => i.item.kind === 'packaging'), 'packaging must not be catalogued as product');
  });

  test('nothing arrives already verified - legacy data is unverified until reviewed', async () => {
    const result = await runPipeline(allLegacyAdapters(repoRoot));
    assert.ok(result.items.every((i) => i.item.verification !== 'verified'));
    assert.ok(result.items.every((i) => i.item.lifecycle === 'draft'));
    assert.ok(result.items.every((i) => i.media.every((m) => !m.approved)));
  });

  test('detects the real disagreements between the legacy sources', async () => {
    const result = await runPipeline(allLegacyAdapters(repoRoot));
    assert.ok(result.conflicts.length > 0, 'four overlapping sources must disagree somewhere');
    assert.ok(result.conflicts.every((c) => c.assertions.length >= 2));
  });

  test('flags the master spreadsheet inventory_id column as unusable for matching', async () => {
    const result = await runPipeline(allLegacyAdapters(repoRoot));
    const master = result.batches.find((b) => b.source.id === 'master-spreadsheet')!;
    assert.ok(
      master.warnings.some((w) => w.includes('legacy_inventory_id') && w.includes('not unique')),
      'the inventory_id column repeats and must be excluded from identity matching',
    );
  });
});
