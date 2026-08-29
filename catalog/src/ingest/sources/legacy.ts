/**
 * Adapters for the four legacy Best Bottles datasets that already live in this
 * repository. They are the migration proof: every field these files carry has
 * somewhere canonical to land, and everything they cannot supply shows up as a
 * measurable gap rather than disappearing.
 *
 *   inventory.json                461 rows  live site catalogue export
 *   data/complete_products.json  2274 rows  master spreadsheet, decomposed columns
 *   data/verified_products.json   261 rows  human-verified subset, with pricing
 *   data/scraped_products.json    739 rows  bestbottles.com scrape
 *
 * Source kinds are set honestly, which is what drives conflict resolution:
 * the verified subset outranks the master spreadsheet, which outranks the
 * scrape. A scraped height never overwrites a verified one.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ItemKind } from '../../domain/ids.ts';
import { parseVolumeMl } from '../../domain/units.ts';
import { parseNeckFinish, resolveGlassColour, resolveMaterial, resolveUseCase } from '../../domain/vocab.ts';
import type { SourceDescriptor } from '../batch.ts';
import { asPrice, asText, parsePriceBreak } from '../mapping.ts';
import { decodeSku } from '../normalizers/sku.ts';
import type { ParsedRow, SourceAdapter } from '../pipeline.ts';

type Fact = ParsedRow['facts'][number];

const readJson = <T>(repoRoot: string, relativePath: string): T =>
  JSON.parse(readFileSync(resolve(repoRoot, relativePath), 'utf8')) as T;

/* ------------------------------------------------------------------------ */
/* inventory.json - the live site catalogue                                  */
/* ------------------------------------------------------------------------ */

interface LegacyInventoryRow {
  sku: string; name: string; description: string; imageUrl: string;
  price: string; bulkPrice: string; capacity: string; color: string;
  category: string; subCategory?: string; neckFinish?: string;
  material?: string; minOrderQty?: string;
}

export const LEGACY_INVENTORY_SOURCE: SourceDescriptor = {
  id: 'legacy-inventory-json',
  label: 'Legacy site catalogue (inventory.json)',
  kind: 'legacy_database',
  locator: 'inventory.json',
  parserVersion: '1.0.0',
};

export function legacyInventoryAdapter(repoRoot: string): SourceAdapter {
  return {
    source: LEGACY_INVENTORY_SOURCE,
    read: () => {
      const rows = readJson<LegacyInventoryRow[]>(repoRoot, 'inventory.json');
      return rows.map((row, i): ParsedRow => {
        const decoded = decodeSku(row.sku);
        const warnings: string[] = [];

        // The legacy `category` column is site navigation, not item type:
        // "Closures" contains whole bottles. Item kind comes from the SKU
        // grammar instead, and a disagreement is recorded, not resolved here.
        const kind = classify(decoded.kind, row.name, row.category);
        if (row.category === 'Closures' && kind !== 'cap' && kind !== 'closure' && kind !== 'rollerball' && kind !== 'sprayer') {
          warnings.push(`Legacy category "Closures" on a ${kind} (${row.sku}); category column is navigation, not item type.`);
        }

        const facts: Fact[] = [];
        push(facts, 'item.displayName', asText(row.name), 0.8);
        push(facts, 'item.shortDescription', asText(row.description), 0.7);
        push(facts, 'item.family', decoded.family, 0.5);
        push(facts, 'bottle.shape', decoded.shape, 0.5);
        push(facts, 'bottle.nominalCapacityMl', parseVolumeMl(row.capacity), 0.8);
        push(facts, 'bottle.material', resolveMaterial(row.material), 0.7);
        push(facts, 'bottle.glassColour', resolveGlassColour(row.color) ?? resolveGlassColour(row.material), 0.6);

        const neck = parseNeckFinish(row.neckFinish);
        if (neck) {
          push(facts, kind === 'bottle' || kind === 'jar' || kind === 'vial' ? 'bottle.neckFinish' : 'closure.neckFinish', neck, 0.85);
        } else if (row.neckFinish?.trim()) {
          warnings.push(`Unparseable neck finish "${row.neckFinish}" on ${row.sku}.`);
        }

        push(facts, 'commerce.unitPrice', asPrice(row.price), 0.7);
        push(facts, 'commerce.priceBreak', parsePriceBreak(row.bulkPrice), 0.7);
        push(facts, 'commerce.minimumOrderQuantity', numeric(row.minOrderQty), 0.7);
        pushUseCases(facts, row.description, 0.4);

        return {
          locator: `inventory.json[${i}]`,
          sourceKey: row.sku,
          payload: row as unknown as Record<string, unknown>,
          kind,
          sku: row.sku,
          displayName: row.name,
          media: row.imageUrl
            ? [{ storageUrl: row.imageUrl, assetType: 'hero' as const, origin: 'photograph' as const }]
            : [],
          facts,
          warnings,
        };
      });
    },
  };
}

