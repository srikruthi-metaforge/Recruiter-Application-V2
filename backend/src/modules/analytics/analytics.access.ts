import { ForbiddenException } from '@nestjs/common';

/** Data scopes for analytics. Phase 1 exposes company-wide to Super Admin only. */
export type AnalyticsScope = 'company' | 'org' | 'team';

/**
 * Phase 1: Super Admin only.
 * Later phases can widen allowed roles and map them to narrower scopes
 * without rewriting controllers or chart UIs.
 */
export function resolveAnalyticsAccess(currentUser: any): { scope: AnalyticsScope } {
  const role = String(currentUser?.role || '')
    .trim()
    .toLowerCase();

  if (role === 'superadmin') {
    return { scope: 'company' };
  }

  // Future:
  // if (role === 'admin') return { scope: 'org' };
  // if (role === 'lead') return { scope: 'team' };

  throw new ForbiddenException('Analytics dashboard is available to Super Admin only in this release');
}

export function assertAnalyticsAccess(currentUser: any): AnalyticsScope {
  return resolveAnalyticsAccess(currentUser).scope;
}
