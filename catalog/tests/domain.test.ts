import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { catalogId, isCatalogId, kindOfCatalogId, relationshipId } from '../src/domain/ids.ts';
import { displayLength, parseLength, parseVolumeMl, toMl, toMm } from '../src/domain/units.ts';
import {
  neckFinishesMate,
  parseNeckFinish,
  resolveFinish,
  resolveGlassColour,
  resolveMaterial,
  resolveUseCase,
} from '../src/domain/vocab.ts';
import { resolveField, resolveItem, valuesAgree } from '../src/domain/provenance.ts';
import {
  INFERRED_CONFIDENCE,
  closuresFor,
  inferNeckFinishEdges,
  makeEdge,
  mergeEdges,
  validateConfiguration,
} from '../src/domain/compatibility.ts';
import { scoreCompleteness, summariseHealth } from '../src/domain/completeness.ts';
import type { BottleSpec, CatalogItem, ClosureSpec, FactAssertion } from '../src/domain/types.ts';

/* ------------------------------------------------------------------ ids */

describe('canonical identifiers', () => {
  const anchor = { sourceSystem: 'master-spreadsheet', naturalKey: 'GBCylAmb5RollBlkSh' };

  test('are deterministic, so re-importing the same row does not duplicate', () => {
    assert.equal(catalogId('bottle', anchor), catalogId('bottle', anchor));
  });

  test('ignore case and surrounding whitespace in the anchor', () => {
    assert.equal(
      catalogId('bottle', anchor),
      catalogId('bottle', { sourceSystem: ' Master-Spreadsheet ', naturalKey: 'gbcylamb5rollblksh' }),
    );
  });

  test('differ by item kind, so a cap never collides with a bottle', () => {
    assert.notEqual(catalogId('bottle', anchor), catalogId('cap', anchor));
  });

  test('are well formed and carry a decodable kind', () => {
    const id = catalogId('rollerball', anchor);
    assert.ok(isCatalogId(id), id);
    assert.equal(kindOfCatalogId(id), 'rollerball');
  });

  test('do not encode specifications, so a respec does not move identity', () => {
    // Same anchor, and the id is stable regardless of what we later learn.
    const before = catalogId('bottle', anchor);
    const after = catalogId('bottle', anchor);
    assert.equal(before, after);
    assert.ok(!before.includes('AMB'), 'id must not embed attribute tokens');
  });

  test('relationship ids are direction-sensitive and stable', () => {
    assert.equal(relationshipId('A', 'compatible_with', 'B'), relationshipId('A', 'compatible_with', 'B'));
    assert.notEqual(relationshipId('A', 'compatible_with', 'B'), relationshipId('B', 'compatible_with', 'A'));
  });
});

/* ---------------------------------------------------------------- units */

describe('units', () => {
  test('convert to canonical base units', () => {
    assert.equal(toMm(1, 'in'), 25.4);
    assert.equal(toMm(2.5, 'cm'), 25);
    assert.equal(Math.round(toMl(1, 'oz') * 100) / 100, 29.57);
  });

  test('parse a tolerance the legacy spec sheets actually use', () => {
    assert.deepEqual(parseLength('83 ±1 mm'), { value: 83, tolerance: 1 });
    assert.deepEqual(parseLength('20 ±0.5mm'), { value: 20, tolerance: 0.5 });
    assert.deepEqual(parseLength('106mm'), { value: 106 });
  });

  test('refuse to guess a unit that is not stated', () => {
    assert.equal(parseLength('83'), undefined);
    assert.equal(parseLength(''), undefined);
    assert.equal(parseLength('tall'), undefined);
  });

  test('prefer a stated millilitre reading over a rounded ounce reading', () => {
    assert.equal(parseVolumeMl('9 ml (0.3 oz)'), 9);
    assert.equal(parseVolumeMl('100 ml,  '), 100);
  });

  test('parse the fractional ounce forms in the legacy catalogue', () => {
    assert.equal(Math.round(parseVolumeMl('1/3oz')! * 10) / 10, 9.9);
    assert.equal(Math.round(parseVolumeMl('2 ounce')! * 10) / 10, 59.1);
    assert.equal(Math.round(parseVolumeMl('0.14 oz')! * 100) / 100, 4.14);
  });

  test('present both systems without storing both', () => {
    assert.deepEqual(displayLength(25.4), { metric: '25.4 mm', imperial: '1 in' });
  });
});

