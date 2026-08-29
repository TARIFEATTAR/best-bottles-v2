/**
 * Best Bottles SKU grammar.
 *
 * Legacy SKUs are attribute-encoded, e.g.
 *
 *   GBCylAmb5RollMtlBlkSh
 *   |  |  |  | |   |  |
 *   |  |  |  | |   |  +-- cap finish        Sh   = shiny
 *   |  |  |  | |   +----- cap colour        Blk  = black
 *   |  |  |  | +--------- fitment material  Mtl  = metal
 *   |  |  |  +----------- applicator        Roll = roller ball
 *   |  |  +-------------- capacity          5    = 5 ml
 *   |  +----------------- glass colour      Amb  = amber (absent => flint/clear)
 *   +-------------------- family            GBCyl = glass bottle, cylinder
 *
 * We decode it because two of the four legacy sources carry only the SKU, with
 * no decomposed columns - decoding is what lets a scrape row and a spreadsheet
 * row resolve to the same catalog item.
 *
 * Everything here is a *claim*, not a fact: decoded values enter the pipeline as
 * low-confidence `image_filename`-class assertions and lose to any real source.
 */

import type { ItemKind } from '../../domain/ids.ts';

export interface DecodedSku {
  raw: string;
  /** Uppercased, whitespace-stripped form used for matching. */
  normalised: string;
  kind: ItemKind | 'unknown';
  typeCode?: string;
  family?: string;
  shape?: string;
  colourToken?: string;
  capacityToken?: string;
  capacityMl?: number;
  applicatorToken?: string;
  capToken?: string;
  neckFinishToken?: string;
  /** Tokens the grammar could not account for. Non-empty => review. */
  unparsed: string[];
}

/** Family token -> human shape. Extend deliberately; unknown families are reported. */
const FAMILY_SHAPES: Record<string, string> = {
  CYL: 'Cylinder', TALLCYL: 'Tall cylinder', ELG: 'Elegant', DIVA: 'Diva', CRCL: 'Circle',
  RND: 'Round', BSTN: 'Boston round', SLK: 'Sleek', SLEEK: 'Sleek', SLM: 'Slim', EMP: 'Empire',
  TULIP: 'Tulip', RECT: 'Rectangle', TALLRECT: 'Tall rectangle', DMND: 'Diamond', GRCE: 'Grace',
  BELL: 'Bell', QUEEN: 'Queen', ROYAL: 'Royal', FLAIR: 'Flair', SQR: 'Square', DAISY: 'Daisy',
  HEART: 'Heart', APOTH: 'Apothecary', OCT: 'Octagonal', VIAL: 'Vial',
};

const COLOUR_TOKENS = ['AMB', 'FRST', 'CLR', 'CLEAR', 'BLU', 'BLUE', 'BLK', 'BLACK', 'WHT', 'WHITE', 'GREEN', 'GRN', 'PNK', 'PINK', 'LVN'];

const APPLICATOR_TOKENS = [
  'MTLROLLON', 'MTLROLL', 'ROLLON', 'ROLL', 'ANSPTSL', 'ANSP', 'SPRY', 'SPRAY',
  'LOTIONPUMP', 'LTN', 'RDCR', 'BLKDROPPER', 'WHTDROPPER', 'BLKDRP', 'WHTDRP', 'DRP',
  'TSL', 'KEY', 'BLACKCAPSHT', 'WHTCAPSHT', 'BLKCAP', 'WHTCAP',
];

/** Applicator token -> the closure kind it denotes, for CP-prefixed part SKUs. */
const APPLICATOR_KIND: Record<string, ItemKind> = {
  MTLROLLON: 'rollerball', MTLROLL: 'rollerball', ROLLON: 'rollerball', ROLL: 'rollerball',
  SPRY: 'sprayer', SPRAY: 'sprayer', ANSP: 'sprayer', ANSPTSL: 'sprayer',
  LTN: 'pump', LOTIONPUMP: 'pump', RDCR: 'reducer',
  DRP: 'dropper', BLKDRP: 'dropper', WHTDRP: 'dropper', BLKDROPPER: 'dropper', WHTDROPPER: 'dropper',
  TSL: 'accessory', KEY: 'accessory',
};

const PACKAGING_PATTERNS = [/^BOX/i, /^BAG/i, /^RECLOSEABLE/i, /^POUCH/i, /^TRAY/i, /^CARTON/i, /^LABEL/i];
const ACCESSORY_PATTERNS = [/^FUNNEL/i, /^PIPETTE/i, /^PLASTIC ?FUNNEL/i, /^SYRINGE/i, /^DISPLAY/i];

