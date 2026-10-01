import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true, collection: 'interviews' })
export class Interview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  interviewId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Submission', required: true })
  submissionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Requirement', required: true })
  requirementId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'Screening', enum: ['Screening', 'L1 Technical', 'L2 Technical', 'Manager Round', 'Client Round', 'HR Round'] })
  round: string;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ default: 60 })
  durationMinutes: number;

  @Prop({ default: 'Online', enum: ['Online', 'In-Person', 'Telephonic'] })
  mode: string;

  @Prop({ default: null })
  meetingUrl: string;

  @Prop({ required: true, trim: true })
  interviewerName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  interviewerEmail: string;

  @Prop({ default: 'Scheduled', enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Passed', 'Rejected', 'Rescheduled', 'Cancelled'] })
  status: string;

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);

// Compound Indexes prefixed with orgId and suffix deletedAt
InterviewSchema.index({ orgId: 1, submissionId: 1, round: 1, deletedAt: 1 });
InterviewSchema.index({ orgId: 1, dateTime: 1, status: 1, deletedAt: 1 });
InterviewSchema.index({ orgId: 1, interviewerEmail: 1, status: 1, dateTime: 1, deletedAt: 1 });

InterviewSchema.plugin(DataScopePlugin);
