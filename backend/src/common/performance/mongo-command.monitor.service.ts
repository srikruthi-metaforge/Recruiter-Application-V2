import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { attachMongoCommandMonitor } from './mongo-command.monitor';

@Injectable()
export class MongoCommandMonitor implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    const attach = () => {
      try {
        attachMongoCommandMonitor(this.connection);
      } catch (err) {
        // Command events are optional. Requests still run without them.
      }
    };
    if (this.connection.readyState === 1) attach();
    else this.connection.on('connected', attach);
  }
}
