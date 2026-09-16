import { describe, it, expect } from 'vitest';
import { isStrongPassword, isNewPasswordAllowed } from './passwordValidation';

describe('passwordValidation', () => {
  it('deve rejeitar uma nova senha igual à senha atual', () => {
    expect(isNewPasswordAllowed('SenhaAtual!123', 'SenhaAtual!123')).toBe(false);
  });

  it('deve aceitar uma senha forte diferente da atual', () => {
    expect(isNewPasswordAllowed('SenhaAtual!123', 'NovaSenha@456')).toBe(true);
  });

  it('deve validar a força da senha conforme as regras do sistema', () => {
    expect(isStrongPassword('Abcdef1!')).toBe(true);
    expect(isStrongPassword('abc12345')).toBe(false);
  });
});
