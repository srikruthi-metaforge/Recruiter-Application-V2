import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class AppController {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      application: 'metaforge-recruiter-v2',
      database: 'mongodb',
    };
  }

  @Get('db')
  checkDatabase() {
    const state = this.connection.readyState;

    return {
      status: state === 1 ? 'ok' : 'error',
      mongodb: state === 1 ? 'connected' : 'disconnected',
      database: this.connection.name,
    };
  }
}