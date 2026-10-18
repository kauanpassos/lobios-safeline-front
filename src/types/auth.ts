import type { UserRole } from './user';

export type ApplicationPermission =
  | 'cases.read.all'
  | 'cases.status.manage'
  | 'cases.priority.manage'
  | 'cases.assign'
  | 'cases.delete'
  | 'messages.read'
  | 'messages.write'
  | 'attachments.read'
  | 'attachments.upload'
  | 'attachments.delete';
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role?: UserRole;
  } | null;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  roles: UserRole[];
  permissions: ApplicationPermission[];
  userId: string;
  email: string;
}

const isUserRole = (value: unknown): value is UserRole =>
  value === 'COLLABORATOR' || value === 'HR' || value === 'HR_ADMIN' || value === 'ADMIN';

const isApplicationPermission = (value: unknown): value is ApplicationPermission =>
  value === 'cases.read.all' ||
  value === 'cases.status.manage' ||
  value === 'cases.priority.manage' ||
  value === 'cases.assign' ||
  value === 'cases.delete' ||
  value === 'messages.read' ||
  value === 'messages.write' ||
  value === 'attachments.read' ||
  value === 'attachments.upload' ||
  value === 'attachments.delete';

export const parseLoginResponse = (payload: unknown): LoginResponse => {
  if (typeof payload !== 'object' || payload === null || !('token' in payload) || typeof payload.token !== 'string') {
    throw new Error('Invalid authentication response.');
  }
  
  const d = payload as Record<string, unknown>;

  if (!isUserRole(d.role) || typeof d.userId !== 'string' || typeof d.email !== 'string') {
    throw new Error('Invalid authentication response.');
  }

  if (!Array.isArray(d.roles) || !d.roles.every(isUserRole) ||
      !Array.isArray(d.permissions) || !d.permissions.every(isApplicationPermission)) {
    throw new Error('Invalid authorization claims in authentication response.');
  }

  return {
    token: payload.token,
    role: d.role,
    roles: d.roles,
    permissions: d.permissions,
    userId: d.userId,
    email: d.email
  };
};
