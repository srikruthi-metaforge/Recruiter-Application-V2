import { Module } from '@nestjs/common';
import { JdParserController } from './jd-parser.controller';
import { JdParserService } from './jd-parser.service';

@Module({
  controllers: [JdParserController],
  providers: [JdParserService],
  exports: [JdParserService],
})
export class JdParserModule {}
