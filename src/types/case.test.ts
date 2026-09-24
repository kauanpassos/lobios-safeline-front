import { describe, it, expect } from 'vitest';
import { parseMyCaseApiItems, parseCreateCaseResponse } from './case';

describe('case.ts - Parsers e Normalizadores', () => {
  const mockValidCaseItem = {
    id: '12345',
    protocol: 'NH3 - YGW',
    category: 'assédio',
    content: 'Conteúdo da denúncia',
    description: 'Descrição breve',
    status: 'Recebido',
    priority: 'Alta',
    createdAt: '2023-10-01T12:00:00Z',
  };

  describe('parseMyCaseApiItems', () => {
    it('deve fazer o parse de um array válido de denúncias', () => {
      const result = parseMyCaseApiItems([mockValidCaseItem]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('12345');
      expect(result[0].category).toBe('Assédio');
    });

    it('deve mapear status legados para os novos status equivalentes', () => {
      const payload = [
        { ...mockValidCaseItem, status: 'Nova' },
        { ...mockValidCaseItem, status: 'Concluída' },
        { ...mockValidCaseItem, status: 'Deletar' },
      ];
      
      const result = parseMyCaseApiItems(payload);
      
      expect(result[0].status).toBe('Recebido');
      expect(result[1].status).toBe('Resolvido');
      expect(result[2].status).toBe('Encerrado');
    });

    it('deve usar o fallback "Recebido" para status desconhecidos sem quebrar a lista', () => {
      const payload = [{ ...mockValidCaseItem, status: 'StatusBizarroInexistente' }];
      const result = parseMyCaseApiItems(payload);
      
      expect(result[0].status).toBe('Recebido');
    });

    it('deve lançar erro se o payload não for um array', () => {
      expect(() => parseMyCaseApiItems({ id: '123' })).toThrow('Invalid cases response.');
    });

    it('deve lançar erro se um item da lista estiver faltando propriedades obrigatórias', () => {
      const invalidPayload = [{ id: '123', category: 'assédio' }]; // Faltam content, status, etc.
      expect(() => parseMyCaseApiItems(invalidPayload)).toThrow('Invalid case item response.');
    });
  });

  describe('parseCreateCaseResponse', () => {
    it('deve fazer o parse de uma resposta válida de criação', () => {
      const result = parseCreateCaseResponse({ protocol: 'PROT-123', message: 'Sucesso' });
      expect(result.protocol).toBe('PROT-123');
      expect(result.message).toBe('Sucesso');
    });
  });
});
