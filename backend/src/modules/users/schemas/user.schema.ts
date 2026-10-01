import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  userId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['superadmin', 'admin', 'lead', 'recruiter', 'devteam', 'client'], default: 'recruiter' })
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team', default: null })
  teamId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', default: null })
  clientId: MongooseSchema.Types.ObjectId;

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Object, default: {} })
  capabilities: Record<string, boolean>;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound Indexes prefixed with orgId and suffix deletedAt
UserSchema.index({ orgId: 1, email: 1, deletedAt: 1 }, { unique: true });
UserSchema.index({ orgId: 1, userId: 1, deletedAt: 1 }, { unique: true });
UserSchema.index({ orgId: 1, role: 1, active: 1, deletedAt: 1 });
UserSchema.index({ orgId: 1, teamId: 1, deletedAt: 1 });

UserSchema.plugin(DataScopePlugin);
