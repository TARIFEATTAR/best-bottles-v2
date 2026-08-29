/**
 * Catalog completeness.
 *
 * The catalog is designed to hold incomplete data. That is only useful if it
 * can tell you exactly what is missing, so this module turns "unknown" from a
 * silent gap into a reportable, prioritisable work item.
 *
 * A requirement is a named check with a weight. Score is the weighted fraction
 * satisfied; `missingFields` names the gaps; `recommendedNextAction` names the
 * single highest-weight gap so an operator has somewhere to start.
 */

import type { ItemKind } from './ids.ts';
import type {
  AttributeValue,
  BottleSpec,
  CatalogItem,
  ClosureSpec,
  CommerceRecord,
  CompatibilityEdge,
  MediaAsset,
} from './types.ts';

export interface ItemBundle {
  item: CatalogItem;
  bottle?: BottleSpec;
  closure?: ClosureSpec;
  commerce?: CommerceRecord[];
  media?: MediaAsset[];
  attributes?: AttributeValue[];
  edges?: CompatibilityEdge[];
}

export interface Requirement {
  field: string;
  label: string;
  /** Higher weight = a bigger hole in the record. */
  weight: number;
  appliesTo: (bundle: ItemBundle) => boolean;
  satisfied: (bundle: ItemBundle) => boolean;
}

const CONTAINER_KINDS = new Set<ItemKind>(['bottle', 'jar', 'vial']);
const CLOSURE_KINDS = new Set<ItemKind>([
  'closure', 'cap', 'dropper', 'reducer', 'insert', 'rollerball', 'sprayer', 'pump', 'liner',
]);

const isContainer = (b: ItemBundle) => CONTAINER_KINDS.has(b.item.kind);
const isClosure = (b: ItemBundle) => CLOSURE_KINDS.has(b.item.kind);
const anyItem = () => true;

export const REQUIREMENTS: Requirement[] = [
  { field: 'sku', label: 'SKU', weight: 3, appliesTo: anyItem, satisfied: (b) => Boolean(b.item.sku) },
  { field: 'displayName', label: 'Canonical name', weight: 3, appliesTo: anyItem, satisfied: (b) => Boolean(b.item.displayName?.trim()) },
  { field: 'shortDescription', label: 'Description', weight: 1, appliesTo: anyItem, satisfied: (b) => Boolean(b.item.shortDescription?.trim()) },

  { field: 'bottle.nominalCapacityMl', label: 'Nominal capacity', weight: 3, appliesTo: isContainer, satisfied: (b) => b.bottle?.nominalCapacityMl !== undefined },
  { field: 'bottle.material', label: 'Material', weight: 2, appliesTo: isContainer, satisfied: (b) => b.bottle?.material !== undefined && b.bottle.material !== 'unknown' },
  { field: 'bottle.neckFinish', label: 'Neck finish', weight: 3, appliesTo: isContainer, satisfied: (b) => b.bottle?.neckFinish !== undefined },
  { field: 'bottle.heightWithoutClosureMm', label: 'Height', weight: 2, appliesTo: isContainer, satisfied: (b) => b.bottle?.heightWithoutClosureMm !== undefined || b.bottle?.heightWithClosureMm !== undefined },
  { field: 'bottle.diameterMm', label: 'Diameter', weight: 2, appliesTo: isContainer, satisfied: (b) => b.bottle?.diameterMm !== undefined },
  { field: 'bottle.glassColour', label: 'Glass colour', weight: 1, appliesTo: isContainer, satisfied: (b) => b.bottle?.glassColour !== undefined && b.bottle.glassColour !== 'unknown' },
  { field: 'bottle.countryOfOrigin', label: 'Country of origin', weight: 1, appliesTo: isContainer, satisfied: (b) => Boolean(b.bottle?.countryOfOrigin) },

  { field: 'closure.closureKind', label: 'Closure type', weight: 3, appliesTo: isClosure, satisfied: (b) => b.closure?.closureKind !== undefined && b.closure.closureKind !== 'unknown' },
  { field: 'closure.neckFinish', label: 'Mating neck finish', weight: 3, appliesTo: isClosure, satisfied: (b) => b.closure?.neckFinish !== undefined },
  { field: 'closure.material', label: 'Closure material', weight: 2, appliesTo: isClosure, satisfied: (b) => b.closure?.material !== undefined && b.closure.material !== 'unknown' },

  { field: 'commerce.price', label: 'Pricing', weight: 2, appliesTo: anyItem, satisfied: (b) => (b.commerce ?? []).some((c) => c.priceBreaks.length > 0) },
  { field: 'commerce.minimumOrderQuantity', label: 'Minimum order quantity', weight: 1, appliesTo: anyItem, satisfied: (b) => (b.commerce ?? []).some((c) => c.minimumOrderQuantity !== undefined) },
  { field: 'commerce.caseQuantity', label: 'Case quantity', weight: 1, appliesTo: anyItem, satisfied: (b) => (b.commerce ?? []).some((c) => c.caseQuantity !== undefined) },
  { field: 'commerce.stockStatus', label: 'Stock status', weight: 2, appliesTo: anyItem, satisfied: (b) => (b.commerce ?? []).some((c) => c.stockStatus !== undefined) },

  { field: 'media.hero', label: 'Approved hero image', weight: 3, appliesTo: anyItem, satisfied: (b) => (b.media ?? []).some((m) => m.assetType === 'hero' && m.approved) },
  {
    field: 'compatibility.closure',
    label: 'At least one compatible closure',
    weight: 2,
    appliesTo: isContainer,
    satisfied: (b) => (b.edges ?? []).some((e) => e.sourceCatalogId === b.item.catalogId && e.relation === 'compatible_with' && e.status !== 'incompatible'),
  },
  {
    field: 'compatibility.verified',
    label: 'A verified compatible closure',
    weight: 1,
    appliesTo: isContainer,
    satisfied: (b) => (b.edges ?? []).some((e) => e.sourceCatalogId === b.item.catalogId && e.status === 'verified'),
  },
];

