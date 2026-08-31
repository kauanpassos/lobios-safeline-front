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
