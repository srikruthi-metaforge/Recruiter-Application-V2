import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job, Worker } from 'bullmq';
import { MailExtractionSchedulerService } from '../modules/requirements/mail-extraction-scheduler.service';
import { RecruiterAttendanceSchedulerService } from '../modules/recruiter-attendance/recruiter-attendance-scheduler.service';
import { ATTENDANCE_QUEUE, BULL_PREFIX, DEFAULT_JOB_OPTIONS, MAIL_QUEUE } from './job-options';
import { BackgroundQueueService } from './background-queue.service';

@Injectable()
export class JobRunnerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobRunnerService.name);
  private workers: Worker[] = [];
  private completedJobs = 0;
  private failedJobs = 0;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly queues: BackgroundQueueService,
  ) {}

  async onModuleInit() {
    if (!this.queues.isEnabled()) return;
    const role = process.env.PROCESS_ROLE || 'api';
    const runHere = role === 'worker' || process.env.WORKER_IN_API !== 'false';
    if (!runHere) {
      this.logger.log('BullMQ workers run in the worker process (WORKER_IN_API=false)');
      return;
    }
    this.workers = [
      this.consume(MAIL_QUEUE, (job) => this.runMail(job)),
      this.consume(ATTENDANCE_QUEUE, (job) => this.runAttendance(job)),
    ].filter((worker): worker is Worker => !!worker);
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((worker) => worker.close().catch(() => undefined)));
  }

  private consume(queueName: string, handler: (job: Job) => Promise<unknown>): Worker | null {
    const connection = this.queues.workerConnection();
    if (!connection) return null;
    const worker = new Worker(queueName, handler, {
      connection,
      prefix: BULL_PREFIX,
      concurrency: 1,
    });
    worker.on('completed', () => {
      this.completedJobs += 1;
    });
    worker.on('failed', (job, err) => {
      this.failedJobs += 1;
      const made = job?.attemptsMade ?? 0;
      const max = job?.opts?.attempts ?? DEFAULT_JOB_OPTIONS.attempts;
      this.logger.error(`${queueName}/${job?.name || 'job'} failed attempt ${made}/${max}: ${err.message}`);
      if (made >= max) this.logger.error(`${queueName} job ${job?.id} exhausted retries`);
    });
    worker.on('error', (err) => this.logger.error(`${queueName} worker error: ${err.message}`));
    this.logger.log(`BullMQ worker listening on ${queueName}`);
    return worker;
  }

  metrics() {
    return {
      listening: this.workers.length,
      completed: this.completedJobs,
      failed: this.failedJobs,
    };
  }

  private async runMail(job: Job) {
    const scheduler = this.moduleRef.get(MailExtractionSchedulerService, { strict: false });
    if (job.name === 'backfill') {
      return scheduler.runInitialHistoricalBackfill({ days: Number(job.data?.days) || undefined });
    }
    return scheduler.triggerScheduledSync(Number(job.data?.limit) || 25);
  }

  private async runAttendance(job: Job) {
    const scheduler = this.moduleRef.get(RecruiterAttendanceSchedulerService, { strict: false });
    if (job.name === 'cleanup') return scheduler.runSessionCleanup();
    if (job.name === 'catchup') return scheduler.runCatchUp();
    return scheduler.handleScheduleTick();
  }
}