export function decodeSku(rawInput: string): DecodedSku {
  const raw = String(rawInput ?? '');
  const normalised = raw.trim().replace(/\s+/g, '').toUpperCase();
  const base: DecodedSku = { raw, normalised, kind: 'unknown', unparsed: [] };
  if (!normalised) return base;

  for (const pattern of PACKAGING_PATTERNS) if (pattern.test(normalised)) return { ...base, kind: 'packaging' };
  for (const pattern of ACCESSORY_PATTERNS) if (pattern.test(normalised)) return { ...base, kind: 'accessory' };

  // Closure parts: CP<neck><applicator?><cap descriptor>, e.g. CPRoll13-415BlackDot
  if (normalised.startsWith('CP')) return decodeClosurePart(base, normalised);

  if (normalised.startsWith('CREAMJAR')) {
    const rest = normalised.slice('CREAMJAR'.length);
    const capacity = /([0-9]+)/.exec(rest);
    return {
      ...base,
      kind: 'jar',
      typeCode: 'CJ',
      family: 'CreamJar',
      shape: 'Cream jar',
      capacityToken: capacity?.[1],
      capacityMl: capacity ? Number(capacity[1]) : undefined,
      colourToken: matchToken(rest, COLOUR_TOKENS),
    };
  }

  if (normalised.startsWith('ALU')) {
    const rest = normalised.slice(3);
    const capacity = /^([0-9]+)(?:ML)?/.exec(rest);
    return {
      ...base,
      kind: 'bottle',
      typeCode: 'ALU',
      family: 'Alu',
      shape: 'Cylinder',
      capacityToken: capacity?.[1],
      capacityMl: capacity ? Number(capacity[1]) : undefined,
      applicatorToken: matchToken(rest, APPLICATOR_TOKENS),
    };
  }

  const typed = /^(GB|LB)(.*)$/.exec(normalised);
  if (!typed) return { ...base, unparsed: [normalised] };

  const typeCode = typed[1];
  let rest = typed[2];

  const family = matchPrefix(rest, Object.keys(FAMILY_SHAPES));
  if (family) rest = rest.slice(family.length);

  const colourToken = matchPrefix(rest, COLOUR_TOKENS);
  if (colourToken) rest = rest.slice(colourToken.length);

  const capacity = /^([0-9]+)(OZ)?/.exec(rest);
  let capacityMl: number | undefined;
  if (capacity) {
    rest = rest.slice(capacity[0].length);
    // "2oz" means ounces; a bare number in this grammar means millilitres.
    capacityMl = capacity[2] ? Math.round(Number(capacity[1]) * 29.5735295625 * 100) / 100 : Number(capacity[1]);
  }

  const applicatorToken = matchPrefix(rest, APPLICATOR_TOKENS);
  if (applicatorToken) rest = rest.slice(applicatorToken.length);

  const capToken = rest || undefined;

  return {
    ...base,
    kind: family === 'VIAL' ? 'vial' : 'bottle',
    typeCode,
    family: family ? `${typeCode}${titleCase(family)}` : undefined,
    shape: family ? FAMILY_SHAPES[family] : undefined,
    colourToken,
    capacityToken: capacity?.[0],
    capacityMl,
    applicatorToken,
    capToken,
    unparsed: family ? [] : [typed[2]],
  };
}

function decodeClosurePart(base: DecodedSku, normalised: string): DecodedSku {
  let rest = normalised.slice(2);
  const applicatorToken = matchPrefix(rest, APPLICATOR_TOKENS);
  if (applicatorToken) rest = rest.slice(applicatorToken.length);

  const neck = /^([0-9]{1,2}-[0-9]{3})/.exec(rest);
  if (neck) rest = rest.slice(neck[0].length);

  const trailingApplicator = applicatorToken ? undefined : matchPrefix(rest, APPLICATOR_TOKENS);
  if (trailingApplicator) rest = rest.slice(trailingApplicator.length);

  const token = applicatorToken ?? trailingApplicator;
  return {
    ...base,
    kind: token ? (APPLICATOR_KIND[token] ?? 'cap') : 'cap',
    typeCode: 'CP',
    applicatorToken: token,
    neckFinishToken: neck?.[1],
    capToken: rest || undefined,
    unparsed: neck ? [] : [normalised],
  };
}

/** Longest-first prefix match, so ROLLON wins over ROLL and MTLROLLON over MTLROLL. */
function matchPrefix(text: string, candidates: string[]): string | undefined {
  let best: string | undefined;
  for (const candidate of candidates) {
    if (text.startsWith(candidate) && (!best || candidate.length > best.length)) best = candidate;
  }
  return best;
}

function matchToken(text: string, candidates: string[]): string | undefined {
  let best: string | undefined;
  for (const candidate of candidates) {
    if (text.includes(candidate) && (!best || candidate.length > best.length)) best = candidate;
  }
  return best;
}

function titleCase(token: string): string {
  return token.charAt(0) + token.slice(1).toLowerCase();
}
