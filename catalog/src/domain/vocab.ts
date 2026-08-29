/**
 * Governed vocabularies.
 *
 * Domain-critical values (material, finish, colour, closure type, neck finish,
 * use case) are typed enums with an explicit alias table, NOT free strings.
 * The alias tables exist because the legacy sources spell the same fact many
 * ways - `clear glass` / `Clear glass` / `Clear Glass` / `glass`, or
 * `Blk` / `ShnBlk` / `BlkSh` / `Black` for a cap colour.
 *
 * Every resolver returns `undefined` rather than a guess when it cannot map a
 * value. Unmapped values are surfaced by the ingestion report so the vocabulary
 * grows deliberately instead of silently absorbing noise.
 */

export type Material =
  | 'glass'
  | 'aluminium'
  | 'steel'
  | 'plastic'
  | 'polypropylene'
  | 'polyethylene'
  | 'phenolic'
  | 'bakelite'
  | 'wood'
  | 'leather'
  | 'rubber'
  | 'paper'
  | 'unknown';

export type GlassColour =
  | 'flint'
  | 'amber'
  | 'cobalt'
  | 'green'
  | 'black'
  | 'white'
  | 'pink'
  | 'lavender'
  | 'red'
  | 'unknown';

export type Finish = 'clear' | 'frosted' | 'matte' | 'shiny' | 'polished' | 'brushed' | 'coated' | 'unknown';

export type ClosureKind =
  | 'screw_cap'
  | 'roller_ball'
  | 'sprayer'
  | 'atomiser'
  | 'pump'
  | 'dropper'
  | 'reducer'
  | 'plug'
  | 'stopper'
  | 'tassel'
  | 'keychain'
  | 'unknown';

export type UseCase =
  | 'perfume_oil'
  | 'attar'
  | 'essential_oil'
  | 'fragrance_sample'
  | 'tincture'
  | 'serum'
  | 'cosmetic_oil'
  | 'beard_oil'
  | 'aromatherapy'
  | 'body_oil'
  | 'lotion'
  | 'luxury_packaging'
  | 'travel'
  | 'gifting'
  | 'wholesale';

export type UseCaseFit = 'recommended' | 'acceptable' | 'conditional' | 'not_recommended';

/** Where a value came from, used to weight conflicts. Order matters: see SOURCE_RANK. */
export type SourceKind =
  | 'physical_measurement'
  | 'manufacturer_spec'
  | 'supplier_feed'
  | 'employee_verification'
  | 'internal_spreadsheet'
  | 'legacy_database'
  | 'shopify'
  | 'website_scrape'
  | 'image_filename'
  | 'customer_feedback'
  | 'ai_inference';

/**
 * Default precedence when two sources disagree and no manual resolution exists.
 * Higher wins. This is a *default*, not a decision: the disagreement is still
 * recorded as a conflict for a human to resolve.
 */
export const SOURCE_RANK: Record<SourceKind, number> = {
  physical_measurement: 100,
  employee_verification: 90,
  manufacturer_spec: 80,
  supplier_feed: 70,
  shopify: 60,
  internal_spreadsheet: 50,
  legacy_database: 40,
  website_scrape: 30,
  image_filename: 20,
  customer_feedback: 10,
  ai_inference: 0,
};

type AliasTable<T extends string> = ReadonlyArray<readonly [T, readonly string[]]>;

const MATERIAL_ALIASES: AliasTable<Material> = [
  ['glass', ['glass', 'clear glass', 'flint glass', 'frosted glass', 'amber glass', 'cobalt glass', 'cobalt blue glass', 'blue glass', 'green glass', 'black glass', 'white glass', 'coloured glass', 'colored glass', 'gb']],
  ['aluminium', ['aluminium', 'aluminum', 'alu', 'anodised aluminium', 'anodized aluminum']],
  ['steel', ['steel', 'stainless steel', 'metal', 'metal roller', 'stainless']],
  ['plastic', ['plastic', 'pp/pe', 'acrylic', 'pet', 'petg', 'lb']],
  ['polypropylene', ['polypropylene', 'pp']],
  ['polyethylene', ['polyethylene', 'pe', 'ldpe', 'hdpe']],
  ['phenolic', ['phenolic', 'phenolic resin']],
  ['bakelite', ['bakelite']],
  ['wood', ['wood', 'wooden', 'bamboo']],
  ['leather', ['leather', 'leatherette', 'faux leather']],
  ['rubber', ['rubber', 'nitrile', 'silicone']],
  ['paper', ['paper', 'card', 'cardboard', 'kraft']],
];

