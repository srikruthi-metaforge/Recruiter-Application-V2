import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';
import { applyOrgLegacyPostgresIdIndex } from '../../../database/legacy-v1.util';

export type RequirementAssignmentDocument = RequirementAssignment & Document;

/**
 * Archive / ledger of recruiter assignments (V1 `requirement_assignments`).
 * V2 runtime still uses `requirements.assignedRecruiterIds` for current assignees.
 * This collection preserves full ACTIVE / REVOKED / COMPLETED history for migration & audit.
 */
@Schema({ timestamps: true, collection: 'requirement_assignments' })
export class RequirementAssignment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Requirement', required: true, index: true })
  requirementId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  recruiterId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  assignedOn: Date;

  @Prop({
    required: true,
    enum: ['ACTIVE', 'REVOKED', 'COMPLETED'],
    default: 'ACTIVE',
    index: true,
  })
  status: string;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: String, default: null, trim: true })
  legacyPostgresId: string | null;

  @Prop({ type: Object, default: null })
  legacy: Record<string, any> | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const RequirementAssignmentSchema = SchemaFactory.createForClass(RequirementAssignment);

RequirementAssignmentSchema.index({ orgId: 1, requirementId: 1, status: 1, assignedOn: -1 });
RequirementAssignmentSchema.index({ orgId: 1, recruiterId: 1, status: 1, assignedOn: -1 });
applyOrgLegacyPostgresIdIndex(RequirementAssignmentSchema);

RequirementAssignmentSchema.plugin(DataScopePlugin);
