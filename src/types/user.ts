export type UserRole = 'Administrador' | 'Analista de Compliance' | 'Investigador' | 'Colaborador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  joinedAt: string;
}

const isValidRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && ['Administrador', 'Analista de Compliance', 'Investigador', 'Colaborador'].includes(role);
};

export const parseUserProfileResponse = (data: unknown): UserProfile => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Formato de perfil de usuário inválido retornado pelo servidor.');
  }

  const d = data as Record<string, unknown>;

  if (typeof d.id !== 'string') throw new Error('ID do usuário inválido ou ausente.');
  if (typeof d.name !== 'string') throw new Error('Nome do usuário inválido ou ausente.');
  if (typeof d.email !== 'string') throw new Error('E-mail do usuário inválido ou ausente.');
  if (!isValidRole(d.role)) throw new Error(`Role do usuário inválido: ${String(d.role)}`);
  if (typeof d.joinedAt !== 'string') throw new Error('Data de registro inválida ou ausente.');

  return {
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role,
    joinedAt: d.joinedAt,
    department: typeof d.department === 'string' ? d.department : undefined
  };
};