const GLASS_COLOUR_ALIASES: AliasTable<GlassColour> = [
  ['flint', ['clear', 'clr', 'flint', 'transparent', 'clear glass', 'frosted', 'frst', 'frosted glass']],
  ['amber', ['amber', 'amb', 'amber glass', 'brown']],
  ['cobalt', ['cobalt', 'cobalt blue', 'blue', 'blu', 'cobalt blue glass', 'blue glass']],
  ['green', ['green', 'grn', 'green glass']],
  ['black', ['black', 'blk', 'black glass']],
  ['white', ['white', 'wht', 'opal', 'milk', 'white glass']],
  ['pink', ['pink', 'pnk', 'rose']],
  ['lavender', ['lavender', 'lvn', 'lilac', 'purple']],
  ['red', ['red', 'ruby']],
];

const FINISH_ALIASES: AliasTable<Finish> = [
  ['clear', ['clear', 'clr', 'transparent', 'plain', 'gloss clear']],
  ['frosted', ['frosted', 'frst', 'frost', 'satin etch', 'etched']],
  ['matte', ['matte', 'matt', 'mt', 'mat', 'matte finish']],
  ['shiny', ['shiny', 'shn', 'sh', 'gloss', 'glossy', 'shine']],
  ['polished', ['polished', 'polish', 'mirror']],
  ['brushed', ['brushed', 'brush', 'satin']],
  ['coated', ['coated', 'coating', 'painted', 'sprayed', 'uv coated']],
];

const CLOSURE_ALIASES: AliasTable<ClosureKind> = [
  ['screw_cap', ['cap', 'screw cap', 'screw-cap', 'screwcap', 'blkcap', 'whtcap', 'blackcapsht', 'whtcapsht', 'overcap', 'cp']],
  ['roller_ball', ['roll', 'rollon', 'roll-on', 'roll on', 'roller', 'rollerball', 'roller ball', 'mtlroll', 'mtlrollon', 'metal roller', 'plastic roller']],
  ['sprayer', ['spry', 'spray', 'sprayer', 'spray pump', 'fine mist sprayer', 'mist']],
  ['atomiser', ['ansp', 'atomizer', 'atomiser', 'anspttsl', 'ansptsl', 'atomiser spray']],
  ['pump', ['pump', 'ltn', 'lotion', 'lotion pump', 'lotionpump', 'treatment pump']],
  ['dropper', ['drp', 'dropper', 'blkdropper', 'whtdropper', 'blkdrp', 'whtdrp', 'glass dropper', 'pipette']],
  ['reducer', ['rdcr', 'reducer', 'orifice reducer', 'orifice', 'insert']],
  ['plug', ['plug', 'pl', 'push plug']],
  ['stopper', ['stopper', 'glass stopper', 'ground glass stopper']],
  ['tassel', ['tsl', 'tassel']],
  ['keychain', ['key', 'keychain', 'key chain', 'keyring']],
];

const USE_CASE_ALIASES: AliasTable<UseCase> = [
  ['perfume_oil', ['perfume', 'perfume oil', 'fragrance', 'fragrance oil', 'parfum']],
  ['attar', ['attar', 'oud', 'ittar']],
  ['essential_oil', ['essential oil', 'essential oils', 'aromatic oil', 'aromatic oils']],
  ['fragrance_sample', ['sample', 'samples', 'fragrance sample', 'tester', 'decant']],
  ['tincture', ['tincture', 'tinctures', 'herbal extract']],
  ['serum', ['serum', 'serums', 'face serum']],
  ['cosmetic_oil', ['cosmetic oil', 'cosmetics', 'facial oil']],
  ['beard_oil', ['beard oil', 'beard']],
  ['aromatherapy', ['aromatherapy', 'diffuser', 'aroma']],
  ['body_oil', ['body oil', 'body oils', 'massage oil']],
  ['lotion', ['lotion', 'thin lotions', 'thin lotions and ointments', 'ointment', 'ointments', 'cream']],
  ['luxury_packaging', ['luxury packaging', 'luxury', 'premium packaging']],
  ['travel', ['travel', 'travel size', 'purse spray', 'pocket']],
  ['gifting', ['gift', 'gifts', 'gifting', 'wedding favor', 'wedding favour', 'party favor', 'party favour', 'promotions']],
  ['wholesale', ['wholesale', 'bulk', 'trade']],
];

