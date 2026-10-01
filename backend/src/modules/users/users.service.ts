import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { RolePermission, RolePermissionDocument } from './schemas/role-permission.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ScreenTimeDto } from './dto/screen-time.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RecruiterAnalytics, RecruiterAnalyticsDocument } from '../analytics/schemas/recruiter-analytics.schema';

const DEFAULT_ROLE_PERMISSIONS: Record<string, { roleName: string; permissions: string[] }> = {
  superadmin: {
    roleName: 'Super Admin',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign', 'req_delete',
      'cand_search', 'cand_add', 'cand_export', 'cand_delete',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'rep_export_csv',
      'user_manage', 'role_manage', 'activity_logs',
    ],
  },
  admin: {
    roleName: 'Admin',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign',
      'cand_search', 'cand_add', 'cand_export',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'user_manage',
    ],
  },
  lead: {
    roleName: 'Team Lead',
    permissions: [
      'req_view_all', 'req_assign',
      'cand_search', 'cand_add', 'cand_export',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback',
      'rep_view_recruiter',
    ],
  },
  recruiter: {
    roleName: 'Recruiter',
    permissions: [
      'cand_search', 'cand_add',
      'sub_create', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback',
    ],
  },
  devteam: {
    roleName: 'Dev Team',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign', 'req_delete',
      'cand_search', 'cand_add', 'cand_export', 'cand_delete',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'rep_export_csv',
      'user_manage', 'role_manage', 'activity_logs',
    ],
  },
  client: {
    roleName: 'Client',
    permissions: ['req_view_my', 'sub_view_client', 'int_feedback'],
  },
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RolePermission.name) private readonly rolePermissionModel: Model<RolePermissionDocument>,
    @InjectModel(RecruiterAnalytics.name) private readonly analyticsModel: Model<RecruiterAnalyticsDocument>,
  ) {}

  /** Format user document for API response (stripping sensitive passwordHash) */
  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject ? user.toObject() : user;
    const { passwordHash, ...rest } = obj;
    return {
      ...rest,
      id: user._id.toString(),
    };
  }

  /** GET /api/v1/users */
  async findAll(currentUser: any, query?: { role?: string; search?: string; active?: string }) {
    const orgId = currentUser.orgId ? new Types.ObjectId(currentUser.orgId) : null;
    const filter: Record<string, any> = { deletedAt: null };

    if (orgId) {
      filter.orgId = orgId;
    }

    if (query?.role) {
      filter.role = query.role.toLowerCase();
    }

    if (query?.active !== undefined) {
      filter.active = query.active === 'true';
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { userId: regex }];
    }

    const users = await this.userModel.find(filter).sort({ createdAt: -1 }).exec();
    return users.map(u => this.sanitizeUser(u));
  }

  /** GET /api/v1/users/:id */
  async findById(id: string, currentUser: any) {
    let user: UserDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      user = await this.userModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!user) {
      user = await this.userModel.findOne({ userId: id, deletedAt: null }).exec();
    }

    if (!user) {
      throw new NotFoundException(`User '${id}' not found`);
    }

    return this.sanitizeUser(user);
  }

  /** POST /api/v1/users */
  async create(dto: CreateUserDto, currentUser: any) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const orgId = currentUser.orgId
      ? new Types.ObjectId(currentUser.orgId)
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const existing = await this.userModel.findOne({ orgId, email: normalizedEmail, deletedAt: null }).exec();
    if (existing) {
      throw new ConflictException(`User with email '${normalizedEmail}' already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = `user-${Date.now()}`;

    const newUser = new this.userModel({
      orgId,
      userId,
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: dto.role.toLowerCase(),
      phone: dto.phone || null,
      avatarUrl: dto.avatarUrl || null,
      active: dto.active !== undefined ? dto.active : true,
      capabilities: dto.capabilities || {},
      teamId: dto.teamId && Types.ObjectId.isValid(dto.teamId) ? new Types.ObjectId(dto.teamId) : null,
      clientId: dto.clientId && Types.ObjectId.isValid(dto.clientId) ? new Types.ObjectId(dto.clientId) : null,
    });

    const saved = await newUser.save();
    return this.sanitizeUser(saved);
  }

  /** PUT /api/v1/users/:id */
  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    let user: UserDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      user = await this.userModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!user) {
      user = await this.userModel.findOne({ userId: id, deletedAt: null }).exec();
    }

    if (!user) {
      throw new NotFoundException(`User '${id}' not found`);
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.email !== undefined) user.email = dto.email.trim().toLowerCase();
    if (dto.role !== undefined) user.role = dto.role.toLowerCase();
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.active !== undefined) user.active = dto.active;
    if (dto.capabilities !== undefined) user.capabilities = dto.capabilities;
    if (dto.teamId !== undefined) {
      user.teamId = dto.teamId && Types.ObjectId.isValid(dto.teamId) ? (new Types.ObjectId(dto.teamId) as any) : null;
    }
    if (dto.clientId !== undefined) {
      user.clientId = dto.clientId && Types.ObjectId.isValid(dto.clientId) ? (new Types.ObjectId(dto.clientId) as any) : null;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await user.save();
    return this.sanitizeUser(updated);
  }

  /** DELETE /api/v1/users/:id */
  async softDelete(id: string, currentUser: any) {
    let user: UserDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      user = await this.userModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!user) {
      user = await this.userModel.findOne({ userId: id, deletedAt: null }).exec();
    }

    if (!user) {
      throw new NotFoundException(`User '${id}' not found`);
    }

    user.deletedAt = new Date();
    user.active = false;
    await user.save();

    return { message: `User '${user.name}' has been soft-deleted successfully` };
  }

  /** GET /api/v1/users/me */
  async getMe(currentUser: any) {
    const user = await this.userModel.findById(currentUser.id || currentUser.userId).exec();
    if (!user) {
      throw new NotFoundException('Current authenticated user not found');
    }
    return this.sanitizeUser(user);
  }

  /** PUT /api/v1/users/me */
  async updateMe(dto: UpdateProfileDto, currentUser: any) {
    const user = await this.userModel.findById(currentUser.id || currentUser.userId).exec();
    if (!user) {
      throw new NotFoundException('Current authenticated user not found');
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await user.save();
    return this.sanitizeUser(updated);
  }

  /** POST /api/v1/users/screen-time */
  async recordScreenTime(dto: ScreenTimeDto, currentUser: any) {
    const dateKey = dto.date || new Date().toISOString().split('T')[0];
    const day = new Date(`${dateKey}T00:00:00.000Z`);
    const orgId = currentUser.orgId
      ? new Types.ObjectId(currentUser.orgId)
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const recruiterId = currentUser.id && Types.ObjectId.isValid(currentUser.id)
      ? new Types.ObjectId(currentUser.id)
      : undefined;

    let record = null;
    if (recruiterId) {
      record = await this.analyticsModel.findOneAndUpdate(
        { orgId, recruiterId, date: day },
        {
          $inc: { activeScreenTimeMinutes: Math.round((dto.activeSeconds || 0) / 60) },
          $setOnInsert: { orgId, recruiterId, date: day, schemaVersion: 1 },
        },
        { upsert: true, new: true },
      ).exec();
    }

    return {
      message: 'Screen time recorded successfully',
      record: {
        date: dateKey,
        userName: currentUser.name || currentUser.email,
        userRole: currentUser.role,
        activeSeconds: dto.activeSeconds,
        idleSeconds: dto.idleSeconds,
        status: dto.status || 'Active',
        lastActivityTimestamp: Date.now(),
        persistedMinutes: record?.activeScreenTimeMinutes ?? Math.round((dto.activeSeconds || 0) / 60),
      },
    };
  }

  /** GET /api/v1/roles/permissions */
  async getRolePermissions(currentUser: any) {
    const orgId = currentUser.orgId
      ? new Types.ObjectId(currentUser.orgId)
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    let docs = await this.rolePermissionModel.find({ orgId }).exec();

    // If empty in MongoDB, seed default matrix into MongoDB
    if (!docs || docs.length === 0) {
      const seedItems = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([roleCode, val]) => ({
        orgId,
        roleCode,
        roleName: val.roleName,
        permissions: val.permissions,
      }));
      docs = (await this.rolePermissionModel.insertMany(seedItems)) as any;
    }

    const result: Record<string, string[]> = {};
    const storedName: Record<string, string> = {};
    docs.forEach(doc => {
      result[doc.roleCode] = doc.permissions;
      storedName[doc.roleCode] = doc.roleName;
    });

    const roleCodes = [
      ...Object.keys(DEFAULT_ROLE_PERMISSIONS),
      ...docs.map(doc => doc.roleCode).filter(code => !DEFAULT_ROLE_PERMISSIONS[code]),
    ];

    return {
      orgId: orgId.toString(),
      permissionsMatrix: result,
      roles: roleCodes.map(roleCode => ({
        roleCode,
        roleName: DEFAULT_ROLE_PERMISSIONS[roleCode]?.roleName || storedName[roleCode] || roleCode,
        permissions: result[roleCode] || DEFAULT_ROLE_PERMISSIONS[roleCode]?.permissions || [],
      })),
    };
  }

  /** PUT /api/v1/roles/permissions */
  async updateRolePermissions(dto: UpdateRolePermissionsDto, currentUser: any) {
    const orgId = currentUser.orgId
      ? new Types.ObjectId(currentUser.orgId)
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const roleCode = dto.roleCode.toLowerCase();

    const roleName = DEFAULT_ROLE_PERMISSIONS[roleCode]?.roleName || roleCode.toUpperCase();

    const updated = await this.rolePermissionModel.findOneAndUpdate(
      { orgId, roleCode },
      { roleName, permissions: dto.permissions },
      { new: true, upsert: true },
    ).exec();

    return {
      message: `Permissions for role '${roleCode}' updated successfully`,
      rolePermission: {
        roleCode: updated.roleCode,
        roleName: updated.roleName,
        permissions: updated.permissions,
      },
    };
  }
}
