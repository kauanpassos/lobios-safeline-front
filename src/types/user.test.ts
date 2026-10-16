import { describe, it, expect } from 'vitest';
import { parseHrAssigneeOptions, parseUserProfileResponse } from './user';

describe('user.ts - Parsers do Usuário', () => {
  const mockValidUser = {
    id: 'user-001',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'HR',
    department: 'Recursos Humanos',
    joinedAt: '2023-01-15T00:00:00Z'
  };

  describe('parseUserProfileResponse', () => {
    it('deve retornar o perfil de usuário corretamente para dados válidos', () => {
      const result = parseUserProfileResponse(mockValidUser);
      expect(result.id).toBe('user-001');
      expect(result.role).toBe('HR');
      expect(result.department).toBe('Recursos Humanos');
    });

    it('deve lançar erro caso falte uma propriedade obrigatória', () => {
      const userWithoutName = { ...mockValidUser, name: undefined };
      expect(() => parseUserProfileResponse(userWithoutName)).toThrow('Nome do usuário inválido ou ausente.');
    });

    it('deve retornar COLLABORATOR para role não mapeada', () => {
      const userWithInvalidRole = { ...mockValidUser, role: 'Hacker Supremo' };
      const result = parseUserProfileResponse(userWithInvalidRole);
      expect(result.role).toBe('COLLABORATOR');
    });

    it('deve processar normalmente mesmo se "department" estiver ausente (é opcional)', () => {
      const userWithoutDept = { ...mockValidUser, department: undefined };
      const result = parseUserProfileResponse(userWithoutDept);
      expect(result.department).toBeUndefined();
      expect(result.id).toBe('user-001');
    });
  });

  describe('parseHrAssigneeOptions', () => {
    it('deve validar sugestões de responsáveis', () => {
      expect(parseHrAssigneeOptions([{ id: 'rh-1', name: 'Ana Silva' }])).toEqual([
        { id: 'rh-1', name: 'Ana Silva' },
      ]);
      expect(() => parseHrAssigneeOptions([{ id: 'rh-1' }])).toThrow(
        'Resposta inválida ao pesquisar responsável.'
      );
    });
  });
});
