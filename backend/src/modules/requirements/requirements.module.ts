import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Requirement, RequirementSchema } from './schemas/requirement.schema';
import { RequirementHistory, RequirementHistorySchema } from './schemas/requirement-history.schema';
import {
  RequirementAssignment,
  RequirementAssignmentSchema,
} from './schemas/requirement-assignment.schema';
import {
  EmailIngestionEvent,
  EmailIngestionEventSchema,
} from './schemas/email-ingestion-event.schema';
import {
  ClientSubmitApproval,
  ClientSubmitApprovalSchema,
} from './schemas/client-submit-approval.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RequirementRepository } from './repositories/requirement.repository';
import { RequirementsService } from './requirements.service';
import { RequirementsController } from './requirements.controller';
import { RequirementsIngestController } from './requirements-ingest.controller';
import { MailExtractionSchedulerService } from './mail-extraction-scheduler.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsModule } from '../../jobs/jobs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Requirement.name, schema: RequirementSchema },
      { name: RequirementHistory.name, schema: RequirementHistorySchema },
      { name: RequirementAssignment.name, schema: RequirementAssignmentSchema },
      { name: EmailIngestionEvent.name, schema: EmailIngestionEventSchema },
      { name: ClientSubmitApproval.name, schema: ClientSubmitApprovalSchema },
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    NotificationsModule,
    JobsModule,
  ],
  controllers: [RequirementsController, RequirementsIngestController],
  providers: [RequirementsService, RequirementRepository, MailExtractionSchedulerService],
  exports: [
    RequirementsService,
    RequirementRepository,
    MailExtractionSchedulerService,
    MongooseModule,
  ],
})
export class RequirementsModule {}

