/**
 * Canonical measurement handling.
 *
 * Rule: the catalog stores exactly ONE canonical value per measurement, in a
 * fixed base unit. Imperial / alternate units are a *presentation* concern and
 * are derived on read. We never store both `height_mm` and `height_in`.
 *
 * Base units:
 *   length  -> millimetres (mm)
 *   volume  -> millilitres (ml)
 *   mass    -> grams (g)
 */

export type LengthUnit = 'mm' | 'cm' | 'in';
export type VolumeUnit = 'ml' | 'l' | 'oz' | 'floz';
export type MassUnit = 'g' | 'kg' | 'oz_wt' | 'lb';

const MM_PER: Record<LengthUnit, number> = { mm: 1, cm: 10, in: 25.4 };
const ML_PER: Record<VolumeUnit, number> = { ml: 1, l: 1000, oz: 29.5735295625, floz: 29.5735295625 };
const G_PER: Record<MassUnit, number> = { g: 1, kg: 1000, oz_wt: 28.349523125, lb: 453.59237 };

/** A measurement as stored: canonical magnitude + optional symmetric tolerance. */
export interface Measurement {
  /** Magnitude in the canonical base unit for its dimension. */
  value: number;
  /** Symmetric tolerance in the same base unit, e.g. 1 for "83 ±1 mm". Unknown => undefined. */
  tolerance?: number;
}

export const toMm = (value: number, from: LengthUnit): number => round(value * MM_PER[from], 4);
export const toMl = (value: number, from: VolumeUnit): number => round(value * ML_PER[from], 4);
export const toGrams = (value: number, from: MassUnit): number => round(value * G_PER[from], 4);

export const fromMm = (mm: number, to: LengthUnit): number => round(mm / MM_PER[to], 4);
export const fromMl = (ml: number, to: VolumeUnit): number => round(ml / ML_PER[to], 4);
export const fromGrams = (g: number, to: MassUnit): number => round(g / G_PER[to], 4);

export function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/**
 * Parse a free-text length such as "83 ±1 mm", "20 ±0.5mm", "106mm", "3.25 in",
 * "17mm". Returns undefined when nothing parseable is present — we never guess.
 */
export function parseLength(raw: unknown): Measurement | undefined {
  const text = cleanNumericText(raw);
  if (!text) return undefined;
  const m = /^([0-9]*\.?[0-9]+)\s*(?:(?:\+\/-|±)\s*([0-9]*\.?[0-9]+))?\s*(mm|millimet(?:er|re)s?|cm|centimet(?:er|re)s?|in|inch(?:es)?|")?$/i.exec(text);
  if (!m) return undefined;
  const unit = normaliseLengthUnit(m[3]);
  if (!unit) return undefined;
  const out: Measurement = { value: toMm(Number(m[1]), unit) };
  if (m[2] !== undefined) out.tolerance = toMm(Number(m[2]), unit);
  return out;
}

/**
 * Parse a free-text volume such as "9 ml (0.3 oz)", "9ml,", "100 ml,  ",
 * "1/3oz", "2 ounce", "0.14 oz". Millilitre readings win over ounce readings
 * because the source data states ml precisely and oz as a marketing rounding.
 */
export function parseVolumeMl(raw: unknown): number | undefined {
  const text = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw : '';
  if (!text.trim()) return undefined;

  const ml = /([0-9]*\.?[0-9]+)\s*(?:ml|millilit(?:er|re)s?)\b/i.exec(text);
  if (ml) return round(Number(ml[1]), 4);

  const ozFraction = /(?:^|[\s(])([0-9]+)\s*\/\s*([0-9]+)\s*(?:oz|ounces?)\b/i.exec(text);
  if (ozFraction) return toMl(Number(ozFraction[1]) / Number(ozFraction[2]), 'oz');

  const oz = /([0-9]*\.?[0-9]+)\s*(?:oz|ounces?)\b/i.exec(text);
  if (oz) return toMl(Number(oz[1]), 'oz');

  // A bare number is only meaningful where the caller already knows the unit.
  const bare = /^\s*([0-9]*\.?[0-9]+)\s*,?\s*$/.exec(text);
  if (bare) return round(Number(bare[1]), 4);

  return undefined;
}

/** Present a canonical millimetre value in both systems, for UI/feeds. */
export function displayLength(mm: number): { metric: string; imperial: string } {
  return { metric: `${round(mm, 2)} mm`, imperial: `${round(fromMm(mm, 'in'), 3)} in` };
}

/** Present a canonical millilitre value in both systems, for UI/feeds. */
export function displayVolume(ml: number): { metric: string; imperial: string } {
  return { metric: `${round(ml, 2)} ml`, imperial: `${round(fromMl(ml, 'floz'), 2)} fl oz` };
}

function normaliseLengthUnit(unit: string | undefined): LengthUnit | undefined {
  if (!unit) return undefined;
  const u = unit.toLowerCase();
  if (u.startsWith('mm') || u.startsWith('millim')) return 'mm';
  if (u.startsWith('cm') || u.startsWith('centim')) return 'cm';
  if (u === 'in' || u === '"' || u.startsWith('inch')) return 'in';
  return undefined;
}

function cleanNumericText(raw: unknown): string {
  if (typeof raw === 'number') return String(raw);
  if (typeof raw !== 'string') return '';
  return raw.replace(/\u00a0/g, ' ').trim();
}
