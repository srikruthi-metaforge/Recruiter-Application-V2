import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { applyOrgLegacyPostgresIdIndex } from '../../../database/legacy-v1.util';

export type SubmissionHistoryDocument = SubmissionHistory & Document;

@Schema({ timestamps: true, collection: 'submission_histories' })
export class SubmissionHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Submission', required: true })
  submissionId: Types.ObjectId;

  @Prop({ required: true })
  previousStage: string;

  @Prop({ required: true })
  newStage: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ default: null })
  notes: string;

  /** V1 `candidate_status_history.id` when imported from V1. */
  @Prop({ type: String, default: null, trim: true })
  legacyPostgresId: string | null;

  @Prop({ type: Object, default: null })
  legacy: Record<string, any> | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const SubmissionHistorySchema = SchemaFactory.createForClass(SubmissionHistory);
SubmissionHistorySchema.index({ orgId: 1, submissionId: 1, createdAt: -1 });
applyOrgLegacyPostgresIdIndex(SubmissionHistorySchema);