/* ------------------------------------------------------------------------ */
/* data/complete_products.json - the master spreadsheet                      */
/* ------------------------------------------------------------------------ */

interface MasterRow {
  sku: string; name: string | null; family: string; parent: string; type_code: string;
  bottle_shape: string; capacity_oz: string; capacity_ml: string; applicator: string;
  color: string; cap_color: string; neck_thread: string; use_case: string;
  description: string | null; price_1pc: string | null; image_url: string | null;
  product_url: string | null; inventory_id: number | null; source_sheet: string;
}

export const MASTER_SPREADSHEET_SOURCE: SourceDescriptor = {
  id: 'master-spreadsheet',
  label: 'Master product spreadsheet (complete_products.json)',
  kind: 'internal_spreadsheet',
  locator: 'data/complete_products.json',
  parserVersion: '1.0.0',
};

export function masterSpreadsheetAdapter(repoRoot: string): SourceAdapter {
  return {
    source: MASTER_SPREADSHEET_SOURCE,
    read: () => {
      const rows = readJson<MasterRow[]>(repoRoot, 'data/complete_products.json');
      return rows.map((row, i): ParsedRow => buildMasterRow(row, `data/complete_products.json[${i}]`, 0.7));
    },
  };
}

/* ------------------------------------------------------------------------ */
/* data/verified_products.json - the human-verified subset                   */
/* ------------------------------------------------------------------------ */

interface VerifiedRow extends MasterRow {
  material?: string; price_144pc?: string | null; bulk_price?: string | null;
  min_order_qty?: number | null; tags?: string; verified?: boolean;
}

export const VERIFIED_SUBSET_SOURCE: SourceDescriptor = {
  id: 'verified-products',
  label: 'Verified product subset (verified_products.json)',
  kind: 'employee_verification',
  locator: 'data/verified_products.json',
  parserVersion: '1.0.0',
};

export function verifiedProductsAdapter(repoRoot: string): SourceAdapter {
  return {
    source: VERIFIED_SUBSET_SOURCE,
    read: () => {
      const rows = readJson<VerifiedRow[]>(repoRoot, 'data/verified_products.json');
      return rows.map((row, i): ParsedRow => {
        const parsed = buildMasterRow(row, `data/verified_products.json[${i}]`, 0.9);
        push(parsed.facts, 'bottle.material', resolveMaterial(row.material), 0.9);
        push(parsed.facts, 'commerce.priceBreak', parsePriceBreak(row.bulk_price), 0.9);
        push(parsed.facts, 'commerce.minimumOrderQuantity', numeric(row.min_order_qty), 0.9);
        return parsed;
      });
    },
  };
}

/* ------------------------------------------------------------------------ */
/* data/scraped_products.json - the website scrape                           */
/* ------------------------------------------------------------------------ */

interface ScrapedRow {
  sku: string; name: string; description: string; imageUrl: string; productUrl: string;
  capacityMl: string; capacityOz: string; prices: string[]; price1pc: string;
  neckThread: string; heightWithCap: string; width: string;
}

