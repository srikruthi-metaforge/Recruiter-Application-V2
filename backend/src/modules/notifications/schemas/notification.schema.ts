import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
  | 'submission_approved'
  | 'submission_rejected'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'offer_released'
  | 'candidate_placed'
  | 'requirement_assigned'
  | 'lead_approval_requested';

export type EntityType = 'submission' | 'interview' | 'offer' | 'requirement' | 'candidate';

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'submission_approved',
      'submission_rejected',
      'interview_scheduled',
      'interview_reminder',
      'offer_released',
      'candidate_placed',
      'requirement_assigned',
      'lead_approval_requested',
    ],
  })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  entityId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['submission', 'interview', 'offer', 'requirement', 'candidate'] })
  entityType: EntityType;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Unread notifications feed index
NotificationSchema.index({ orgId: 1, userId: 1, readAt: 1, createdAt: -1 });

// All notifications feed index
NotificationSchema.index({ orgId: 1, userId: 1, createdAt: -1 });

// 90 Days TTL index (7776000 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
