/**
 * Candidate business IDs are unique increasing integers (e.g. "20834"),
 * continuing from the highest value already present after a DB dump/restore.
 * Legacy values may look like "CAND-16530". Timestamp-sized junk is ignored.
 */

/** Ignore Date.now()-style ids that poisoned the sequence (13+ digits). */
export const CANDIDATE_ID_MAX_REASONABLE = 9_999_999;

export function parseCandidateSeq(raw?: string | null): number | null {
  const id = String(raw || '').trim();
  if (!id) return null;
  const m = id.match(/^CAND-(\d+)$/i) || id.match(/^(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > CANDIDATE_ID_MAX_REASONABLE) return null;
  return n;
}

/** Canonical display/storage form: plain digits, no CAND- prefix. */
export function formatCandidateId(seq: number): string {
  return String(seq);
}

/** UI helper: show "20834" whether stored as "20834" or "CAND-20834". */
export function displayCandidateId(raw?: string | null, fallback = '—'): string {
  const seq = parseCandidateSeq(raw);
  if (seq != null) return formatCandidateId(seq);
  const trimmed = String(raw || '').trim();
  return trimmed || fallback;
}
