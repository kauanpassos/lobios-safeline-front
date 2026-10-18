import { apiFetch } from './api';
import {
  parseClaimsAdminUser,
  parseClaimsAdminUserPage,
  parseClaimsAuditEntries,
  type ClaimsAdminUser,
  type ClaimsAdminUserPage,
  type ClaimsAuditEntry,
} from '../types/claims';
import type { ApplicationPermission } from '../types/auth';
import type { UserRole } from '../types/user';

export async function fetchClaimsAdminUsers(
  search: string,
  page: number,
  pageSize = 20,
  signal?: AbortSignal
): Promise<ClaimsAdminUserPage> {
  const query = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
  });

  return apiFetch(
    `/api/v1/admin/claims/users?${query.toString()}`,
    { method: 'GET', signal },
    parseClaimsAdminUserPage
  );
}

export async function fetchUserClaims(userId: string, signal?: AbortSignal): Promise<ClaimsAdminUser> {
  return apiFetch(
    `/api/v1/admin/claims/users/${encodeURIComponent(userId)}`,
    { method: 'GET', signal },
    parseClaimsAdminUser
  );
}

export async function grantUserRole(userId: string, role: UserRole): Promise<ClaimsAdminUser> {
  return changeUserClaim(userId, 'roles', role, 'POST');
}

export async function revokeUserRole(userId: string, role: UserRole): Promise<ClaimsAdminUser> {
  return changeUserClaim(userId, 'roles', role, 'DELETE');
}

export async function grantUserPermission(
  userId: string,
  permission: ApplicationPermission
): Promise<ClaimsAdminUser> {
  return changeUserClaim(userId, 'permissions', permission, 'POST');
}

export async function revokeUserPermission(
  userId: string,
  permission: ApplicationPermission
): Promise<ClaimsAdminUser> {
  return changeUserClaim(userId, 'permissions', permission, 'DELETE');
}

async function changeUserClaim(
  userId: string,
  kind: 'roles' | 'permissions',
  value: string,
  method: 'POST' | 'DELETE'
): Promise<ClaimsAdminUser> {
  return apiFetch(
    `/api/v1/admin/claims/users/${encodeURIComponent(userId)}/${kind}/${encodeURIComponent(value)}`,
    { method },
    parseClaimsAdminUser
  );
}

export async function fetchClaimsAudit(
  userId: string,
  signal?: AbortSignal
): Promise<ClaimsAuditEntry[]> {
  const query = new URLSearchParams({ userId, page: '1', pageSize: '50' });
  return apiFetch(
    `/api/v1/admin/claims/audit?${query.toString()}`,
    { method: 'GET', signal },
    parseClaimsAuditEntries
  );
}
