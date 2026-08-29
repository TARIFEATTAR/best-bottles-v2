/**
 * Compatibility graph.
 *
 * The rule the whole module exists to enforce: a matching neck finish is
 * EVIDENCE of fit, not PROOF of fit. Thread pitch, liner thickness, shoulder
 * clearance and cap skirt depth all decide whether a closure actually seats.
 * So rule-inferred edges are written as `likely` with bounded confidence and a
 * `basis` naming the rule; only a human or a physical test may write `verified`.
 */

import { relationshipId } from './ids.ts';
import type {
  CatalogItem,
  ClosureSpec,
  BottleSpec,
  CompatibilityEdge,
  CompatibilityStatus,
  Configuration,
  RelationType,
} from './types.ts';
import { neckFinishesMate } from './vocab.ts';

/** Confidence ceiling for an edge that no human has confirmed. */
export const INFERRED_CONFIDENCE = 0.6;

export interface CompatibilityInput {
  containers: Array<{ item: CatalogItem; spec: BottleSpec }>;
  closures: Array<{ item: CatalogItem; spec: ClosureSpec }>;
}

/**
 * Infer `likely` compatibility edges from neck-finish agreement.
 * Deterministic and idempotent: the same inputs produce the same edge ids.
 */
export function inferNeckFinishEdges(input: CompatibilityInput): CompatibilityEdge[] {
  const edges: CompatibilityEdge[] = [];
  for (const container of input.containers) {
    const neck = container.spec.neckFinish;
    if (!neck) continue;
    for (const closure of input.closures) {
      if (!neckFinishesMate(neck, closure.spec.neckFinish)) continue;
      edges.push(
        makeEdge({
          sourceCatalogId: container.item.catalogId,
          relation: 'compatible_with',
          targetCatalogId: closure.item.catalogId,
          status: 'likely',
          confidence: INFERRED_CONFIDENCE,
          basis: `rule:neck-finish-match:${neck.code}`,
          notes: 'Neck finish agrees. Physical fit not yet confirmed.',
        }),
      );
    }
  }
  return edges;
}

export function makeEdge(input: {
  sourceCatalogId: string;
  relation: RelationType;
  targetCatalogId: string;
  status: CompatibilityStatus;
  confidence: number;
  basis: string;
  condition?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}): CompatibilityEdge {
  if (input.status === 'verified' && !input.verifiedBy) {
    throw new Error(
      `A 'verified' compatibility edge requires verifiedBy (${input.sourceCatalogId} -> ${input.targetCatalogId}). ` +
        'Rule inference must use status "likely".',
    );
  }
  if (input.confidence < 0 || input.confidence > 1) {
    throw new Error(`Confidence must be within 0..1, received ${input.confidence}`);
  }
  if (input.basis.startsWith('rule:') && input.confidence > INFERRED_CONFIDENCE) {
    throw new Error(
      `Rule-inferred edges may not exceed confidence ${INFERRED_CONFIDENCE} (received ${input.confidence}). ` +
        'Raise confidence only through verification.',
    );
  }
  return {
    relationshipId: relationshipId(input.sourceCatalogId, input.relation, input.targetCatalogId),
    ...input,
  };
}

/**
 * Merge newly inferred edges into existing ones without demoting human work.
 * A `verified` or `incompatible` edge always survives re-inference.
 */
export function mergeEdges(existing: CompatibilityEdge[], inferred: CompatibilityEdge[]): CompatibilityEdge[] {
  const byId = new Map(existing.map((e) => [e.relationshipId, e]));
  for (const edge of inferred) {
    const current = byId.get(edge.relationshipId);
    if (!current) {
      byId.set(edge.relationshipId, edge);
      continue;
    }
    if (current.status === 'verified' || current.status === 'incompatible' || current.status === 'conditional') continue;
    byId.set(edge.relationshipId, { ...current, ...edge, notes: current.notes ?? edge.notes });
  }
  return [...byId.values()];
}

