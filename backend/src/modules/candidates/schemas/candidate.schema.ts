import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';
import { applyOrgLegacyPostgresIdIndex } from '../../../database/legacy-v1.util';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true, collection: 'candidates' })
export class Candidate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  candidateId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: null })
  linkedInUrl: string;

  @Prop({ default: null })
  currentCompany: string;

  @Prop({ default: null })
  qualification: string;

  @Prop({ default: 0.0 })
  totalExperienceYears: number;

  @Prop({ default: 0.0 })
  relevantExperienceYears: number;

  @Prop({ default: 0.0 })
  currentCtc: number;

  @Prop({ default: 0.0 })
  expectedCtc: number;

  @Prop({ default: 30 })
  noticePeriodDays: number;

  @Prop({ default: null })
  currentLocation: string;

  @Prop({ default: null })
  preferredLocation: string;

  @Prop({ default: 'No', enum: ['No', 'Yes', 'In Pipeline', 'Multiple'] })
  offerInHand: string;

  @Prop({ default: null })
  interviewAvailability: string;

  @Prop({ default: null })
  reasonForChange: string;

  @Prop({ default: null })
  notes: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FileMetadata', default: null })
  resumeFileId: Types.ObjectId;

  /** Original filename of the attached resume, copied from file metadata at link time. */
  @Prop({ default: null })
  resumeFileName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sourcedByRecruiterId: Types.ObjectId;

  @Prop({ default: 'New', enum: ['New', 'Parsed', 'Submitted', 'Interviewing', 'Offered', 'Placed'] })
  status: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  /** V1 Postgres `candidates.id`. */
  @Prop({ type: String, default: null, trim: true })
  legacyPostgresId: string | null;

  /**
   * V1-only leftovers preserved for migration fidelity, e.g.:
   * candidateRef, education[], technologies[], sourcePlatform, sourcePlatformId,
   * experienceLabel, raw salaries/notice, offerInHandDetails, phoneNormalized, createdByMissing.
   */
  @Prop({ type: Object, default: null })
  legacy: Record<string, any> | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

// Compound Indexes prefixed with orgId and suffix deletedAt
CandidateSchema.index({ orgId: 1, phone: 1, deletedAt: 1 }, { unique: true });
CandidateSchema.index({ orgId: 1, email: 1, deletedAt: 1 }, { unique: true });
CandidateSchema.index({ orgId: 1, skills: 1, totalExperienceYears: 1, deletedAt: 1 });
CandidateSchema.index({ orgId: 1, noticePeriodDays: 1, currentLocation: 1, deletedAt: 1 });
applyOrgLegacyPostgresIdIndex(CandidateSchema);

CandidateSchema.plugin(DataScopePlugin);
