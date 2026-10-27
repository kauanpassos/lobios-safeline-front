import { describe, it, expect } from 'vitest';
import {
  normalizeCaseDescription,
  normalizeCaseTitle,
  parseAdminCaseItems,
  parseCaseDetailsResponse,
  parseCaseMessageItems,
  parseCaseStatusHistoryItems,
  parseMyCaseApiItems,
  parseCreateCaseResponse,
} from './case';

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

    it('deve preservar prioridade nula sem substituí-la por um valor padrão', () => {
      const result = parseMyCaseApiItems([{ ...mockValidCaseItem, priority: null }]);

      expect(result[0].priority).toBeNull();
    });

    it('deve rejeitar status desconhecidos em vez de apresentá-los como recebidos', () => {
      const payload = [{ ...mockValidCaseItem, status: 'StatusBizarroInexistente' }];
      expect(() => parseMyCaseApiItems(payload)).toThrow('Invalid case status.');
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

  it('deve preservar prioridade nula nos detalhes da denúncia', () => {
    const result = parseCaseDetailsResponse({
      id: 'case-1',
      category: 'Fraude',
      title: 'Relato de fraude',
      description: 'Descrição do relato',
      status: 'Recebido',
      priority: null,
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(result.priority).toBeNull();
  });

  it('deve rejeitar detalhes sem informações essenciais, sem inventar valores', () => {
    expect(() => parseCaseDetailsResponse({ id: 'case-1' })).toThrow(
      'Resposta de detalhes da denúncia inválida.'
    );
  });

  it('deve validar os casos administrativos sem fabricar registros', () => {
    const parsed = parseAdminCaseItems([{
      id: 'case-1',
      categoryId: 'fraude',
      title: 'Relato',
      description: 'Descrição',
      status: 'Recebido',
      createdAtWindow: 'Hoje',
      priority: 'Alta',
      updatedAt: '2026-10-07T10:00:00.000Z',
      assignedUserIds: ['rh-1', 'rh-2'],
    }]);

    expect(parsed[0].id).toBe('case-1');
    expect(parsed[0].category).toBe('Fraude');
    expect(parsed[0].priority).toBe('Alta');
    expect(parsed[0].updatedAt).toBe('2026-10-07T10:00:00.000Z');
    expect(parsed[0].assignedUserIds).toEqual(['rh-1', 'rh-2']);
    expect(() => parseAdminCaseItems([{ categoryId: 'fraude' }])).toThrow('Invalid admin case item response.');
  });

  it('deve carregar casos legados com entidades HTML numéricas na categoria', () => {
    const parsed = parseAdminCaseItems([{
      id: 'case-legacy',
      categoryId: 'ass&#233;dio',
      title: 'Relato',
      description: 'Descrição',
      status: 'Recebido',
      createdAtWindow: 'Hoje',
      createdAt: '2026-10-07T10:00:00.000Z',
      assignedUserIds: [],
    }]);

    expect(parsed[0].category).toBe('Assédio');
  });

  it('deve aceitar mensagens somente quando pertencem ao caso solicitado', () => {
    const message = {
      id: 'message-1',
      caseId: 'case-1',
      senderUserId: 'hr-1',
      senderRole: 'HR',
      content: 'Recebemos seu relato.',
      createdAt: '2026-10-07T10:00:00.000Z',
    };
    const [parsed] = parseCaseMessageItems([message], 'case-1');

    expect(parsed?.isFromAdmin).toBe(true);
    expect(parsed?.senderName).toBe('Equipe de RH');
    expect(() => parseCaseMessageItems([message], 'case-2')).toThrow('Invalid case message response.');
  });

  it('deve validar e normalizar o histórico de status recebido da API', () => {
    const parsed = parseCaseStatusHistoryItems([{
      id: 'history-1',
      previousStatus: 'Nova',
      newStatus: 'Em análise',
      createdAt: '2026-10-07T10:00:00.000Z',
    }]);

    expect(parsed[0].previousStatus).toBe('Recebido');
    expect(parsed[0].newStatus).toBe('Em análise');
    expect(() => parseCaseStatusHistoryItems([{
      id: 'history-invalid',
      previousStatus: 'Recebido',
      newStatus: 'Resolvido',
      createdAt: 'data inválida',
    }])).toThrow('Invalid case status history item response.');
  });

  it('deve normalizar espaços do assunto e do relato sem juntar parágrafos', () => {
    expect(normalizeCaseTitle('  Falha   no\n processo  ')).toBe('Falha no processo');
    expect(normalizeCaseDescription('  Linha   um\r\n\r\n\r\n linha\t dois  ')).toBe('Linha um\n\nlinha dois');
  });

  it('deve decodificar entidades HTML como &#231; no título e descrição das denúncias', () => {
    const rawCase = {
      id: 'case-special-chars',
      protocol: 'QBDU-DAFT-FS7A',
      category: 'assédio',
      title: 'Ass&#233;dio Moral - Bob Esponja sem cal&#231;a quadrada!!!',
      description: 'Relato contendo acentua&#231;&#227;o e caracteres especiais: &#193;gua de ma&#231;&#227;.',
      status: 'Recebido',
      createdAt: '2026-10-01T12:00:00Z',
    };

    const [parsedMyCase] = parseMyCaseApiItems([rawCase]);
    expect(parsedMyCase.title).toBe('Assédio Moral - Bob Esponja sem calça quadrada!!!');
    expect(parsedMyCase.description).toBe('Relato contendo acentuação e caracteres especiais: Água de maçã.');
    expect(parsedMyCase.protocol).toBe('QBDU-DAFT-FS7A');

    const parsedDetails = parseCaseDetailsResponse(rawCase);
    expect(parsedDetails.title).toBe('Assédio Moral - Bob Esponja sem calça quadrada!!!');
    expect(parsedDetails.description).toBe('Relato contendo acentuação e caracteres especiais: Água de maçã.');
    expect(parsedDetails.protocol).toBe('QBDU-DAFT-FS7A');
  });
});
