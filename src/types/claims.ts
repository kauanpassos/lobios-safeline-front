import type { ApplicationPermission } from './auth';
import type { UserRole } from './user';

export interface ClaimsAdminUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  permissions: ApplicationPermission[];
  effectivePermissions: ApplicationPermission[];
}

export interface ClaimsAdminUserPage {
  users: ClaimsAdminUser[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ClaimsAuditEntry {
  id: string;
  actorUserId: string;
  affectedUserId: string;
  operation: 'GRANT' | 'REVOKE';
  assignmentType: 'role' | 'permission';
  assignmentValue: string;
  occurredAt: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const allowedRoles: readonly UserRole[] = ['COLLABORATOR', 'HR', 'HR_ADMIN', 'ADMIN'];
const allowedPermissions: readonly ApplicationPermission[] = [
  'cases.read.all',
  'cases.status.manage',
  'cases.priority.manage',
  'cases.assign',
  'cases.delete',
  'messages.read',
  'messages.write',
  'attachments.read',
  'attachments.upload',
  'attachments.delete',
];

const isAllowedRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && allowedRoles.some((role) => role === value);

const isAllowedPermission = (value: unknown): value is ApplicationPermission =>
  typeof value === 'string' && allowedPermissions.some((permission) => permission === value);

const parseUser = (value: unknown): ClaimsAdminUser => {
  if (!isObject(value) ||
      typeof value.id !== 'string' ||
      typeof value.name !== 'string' ||
      typeof value.email !== 'string' ||
      !Array.isArray(value.roles) ||
      !value.roles.every(isAllowedRole) ||
      !Array.isArray(value.permissions) ||
      !value.permissions.every(isAllowedPermission) ||
      !Array.isArray(value.effectivePermissions) ||
      !value.effectivePermissions.every(isAllowedPermission)) {
    throw new Error('Resposta inválida na administração de permissões.');
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    roles: value.roles,
    permissions: value.permissions,
    effectivePermissions: value.effectivePermissions,
  };
};

export const parseClaimsAdminUser = (payload: unknown): ClaimsAdminUser => parseUser(payload);

export const parseClaimsAdminUserPage = (payload: unknown): ClaimsAdminUserPage => {
  if (!isObject(payload) ||
      !Array.isArray(payload.users) ||
      typeof payload.page !== 'number' ||
      typeof payload.pageSize !== 'number' ||
      typeof payload.totalCount !== 'number') {
    throw new Error('Resposta inválida na listagem de usuários.');
  }

  return {
    users: payload.users.map(parseUser),
    page: payload.page,
    pageSize: payload.pageSize,
    totalCount: payload.totalCount,
  };
};

export const parseClaimsAuditEntries = (payload: unknown): ClaimsAuditEntry[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Resposta inválida no histórico de auditoria.');
  }

  return payload.map((entry) => {
    if (!isObject(entry) ||
        typeof entry.id !== 'string' ||
        typeof entry.actorUserId !== 'string' ||
        typeof entry.affectedUserId !== 'string' ||
        (entry.operation !== 'GRANT' && entry.operation !== 'REVOKE') ||
        (entry.assignmentType !== 'role' && entry.assignmentType !== 'permission') ||
        typeof entry.assignmentValue !== 'string' ||
        typeof entry.occurredAt !== 'string') {
      throw new Error('Registro inválido no histórico de auditoria.');
    }

    return {
      id: entry.id,
      actorUserId: entry.actorUserId,
      affectedUserId: entry.affectedUserId,
      operation: entry.operation,
      assignmentType: entry.assignmentType,
      assignmentValue: entry.assignmentValue,
      occurredAt: entry.occurredAt,
    };
  });
};
