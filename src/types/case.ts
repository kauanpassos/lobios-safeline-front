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

const normalizeCategory = (value: unknown): CaseCategory => {
  if (typeof value !== 'string') return 'Outro';

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

  return 'Outro';
};

const normalizeStatus = (value: string): CaseStatus => {
  const legacyStatuses: Record<string, CaseStatus> = {
    Nova: 'Recebido',
    'Em Análise': 'Em análise',
    Concluída: 'Resolvido',
    Deletar: 'Encerrado',
  };

  if (CASE_STATUSES.includes(value as CaseStatus)) {
    return value as CaseStatus;
  }

  if (legacyStatuses[value]) {
    return legacyStatuses[value];
  }

  return 'Recebido';
};

const normalizePriority = (value: unknown): CasePriority => {
  if (typeof value === 'string' && (CASE_PRIORITIES as readonly string[]).includes(value)) {
    return value as CasePriority;
  }

  return 'Média';
};

export interface CreateCasePayload {
  categoryId: CaseCategoryId;
  title: string;
  description: string;
  priority: CasePriority;
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
      protocol: isString(caseItem.protocol) ? caseItem.protocol : caseItem.id.substring(0, 8).toUpperCase(),
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
