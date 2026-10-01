import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuditRepository } from './repositories/audit.repository';
import { ActivityLog } from './schemas/activity-log.schema';

export interface AuditLogQueryDto {
  userId?: string;
  action?: string;
  category?: string;
  targetEntity?: string;
  module?: string;
  entity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async findAll(currentUser: any, query: AuditLogQueryDto) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const filter: Record<string, any> = { orgId };

    // 1. User filter
    if (query.userId && Types.ObjectId.isValid(query.userId)) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    // 2. Action filter
    if (query.action) {
      filter.action = { $regex: new RegExp(query.action.trim(), 'i') };
    }

    // 3. Category / Entity / Module filter
    const cat = query.category || query.targetEntity || query.module || query.entity;
    if (cat) {
      filter.$or = [
        { category: { $regex: new RegExp(cat.trim(), 'i') } },
        { targetEntity: { $regex: new RegExp(cat.trim(), 'i') } },
      ];
    }

    // 4. Status filter
    if (query.status) {
      filter.status = query.status;
    }

    // 5. Date range filter
    const dateFilter: Record<string, any> = {};
    if (query.startDate) {
      const s = new Date(query.startDate);
      if (!isNaN(s.getTime())) dateFilter.$gte = s;
    }
    if (query.endDate) {
      const e = new Date(query.endDate);
      if (!isNaN(e.getTime())) dateFilter.$lte = e;
    }
    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }

    // 6. General Search
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      const searchConditions = [
        { userName: regex },
        { userEmail: regex },
        { action: regex },
        { category: regex },
        { targetEntity: regex },
        { targetId: regex },
        { clientName: regex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const page = Math.max(1, parseInt(String(query.page || 1), 10));
    const rawLimit = parseInt(String(query.limit || 20), 10);
    const limit = Math.min(100, Math.max(1, rawLimit));

    return this.auditRepository.findAll(filter, page, limit);
  }

  async findById(currentUser: any, id: string) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const log = await this.auditRepository.findById(orgId, id);
    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return log;
  }

  async createLog(logData: Partial<ActivityLog>) {
    return this.auditRepository.createLog(logData);
  }

  async createFromClient(currentUser: any, body: Record<string, any>) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const userId = currentUser?.id && Types.ObjectId.isValid(currentUser.id)
      ? new Types.ObjectId(currentUser.id)
      : new Types.ObjectId();

    const allowed = [
      'Submissions',
      'Requirements',
      'User Management',
      'Client Management',
      'Interviews',
      'System & Access',
      'Candidate Sourcing',
    ];
    const category = allowed.includes(body.category) ? body.category : 'System & Access';

    return this.auditRepository.createLog({
      orgId: orgId as any,
      userId: userId as any,
      userName: body.userName || currentUser.name || 'Unknown',
      userEmail: body.userEmail || currentUser.email || '',
      userRole: body.userRole || currentUser.role || 'recruiter',
      action: body.action || 'Activity recorded',
      category,
      targetEntity: body.targetEntity || body.action || 'Workspace',
      targetId: body.targetId || body.id || null,
      clientName: body.clientName || null,
      ipAddress: body.ipAddress || '127.0.0.1',
      status: ['Success', 'Warning', 'Security Alert'].includes(body.status) ? body.status : 'Success',
      details: typeof body.details === 'object' && body.details ? body.details : { note: body.details || '' },
      schemaVersion: 1,
    });
  }
}