export const resolveMaterial = buildResolver(MATERIAL_ALIASES);
export const resolveGlassColour = buildResolver(GLASS_COLOUR_ALIASES);
export const resolveFinish = buildResolver(FINISH_ALIASES);
export const resolveClosureKind = buildResolver(CLOSURE_ALIASES);
export const resolveUseCase = buildResolver(USE_CASE_ALIASES);

/**
 * Neck finishes are a compatibility signal, so they get strict parsing rather
 * than an alias table. A GPI-style finish is `<diameter>-<finish series>`,
 * e.g. `18-415`. Bare millimetre necks (`17mm`, `14.3mm`) are also real, and
 * are kept as a distinct shape so a rule engine never confuses `17mm` with
 * `17-415`. Category labels that leaked into the legacy neck column
 * ("Apothecary", "Jars", "Vials", "Decorative Hearts") are rejected.
 */
export type NeckFinish =
  | { style: 'gpi'; diameterMm: number; series: string; code: string }
  | { style: 'metric'; diameterMm: number; code: string }
  | { style: 'special'; code: string };

const SPECIAL_NECKS = new Set(['ground glass', 'ground glass neck with glass stopper', 'ground glass neck']);
const NON_NECK_LABELS = new Set([
  'apothecary', 'jars', 'vials', 'decorative hearts', 'aluminum', 'aluminium',
  '5ml elegant', '13-415 atomizers', 'none', 'n/a', '', '0',
]);

export function parseNeckFinish(raw: unknown): NeckFinish | undefined {
  if (typeof raw !== 'string') return undefined;
  const text = raw.trim().toLowerCase();
  if (NON_NECK_LABELS.has(text)) return undefined;
  if (SPECIAL_NECKS.has(text)) return { style: 'special', code: 'ground-glass' };

  const gpi = /^([0-9]{1,2})\s*[-/]\s*([0-9]{3})$/.exec(text);
  if (gpi) {
    return { style: 'gpi', diameterMm: Number(gpi[1]), series: gpi[2], code: `${gpi[1]}-${gpi[2]}` };
  }

  const metric = /^([0-9]{1,2}(?:\.[0-9])?)\s*mm$/.exec(text);
  if (metric) {
    return { style: 'metric', diameterMm: Number(metric[1]), code: `${metric[1]}mm` };
  }

  return undefined;
}

/**
 * Two necks thread together only when the style, diameter and (for GPI)
 * finish series all agree. Deliberately strict: `18-415` and `18-400` share a
 * diameter but a different thread profile, and a `17mm` snap neck is not a
 * `17-415` screw neck.
 */
export function neckFinishesMate(a: NeckFinish | undefined, b: NeckFinish | undefined): boolean {
  if (!a || !b) return false;
  if (a.style !== b.style) return false;
  if (a.style === 'gpi' && b.style === 'gpi') return a.diameterMm === b.diameterMm && a.series === b.series;
  if (a.style === 'metric' && b.style === 'metric') return a.diameterMm === b.diameterMm;
  return a.code === b.code;
}

function buildResolver<T extends string>(table: AliasTable<T>): (raw: unknown) => T | undefined {
  const index = new Map<string, T>();
  for (const [value, aliases] of table) {
    index.set(value, value);
    for (const alias of aliases) index.set(alias, value);
  }
  return (raw: unknown): T | undefined => {
    if (typeof raw !== 'string') return undefined;
    const key = raw.trim().toLowerCase().replace(/[\s_]+/g, ' ');
    return index.get(key);
  };
}
