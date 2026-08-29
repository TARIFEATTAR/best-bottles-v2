/**
 * Core domain model for the Best Bottles Commerce Knowledge Catalog.
 *
 * Shape of the model:
 *
 *   CatalogItem            canonical identity + lifecycle, one row per thing
 *     +- BottleSpec        typed container specification (kind: bottle/jar/vial)
 *     +- ClosureSpec       typed closure/component specification
 *     +- AttributeValue[]  governed extensible attributes (no migration needed)
 *     +- UseCaseFitness[]  semantic intent, not just physics
 *     +- CommerceRecord    pricing/inventory, kept out of product identity
 *     +- ExternalId[]      Shopify / marketplace / supplier mappings
 *     +- MediaAsset[]      first-class image and render records
 *
 *   CompatibilityEdge      explicit relationship graph between items
 *   FactAssertion          "source S claims field F of item I is V"
 *   Conflict               two assertions that disagree, unresolved
 *
 * The separation that matters most: a CatalogItem's *canonical values* are
 * derived from FactAssertions, they are not written directly by an importer.
 * That is what makes "where did this come from?" answerable and what stops an
 * import from silently overwriting a measured value with a scraped one.
 */

import type { ItemKind } from './ids.ts';
import type { Measurement } from './units.ts';
import type {
  ClosureKind,
  Finish,
  GlassColour,
  Material,
  NeckFinish,
  SourceKind,
  UseCase,
  UseCaseFit,
} from './vocab.ts';

export type { ItemKind } from './ids.ts';

/** Lifecycle. Catalog knowledge is never hard-deleted; it is retired. */
export type LifecycleState = 'draft' | 'active' | 'inactive' | 'discontinued' | 'archived';

/** How much we trust the record as a whole. */
export type VerificationState = 'unverified' | 'needs_review' | 'verified' | 'conflicting';

export interface CatalogItem {
  /** Permanent opaque identity. See domain/ids.ts. */
  catalogId: string;
  kind: ItemKind;
  /** Best Bottles merchandising SKU. Unique where known, but not identity. */
  sku?: string;
  displayName: string;
  slug: string;
  /** Internal-only note. Never exposed on public endpoints. */
  internalNotes?: string;
  shortDescription?: string;
  /** Product family, e.g. `GBCyl`. Groups variants of one mould. */
  family?: string;
  lifecycle: LifecycleState;
  verification: VerificationState;
  /** The (sourceSystem, naturalKey) the id was minted from. Frozen. */
  identityAnchor: { sourceSystem: string; naturalKey: string };
  createdAt: string;
  updatedAt: string;
}

/** Typed specification for containers: bottles, jars, vials. */
export interface BottleSpec {
  catalogId: string;
  shape?: string;
  /** Labelled capacity, canonical millilitres. */
  nominalCapacityMl?: number;
  /** Capacity filled to the brim, canonical millilitres. */
  brimfulCapacityMl?: number;
  heightWithClosureMm?: Measurement;
  heightWithoutClosureMm?: Measurement;
  diameterMm?: Measurement;
  widthMm?: Measurement;
  depthMm?: Measurement;
  openingDiameterMm?: Measurement;
  emptyWeightG?: number;
  material?: Material;
  glassColour?: GlassColour;
  finish?: Finish;
  neckFinish?: NeckFinish;
  /** True/false/undefined - undefined means unknown, never assume false. */
  foodSafe?: boolean;
  cosmeticSafe?: boolean;
  countryOfOrigin?: string;
  manufacturer?: string;
}

/** Typed specification for closures and fitments. */
export interface ClosureSpec {
  catalogId: string;
  closureKind?: ClosureKind;
  /** The neck this closure mates with. The primary compatibility signal. */
  neckFinish?: NeckFinish;
  diameterMm?: Measurement;
  heightMm?: Measurement;
  material?: Material;
  finish?: Finish;
  /** Free colour label, normalised where the vocabulary knows it. */
  colourLabel?: string;
  linerType?: string;
  /** Roller ball diameter, sprayer orifice, dropper bulb - kind-specific. */
  orificeMm?: Measurement;
  dipTubeLengthMm?: Measurement;
  tamperEvident?: boolean;
  childResistant?: boolean;
}

/**
 * Governed extensible attribute. Adding a niche specification does not need a
 * database migration - it needs an AttributeDefinition row.
 */
export interface AttributeDefinition {
  /** Machine name, snake_case, immutable. */
  key: string;
  label: string;
  dataType: 'string' | 'number' | 'boolean' | 'enum' | 'measurement';
  /** Base unit for `measurement`, e.g. 'mm'. */
  unit?: string;
  allowedValues?: string[];
  /** Item kinds this attribute may be set on. Empty = any. */
  appliesTo: ItemKind[];
  description?: string;
}

export interface AttributeValue {
  catalogId: string;
  key: string;
  value: string | number | boolean;
  unit?: string;
  confidence?: number;
  verification: VerificationState;
}

export interface UseCaseFitness {
  catalogId: string;
  useCase: UseCase;
  fit: UseCaseFit;
  /** Why. Empty rationale on a `not_recommended` is a data-quality problem. */
  rationale?: string;
}

