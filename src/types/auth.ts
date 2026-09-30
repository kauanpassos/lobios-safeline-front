import type { UserRole } from './user';
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name?: string;
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
  userId: string;
  email: string;
}

export const parseLoginResponse = (payload: unknown): LoginResponse => {
  if (typeof payload !== 'object' || payload === null || !('token' in payload) || typeof payload.token !== 'string') {
    throw new Error('Invalid authentication response.');
  }
  
  const d = payload as Record<string, unknown>;

  return { 
    token: d.token as string,
    role: (d.role as UserRole) || 'User',
    userId: (d.userId as string) || '',
    email: (d.email as string) || ''
  };
};