export const WEBSITE_SCRAPE_SOURCE: SourceDescriptor = {
  id: 'website-scrape',
  label: 'bestbottles.com scrape (scraped_products.json)',
  kind: 'website_scrape',
  locator: 'data/scraped_products.json',
  parserVersion: '1.0.0',
};

export function websiteScrapeAdapter(repoRoot: string): SourceAdapter {
  return {
    source: WEBSITE_SCRAPE_SOURCE,
    read: () => {
      const rows = readJson<ScrapedRow[]>(repoRoot, 'data/scraped_products.json');
      return rows.map((row, i): ParsedRow => {
        const decoded = decodeSku(row.sku);
        const facts: Fact[] = [];
        push(facts, 'item.displayName', asText(row.name), 0.6);
        push(facts, 'item.shortDescription', asText(row.description), 0.5);
        push(facts, 'bottle.shape', decoded.shape, 0.4);
        // capacityMl is a bare number in this source; the header supplies the unit.
        push(facts, 'bottle.nominalCapacityMl', numeric(row.capacityMl) ?? parseVolumeMl(row.capacityOz), 0.6);
        push(facts, 'bottle.neckFinish', parseNeckFinish(row.neckThread), 0.6);
        push(facts, 'bottle.heightWithClosureMm', parseLengthLoose(row.heightWithCap), 0.6);
        push(facts, 'bottle.diameterMm', parseLengthLoose(row.width), 0.6);
        push(facts, 'commerce.unitPrice', asPrice(row.price1pc), 0.5);
        pushUseCases(facts, row.description, 0.3);

        return {
          locator: `data/scraped_products.json[${i}]`,
          sourceKey: row.sku,
          payload: row as unknown as Record<string, unknown>,
          kind: classify(decoded.kind, row.name),
          sku: row.sku,
          displayName: row.name,
          externalIds: row.productUrl
            ? [{ system: 'website_url' as const, externalId: row.productUrl, url: row.productUrl }]
            : [],
          media: row.imageUrl ? [{ storageUrl: row.imageUrl, assetType: 'hero' as const, origin: 'photograph' as const }] : [],
          facts,
        };
      });
    },
  };
}

/** All four legacy adapters, in ascending order of authority. */
export function allLegacyAdapters(repoRoot: string): SourceAdapter[] {
  return [
    websiteScrapeAdapter(repoRoot),
    legacyInventoryAdapter(repoRoot),
    masterSpreadsheetAdapter(repoRoot),
    verifiedProductsAdapter(repoRoot),
  ];
}

/* ------------------------------------------------------------------------ */

function buildMasterRow(row: MasterRow, locator: string, confidence: number): ParsedRow {
  const decoded = decodeSku(row.sku);
  const warnings: string[] = [];
  const kind = classify(decoded.kind, row.name ?? '', undefined, row.applicator, row.type_code);

  const facts: Fact[] = [];
  push(facts, 'item.displayName', asText(row.name), confidence);
  push(facts, 'item.shortDescription', asText(row.description), confidence - 0.1);
  push(facts, 'item.family', asText(row.family), confidence);
  push(facts, 'bottle.shape', asText(row.bottle_shape), confidence);
  push(facts, 'bottle.nominalCapacityMl', parseVolumeMl(row.capacity_ml) ?? parseVolumeMl(row.capacity_oz), confidence + 0.05);
  push(facts, 'bottle.glassColour', resolveGlassColour(row.color), confidence - 0.05);
  push(facts, 'bottle.material', resolveMaterial(row.type_code === 'ALU' ? 'aluminium' : row.type_code), confidence - 0.2);
  push(facts, 'closure.colourLabel', asText(row.cap_color), confidence - 0.1);
  push(facts, 'commerce.unitPrice', asPrice(row.price_1pc), confidence - 0.1);
  pushUseCases(facts, row.use_case, confidence - 0.1);

  const neck = parseNeckFinish(row.neck_thread);
  if (neck) {
    push(facts, isContainer(kind) ? 'bottle.neckFinish' : 'closure.neckFinish', neck, confidence + 0.1);
  } else if (row.neck_thread?.trim() && row.neck_thread !== 'None') {
    // e.g. "Apothecary", "Jars", "Vials" - a category label in a spec column.
    warnings.push(`Neck column holds a category label, not a finish: "${row.neck_thread}".`);
  }

  return {
    locator,
    sourceKey: row.sku,
    payload: row as unknown as Record<string, unknown>,
    kind,
    sku: row.sku,
    displayName: row.name ?? undefined,
    externalIds: row.inventory_id ? [{ system: 'legacy_inventory_id' as const, externalId: String(row.inventory_id) }] : [],
    media: row.image_url ? [{ storageUrl: row.image_url, assetType: 'hero' as const, origin: 'photograph' as const }] : [],
    facts,
    warnings,
  };
}

