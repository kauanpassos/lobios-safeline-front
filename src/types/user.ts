export type UserRole = 'Administrador' | 'Analista de Compliance' | 'Investigador' | 'Colaborador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  joinedAt: string;
}

export const parseUserProfileResponse = (data: unknown): UserProfile => {
  const d = data as Record<string, unknown>;
  if (!d || typeof d.id !== 'string' || typeof d.name !== 'string') {
    throw new Error('Formato de perfil de usuário inválido retornado pelo servidor.');
  }
  return data as UserProfile;
};
