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
    role?: 'employee' | 'admin' | 'anonymous';
  } | null;
}

export interface LoginResponse {
  token: string;
}

export const parseLoginResponse = (payload: unknown): LoginResponse => {
  if (typeof payload !== 'object' || payload === null || !('token' in payload) || typeof payload.token !== 'string') {
    throw new Error('Invalid authentication response.');
  }

  return { token: payload.token };
};
