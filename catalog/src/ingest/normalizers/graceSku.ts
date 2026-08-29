/**
 * graceSku — the canonical hyphenated SKU used by the live Best Bottles site.
 *
 * The production storefront (a separate Next.js repo) keeps its catalog in
 * Convex `precise-raccoon-123`, where every product row carries two keys:
 *
 *   products.websiteSku   GBEmp50AnSpTslRed          shorthand, indexed lookup
 *   products.graceSku     GB-EMP-CLR-50ML-AST-RED    canonical, human readable
 *
 * `websiteSku` uses the same grammar as the legacy SKUs in this repository,
 * which is what makes the two catalogs joinable at all — see
 * `normalizers/sku.ts` and `docs/05-CONVEX.md`.
 *
 * Segment layout, from the documented examples:
 *
 *   GB - EMP - CLR - 50ML - AST - RED
 *   │    │     │     │      │     └── cap / trim colour code
 *   │    │     │     │      └──────── applicator code
 *   │    │     │     └─────────────── capacity + unit
 *   │    │     └───────────────────── glass colour code
 *   │    └─────────────────────────── family code
 *   └──────────────────────────────── type code (GB glass, LB lotion bottle)
 *
 * IMPORTANT — the confidence level of this module.
 *
 * The structure and the applicator codes below are taken from the
 * `madison-hero-sync` pipeline documentation, not from a Convex export: this
 * environment has no Convex credential and the storefront repo is not present.
 * So the parser is deliberately *structural*: it splits and validates the
 * shape, maps only the codes there is documented evidence for, and returns the
 * raw segment for everything else rather than inventing a meaning.
 *
 * `parseGraceSku` never guesses. Anything it cannot map surfaces in the
 * `unmapped` list, which is what the reconciliation report reads.
 */

import type { ItemKind } from '../../domain/ids.ts';
import type { ClosureKind } from '../../domain/vocab.ts';

/**
 * Applicator codes, with the closure kind each denotes.
 *
 * Source: the per-applicator preset routing matrix in the pipeline docs.
 * `SPR` and `FNM` are genuinely distinct closures (a perfume spray pump vs a
 * fine mist sprayer) even though the legacy grammar spells both `Spry` — see
 * `AMBIGUOUS_LEGACY_APPLICATORS` below.
 */
export const GRACE_APPLICATORS: Record<string, { label: string; closureKind: ClosureKind }> = {
  AST: { label: 'Bulb sprayer with tassel', closureKind: 'atomiser' },
  ASP: { label: 'Bulb sprayer', closureKind: 'atomiser' },
  SPR: { label: 'Perfume spray pump', closureKind: 'sprayer' },
  FNM: { label: 'Fine mist sprayer', closureKind: 'sprayer' },
  RDC: { label: 'Reducer', closureKind: 'reducer' },
  DRP: { label: 'Dropper', closureKind: 'dropper' },
  LPM: { label: 'Lotion pump', closureKind: 'pump' },
};

/**
 * Trim / cap finish codes documented as a fallback when the description parse
 * misses. `CPR` is deliberately mapped to a null trim: a monolithic copper
 * closure has no separate trim, and recording one would be a fabricated fact.
 */
export const GRACE_TRIM_CODES: Record<string, { finish: string | null; colour: string }> = {
  MSLV: { finish: 'Matte', colour: 'Silver' },
  MGLD: { finish: 'Matte', colour: 'Gold' },
  MBLK: { finish: 'Matte', colour: 'Black' },
  SSLV: { finish: 'Shiny', colour: 'Silver' },
  SGLD: { finish: 'Shiny', colour: 'Gold' },
  SBLK: { finish: 'Shiny', colour: 'Black' },
  CPR: { finish: null, colour: 'Copper' },
};

/** Type codes seen on graceSku, mapped to catalog item kinds. */
const GRACE_TYPE_KINDS: Record<string, ItemKind> = {
  GB: 'bottle',
  LB: 'bottle',
  CJ: 'jar',
  ALU: 'bottle',
};

/**
 * Legacy applicator tokens whose graceSku code cannot be determined from the
 * token alone. `Spry` maps to either SPR or FNM depending on the actual
 * closure fitted, and nothing in the legacy SKU distinguishes them.
 *
 * Reconciliation must resolve these against the Convex row, never by picking
 * one. Guessing here would silently mislabel every spray SKU in the catalog.
 */
export const AMBIGUOUS_LEGACY_APPLICATORS: Record<string, string[]> = {
  SPRY: ['SPR', 'FNM'],
  SPRAY: ['SPR', 'FNM'],
};

/**
 * Legacy applicator token -> graceSku applicator code, where the mapping is
 * unambiguous and evidenced by a documented websiteSku/graceSku pair.
 */
export const LEGACY_TO_GRACE_APPLICATOR: Record<string, string> = {
  ANSPTSL: 'AST', // GBEmp50AnSpTslRed -> GB-EMP-CLR-50ML-AST-RED
  ANSP: 'ASP',
  LTN: 'LPM', // LBEmp50LtnMtGl    -> LB-EMP-CLR-50ML-LPM-MGLD
  LOTIONPUMP: 'LPM',
  RDCR: 'RDC',
  DRP: 'DRP',
  BLKDRP: 'DRP',
  WHTDRP: 'DRP',
  BLKDROPPER: 'DRP',
  WHTDROPPER: 'DRP',
};