/* ---------------------------------------------------------------- vocab */

describe('governed vocabularies', () => {
  test('collapse the many spellings the legacy sources use', () => {
    for (const raw of ['clear glass', 'Clear glass', 'Clear Glass', 'glass', 'GLASS']) {
      assert.equal(resolveMaterial(raw), 'glass', raw);
    }
    assert.equal(resolveMaterial('Cobalt blue glass'), 'glass');
    assert.equal(resolveMaterial('Metal'), 'steel');
  });

  test('map colour and finish tokens from the SKU grammar', () => {
    assert.equal(resolveGlassColour('Amb'), 'amber');
    assert.equal(resolveGlassColour('Blu'), 'cobalt');
    assert.equal(resolveGlassColour('Frst'), 'flint');
    assert.equal(resolveFinish('Sh'), 'shiny');
    assert.equal(resolveFinish('Mt'), 'matte');
  });

  test('return undefined rather than guessing an unknown value', () => {
    assert.equal(resolveMaterial('unobtainium'), undefined);
    assert.equal(resolveGlassColour(''), undefined);
    assert.equal(resolveUseCase('something novel'), undefined);
  });

  test('extract structured use cases from marketing copy fragments', () => {
    assert.equal(resolveUseCase('essential oils'), 'essential_oil');
    assert.equal(resolveUseCase('thin lotions and ointments'), 'lotion');
    assert.equal(resolveUseCase('Perfume oil'), 'perfume_oil');
  });
});

describe('neck finishes', () => {
  test('parse GPI and metric forms distinctly', () => {
    assert.deepEqual(parseNeckFinish('18-415'), { style: 'gpi', diameterMm: 18, series: '415', code: '18-415' });
    assert.deepEqual(parseNeckFinish('14.3mm'), { style: 'metric', diameterMm: 14.3, code: '14.3mm' });
  });

  test('reject category labels that leaked into the neck column', () => {
    for (const label of ['Apothecary', 'Jars', 'Vials', 'Decorative Hearts', '5ml Elegant', 'None', '']) {
      assert.equal(parseNeckFinish(label), undefined, label);
    }
  });

  test('do not mate different thread series that share a diameter', () => {
    assert.equal(neckFinishesMate(parseNeckFinish('18-415'), parseNeckFinish('18-400')), false);
  });

  test('do not mate a metric snap neck with a GPI screw neck', () => {
    assert.equal(neckFinishesMate(parseNeckFinish('17mm'), parseNeckFinish('17-415')), false);
  });

  test('mate identical finishes', () => {
    assert.equal(neckFinishesMate(parseNeckFinish('13-415'), parseNeckFinish('13-415')), true);
  });

  test('never mate when either side is unknown', () => {
    assert.equal(neckFinishesMate(undefined, parseNeckFinish('13-415')), false);
  });
});

/* ----------------------------------------------------------- provenance */

const assertion = (over: Partial<FactAssertion>): FactAssertion => ({
  assertionId: `a${Math.random()}`,
  catalogId: 'BB-BTL-TEST000000',
  field: 'bottle.heightWithoutClosureMm',
  value: 106,
  sourceId: 'src',
  sourceKind: 'website_scrape',
  observedAt: '2026-01-01T00:00:00.000Z',
  confidence: 0.7,
  ...over,
});

