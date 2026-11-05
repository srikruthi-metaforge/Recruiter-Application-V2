import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { RedisService } from '../modules/redis/redis.service';
import {
  ATTENDANCE_CATCHUP_JOB_ID,
  ATTENDANCE_CLEANUP_SCHEDULER_ID,
  ATTENDANCE_QUEUE,
  ATTENDANCE_TICK_SCHEDULER_ID,
  BULL_PREFIX,
  DEFAULT_JOB_OPTIONS,
  isDuplicateJobError,
  MAIL_BACKFILL_JOB_ID,
  MAIL_QUEUE,
  MAIL_SYNC_SCHEDULER_ID,
} from './job-options';

@Injectable()
export class BackgroundQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackgroundQueueService.name);
  private connection: Redis | null = null;
  private mailQueue: Queue | null = null;
  private attendanceQueue: Queue | null = null;
  private enabled = false;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL');
    if (!url || this.redis.status !== 'connected') return;
    try {
      this.connection = new Redis(url, { maxRetriesPerRequest: null, enableReadyCheck: false });
      this.mailQueue = new Queue(MAIL_QUEUE, {
        connection: this.connection,
        prefix: BULL_PREFIX,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      });
      this.attendanceQueue = new Queue(ATTENDANCE_QUEUE, {
        connection: this.connection.duplicate(),
        prefix: BULL_PREFIX,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      });
      this.enabled = true;
      this.logger.log('BullMQ queues ready');
    } catch (err) {
      this.enabled = false;
      this.logger.warn(`BullMQ unavailable (${(err as Error).message}) — schedulers stay in-process`);
    }
  }

  async onModuleDestroy() {
    await this.mailQueue?.close().catch(() => undefined);
    await this.attendanceQueue?.close().catch(() => undefined);
    await this.connection?.quit().catch(() => undefined);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  workerConnection(): Redis | null {
    return this.connection ? this.connection.duplicate() : null;
  }

  async registerMailSchedule(input: { intervalMs: number; backfill: boolean; days: number }) {
    if (!this.mailQueue) return;
    await this.mailQueue.upsertJobScheduler(
      MAIL_SYNC_SCHEDULER_ID,
      { every: input.intervalMs },
      { name: 'sync', data: { limit: 25 }, opts: DEFAULT_JOB_OPTIONS },
    );
    if (!input.backfill) return;
    try {
      await this.mailQueue.add(
        'backfill',
        { days: input.days },
        { ...DEFAULT_JOB_OPTIONS, jobId: MAIL_BACKFILL_JOB_ID, delay: 6_000 },
      );
    } catch (err) {
      if (!isDuplicateJobError(err)) throw err;
    }
  }

  async removeMailSchedule() {
    if (!this.mailQueue) return;
    await this.mailQueue.removeJobScheduler(MAIL_SYNC_SCHEDULER_ID).catch(() => false);
  }

  async registerAttendanceSchedule() {
    if (!this.attendanceQueue) return;
    await this.attendanceQueue.upsertJobScheduler(
      ATTENDANCE_TICK_SCHEDULER_ID,
      { every: 30_000 },
      { name: 'tick', data: {}, opts: DEFAULT_JOB_OPTIONS },
    );
    await this.attendanceQueue.upsertJobScheduler(
      ATTENDANCE_CLEANUP_SCHEDULER_ID,
      { every: 10 * 60_000 },
      { name: 'cleanup', data: {}, opts: DEFAULT_JOB_OPTIONS },
    );
    try {
      await this.attendanceQueue.add(
        'catchup',
        {},
        { ...DEFAULT_JOB_OPTIONS, jobId: ATTENDANCE_CATCHUP_JOB_ID, delay: 8_000 },
      );
    } catch (err) {
      if (!isDuplicateJobError(err)) throw err;
    }
  }

  async removeAttendanceSchedule() {
    if (!this.attendanceQueue) return;
    await this.attendanceQueue.removeJobScheduler(ATTENDANCE_TICK_SCHEDULER_ID).catch(() => false);
    await this.attendanceQueue.removeJobScheduler(ATTENDANCE_CLEANUP_SCHEDULER_ID).catch(() => false);
  }

  async metrics() {
    const queues = [this.mailQueue, this.attendanceQueue].filter((queue): queue is Queue => !!queue);
    if (!queues.length) return { enabled: false, queues: [] as Array<Record<string, unknown>> };
    const rows = [];
    for (const queue of queues) {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
        rows.push({ name: queue.name, ...counts });
      } catch (err) {
        rows.push({ name: queue.name, error: (err as Error).message });
      }
    }
    return { enabled: this.enabled, queues: rows };
  }
}
