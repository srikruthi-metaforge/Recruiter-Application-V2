process.env.PROCESS_ROLE = 'worker';

import './common/runtime/threadpool';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * BullMQ worker process. Schedulers in the API enqueue mail extraction and
 * attendance work; this process executes it. With Redis unavailable the API
 * keeps its in-process timers instead.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
