import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { RuntimeMetricsService } from './common/performance/runtime-metrics.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class AppController {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly runtimeMetrics: RuntimeMetricsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Process health' })
  check() {
    return {
      status: 'ok',
      application: 'metaforge-recruiter-v2',
      database: 'mongodb',
    };
  }

  @Get('db')
  @ApiOperation({ summary: 'MongoDB connectivity' })
  checkDatabase() {
    const state = this.connection.readyState;

    return {
      status: state === 1 ? 'ok' : 'error',
      mongodb: state === 1 ? 'connected' : 'disconnected',
      database: this.connection.name,
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Response time, MongoDB, Redis, and queue counters' })
  metrics() {
    return this.runtimeMetrics.snapshot();
  }
}
