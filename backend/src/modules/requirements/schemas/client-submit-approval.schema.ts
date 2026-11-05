import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ClientSubmitApprovalDocument = ClientSubmitApproval & Document;

@Schema({ timestamps: true, collection: 'client_submit_approvals' })
export class ClientSubmitApproval {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Requirement', required: true, index: true })
  requirementId: Types.ObjectId;

  @Prop({ type: String, default: null, trim: true, index: true })
  reqCode: string;

  @Prop({ type: String, default: '', trim: true })
  reqTitle: string;

  @Prop({ type: String, default: '', trim: true })
  clientName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  recruiterId: Types.ObjectId;

  @Prop({ type: String, default: '', trim: true })
  recruiterName: string;

  @Prop({ type: String, default: '', trim: true })
  recruiterEmail: string;

  @Prop({ type: [String], default: [] })
  candidateNames: string[];

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'approved' | 'rejected';

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  reviewedById: Types.ObjectId | null;

  @Prop({ type: String, default: null, trim: true })
  reviewedByName: string | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: Date, default: Date.now })
  requestedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ClientSubmitApprovalSchema = SchemaFactory.createForClass(ClientSubmitApproval);
ClientSubmitApprovalSchema.index({ orgId: 1, requirementId: 1, recruiterId: 1, status: 1 });
ClientSubmitApprovalSchema.index({ orgId: 1, status: 1, requestedAt: -1 });
