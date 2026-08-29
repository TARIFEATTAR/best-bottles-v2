/**
 * Provenance and conflict resolution.
 *
 * Importers do not write canonical values. They write FactAssertions:
 * "source S, at locator L, on date D, claimed that field F of item I is V".
 *
 * The canonical value of a field is then *derived* by resolving the assertions
 * for that field. When assertions disagree materially, the field still resolves
 * (so the catalog stays usable) but a Conflict is raised and the item is marked
 * `conflicting`, so a human decides rather than "last import wins".
 */

import { createHash } from 'node:crypto';
import type { Conflict, FactAssertion, VerificationState } from './types.ts';
import { SOURCE_RANK, type SourceKind } from './vocab.ts';

/**
 * Relative tolerance below which two numeric claims are treated as the same
 * fact rather than a conflict. Legacy sources round millimetres and millilitres
 * differently; a 0.5 % gap between 106 and 106.4 mm is noise, 106 vs 108 is not.
 */
export const NUMERIC_TOLERANCE = 0.005;

export interface ResolvedField {
  field: string;
  value: unknown;
  unit?: string;
  /** The assertion that won. */
  winner: FactAssertion;
  /** Assertions that materially disagreed with the winner. */
  dissenting: FactAssertion[];
  confidence: number;
  verification: VerificationState;
}

export function assertionId(input: {
  catalogId: string;
  field: string;
  sourceId: string;
  sourceLocator?: string;
  value: unknown;
}): string {
  const key = [input.catalogId, input.field, input.sourceId, input.sourceLocator ?? '', stringify(input.value)].join('::');
  return `BB-FCT-${createHash('sha256').update(key).digest('hex').slice(0, 16)}`;
}

export function conflictId(catalogId: string, field: string): string {
  return `BB-CFL-${createHash('sha256').update(`${catalogId}::${field}`).digest('hex').slice(0, 16)}`;
}

/**
 * Resolve one field from its assertions.
 *
 * Precedence, in order:
 *   1. an explicit manual resolution (`preferredAssertionId`)
 *   2. source rank (a physical measurement beats a website scrape)
 *   3. assertion confidence
 *   4. most recently observed
 *
 * Returns undefined when there is nothing to resolve - an absent field stays
 * absent. We never substitute a default for an unknown value.
 */
export function resolveField(
  assertions: FactAssertion[],
  options: { preferredAssertionId?: string } = {},
): ResolvedField | undefined {
  const usable = assertions.filter((a) => a.value !== undefined && a.value !== null && a.value !== '');
  if (usable.length === 0) return undefined;

  const preferred = options.preferredAssertionId
    ? usable.find((a) => a.assertionId === options.preferredAssertionId)
    : undefined;

  const ranked = [...usable].sort(compareAssertions);
  const winner = preferred ?? ranked[0];
  const dissenting = usable.filter((a) => a !== winner && !valuesAgree(a.value, winner.value));

  const verification: VerificationState = dissenting.length > 0
    ? 'conflicting'
    : isVerifyingSource(winner.sourceKind)
      ? 'verified'
      : 'unverified';

  return {
    field: winner.field,
    value: winner.value,
    unit: winner.unit,
    winner,
    dissenting,
    confidence: dissenting.length > 0 ? Math.min(winner.confidence, 0.6) : winner.confidence,
    verification,
  };
}

/** Resolve every field of an item, grouping assertions by field. */
export function resolveItem(
  assertions: FactAssertion[],
  resolutions: Record<string, string> = {},
): { fields: Map<string, ResolvedField>; conflicts: Conflict[] } {
  const byField = new Map<string, FactAssertion[]>();
  for (const a of assertions) {
    const list = byField.get(a.field);
    if (list) list.push(a);
    else byField.set(a.field, [a]);
  }

  const fields = new Map<string, ResolvedField>();
  const conflicts: Conflict[] = [];

  for (const [field, list] of byField) {
    const resolved = resolveField(list, { preferredAssertionId: resolutions[field] });
    if (!resolved) continue;
    fields.set(field, resolved);
    if (resolved.dissenting.length > 0) {
      conflicts.push({
        conflictId: conflictId(resolved.winner.catalogId, field),
        catalogId: resolved.winner.catalogId,
        field,
        assertions: [resolved.winner, ...resolved.dissenting],
        status: resolutions[field] ? 'resolved' : 'open',
        resolvedAssertionId: resolutions[field],
      });
    }
  }

  return { fields, conflicts };
}

/**
 * Do two claimed values represent the same fact? Numbers compare within
 * NUMERIC_TOLERANCE; strings compare case- and whitespace-insensitively;
 * everything else compares structurally.
 */
export function valuesAgree(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return true;
    const scale = Math.max(Math.abs(a), Math.abs(b));
    if (scale === 0) return true;
    return Math.abs(a - b) / scale <= NUMERIC_TOLERANCE;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  return stringify(a) === stringify(b);
}

function compareAssertions(a: FactAssertion, b: FactAssertion): number {
  const rank = SOURCE_RANK[b.sourceKind] - SOURCE_RANK[a.sourceKind];
  if (rank !== 0) return rank;
  if (b.confidence !== a.confidence) return b.confidence - a.confidence;
  return b.observedAt.localeCompare(a.observedAt);
}

function isVerifyingSource(kind: SourceKind): boolean {
  return kind === 'physical_measurement' || kind === 'employee_verification' || kind === 'manufacturer_spec';
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value, Object.keys(value as object).sort());
  }
  return String(value);
}
