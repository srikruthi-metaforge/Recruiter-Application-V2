import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { CandidateRepository } from './repositories/candidate.repository';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import {
  CandidateDocumentRecord,
  CandidateDocumentRecordSchema,
} from './schemas/candidate-document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: CandidateDocumentRecord.name, schema: CandidateDocumentRecordSchema },
    ]),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidateRepository],
  exports: [CandidatesService, CandidateRepository],
})
export class CandidatesModule {}
