import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  dimension,
  parseMinimumPurchase,
  priceLadder,
  sku,
  type LivePdpRow,
} from '../src/ingest/sources/livePdp.ts';
import { classify } from '../src/ingest/corrections.ts';
import { runPipeline, type ParsedRow, type SourceAdapter } from '../src/ingest/pipeline.ts';

/* ------------------------------------------------------ live PDP parsing */

describe('live PDP row parsing', () => {
  test('reads the SKU from either scrape format', () => {
    assert.equal(sku({ siteSku: 'GBAtom5SlimBlk' }), 'GBAtom5SlimBlk');
    assert.equal(sku({ websiteSku: 'GBAtom5SlimBlk' }), 'GBAtom5SlimBlk');
    assert.equal(sku({ siteSku: 'A', websiteSku: 'B' }), 'A', 'the newer key wins');
    assert.equal(sku({}), undefined);
  });

  test('keeps the published tolerance rather than flattening it', () => {
    assert.deepEqual(dimension('104 ±2 mm'), { value: 104, tolerance: 2 });
    assert.deepEqual(dimension('15 ±0.5 mm'), { value: 15, tolerance: 0.5 });
  });

  test('supplies mm for the older bare-number format, and invents no tolerance', () => {
    assert.deepEqual(dimension('104'), { value: 104 });
    assert.equal(dimension('')?.value, undefined);
    assert.equal(dimension(null), undefined);
  });

  test('parses the stated minimum purchase', () => {
    assert.equal(parseMinimumPurchase('US $50'), 50);
    assert.equal(parseMinimumPurchase('$1,250'), 1250);
    assert.equal(parseMinimumPurchase('call us'), undefined);
    assert.equal(parseMinimumPurchase(undefined), undefined);
  });
});

/* -------------------------------------------------------- price ladders */

describe('price ladders', () => {
  const row: LivePdpRow = {
    siteSku: 'X',
    tiers: [
      { qty: 1, unitPrice: 2.25 },
      { qty: 12, unitPrice: 2.14 },
      { qty: 144, unitPrice: 2.03 },
      { qty: 3000, unitPrice: 1.76 },
    ],
  };

  test('returns the ladder ascending by quantity', () => {
    assert.deepEqual(priceLadder(row).map((t) => t.minQuantity), [1, 12, 144, 3000]);
    assert.equal(priceLadder(row)[0].unitPrice, 2.25);
  });

  test('sorts an out-of-order ladder', () => {
    const shuffled: LivePdpRow = { tiers: [{ qty: 144, unitPrice: 2.03 }, { qty: 1, unitPrice: 2.25 }, { qty: 12, unitPrice: 2.14 }] };
    assert.deepEqual(priceLadder(shuffled).map((t) => t.minQuantity), [1, 12, 144]);
  });

  test('drops the qty:0 break the source emits on some rows', () => {
    const withZero: LivePdpRow = { tiers: [{ qty: 0, unitPrice: 9 }, { qty: 1, unitPrice: 2.25 }] };
    assert.deepEqual(priceLadder(withZero), [{ minQuantity: 1, unitPrice: 2.25 }]);
  });

  test('deduplicates a repeated quantity, first writer winning', () => {
    const dupes: LivePdpRow = { tiers: [{ qty: 12, unitPrice: 2.14 }, { qty: 12, unitPrice: 9.99 }] };
    assert.deepEqual(priceLadder(dupes), [{ minQuantity: 12, unitPrice: 2.14 }]);
  });

  test('falls back to a single price when the older format supplies no ladder', () => {
    assert.deepEqual(priceLadder({ price1pc: 2.25 }), [{ minQuantity: 1, unitPrice: 2.25 }]);
    assert.deepEqual(priceLadder({}), []);
  });

  test('ignores malformed tiers rather than emitting NaN', () => {
    const bad: LivePdpRow = { tiers: [{ qty: undefined, unitPrice: 1 }, { qty: 5, unitPrice: undefined }, { qty: 10, unitPrice: 1.5 }] };
    assert.deepEqual(priceLadder(bad), [{ minQuantity: 10, unitPrice: 1.5 }]);
  });
});