const CONTAINER_KINDS = new Set<ItemKind>(['bottle', 'jar', 'vial']);
const isContainer = (kind: ItemKind | 'unknown') => CONTAINER_KINDS.has(kind as ItemKind);

/**
 * Decide item kind. The SKU grammar is the primary signal; the product name is
 * a fallback; the legacy category column is deliberately NOT used, because it
 * is site navigation and demonstrably disagrees with the product it labels.
 */
function classify(
  decodedKind: ItemKind | 'unknown',
  name: string,
  _legacyCategory?: string,
  applicator?: string,
  typeCode?: string,
): ItemKind | 'unknown' {
  if (decodedKind !== 'unknown') return decodedKind;
  const text = `${name ?? ''}`.toLowerCase();
  if (/\bcap\b|\bclosure\b|\blid\b/.test(text)) return 'cap';
  if (/roller ?ball|roll-?on plug/.test(text)) return 'rollerball';
  if (/sprayer|atomi[sz]er|spray pump/.test(text)) return 'sprayer';
  if (/dropper|pipette/.test(text)) return 'dropper';
  if (/reducer|orifice/.test(text)) return 'reducer';
  if (/\bpump\b/.test(text)) return 'pump';
  if (/\bjar\b/.test(text)) return 'jar';
  if (/\bvial\b/.test(text)) return 'vial';
  if (/\bbox\b|\bbag\b|carton|pouch/.test(text)) return 'packaging';
  if (/funnel|display|tray/.test(text)) return 'accessory';
  if (/\bbottle\b/.test(text)) return 'bottle';
  if (typeCode === 'CJ') return 'jar';
  if (typeCode === 'GB' || typeCode === 'LB' || typeCode === 'ALU') return 'bottle';
  if (applicator && applicator !== 'None') return 'bottle';
  return 'unknown';
}

function push(facts: Fact[], field: string, value: unknown, confidence: number): void {
  if (value === undefined || value === null || value === '') return;
  facts.push({ field, value, confidence: clamp(confidence) });
}

/** Extract structured use cases from free-text marketing copy. */
function pushUseCases(facts: Fact[], text: string | null | undefined, confidence: number): void {
  if (!text) return;
  const seen = new Set<string>();
  for (const phrase of text.split(/[,.;]/)) {
    const useCase = resolveUseCase(phrase.trim());
    if (useCase && !seen.has(useCase)) {
      seen.add(useCase);
      facts.push({ field: `useCase.${useCase}`, value: 'acceptable', confidence: clamp(confidence) });
    }
  }
}

/** The scrape stores dimensions unitless or with a stray unit; assume mm only when a unit says so. */
function parseLengthLoose(raw: string | undefined): { value: number } | undefined {
  if (!raw || !raw.trim()) return undefined;
  const m = /^([0-9]*\.?[0-9]+)\s*mm$/i.exec(raw.trim());
  return m ? { value: Number(m[1]) } : undefined;
}

function numeric(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