/** Commerce data, kept separate so pricing churn never touches product identity. */
export interface CommerceRecord {
  catalogId: string;
  channel: string;
  currency: string;
  /** Quantity break -> unit price. Sorted ascending by quantity on write. */
  priceBreaks: Array<{ minQuantity: number; unitPrice: number }>;
  minimumOrderQuantity?: number;
  caseQuantity?: number;
  palletQuantity?: number;
  leadTimeDays?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'discontinued';
  availableQuantity?: number;
  shippingWeightG?: number;
}

export type ExternalSystem =
  | 'shopify_product'
  | 'shopify_variant'
  | 'sanity_document'
  | 'supabase_product_image'
  | 'supplier_part'
  | 'gtin'
  | 'website_url'
  | 'google_merchant'
  | 'amazon'
  | 'etsy'
  | 'faire'
  | 'legacy_inventory_id';

export interface ExternalId {
  catalogId: string;
  system: ExternalSystem;
  externalId: string;
  /** Optional URL back to the record in that system. */
  url?: string;
}

export type AssetType =
  | 'hero'
  | 'front'
  | 'rear'
  | 'side'
  | 'top'
  | 'detail'
  | 'scale_reference'
  | 'technical_drawing'
  | 'dimension_diagram'
  | 'lifestyle'
  | 'render_3d'
  | 'transparent_png'
  | 'paper_doll_layer'
  | 'marketplace_crop'
  | 'thumbnail'
  | 'packaging';

export interface MediaAsset {
  assetId: string;
  /** The item this asset depicts. A configuration asset depicts a CFG item. */
  catalogId: string;
  assetType: AssetType;
  storageUrl: string;
  /** 'photograph' | 'render' | 'derived' - never conflate a render with a photo. */
  origin: 'photograph' | 'render' | 'derived' | 'unknown';
  /** Asset this one was derived from, for lineage. */
  derivedFromAssetId?: string;
  approved: boolean;
  approvedAt?: string;
  widthPx?: number;
  heightPx?: number;
  checksum?: string;
  /** Which closure/configuration is shown, when the asset shows an assembly. */
  showsConfigurationId?: string;
  version: number;
}

/** Relationship vocabulary for the compatibility graph. */
export type RelationType =
  | 'compatible_with'
  | 'incompatible_with'
  | 'accepts'
  | 'requires'
  | 'fits_into'
  | 'suitable_for'
  | 'replaces'
  | 'variant_of';

/**
 * Compatibility status. `likely` exists specifically so a neck-finish match can
 * be recorded without claiming it was physically tested - a thread match is
 * evidence, not proof of fit.
 */
export type CompatibilityStatus = 'verified' | 'likely' | 'unverified' | 'conditional' | 'incompatible';

export interface CompatibilityEdge {
  relationshipId: string;
  sourceCatalogId: string;
  relation: RelationType;
  targetCatalogId: string;
  status: CompatibilityStatus;
  /** 0..1. A rule-inferred edge should never claim 1. */
  confidence: number;
  /** How this edge was established, e.g. 'rule:neck-finish-match'. */
  basis: string;
  condition?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

/** A complete buildable assembly: container + closure + optional components. */
export interface Configuration {
  catalogId: string;
  displayName: string;
  containerId: string;
  closureId?: string;
  componentIds: string[];
  status: 'proposed' | 'validated' | 'published';
  validationNotes?: string;
}

/** A single claim by a single source about a single field. The unit of truth. */
export interface FactAssertion {
  assertionId: string;
  catalogId: string;
  /** Dotted path into the canonical model, e.g. 'bottle.nominalCapacityMl'. */
  field: string;
  value: unknown;
  unit?: string;
  sourceId: string;
  sourceKind: SourceKind;
  /** Where inside the source, e.g. 'row 412' or a URL. */
  sourceLocator?: string;
  importBatchId?: string;
  observedAt: string;
  confidence: number;
}

export interface Conflict {
  conflictId: string;
  catalogId: string;
  field: string;
  assertions: FactAssertion[];
  status: 'open' | 'resolved' | 'accepted_variance';
  /** The assertion chosen as canonical, once resolved. */
  resolvedAssertionId?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  note?: string;
}

/** Knowledge layer: FAQs, explanations, comparisons, buying advice. */
export type KnowledgeKind =
  | 'faq'
  | 'product_explanation'
  | 'technical_note'
  | 'recommendation'
  | 'comparison'
  | 'objection'
  | 'customer_question'
  | 'terminology'
  | 'buying_advice'
  | 'compatibility_explanation'
  | 'application_guidance'
  | 'support_answer';

export interface KnowledgeEntry {
  knowledgeId: string;
  kind: KnowledgeKind;
  /** Items or categories this entry is about. */
  subjectCatalogIds: string[];
  question?: string;
  content: string;
  status: 'proposed' | 'in_review' | 'approved' | 'retired';
  /** AI-drafted content is never published without review. */
  authoredBy: 'human' | 'ai_draft';
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** Customer terminology: how buyers actually name these things. */
export interface TermSynonym {
  canonicalTerm: string;
  synonym: string;
  kind: 'colloquial' | 'search_query' | 'trade_term' | 'misspelling';
  /** Times observed in search/support, for prioritising knowledge gaps. */
  observedCount: number;
}
