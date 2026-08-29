/**
 * Adapter for the live bestbottles.com PDP scrape.
 *
 * Registered as `bb-live-pdp`, rank 65 — above Convex (60) because the
 * storefront pipeline treats the live PDP as the arbiter where the two
 * disagree, and below employee verification (90) and physical measurement
 * (100).
 *
 * Consumes the August cache parse
 * (`docs/reviews/audit-2026-08-06/live-site-full-scrape.json`), which is
 * strictly richer than the older `bestbottles_raw_website_data.json`:
 *
 *   - dimensions keep their published tolerance ("104 ±2 mm"), which the
 *     catalog stores as magnitude + tolerance rather than flattening
 *   - a full `tiers[]` volume ladder rather than a single unit price
 *   - `minimumPurchase` and `itemType`
 *
 * The older format is still accepted so a re-run against either file works.
 */

import { readFileSync } from 'node:fs';
import { parseVolumeMl, parseLength } from '../../domain/units.ts';
import { parseNeckFinish } from '../../domain/vocab.ts';
import type { SourceDescriptor } from '../batch.ts';
import { decodeSku } from '../normalizers/sku.ts';
import type { ParsedRow, SourceAdapter } from '../pipeline.ts';

export interface LivePdpTier { qty?: number; unitPrice?: number; lineTotal?: number; totalStated?: boolean }

export interface LivePdpRow {
  url?: string; productUrl?: string; status?: string;
  siteSku?: string; websiteSku?: string;
  itemName?: string; itemDescription?: string; itemType?: string;
  capacity?: string; heightWithCap?: string; heightWithoutCap?: string; diameter?: string;
  neckThreadSize?: string; minimumPurchase?: string;
  tiers?: LivePdpTier[]; price1pc?: number | string; imageUrl?: string;
}

export const LIVE_PDP_SOURCE: SourceDescriptor = {
  id: 'bb-live-pdp',
  label: 'bestbottles.com product detail pages',
  kind: 'website_scrape',
  locator: 'https://www.bestbottles.com/product/',
  parserVersion: '2.0.0',
};

export const sku = (r: LivePdpRow): string | undefined => r.siteSku ?? r.websiteSku;

/**
 * A published quantity ladder, ascending, deduplicated by quantity.
 * `qty: 0` appears in the source on a handful of rows and is dropped — a
 * zero-quantity break is not a price break.
 */
export function priceLadder(r: LivePdpRow): Array<{ minQuantity: number; unitPrice: number }> {
  const seen = new Map<number, number>();
  for (const t of r.tiers ?? []) {
    const q = Number(t.qty);
    const p = Number(t.unitPrice);
    if (!Number.isFinite(q) || q < 1) continue;
    if (!Number.isFinite(p) || p < 0) continue;
    if (!seen.has(q)) seen.set(q, p);
  }
  if (seen.size === 0) {
    const single = Number(r.price1pc);
    if (Number.isFinite(single) && single > 0) seen.set(1, single);
  }
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([minQuantity, unitPrice]) => ({ minQuantity, unitPrice }));
}

/** "US $50" -> 50. Returns undefined when no amount is stated. */
export function parseMinimumPurchase(raw: unknown): number | undefined {
  const m = /([0-9]+(?:\.[0-9]+)?)/.exec(String(raw ?? '').replace(/,/g, ''));
  return m ? Number(m[1]) : undefined;
}

/**
 * Dimensions arrive either bare ("104") or with tolerance ("104 ±2 mm").
 * `parseLength` handles the second natively; the first needs its unit
 * supplied, which the column name does. We never invent a tolerance.
 */
export function dimension(raw: unknown): { value: number; tolerance?: number } | undefined {
  const text = String(raw ?? '').trim();
  if (!text) return undefined;
  return parseLength(/\b(mm|cm|in)\b|"$/i.test(text) ? text : `${text}mm`);
}

export function livePdpAdapter(path: string): SourceAdapter {
  return {
    source: { ...LIVE_PDP_SOURCE, locator: path },
    read: () => {
      const rows = JSON.parse(readFileSync(path, 'utf8')) as LivePdpRow[];
      return rows.flatMap((row, i): ParsedRow[] => {
        const key = sku(row);
        if (!key?.trim()) return [];

        const decoded = decodeSku(key);
        const warnings: string[] = [];
        const facts: ParsedRow['facts'] = [];

        const push = (field: string, value: unknown, confidence: number) => {
          if (value === undefined || value === null || value === '') return;
          facts.push({ field, value, confidence });
        };

        // The live PDP is the arbiter for what is sold, so its facts carry high
        // confidence — but it is still a scrape, and rank does the real work.
        push('item.displayName', row.itemName ?? row.itemDescription, 0.8);
        push('item.shortDescription', row.itemDescription, 0.8);
        push('bottle.shape', decoded.shape, 0.5);
        push('bottle.nominalCapacityMl', parseVolumeMl(row.capacity), 0.9);
        push('bottle.heightWithClosureMm', dimension(row.heightWithCap), 0.9);
        push('bottle.heightWithoutClosureMm', dimension(row.heightWithoutCap), 0.9);
        push('bottle.diameterMm', dimension(row.diameter), 0.9);

        const neck = parseNeckFinish(row.neckThreadSize);
        if (neck) push('bottle.neckFinish', neck, 0.9);
        else if (row.neckThreadSize?.trim()) {
          warnings.push(`Unparseable neck finish "${row.neckThreadSize}" on ${key}.`);
        }

        const ladder = priceLadder(row);
        if (ladder.length) {
          push('commerce.priceLadder', ladder, 0.9);
          push('commerce.unitPrice', ladder.find((t) => t.minQuantity === 1)?.unitPrice, 0.9);
        }
        push('commerce.minimumPurchaseUsd', parseMinimumPurchase(row.minimumPurchase), 0.8);

        if (row.status && row.status !== 'ok') {
          warnings.push(`Scrape status "${row.status}" on ${key}; row kept but treat pricing as incomplete.`);
        }

        return [{
          locator: `${path}[${i}]`,
          sourceKey: key,
          payload: row as unknown as Record<string, unknown>,
          kind: decoded.kind,
          sku: key,
          displayName: row.itemName ?? row.itemDescription,
          externalIds: (row.url ?? row.productUrl)
            ? [{ system: 'website_url' as const, externalId: (row.url ?? row.productUrl)!, url: row.url ?? row.productUrl }]
            : [],
          media: row.imageUrl ? [{ storageUrl: row.imageUrl, assetType: 'hero' as const, origin: 'photograph' as const }] : [],
          facts,
          warnings,
        }];
      });
    },
  };
}