export interface CompatibilityQuery {
  edges: CompatibilityEdge[];
  /** Minimum status to accept. 'likely' includes verified; 'verified' excludes likely. */
  minimumStatus?: 'verified' | 'likely' | 'any';
}

const STATUS_ORDER: Record<CompatibilityStatus, number> = {
  incompatible: -1,
  unverified: 0,
  conditional: 1,
  likely: 2,
  verified: 3,
};

/** "What closures fit this bottle?" */
export function closuresFor(containerId: string, query: CompatibilityQuery): CompatibilityEdge[] {
  const floor = STATUS_ORDER[query.minimumStatus === 'verified' ? 'verified' : 'likely'];
  return query.edges
    .filter(
      (e) =>
        e.sourceCatalogId === containerId &&
        (e.relation === 'compatible_with' || e.relation === 'accepts') &&
        (query.minimumStatus === 'any' ? e.status !== 'incompatible' : STATUS_ORDER[e.status] >= floor),
    )
    .sort((a, b) => STATUS_ORDER[b.status] - STATUS_ORDER[a.status] || b.confidence - a.confidence);
}

/** "Which bottles support this closure?" */
export function containersFor(closureId: string, query: CompatibilityQuery): CompatibilityEdge[] {
  const floor = STATUS_ORDER[query.minimumStatus === 'verified' ? 'verified' : 'likely'];
  return query.edges
    .filter(
      (e) =>
        e.targetCatalogId === closureId &&
        (e.relation === 'compatible_with' || e.relation === 'accepts') &&
        (query.minimumStatus === 'any' ? e.status !== 'incompatible' : STATUS_ORDER[e.status] >= floor),
    )
    .sort((a, b) => STATUS_ORDER[b.status] - STATUS_ORDER[a.status] || b.confidence - a.confidence);
}

export interface ValidationResult {
  valid: boolean;
  /** Blocking problems - the configuration cannot be built. */
  errors: string[];
  /** Non-blocking - the configuration may be fine but is not proven. */
  warnings: string[];
}

/**
 * Validate a configuration against the graph.
 *
 * An explicit `incompatible` edge is an error. Absence of any edge is a
 * warning, not an error: the catalog is explicitly designed to hold incomplete
 * knowledge, and "we have not checked this" must not read as "this fails".
 */
export function validateConfiguration(config: Configuration, edges: CompatibilityEdge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parts = [config.closureId, ...config.componentIds].filter((id): id is string => Boolean(id));

  for (const partId of parts) {
    const edge = findEdge(edges, config.containerId, partId);
    if (!edge) {
      warnings.push(`No recorded compatibility between ${config.containerId} and ${partId}. Fit is unverified.`);
      continue;
    }
    if (edge.status === 'incompatible') {
      errors.push(`${partId} is recorded as incompatible with ${config.containerId}: ${edge.notes ?? 'no note'}`);
    } else if (edge.status === 'conditional') {
      warnings.push(`${partId} fits ${config.containerId} only under a condition: ${edge.condition ?? 'unspecified'}`);
    } else if (edge.status === 'likely' || edge.status === 'unverified') {
      warnings.push(`Fit between ${config.containerId} and ${partId} is ${edge.status}, not physically verified.`);
    }
  }

  for (const partId of parts) {
    const required = edges.filter((e) => e.sourceCatalogId === partId && e.relation === 'requires');
    for (const req of required) {
      if (!parts.includes(req.targetCatalogId)) {
        errors.push(`${partId} requires ${req.targetCatalogId}, which is not in this configuration.`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function findEdge(edges: CompatibilityEdge[], a: string, b: string): CompatibilityEdge | undefined {
  return edges.find(
    (e) =>
      (e.sourceCatalogId === a && e.targetCatalogId === b) || (e.sourceCatalogId === b && e.targetCatalogId === a),
  );
}
