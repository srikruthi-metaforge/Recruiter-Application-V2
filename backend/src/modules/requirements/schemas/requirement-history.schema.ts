import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { applyOrgLegacyPostgresIdIndex } from '../../../database/legacy-v1.util';

export type RequirementHistoryDocument = RequirementHistory & Document;

@Schema({ timestamps: true, collection: 'requirement_histories' })
export class RequirementHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Requirement', required: true })
  requirementId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  previousValue: Record<string, any>;

  @Prop({ type: Object, default: {} })
  newValue: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ default: null })
  reason: string;

  /** V1 `requirement_activities.id` when imported from V1. */
  @Prop({ type: String, default: null, trim: true })
  legacyPostgresId: string | null;

  @Prop({ type: Object, default: null })
  legacy: Record<string, any> | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const RequirementHistorySchema = SchemaFactory.createForClass(RequirementHistory);
RequirementHistorySchema.index({ orgId: 1, requirementId: 1, createdAt: -1 });
applyOrgLegacyPostgresIdIndex(RequirementHistorySchema);
