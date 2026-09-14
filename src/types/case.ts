export const CASE_STATUSES = [
  'Recebido',
  'Em análise',
  'Em investigação',
  'Aguardando informações',
  'Resolvido',
  'Encerrado',
] as const;

export type CaseStatus = typeof CASE_STATUSES[number];

export const CASE_PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;
export type CasePriority = typeof CASE_PRIORITIES[number];

export const CASE_CATEGORIES = ['Assédio', 'Fraude', 'Conduta', 'Sugestão', 'Outro'] as const;
export type CaseCategory = typeof CASE_CATEGORIES[number];

export const CASE_CATEGORY_IDS = ['assédio', 'fraude', 'conduta', 'sugestao', 'outro'] as const;
export type CaseCategoryId = typeof CASE_CATEGORY_IDS[number];

export const isCaseCategoryId = (value: string): value is CaseCategoryId => (
  CASE_CATEGORY_IDS.includes(value as CaseCategoryId)
);

const normalizeCategory = (value: string): CaseCategory => {
  const categories: Record<CaseCategoryId, CaseCategory> = {
    assédio: 'Assédio',
    fraude: 'Fraude',
    conduta: 'Conduta',
    sugestao: 'Sugestão',
    outro: 'Outro',
  };

  if (isCaseCategoryId(value)) {
    return categories[value];
  }

  if (CASE_CATEGORIES.includes(value as CaseCategory)) {
    return value as CaseCategory;
  }

  throw new Error('Invalid case category.');
};

const normalizeStatus = (value: string): CaseStatus => {
  const legacyStatuses: Record<string, CaseStatus> = {
    Nova: 'Recebido',
    'Em Análise': 'Em análise',
    'Concluída': 'Resolvido',
    Deletar: 'Encerrado', // Mapeamento adicionado para evitar quebra com status legado
  };

  if (CASE_STATUSES.includes(value as CaseStatus)) {
    return value as CaseStatus;
  }

  if (legacyStatuses[value]) {
    return legacyStatuses[value];
  }

  return 'Recebido'; 
};

const normalizePriority = (value: string): CasePriority => {
  if (!CASE_PRIORITIES.includes(value as CasePriority)) {
    throw new Error('Invalid case priority.');
  }

  return value as CasePriority;
};

export interface CreateCasePayload {
  categoryId: CaseCategoryId;
  content: string;
  turnstileToken: string;
}

export interface CreateCaseResponse {
  protocol: string;
  message?: string;
}

export interface CaseSummary {
  id: string;
  protocol: string;
  category: CaseCategory;
  snippet: string;
  status: CaseStatus;
  priority: CasePriority;
  updatedAt: string;
}

export interface MyCaseApiItem {
  id: string;
  protocol: string;
  category: CaseCategory;
  content: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isString = (value: unknown): value is string => typeof value === 'string';

export const parseMyCaseApiItems = (payload: unknown): MyCaseApiItem[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid cases response.');
  }

  return payload.map((caseItem) => {
    if (
      !isRecord(caseItem) ||
      !isString(caseItem.id) ||
      !isString(caseItem.protocol) ||
      !isString(caseItem.category) ||
      !isString(caseItem.content) ||
      !isString(caseItem.description) ||
      !isString(caseItem.status) ||
      !isString(caseItem.priority) ||
      !isString(caseItem.createdAt)
    ) {
      throw new Error('Invalid case item response.');
    }

    return {
      id: caseItem.id,
      protocol: caseItem.protocol,
      category: normalizeCategory(caseItem.category),
      content: caseItem.content,
      description: caseItem.description,
      status: normalizeStatus(caseItem.status),
      priority: normalizePriority(caseItem.priority),
      createdAt: caseItem.createdAt,
    };
  });
};

export const parseCreateCaseResponse = (payload: unknown): CreateCaseResponse => {
  if (!isRecord(payload) || !isString(payload.protocol)) {
    throw new Error('Invalid case creation response.');
  }

  return {
    protocol: payload.protocol,
    message: isString(payload.message) ? payload.message : undefined,
  };
};
