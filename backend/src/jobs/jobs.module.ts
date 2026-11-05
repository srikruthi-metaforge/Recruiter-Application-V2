import { Module } from '@nestjs/common';
import { BackgroundQueueService } from './background-queue.service';
import { JobRunnerService } from './job-runner.service';

@Module({
  providers: [BackgroundQueueService, JobRunnerService],
  exports: [BackgroundQueueService, JobRunnerService],
})
export class JobsModule {}
