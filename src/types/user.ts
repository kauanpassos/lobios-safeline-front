export type UserRole = 'Administrador' | 'Analista de Compliance' | 'Investigador' | 'Colaborador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  joinedAt: string;
}

const normalizeRole = (value: unknown): UserRole => {
  if (value === 'Administrador' || value === 'Analista de Compliance' || value === 'Investigador' || value === 'Colaborador') {
    return value;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower.includes('admin')) return 'Administrador';
    if (lower.includes('invest')) return 'Investigador';
    if (lower.includes('analista')) return 'Analista de Compliance';
  }

  throw new Error(`Role do usuário inválido: ${String(value)}`);
};

export const parseUserProfileResponse = (data: unknown): UserProfile => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Formato de resposta do perfil inválido.');
  }

  const d = data as Record<string, unknown>;

  if (typeof d.id !== 'string') throw new Error('ID do usuário inválido ou ausente.');
  if (typeof d.name !== 'string') throw new Error('Nome do usuário inválido ou ausente.');
  if (typeof d.email !== 'string') throw new Error('E-mail do usuário inválido ou ausente.');
  if (typeof d.joinedAt !== 'string') throw new Error('Data de registro inválida ou ausente.');

  return {
    id: d.id,
    name: d.name,
    email: d.email,
    role: normalizeRole(d.role),
    joinedAt: d.joinedAt,
    department: typeof d.department === 'string' ? d.department : undefined,
  };
};