describe('provenance and conflict detection', () => {
  test('a measured value beats a scraped value regardless of import order', () => {
    const scraped = assertion({ value: 106, sourceKind: 'website_scrape', observedAt: '2026-06-01T00:00:00.000Z' });
    const measured = assertion({ value: 108, sourceKind: 'physical_measurement', observedAt: '2026-01-01T00:00:00.000Z' });

    assert.equal(resolveField([scraped, measured])!.value, 108);
    assert.equal(resolveField([measured, scraped])!.value, 108, 'last import must not win');
  });

  test('a material disagreement is a conflict, not a silent overwrite', () => {
    const resolved = resolveField([
      assertion({ value: 106, sourceKind: 'website_scrape' }),
      assertion({ value: 108, sourceKind: 'physical_measurement' }),
    ])!;
    assert.equal(resolved.dissenting.length, 1);
    assert.equal(resolved.verification, 'conflicting');
    assert.ok(resolved.confidence <= 0.6, 'confidence must drop when sources disagree');
  });

  test('rounding noise is not treated as a conflict', () => {
    const resolved = resolveField([
      assertion({ value: 106, sourceKind: 'supplier_feed' }),
      assertion({ value: 106.4, sourceKind: 'website_scrape' }),
    ])!;
    assert.equal(resolved.dissenting.length, 0);
    assert.ok(valuesAgree(106, 106.4));
    assert.ok(!valuesAgree(106, 108));
  });

  test('an explicit manual resolution overrides source rank', () => {
    const scraped = assertion({ assertionId: 'scraped', value: 106, sourceKind: 'website_scrape' });
    const measured = assertion({ assertionId: 'measured', value: 108, sourceKind: 'physical_measurement' });
    const resolved = resolveField([scraped, measured], { preferredAssertionId: 'scraped' })!;
    assert.equal(resolved.value, 106);
  });

  test('an absent field stays absent rather than defaulting', () => {
    assert.equal(resolveField([]), undefined);
    assert.equal(resolveField([assertion({ value: '' })]), undefined);
  });

  test('resolveItem raises one open conflict per disagreeing field', () => {
    const { fields, conflicts } = resolveItem([
      assertion({ field: 'bottle.heightWithoutClosureMm', value: 106, sourceKind: 'website_scrape' }),
      assertion({ field: 'bottle.heightWithoutClosureMm', value: 108, sourceKind: 'physical_measurement' }),
      assertion({ field: 'bottle.nominalCapacityMl', value: 9, sourceKind: 'supplier_feed' }),
    ]);
    assert.equal(fields.size, 2);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].field, 'bottle.heightWithoutClosureMm');
    assert.equal(conflicts[0].status, 'open');
  });
});

/* -------------------------------------------------------- compatibility */

