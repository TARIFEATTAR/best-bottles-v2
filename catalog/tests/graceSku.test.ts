import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  AMBIGUOUS_LEGACY_APPLICATORS,
  CONVEX_PROMPT_READINESS_FIELDS,
  GRACE_APPLICATORS,
  GRACE_TRIM_CODES,
  parseCapacityToken,
  parseConvexDimension,
  parseGraceSku,
  resolveGraceApplicator,
} from '../src/ingest/normalizers/graceSku.ts';
import { decodeSku } from '../src/ingest/normalizers/sku.ts';
import { normaliseSku } from '../src/ingest/matching.ts';

describe('graceSku parsing', () => {
  test('decomposes the documented storefront example', () => {
    const g = parseGraceSku('GB-EMP-CLR-50ML-AST-RED');
    assert.equal(g.wellFormed, true);
    assert.equal(g.typeCode, 'GB');
    assert.equal(g.kind, 'bottle');
    assert.equal(g.familyCode, 'EMP');
    assert.equal(g.colourCode, 'CLR');
    assert.equal(g.capacityMl, 50);
    assert.equal(g.applicatorCode, 'AST');
    assert.equal(g.closureKind, 'atomiser');
    assert.equal(g.capColourCode, 'RED');
    assert.deepEqual(g.unmapped, []);
  });

  test('decomposes the documented lotion-pump example', () => {
    const g = parseGraceSku('LB-EMP-CLR-50ML-LPM-MGLD');
    assert.equal(g.applicatorCode, 'LPM');
    assert.equal(g.closureKind, 'pump');
    assert.deepEqual(g.trim, { finish: 'Matte', colour: 'Gold' });
  });

  test('is case and whitespace insensitive', () => {
    assert.equal(parseGraceSku(' gb-emp-clr-50ml-ast-red ').normalised, 'GB-EMP-CLR-50ML-AST-RED');
  });

  test('rejects a value that is not six segments rather than half-parsing it', () => {
    for (const bad of ['GB-EMP-CLR-50ML-AST', 'GB-EMP-CLR-50ML-AST-RED-EXTRA', 'GBEmp50AnSpTslRed']) {
      const g = parseGraceSku(bad);
      assert.equal(g.wellFormed, false, bad);
      assert.equal(g.applicatorCode, undefined);
      assert.ok(g.unmapped.length > 0);
    }
  });

  test('reports an unrecognised applicator instead of inventing one', () => {
    const g = parseGraceSku('GB-EMP-CLR-50ML-ZZZ-RED');
    assert.equal(g.wellFormed, true);
    assert.equal(g.applicatorCode, 'ZZZ');
    assert.equal(g.closureKind, undefined, 'must not guess a closure kind');
    assert.ok(g.unmapped.includes('applicator:ZZZ'));
  });

  test('a plain colour code is not treated as a missing trim code', () => {
    const g = parseGraceSku('GB-EMP-CLR-50ML-AST-PNK');
    assert.equal(g.trim, undefined);
    assert.deepEqual(g.unmapped, [], 'PNK is a colour, not an unmapped value');
  });

  test('copper records no separate trim rather than a fabricated one', () => {
    assert.equal(GRACE_TRIM_CODES.CPR.finish, null);
  });

  test('parses capacity tokens, and refuses a unitless one', () => {
    assert.equal(parseCapacityToken('50ML'), 50);
    assert.equal(parseCapacityToken('9ML'), 9);
    assert.equal(parseCapacityToken('1OZ'), 29.57);
    assert.equal(parseCapacityToken('50'), undefined);
    assert.equal(parseCapacityToken(undefined), undefined);
  });

  test('every documented applicator maps to a real closure kind', () => {
    for (const [code, entry] of Object.entries(GRACE_APPLICATORS)) {
      assert.ok(entry.closureKind, code);
      assert.ok(entry.label.length > 0, code);
    }
  });
});

