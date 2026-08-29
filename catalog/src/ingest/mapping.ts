/**
 * Reusable field-mapping profiles.
 *
 * Supplier A writes "Bottle Height", supplier B writes "Height", supplier C
 * writes "H (mm)". None of that should require new import code - it requires a
 * mapping profile. A profile declares, per canonical field, which source
 * headers may carry it and how to coerce the raw cell.
 *
 * Header matching is case-, space- and punctuation-insensitive, so
 * "Height (mm)", "height_mm" and "HEIGHT MM" all hit the same rule.
 */

import { parseLength, parseVolumeMl, type Measurement } from '../domain/units.ts';
import {
  parseNeckFinish,
  resolveClosureKind,
  resolveFinish,
  resolveGlassColour,
  resolveMaterial,
  type NeckFinish,
} from '../domain/vocab.ts';

export type CoercedValue = string | number | boolean | Measurement | NeckFinish | undefined;

export interface FieldRule {
  /** Canonical dotted field path, e.g. 'bottle.heightWithoutClosureMm'. */
  field: string;
  /** Source headers that may carry this field, in priority order. */
  headers: string[];
  coerce: (raw: unknown) => CoercedValue;
  /** Confidence for assertions produced by this rule, 0..1. */
  confidence?: number;
}

export interface MappingProfile {
  id: string;
  label: string;
  rules: FieldRule[];
}

export const asText = (raw: unknown): CoercedValue => {
  if (raw === null || raw === undefined) return undefined;
  const text = String(raw).trim();
  return text === '' || text.toLowerCase() === 'none' || text.toLowerCase() === 'n/a' ? undefined : text;
};

