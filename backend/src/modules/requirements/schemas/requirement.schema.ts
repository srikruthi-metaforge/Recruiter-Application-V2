import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';

export type RequirementDocument = Requirement & Document;

@Schema({
  timestamps: true,
  collection: 'requirements',
})
export class Requirement {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  orgId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  reqCode: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  clientName: string;

  @Prop({
    default: 'Medium',
    enum: ['High', 'Medium', 'Low', 'Urgent'],
  })
  priority: string;

  @Prop({
    default: 'Open',
    enum: ['Open', 'Assigned', 'In Progress', 'On Hold', 'Reopen', 'Closed'],
  })
  status: string;

  @Prop({
    default: 'Unassigned',
    enum: ['Unassigned', 'Assigned', 'In Progress', 'Closed'],
  })
  assignmentStatus: string;

  @Prop({ default: 1, min: 1 })
  openings: number;

  @Prop({ default: 0, min: 0 })
  placedCount: number;

  @Prop({
    type: Object,
    default: { min: 0, max: 0, currency: 'INR' },
  })
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  assignedLeadId: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  assignedRecruiterIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  skillsRequired: string[];

  @Prop({
    type: Object,
    default: { min: 0, max: 0 },
  })
  experienceRange: {
    min: number;
    max: number;
  };

  @Prop({ default: 'Hybrid' })
  location: string;

  @Prop({ default: Date.now })
  emailArrivedTime: Date;

  @Prop({ default: false })
  revokeRequested: boolean;

  @Prop({ default: null })
  revokeReason: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const RequirementSchema =
  SchemaFactory.createForClass(Requirement);

// Compound Indexes prefixed with orgId and suffix deletedAt
RequirementSchema.index(
  {
    orgId: 1,
    reqCode: 1,
    deletedAt: 1,
  },
  {
    unique: true,
  },
);

RequirementSchema.index({
  orgId: 1,
  status: 1,
  clientId: 1,
  createdAt: -1,
  deletedAt: 1,
});

RequirementSchema.index({
  orgId: 1,
  assignedLeadId: 1,
  status: 1,
  deletedAt: 1,
});

RequirementSchema.index({
  orgId: 1,
  assignedRecruiterIds: 1,
  status: 1,
  deletedAt: 1,
});

RequirementSchema.plugin(DataScopePlugin);