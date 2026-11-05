import { Injectable } from '@nestjs/common';
import { performanceMetrics } from './performance-metrics';
import { RedisService } from '../../modules/redis/redis.service';
import { BackgroundQueueService } from '../../jobs/background-queue.service';
import { JobRunnerService } from '../../jobs/job-runner.service';

@Injectable()
export class RuntimeMetricsService {
  constructor(
    private readonly redis: RedisService,
    private readonly queues: BackgroundQueueService,
    private readonly jobs: JobRunnerService,
  ) {}

  async snapshot() {
    const [redis, queues] = await Promise.all([
      this.redis.metrics(),
      this.queues.metrics(),
    ]);
    const timings = performanceMetrics.snapshot();
    return {
      collectedAt: new Date().toISOString(),
      http: timings.http,
      mongodb: timings.mongodb,
      recentSlowHttp: timings.recentSlowHttp,
      recentSlowQueries: timings.recentSlowQueries,
      redis,
      bullmq: {
        ...queues,
        worker: this.jobs.metrics(),
      },
      compression: { thresholdBytes: 1024 },
    };
  }
}
