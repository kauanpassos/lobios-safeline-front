export type UserRole = 'Admin' | 'User' | 'HR' | 'HR_MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  joinedAt: string;
}

export interface HrAssignee {
  id: string;
  name: string;
}

export const parseHrAssigneeOptions = (payload: unknown): HrAssignee[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Resposta inválida ao pesquisar responsáveis.');
  }

  return payload.map((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('id' in item) ||
      typeof item.id !== 'string' ||
      !('name' in item) ||
      typeof item.name !== 'string'
    ) {
      throw new Error('Resposta inválida ao pesquisar responsável.');
    }

    return { id: item.id, name: item.name };
  });
};

const normalizeRole = (value: unknown): UserRole => {
  if (value === 'Admin' || value === 'HR' || value === 'HR_MANAGER') {
    return value;
  }

  return 'User';
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