export const asNumber = (raw: unknown): CoercedValue => {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const cleaned = String(raw).replace(/[$,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export const asInteger = (raw: unknown): CoercedValue => {
  const n = asNumber(raw);
  return typeof n === 'number' ? Math.round(n) : undefined;
};

export const asMilligramsFreeVolume = (raw: unknown): CoercedValue => parseVolumeMl(raw);
export const asMillimetres = (raw: unknown): CoercedValue => parseLength(raw);
export const asNeckFinish = (raw: unknown): CoercedValue => parseNeckFinish(raw);
export const asMaterial = (raw: unknown): CoercedValue => resolveMaterial(raw);
export const asGlassColour = (raw: unknown): CoercedValue => resolveGlassColour(raw);
export const asFinish = (raw: unknown): CoercedValue => resolveFinish(raw);
export const asClosureKind = (raw: unknown): CoercedValue => resolveClosureKind(raw);

/** "$2.80" -> 2.8; "1200pc @ $0.86" -> 0.86 (the unit price, not the break). */
export const asPrice = (raw: unknown): CoercedValue => {
  if (raw === null || raw === undefined) return undefined;
  const m = /\$\s*([0-9]+(?:\.[0-9]+)?)/.exec(String(raw));
  if (m) return Number(m[1]);
  return asNumber(raw);
};

/** "2500pc @ $2.30" -> { minQuantity: 2500, unitPrice: 2.3 } */
export function parsePriceBreak(raw: unknown): { minQuantity: number; unitPrice: number } | undefined {
  if (typeof raw !== 'string') return undefined;
  const m = /([0-9][0-9,]*)\s*(?:pc|pcs|pieces)?\s*@\s*\$?\s*([0-9]+(?:\.[0-9]+)?)/i.exec(raw);
  if (!m) return undefined;
  return { minQuantity: Number(m[1].replace(/,/g, '')), unitPrice: Number(m[2]) };
}

const normaliseHeader = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

export interface MappedField {
  field: string;
  value: Exclude<CoercedValue, undefined>;
  /** The source header the value came from, for the assertion locator. */
  sourceHeader: string;
  confidence: number;
}

/**
 * Apply a profile to one source row. Headers absent from the row are skipped
 * silently; headers present but uncoercible are reported so a bad mapping is
 * visible rather than quietly dropping data.
 */
export function applyProfile(
  profile: MappingProfile,
  row: Record<string, unknown>,
): { mapped: MappedField[]; uncoercible: Array<{ field: string; header: string; raw: unknown }> } {
  const index = new Map<string, { key: string; value: unknown }>();
  for (const [key, value] of Object.entries(row)) index.set(normaliseHeader(key), { key, value });

  const mapped: MappedField[] = [];
  const uncoercible: Array<{ field: string; header: string; raw: unknown }> = [];

  for (const rule of profile.rules) {
    for (const header of rule.headers) {
      const cell = index.get(normaliseHeader(header));
      if (!cell || cell.value === null || cell.value === undefined || cell.value === '') continue;
      const value = rule.coerce(cell.value);
      if (value === undefined) {
        uncoercible.push({ field: rule.field, header: cell.key, raw: cell.value });
        continue;
      }
      mapped.push({ field: rule.field, value, sourceHeader: cell.key, confidence: rule.confidence ?? 0.7 });
      break; // first matching header wins
    }
  }

  return { mapped, uncoercible };
}

/**
 * Generic spreadsheet profile. A new supplier spreadsheet usually needs only
 * extra `headers` entries here, not new code. See catalog/docs/HOWTO.md.
 */
export const GENERIC_SPREADSHEET_PROFILE: MappingProfile = {
  id: 'generic-spreadsheet',
  label: 'Generic supplier spreadsheet',
  rules: [
    { field: 'item.sku', headers: ['sku', 'sku name', 'item code', 'product code', 'part number', 'mpn'], coerce: asText, confidence: 0.9 },
    { field: 'item.displayName', headers: ['name', 'product name', 'title', 'description name'], coerce: asText, confidence: 0.7 },
    { field: 'item.shortDescription', headers: ['description', 'product description', 'long description'], coerce: asText, confidence: 0.6 },
    { field: 'bottle.nominalCapacityMl', headers: ['capacity ml', 'capacity_ml', 'volume ml', 'capacity', 'volume', 'size'], coerce: asMilligramsFreeVolume, confidence: 0.8 },
    { field: 'bottle.heightWithClosureMm', headers: ['height with cap', 'height with closure', 'overall height', 'total height'], coerce: asMillimetres, confidence: 0.8 },
    { field: 'bottle.heightWithoutClosureMm', headers: ['height', 'bottle height', 'h (mm)', 'height mm', 'height without cap'], coerce: asMillimetres, confidence: 0.8 },
    { field: 'bottle.diameterMm', headers: ['diameter', 'dia', 'diameter mm', 'body diameter', 'width'], coerce: asMillimetres, confidence: 0.8 },
    { field: 'bottle.openingDiameterMm', headers: ['opening diameter', 'mouth diameter', 'orifice'], coerce: asMillimetres, confidence: 0.8 },
    { field: 'bottle.neckFinish', headers: ['neck finish', 'neck', 'neck thread', 'thread', 'finish', 'neck size'], coerce: asNeckFinish, confidence: 0.85 },
    { field: 'bottle.material', headers: ['material', 'substrate', 'body material'], coerce: asMaterial, confidence: 0.75 },
    { field: 'bottle.glassColour', headers: ['colour', 'color', 'glass colour', 'glass color'], coerce: asGlassColour, confidence: 0.7 },
    { field: 'bottle.finish', headers: ['finish type', 'surface finish', 'decoration'], coerce: asFinish, confidence: 0.7 },
    { field: 'bottle.countryOfOrigin', headers: ['country of origin', 'origin', 'coo', 'made in'], coerce: asText, confidence: 0.8 },
    { field: 'closure.closureKind', headers: ['closure type', 'cap type', 'applicator', 'fitment'], coerce: asClosureKind, confidence: 0.75 },
    { field: 'commerce.unitPrice', headers: ['price', 'unit price', 'price 1pc', 'price_1pc', 'list price'], coerce: asPrice, confidence: 0.7 },
    { field: 'commerce.minimumOrderQuantity', headers: ['moq', 'min order qty', 'minimum order quantity', 'min qty'], coerce: asInteger, confidence: 0.8 },
    { field: 'commerce.caseQuantity', headers: ['case qty', 'case quantity', 'carton qty', 'units per case'], coerce: asInteger, confidence: 0.8 },
    { field: 'commerce.leadTimeDays', headers: ['lead time', 'lead time days', 'lead_time_days'], coerce: asInteger, confidence: 0.7 },
  ],
};