describe('legacy SKU to graceSku applicator resolution', () => {
  test('resolves the pairs with documented evidence', () => {
    assert.deepEqual(resolveGraceApplicator('AnSpTsl'), { outcome: 'resolved', code: 'AST' });
    assert.deepEqual(resolveGraceApplicator('Ltn'), { outcome: 'resolved', code: 'LPM' });
    assert.deepEqual(resolveGraceApplicator('Rdcr'), { outcome: 'resolved', code: 'RDC' });
  });

  test('refuses to choose between a spray pump and a fine mist sprayer', () => {
    // The legacy grammar spells both `Spry`. Picking one would silently
    // mislabel every spray SKU in the catalog.
    const result = resolveGraceApplicator('Spry');
    assert.equal(result.outcome, 'ambiguous');
    assert.deepEqual(result.outcome === 'ambiguous' && result.candidates, ['SPR', 'FNM']);
    assert.deepEqual(AMBIGUOUS_LEGACY_APPLICATORS.SPRY, ['SPR', 'FNM']);
  });

  test('reports unknown rather than falling back to a default', () => {
    assert.deepEqual(resolveGraceApplicator('Wibble'), { outcome: 'unknown' });
    assert.deepEqual(resolveGraceApplicator(undefined), { outcome: 'unknown' });
  });
});

describe('joining this catalog to the storefront catalog', () => {
  test('websiteSku uses the same grammar this repo decodes, which is the join key', () => {
    // Documented storefront pair: GBEmp50AnSpTslRed <-> GB-EMP-CLR-50ML-AST-RED
    const legacy = decodeSku('GBEmp50AnSpTslRed');
    const grace = parseGraceSku('GB-EMP-CLR-50ML-AST-RED');

    assert.equal(legacy.kind, 'bottle');
    assert.equal(legacy.typeCode, grace.typeCode);
    assert.equal(legacy.capacityMl, grace.capacityMl);
    assert.equal(legacy.shape, 'Empire');
    assert.equal(
      resolveGraceApplicator(legacy.applicatorToken).outcome === 'resolved' &&
        (resolveGraceApplicator(legacy.applicatorToken) as { code: string }).code,
      grace.applicatorCode,
    );
  });

  test('the second documented pair agrees on type and capacity', () => {
    const legacy = decodeSku('LBEmp50LtnMtGl');
    const grace = parseGraceSku('LB-EMP-CLR-50ML-LPM-MGLD');
    assert.equal(legacy.typeCode, grace.typeCode);
    assert.equal(legacy.capacityMl, grace.capacityMl);
    assert.deepEqual(resolveGraceApplicator(legacy.applicatorToken), { outcome: 'resolved', code: 'LPM' });
  });

  test('websiteSku normalises identically on both sides of the join', () => {
    assert.equal(normaliseSku(' gbemp50anspTslred '), normaliseSku('GBEmp50AnSpTslRed'));
  });
});

describe('Convex dimension strings', () => {
  test('decomposes the storefront display format into magnitude and tolerance', () => {
    assert.deepEqual(parseConvexDimension('110 ±2 mm'), { value: 110, tolerance: 2 });
    assert.deepEqual(parseConvexDimension('88 ±1 mm'), { value: 88, tolerance: 1 });
    assert.deepEqual(parseConvexDimension('37 ±0.5 mm'), { value: 37, tolerance: 0.5 });
  });

  test('refuses a value with no stated unit', () => {
    assert.equal(parseConvexDimension('110'), undefined);
    assert.equal(parseConvexDimension(''), undefined);
  });
});

describe('prompt readiness alignment', () => {
  test('names the six fields the storefront gates image generation on', () => {
    assert.equal(CONVEX_PROMPT_READINESS_FIELDS.length, 6);
    for (const field of CONVEX_PROMPT_READINESS_FIELDS) {
      assert.match(field, /^(bottle|closure)\./, field);
    }
    assert.ok(CONVEX_PROMPT_READINESS_FIELDS.includes('bottle.heightWithClosureMm'));
    assert.ok(CONVEX_PROMPT_READINESS_FIELDS.includes('bottle.diameterMm'));
  });
});
