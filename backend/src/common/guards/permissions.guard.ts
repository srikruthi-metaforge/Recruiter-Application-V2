import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

const FALLBACK_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  devteam: ['*'],
  admin: [
    'req_view_all', 'req_create', 'req_edit', 'req_assign',
    'cand_search', 'cand_add', 'cand_export',
    'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
    'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
    'rep_view_exec', 'rep_view_recruiter', 'user_manage',
  ],
  lead: [
    'req_view_all', 'req_assign',
    'cand_search', 'cand_add', 'cand_export',
    'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
    'int_schedule', 'int_join_links', 'int_feedback',
    'rep_view_recruiter',
  ],
  recruiter: [
    'cand_search', 'cand_add',
    'sub_create', 'sub_move_stage',
    'int_schedule', 'int_join_links', 'int_feedback',
  ],
  client: ['req_view_my', 'sub_view_client', 'int_feedback'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException('Authenticated role is required for this action');
    }

    const role = String(user.role).toLowerCase();
    if (role === 'superadmin' || role === 'devteam') return true;

    const granted: string[] = Array.isArray(user.permissions) && user.permissions.length
      ? user.permissions
      : FALLBACK_PERMISSIONS[role] || [];

    if (granted.includes('*') || granted.includes(required)) return true;

    throw new ForbiddenException(`Missing permission: ${required}`);
  }
}
