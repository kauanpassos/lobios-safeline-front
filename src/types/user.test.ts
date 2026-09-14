import { describe, it, expect } from 'vitest';
import { parseUserProfileResponse } from './user';

describe('user.ts - Parsers do Usuário', () => {
  const mockValidUser = {
    id: 'user-001',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'Investigador',
    department: 'Recursos Humanos',
    joinedAt: '2023-01-15T00:00:00Z'
  };

  describe('parseUserProfileResponse', () => {
    it('deve retornar o perfil de usuário corretamente para dados válidos', () => {
      const result = parseUserProfileResponse(mockValidUser);
      expect(result.id).toBe('user-001');
      expect(result.role).toBe('Investigador');
      expect(result.department).toBe('Recursos Humanos');
    });

    it('deve lançar erro caso falte uma propriedade obrigatória', () => {
      const userWithoutName = { ...mockValidUser, name: undefined };
      expect(() => parseUserProfileResponse(userWithoutName)).toThrow('Nome do usuário inválido ou ausente.');
    });

    it('deve lançar erro caso o "role" (cargo) seja inválido', () => {
      const userWithInvalidRole = { ...mockValidUser, role: 'Hacker Supremo' };
      expect(() => parseUserProfileResponse(userWithInvalidRole)).toThrow(/Role do usuário inválido/);
    });

    it('deve processar normalmente mesmo se "department" estiver ausente (é opcional)', () => {
      const userWithoutDept = { ...mockValidUser, department: undefined };
      const result = parseUserProfileResponse(userWithoutDept);
      expect(result.department).toBeUndefined();
      expect(result.id).toBe('user-001');
    });
  });
});
