import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Requirement, RequirementSchema } from './schemas/requirement.schema';
import { RequirementHistory, RequirementHistorySchema } from './schemas/requirement-history.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { RequirementRepository } from './repositories/requirement.repository';
import { RequirementsService } from './requirements.service';
import { RequirementsController } from './requirements.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Requirement.name, schema: RequirementSchema },
      { name: RequirementHistory.name, schema: RequirementHistorySchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    AuthModule,
  ],
  controllers: [RequirementsController],
  providers: [RequirementsService, RequirementRepository],
  exports: [RequirementsService, RequirementRepository],
})
export class RequirementsModule {}