describe('pipeline carries a full ladder', () => {
  const adapter = (id: string, facts: ParsedRow['facts']): SourceAdapter => ({
    source: { id, label: id, kind: 'website_scrape', locator: `${id}.json`, parserVersion: '1.0.0' },
    read: () => [{ locator: 'r1', sourceKey: 'GBCyl5RollBlkSh', payload: {}, kind: 'bottle', sku: 'GBCyl5RollBlkSh', facts }],
  });

  test('a published ladder becomes multiple price breaks', async () => {
    const result = await runPipeline([adapter('live', [
      { field: 'commerce.priceLadder', value: [{ minQuantity: 1, unitPrice: 2.25 }, { minQuantity: 144, unitPrice: 2.03 }] },
    ])]);
    assert.deepEqual(result.items[0].commerce[0].priceBreaks, [
      { minQuantity: 1, unitPrice: 2.25 },
      { minQuantity: 144, unitPrice: 2.03 },
    ]);
  });

  test('a single unit price does not overwrite the ladder price at the same quantity', async () => {
    const result = await runPipeline([adapter('live', [
      { field: 'commerce.priceLadder', value: [{ minQuantity: 1, unitPrice: 2.25 }] },
      { field: 'commerce.unitPrice', value: 9.99 },
    ])]);
    assert.deepEqual(result.items[0].commerce[0].priceBreaks, [{ minQuantity: 1, unitPrice: 2.25 }]);
  });

  test('the legacy single-break shape still works', async () => {
    const result = await runPipeline([adapter('legacy', [
      { field: 'commerce.unitPrice', value: 2.8 },
      { field: 'commerce.priceBreak', value: { minQuantity: 2500, unitPrice: 2.3 } },
    ])]);
    assert.deepEqual(result.items[0].commerce[0].priceBreaks, [
      { minQuantity: 1, unitPrice: 2.8 },
      { minQuantity: 2500, unitPrice: 2.3 },
    ]);
  });

  test('no pricing at all yields no commerce record', async () => {
    const result = await runPipeline([adapter('live', [{ field: 'item.displayName', value: 'x' }])]);
    assert.deepEqual(result.items[0].commerce, []);
  });
});

/* ------------------------------------------------- correction classifier */

describe('correction classification', () => {
  test('an absent value is a fill', () => {
    assert.equal(classify('', '104 ±2 mm'), 'fill');
    assert.equal(classify('   ', '104 ±2 mm'), 'fill');
  });

  test('an identical value is a no-op fill', () => {
    assert.equal(classify('13-415', '13-415'), 'fill');
  });

  test('a truncated value is a repair, not a conflict', () => {
    // Convex holds "Ground"; the live PDP publishes the whole finish.
    assert.equal(classify('Ground', 'Ground glass neck with glass stopper'), 'repair');
    assert.equal(classify('snap', 'snap on'), 'repair');
  });

  test('a value contaminated by the next field is reclaimable', () => {
    assert.equal(classify('66 ±1 mm Item Height without C', '66 ±1 mm'), 'decontaminate');
    assert.equal(classify('55 ±1 mm Item Diameter: 27 ±0.', '55 ±1 mm'), 'decontaminate');
    assert.equal(classify('13-415 Size: GBPillar9BlkSht Nemat In', '13-415'), 'decontaminate');
  });

  test('a genuinely different value stays a conflict and is never auto-applied', () => {
    // A metric snap neck is not a GPI screw neck. This must reach a human.
    assert.equal(classify('13-415', '13mm'), 'conflict');
    assert.equal(classify('Plug', '8-425'), 'conflict');
    assert.equal(classify('73 ±1 mm', '79 ±1 mm'), 'conflict');
  });

  test('a longer stored value with no field label is a conflict, not contamination', () => {
    // Length alone is not proof of damage.
    assert.equal(classify('13-415 special order', '13-415'), 'conflict');
  });

  test('classification is case-insensitive on the damage checks', () => {
    assert.equal(classify('ground', 'Ground glass neck with glass stopper'), 'repair');
    assert.equal(classify('66 ±1 mm ITEM HEIGHT WITHOUT C', '66 ±1 mm'), 'decontaminate');
  });
});