export interface ParsedGraceSku {
  raw: string;
  normalised: string;
  /** True only when the value has the expected six-segment shape. */
  wellFormed: boolean;
  typeCode?: string;
  kind?: ItemKind;
  familyCode?: string;
  colourCode?: string;
  capacityToken?: string;
  capacityMl?: number;
  applicatorCode?: string;
  applicatorLabel?: string;
  closureKind?: ClosureKind;
  capColourCode?: string;
  /** Trim finish + colour, when the cap colour code is a documented trim code. */
  trim?: { finish: string | null; colour: string };
  /** Segments this module recognised structurally but cannot interpret. */
  unmapped: string[];
}

const SEGMENT_COUNT = 6;

export function parseGraceSku(raw: string): ParsedGraceSku {
  const input = String(raw ?? '');
  const normalised = input.trim().toUpperCase();
  const base: ParsedGraceSku = { raw: input, normalised, wellFormed: false, unmapped: [] };
  if (!normalised) return base;

  const segments = normalised.split('-');
  if (segments.length !== SEGMENT_COUNT) {
    return { ...base, unmapped: [normalised] };
  }

  const [typeCode, familyCode, colourCode, capacityToken, applicatorCode, capColourCode] = segments;
  const unmapped: string[] = [];

  const kind = GRACE_TYPE_KINDS[typeCode];
  if (!kind) unmapped.push(`type:${typeCode}`);

  const applicator = GRACE_APPLICATORS[applicatorCode];
  if (!applicator) unmapped.push(`applicator:${applicatorCode}`);

  const trim = GRACE_TRIM_CODES[capColourCode];
  // A plain colour code such as RED or PNK is expected and is not "unmapped" —
  // it simply is not one of the finish-coded trim suffixes.

  return {
    ...base,
    wellFormed: true,
    typeCode,
    kind,
    familyCode,
    colourCode,
    capacityToken,
    capacityMl: parseCapacityToken(capacityToken),
    applicatorCode,
    applicatorLabel: applicator?.label,
    closureKind: applicator?.closureKind,
    capColourCode,
    trim,
    unmapped,
  };
}

/** `50ML` -> 50, `1OZ` -> 29.57. Returns undefined when the unit is absent. */
export function parseCapacityToken(token: string | undefined): number | undefined {
  if (!token) return undefined;
  const ml = /^([0-9]+(?:\.[0-9]+)?)ML$/.exec(token);
  if (ml) return Number(ml[1]);
  const oz = /^([0-9]+(?:\.[0-9]+)?)OZ$/.exec(token);
  if (oz) return Math.round(Number(oz[1]) * 29.5735295625 * 100) / 100;
  return undefined;
}

export type GraceApplicatorResolution =
  | { outcome: 'resolved'; code: string }
  | { outcome: 'ambiguous'; candidates: string[] }
  | { outcome: 'unknown' };

/**
 * Map a legacy applicator token onto a graceSku applicator code.
 *
 * Returns `ambiguous` rather than choosing when the legacy token cannot
 * distinguish two real closures (`Spry` -> SPR or FNM). Callers must resolve
 * an ambiguous result against the Convex row, not by picking a default.
 */
export function resolveGraceApplicator(legacyToken: string | undefined): GraceApplicatorResolution {
  if (!legacyToken) return { outcome: 'unknown' };
  const token = legacyToken.trim().toUpperCase();
  const ambiguous = AMBIGUOUS_LEGACY_APPLICATORS[token];
  if (ambiguous) return { outcome: 'ambiguous', candidates: ambiguous };
  const code = LEGACY_TO_GRACE_APPLICATOR[token];
  return code ? { outcome: 'resolved', code } : { outcome: 'unknown' };
}

/**
 * Parse a Convex dimension string such as `"110 ±2 mm"` or `"37 ±0.5 mm"`
 * into the catalog's canonical millimetre form.
 *
 * Convex stores dimensions as display strings with the tolerance baked in.
 * The catalog stores the magnitude and the tolerance as separate numbers, so
 * this is the boundary where that display format is decomposed. It reuses
 * `parseLength` so there is exactly one implementation of the rule.
 */
export { parseLength as parseConvexDimension } from '../../domain/units.ts';

/**
 * The six fields Convex's own `promptReadiness` block gates image generation
 * on, expressed as catalog field paths.
 *
 * Keeping these aligned matters: the storefront already refuses to generate
 * imagery for a SKU missing any of them, so an item the catalog calls complete
 * while Convex calls it blocked is a disagreement worth surfacing.
 */
export const CONVEX_PROMPT_READINESS_FIELDS = [
  'closure.closureKind', // applicator
  'closure.capStyle', // capStyle
  'closure.colourLabel', // capColor
  'bottle.heightWithoutClosureMm', // heightWithoutCap
  'bottle.heightWithClosureMm', // heightWithCap
  'bottle.diameterMm', // diameter
] as const;
