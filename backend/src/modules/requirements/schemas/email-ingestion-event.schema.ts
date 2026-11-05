import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DataScopePlugin } from '../../../database/plugins/data-scope.plugin';
import { OrgCachePlugin } from '../../../database/plugins/org-cache.plugin';
import { applyOrgLegacyPostgresIdIndex } from '../../../database/legacy-v1.util';

export type EmailIngestionEventDocument = EmailIngestionEvent & Document;

/**
 * Ledger of inbound JD email automation events (V1 `email_ingestion_events`).
 * Complements requirement source* fields; preserves idempotency and payload history.
 */
@Schema({ timestamps: true, collection: 'email_ingestion_events' })
export class EmailIngestionEvent {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  orgId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  idempotencyKey: string;

  @Prop({ type: String, default: null, trim: true })
  graphMessageId: string | null;

  @Prop({ type: String, default: null, trim: true })
  internetMessageId: string | null;

  @Prop({ default: 'EMAIL_AUTOMATION', trim: true })
  source: string;

  @Prop({ default: 'PENDING', trim: true, index: true })
  status: string;

  @Prop({ type: String, default: null })
  errorMessage: string | null;

  /** Linked V2 requirement ObjectId after resolve (optional). */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Requirement', default: null, index: true })
  requirementId: Types.ObjectId | null;

  /** V1 requirement PK text (pre-resolve). */
  @Prop({ type: String, default: null, trim: true })
  requirementPk: string | null;

  @Prop({ type: String, default: null, trim: true })
  requirementCode: string | null;

  @Prop({ type: Object, default: null })
  payload: Record<string, any> | null;

  @Prop({ type: String, default: null, trim: true })
  legacyPostgresId: string | null;

  @Prop({ type: Object, default: null })
  legacy: Record<string, any> | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const EmailIngestionEventSchema = SchemaFactory.createForClass(EmailIngestionEvent);

EmailIngestionEventSchema.index(
  { orgId: 1, idempotencyKey: 1 },
  { unique: true, name: 'uniq_org_email_ingestion_idempotencyKey' },
);
EmailIngestionEventSchema.index({ orgId: 1, graphMessageId: 1 });
EmailIngestionEventSchema.index({ orgId: 1, status: 1, createdAt: -1 });
applyOrgLegacyPostgresIdIndex(EmailIngestionEventSchema);

EmailIngestionEventSchema.plugin(DataScopePlugin).plugin(OrgCachePlugin);