const item = (id: string, kind: CatalogItem['kind']): CatalogItem => ({
  catalogId: id,
  kind,
  displayName: id,
  slug: id.toLowerCase(),
  lifecycle: 'active',
  verification: 'unverified',
  identityAnchor: { sourceSystem: 'test', naturalKey: id },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('compatibility graph', () => {
  const bottle: BottleSpec = { catalogId: 'BOT1', neckFinish: parseNeckFinish('13-415') };
  const otherBottle: BottleSpec = { catalogId: 'BOT2', neckFinish: parseNeckFinish('18-415') };
  const cap: ClosureSpec = { catalogId: 'CAP1', neckFinish: parseNeckFinish('13-415'), closureKind: 'screw_cap' };

  const input = {
    containers: [
      { item: item('BOT1', 'bottle'), spec: bottle },
      { item: item('BOT2', 'bottle'), spec: otherBottle },
    ],
    closures: [{ item: item('CAP1', 'cap'), spec: cap }],
  };

  test('infers edges only where the neck finish actually mates', () => {
    const edges = inferNeckFinishEdges(input);
    assert.equal(edges.length, 1);
    assert.equal(edges[0].sourceCatalogId, 'BOT1');
    assert.equal(edges[0].targetCatalogId, 'CAP1');
  });

  test('never claims a rule-inferred edge is verified', () => {
    const edge = inferNeckFinishEdges(input)[0];
    assert.equal(edge.status, 'likely');
    assert.ok(edge.confidence <= INFERRED_CONFIDENCE);
    assert.match(edge.basis, /^rule:neck-finish-match/);
  });

  test('inference is idempotent', () => {
    const first = inferNeckFinishEdges(input);
    const second = inferNeckFinishEdges(input);
    assert.deepEqual(first.map((e) => e.relationshipId), second.map((e) => e.relationshipId));
    assert.equal(mergeEdges(first, second).length, 1);
  });

  test('rejects a verified edge with no verifier', () => {
    assert.throws(
      () => makeEdge({ sourceCatalogId: 'A', relation: 'compatible_with', targetCatalogId: 'B', status: 'verified', confidence: 1, basis: 'manual' }),
      /requires verifiedBy/,
    );
  });

  test('rejects a rule claiming more confidence than a rule may claim', () => {
    assert.throws(
      () => makeEdge({ sourceCatalogId: 'A', relation: 'compatible_with', targetCatalogId: 'B', status: 'likely', confidence: 0.95, basis: 'rule:neck' }),
      /Rule-inferred edges may not exceed/,
    );
  });

  test('re-inference never demotes a human verification', () => {
    const verified = makeEdge({
      sourceCatalogId: 'BOT1', relation: 'compatible_with', targetCatalogId: 'CAP1',
      status: 'verified', confidence: 1, basis: 'physical test', verifiedBy: 'warehouse',
    });
    const merged = mergeEdges([verified], inferNeckFinishEdges(input));
    assert.equal(merged.length, 1);
    assert.equal(merged[0].status, 'verified');
    assert.equal(merged[0].confidence, 1);
  });

  test('answers "what closures fit this bottle?"', () => {
    const edges = inferNeckFinishEdges(input);
    assert.deepEqual(closuresFor('BOT1', { edges }).map((e) => e.targetCatalogId), ['CAP1']);
    assert.deepEqual(closuresFor('BOT2', { edges }), []);
    assert.deepEqual(closuresFor('BOT1', { edges, minimumStatus: 'verified' }), [], 'likely must not pass a verified-only filter');
  });

  test('an unknown pairing warns, an explicit incompatibility errors', () => {
    const config = { catalogId: 'CFG1', displayName: 'c', containerId: 'BOT1', closureId: 'CAP1', componentIds: [], status: 'proposed' as const };

    const unknown = validateConfiguration(config, []);
    assert.equal(unknown.valid, true, 'missing knowledge must not read as failure');
    assert.equal(unknown.warnings.length, 1);

    const blocked = validateConfiguration(config, [
      makeEdge({ sourceCatalogId: 'BOT1', relation: 'incompatible_with', targetCatalogId: 'CAP1', status: 'incompatible', confidence: 0.9, basis: 'test', notes: 'skirt fouls the shoulder' }),
    ]);
    assert.equal(blocked.valid, false);
    assert.match(blocked.errors[0], /incompatible/);
  });

  test('a missing required component is an error', () => {
    const result = validateConfiguration(
      { catalogId: 'CFG2', displayName: 'c', containerId: 'BOT1', closureId: 'CAP1', componentIds: [], status: 'proposed' },
      [makeEdge({ sourceCatalogId: 'CAP1', relation: 'requires', targetCatalogId: 'LINER1', status: 'likely', confidence: 0.5, basis: 'spec' })],
    );
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /requires LINER1/);
  });
});

/* ----------------------------------------------------------- completeness */

describe('completeness', () => {
  const bare = { item: item('BB-BTL-AAAAAAAAAA', 'bottle') };

  test('reports what is missing, not just a score', () => {
    const result = scoreCompleteness(bare);
    assert.ok(result.score < 0.2);
    assert.ok(result.missingFields.includes('bottle.neckFinish'));
    assert.ok(result.missingFields.includes('media.hero'));
    assert.equal(result.productionReady, false);
    assert.ok(result.recommendedNextAction);
  });

  test('an unapproved image does not satisfy the hero-image requirement', () => {
    const withDraftImage = {
      ...bare,
      media: [{ assetId: 'x', catalogId: bare.item.catalogId, assetType: 'hero' as const, storageUrl: 'u', origin: 'photograph' as const, approved: false, version: 1 }],
    };
    assert.ok(scoreCompleteness(withDraftImage).missingFields.includes('media.hero'));
  });

  test('closure requirements do not apply to containers and vice versa', () => {
    const bottleGaps = scoreCompleteness(bare).missingFields;
    assert.ok(!bottleGaps.includes('closure.closureKind'));

    const capGaps = scoreCompleteness({ item: item('BB-CAP-AAAAAAAAAA', 'cap') }).missingFields;
    assert.ok(capGaps.includes('closure.closureKind'));
    assert.ok(!capGaps.includes('bottle.nominalCapacityMl'));
  });

  test('a likely-only compatibility satisfies "has a closure" but not "verified"', () => {
    const edges = [makeEdge({ sourceCatalogId: bare.item.catalogId, relation: 'compatible_with', targetCatalogId: 'CAP1', status: 'likely', confidence: 0.6, basis: 'rule:neck-finish-match:13-415' })];
    const gaps = scoreCompleteness({ ...bare, edges }).missingFields;
    assert.ok(!gaps.includes('compatibility.closure'));
    assert.ok(gaps.includes('compatibility.verified'));
  });

  test('health rolls gaps up across the catalog', () => {
    const health = summariseHealth([bare, { item: item('BB-CAP-BBBBBBBBBB', 'cap') }]);
    assert.equal(health.totalItems, 2);
    assert.equal(health.productionReady, 0);
    assert.equal(health.itemsMissingHeroImage, 2);
    assert.ok(health.missingByField.length > 0);
  });
});
