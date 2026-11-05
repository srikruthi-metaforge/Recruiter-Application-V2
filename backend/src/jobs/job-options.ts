/** Shared BullMQ defaults. Kept free of the queue runtime so unit tests can import them. */

export const BULL_PREFIX = 'mrap-bull';
export const MAIL_QUEUE = 'mail-extraction';
export const ATTENDANCE_QUEUE = 'attendance';

export const MAIL_SYNC_SCHEDULER_ID = 'mail-sync';
export const ATTENDANCE_TICK_SCHEDULER_ID = 'attendance-tick';
export const ATTENDANCE_CLEANUP_SCHEDULER_ID = 'attendance-cleanup';
export const MAIL_BACKFILL_JOB_ID = 'mail-initial-backfill';
export const ATTENDANCE_CATCHUP_JOB_ID = 'attendance-catchup';

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 5_000 },
  removeOnComplete: 25,
  removeOnFail: 100,
};

export function isDuplicateJobError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err || '');
  return /already exists|jobid|duplicate/i.test(message);
}
