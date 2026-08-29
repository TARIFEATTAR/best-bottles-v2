/**
 * Classifying a proposed change to a stored catalog value.
 *
 * Pure logic, deliberately separate from the CLI that uses it, so it can be
 * tested without running an import.
 *
 * The distinction that matters: some differences between a stored value and an
 * authoritative one are *provable damage* and can be repaired mechanically;
 * others are genuine disagreement and must reach a human. Conflating the two is
 * how a bulk "fix" quietly overwrites real data.
 */

export type ChangeType = 'fill' | 'repair' | 'decontaminate' | 'conflict';

/**
 * Markers that identify a stored value as having absorbed a neighbouring
 * field. Seen in the wild as "66 ±1 mm Item Height without C" and
 * "13-415 Size: GBPillar9BlkSht Nemat In" — a value followed by the *label* of
 * the next field, then cut off at the column width.
 */
export const CONTAMINATION_MARKERS = [
  'item height', 'item diameter', 'item width', 'item weight', 'item capacity',
  'size:', 'nemat', 'height without', 'height with', 'diameter:', 'neck',
];

export interface Correction {
  websiteSku: string;
  graceSku?: string;
  field: string;
  current: string | null;
  proposed: string;
  changeType: ChangeType;
  source: string;
  sourceRank: number;
  reason: string;
}

/**
 * Classify a stored value against an authoritative one.
 *
 *   fill           nothing stored, or already identical
 *   repair         stored is a strict prefix of the published value (truncation)
 *   decontaminate  stored is the published value plus another field's label
 *   conflict       anything else — two real, different claims
 *
 * "Ground" vs "Ground glass neck with glass stopper" is truncation.
 * "13mm" vs "13-415" is NOT: those are different geometries, and a rule that
 * silently picked one would produce wrong compatibility answers.
 */
export function classify(current: string, proposed: string): ChangeType {
  const c = current.trim();
  const p = proposed.trim();
  if (c === '' || c === p) return 'fill';

  const cl = c.toLowerCase();
  const pl = p.toLowerCase();

  if (pl.startsWith(cl) && pl.length > cl.length) return 'repair';

  // Require an explicit field label in the tail. A longer stored value is not,
  // on its own, proof of damage.
  if (cl.startsWith(pl) && cl.length > pl.length) {
    const tail = cl.slice(pl.length);
    if (CONTAMINATION_MARKERS.some((m) => tail.includes(m))) return 'decontaminate';
  }

  return 'conflict';
}

export function reasonFor(changeType: ChangeType): string {
  switch (changeType) {
    case 'fill':
      return 'Storefront holds no value; the source publishes one.';
    case 'repair':
      return 'Stored value is a strict prefix of the published value — truncation, not disagreement.';
    case 'decontaminate':
      return "Stored value is the published value plus another field's label — cell contamination, not disagreement.";
    default:
      return 'Sources state materially different values. Needs a human decision; do not auto-apply.';
  }
}
