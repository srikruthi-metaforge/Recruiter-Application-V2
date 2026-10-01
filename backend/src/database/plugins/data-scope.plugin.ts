import { Schema, Query } from 'mongoose';
import { CurrentUserPayload } from '../../common/interfaces/current-user.interface';

export function DataScopePlugin(schema: Schema) {
  const hasDeletedAt = schema.path('deletedAt') !== undefined;
  const hasOrgId = schema.path('orgId') !== undefined;

  const preQueryHook = function (this: Query<any, any>) {
    const options = this.getOptions();
    const user: CurrentUserPayload | undefined = options.currentUser;

    const conditions: Record<string, any> = {};

    // 1. Always inject orgId filter if schema has orgId and user context is provided
    if (hasOrgId && user?.orgId) {
      conditions.orgId = user.orgId;
    }

    // 2. Always inject deletedAt: null if schema supports soft delete and not explicitly querying deleted
    if (hasDeletedAt && !options.includeDeleted) {
      conditions.deletedAt = null;
    }

    // 3. Inject role data scoping
    if (user) {
      if (user.role === 'recruiter') {
        conditions.$or = [
          { recruiterId: user._id },
          { assignedRecruiterIds: user._id },
          { createdBy: user._id }
        ];
      } else if (user.role === 'lead') {
        conditions.$or = [
          { assignedLeadId: user._id },
          { leadId: user._id },
          ...(user.teamRecruiterIds?.length ? [{ recruiterId: { $in: user.teamRecruiterIds } }] : [])
        ];
      } else if (user.role === 'client' && user.clientId) {
        conditions.clientId = user.clientId;
      }
    }

    if (Object.keys(conditions).length > 0) {
      this.where(conditions);
    }
  };

  schema.pre('find', preQueryHook);
  schema.pre('findOne', preQueryHook);
  schema.pre('findOneAndUpdate', preQueryHook);
  schema.pre('countDocuments', preQueryHook);
}