export interface CompletenessResult {
  catalogId: string;
  /** 0..1, weighted. */
  score: number;
  missingFields: string[];
  missingLabels: string[];
  /** Highest-weight gap, or undefined when the record is complete. */
  recommendedNextAction?: string;
  /** True when every requirement carrying weight >= 3 is satisfied. */
  productionReady: boolean;
}

export function scoreCompleteness(bundle: ItemBundle, requirements: Requirement[] = REQUIREMENTS): CompletenessResult {
  const applicable = requirements.filter((r) => r.appliesTo(bundle));
  let earned = 0;
  let total = 0;
  const missing: Requirement[] = [];

  for (const req of applicable) {
    total += req.weight;
    if (req.satisfied(bundle)) earned += req.weight;
    else missing.push(req);
  }

  missing.sort((a, b) => b.weight - a.weight || a.field.localeCompare(b.field));
  const blocking = missing.filter((r) => r.weight >= 3);

  return {
    catalogId: bundle.item.catalogId,
    score: total === 0 ? 1 : round(earned / total),
    missingFields: missing.map((r) => r.field),
    missingLabels: missing.map((r) => r.label),
    recommendedNextAction: missing[0] ? `Add ${missing[0].label.toLowerCase()}` : undefined,
    productionReady: blocking.length === 0,
  };
}

export interface CatalogHealth {
  totalItems: number;
  byKind: Record<string, number>;
  productionReady: number;
  incomplete: number;
  averageScore: number;
  missingByField: Array<{ field: string; label: string; count: number }>;
  itemsMissingHeroImage: number;
  itemsMissingDimensions: number;
  itemsMissingNeckFinish: number;
  itemsWithoutCompatibleClosure: number;
}

export function summariseHealth(bundles: ItemBundle[]): CatalogHealth {
  const byKind: Record<string, number> = {};
  const missingCounts = new Map<string, { label: string; count: number }>();
  let ready = 0;
  let scoreSum = 0;

  for (const bundle of bundles) {
    byKind[bundle.item.kind] = (byKind[bundle.item.kind] ?? 0) + 1;
    const result = scoreCompleteness(bundle);
    scoreSum += result.score;
    if (result.productionReady) ready += 1;
    result.missingFields.forEach((field, i) => {
      const entry = missingCounts.get(field) ?? { label: result.missingLabels[i], count: 0 };
      entry.count += 1;
      missingCounts.set(field, entry);
    });
  }

  const missingByField = [...missingCounts.entries()]
    .map(([field, { label, count }]) => ({ field, label, count }))
    .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));

  const countMissing = (field: string) => missingCounts.get(field)?.count ?? 0;

  return {
    totalItems: bundles.length,
    byKind,
    productionReady: ready,
    incomplete: bundles.length - ready,
    averageScore: bundles.length === 0 ? 1 : round(scoreSum / bundles.length),
    missingByField,
    itemsMissingHeroImage: countMissing('media.hero'),
    itemsMissingDimensions: countMissing('bottle.diameterMm') + countMissing('bottle.heightWithoutClosureMm'),
    itemsMissingNeckFinish: countMissing('bottle.neckFinish') + countMissing('closure.neckFinish'),
    itemsWithoutCompatibleClosure: countMissing('compatibility.closure'),
  };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
