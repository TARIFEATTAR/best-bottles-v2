/**
 * Canonical identifier strategy.
 *
 * Three identifier layers, deliberately kept apart:
 *
 *   1. `catalogId`  - the permanent, machine-safe, opaque catalog identity.
 *                     Never encodes specifications. Survives renames, respecs,
 *                     re-photography, price changes and channel churn.
 *   2. `sku`        - the Best Bottles merchandising SKU (e.g. GBCylAmb5RollBlkSh).
 *                     Human-meaningful, attribute-encoded, and therefore NOT
 *                     safe as identity: a corrected cap colour changes the SKU.
 *   3. external ids - Shopify product/variant, supplier part numbers, GTIN,
 *                     marketplace ids. These live in `catalog_external_id`
 *                     as *mappings*, never as identity.
 *
 * Format: BB-<KIND>-<10 char Crockford base32 digest>
 *   e.g. BB-BTL-8T4XKQ2M1P
 *
 * The digest is derived deterministically from an *identity anchor* - the
 * (sourceSystem, naturalKey) pair under which the item was first seen. This
 * makes ingestion idempotent without a database round trip: re-importing the
 * same supplier row resolves to the same catalogId instead of creating a
 * duplicate. The anchor is frozen at creation; later corrections to name,
 * colour or dimensions do not move the id.
 */

import { createHash } from 'node:crypto';

export type ItemKind =
  | 'bottle'
  | 'jar'
  | 'vial'
  | 'closure'
  | 'cap'
  | 'dropper'
  | 'reducer'
  | 'insert'
  | 'rollerball'
  | 'sprayer'
  | 'pump'
  | 'liner'
  | 'accessory'
  | 'packaging'
  | 'kit'
  | 'configuration';

/** Short code used inside the catalog id. Stable - never renumber these. */
export const KIND_CODE: Record<ItemKind, string> = {
  bottle: 'BTL',
  jar: 'JAR',
  vial: 'VIA',
  closure: 'CLO',
  cap: 'CAP',
  dropper: 'DRP',
  reducer: 'RDC',
  insert: 'INS',
  rollerball: 'ROL',
  sprayer: 'SPR',
  pump: 'PMP',
  liner: 'LNR',
  accessory: 'ACC',
  packaging: 'PKG',
  kit: 'KIT',
  configuration: 'CFG',
};

const CODE_TO_KIND: Record<string, ItemKind> = Object.fromEntries(
  Object.entries(KIND_CODE).map(([kind, code]) => [code, kind as ItemKind]),
) as Record<string, ItemKind>;

/** Crockford base32 - no I, L, O or U, so ids never read as a different string. */
const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const DIGEST_LEN = 10;

export interface IdentityAnchor {
  /** The system the item was first ingested from, e.g. 'legacy-inventory-json'. */
  sourceSystem: string;
  /** The stable key within that system, e.g. the legacy SKU or supplier part no. */
  naturalKey: string;
}

export const CATALOG_ID_PATTERN = /^BB-[A-Z]{3}-[0-9A-HJKMNP-TV-Z]{10}$/;

/** Derive the permanent catalog id for an item kind and identity anchor. */
export function catalogId(kind: ItemKind, anchor: IdentityAnchor): string {
  const code = KIND_CODE[kind];
  if (!code) throw new Error(`Unknown item kind: ${kind}`);
  const key = `${anchor.sourceSystem.trim().toLowerCase()}::${anchor.naturalKey.trim().toLowerCase()}`;
  return `BB-${code}-${digest(`${code}::${key}`)}`;
}

export function isCatalogId(value: string): boolean {
  return CATALOG_ID_PATTERN.test(value);
}

export function kindOfCatalogId(value: string): ItemKind | undefined {
  const m = /^BB-([A-Z]{3})-/.exec(value);
  return m ? CODE_TO_KIND[m[1]] : undefined;
}

/**
 * Deterministic id for a compatibility edge, so re-running rule inference is
 * idempotent rather than accumulating duplicate relationships.
 */
export function relationshipId(sourceId: string, relation: string, targetId: string): string {
  return `BB-REL-${digest(`${sourceId}::${relation}::${targetId}`)}`;
}

/** Deterministic id for a media asset, keyed on its storage location. */
export function assetId(storageKey: string): string {
  return `BB-AST-${digest(storageKey.trim().toLowerCase())}`;
}

function digest(input: string): string {
  const bytes = createHash('sha256').update(input, 'utf8').digest();
  let bits = 0;
  let acc = 0;
  let out = '';
  for (const byte of bytes) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += BASE32[(acc >>> bits) & 31];
      if (out.length === DIGEST_LEN) return out;
    }
  }
  return out.padEnd(DIGEST_LEN, '0');
}
