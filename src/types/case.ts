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

export const normalizeCategory = (value: unknown): CaseCategory => {
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

export const normalizeStatus = (value: string): CaseStatus => {
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

export const normalizePriority = (value: unknown): CasePriority => {
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
  category: CaseCategory;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  updatedAt: string;
}

export interface MyCaseApiItem {
  id: string;
  category: CaseCategory;
  title?: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
}

export interface CaseDetails {
  id: string;
  category: CaseCategory;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt?: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderUserId: string;
  senderRole: string;
  senderType: string;
  content: string;
  createdAt: string;
  sentAt?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isString = (value: unknown): value is string => typeof value === 'string';

export const parseMyCaseApiItems = (payload: unknown): MyCaseApiItem[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Resposta de denúncias inválida.');
  }

  return payload.map((caseItem) => {
    if (
      !isRecord(caseItem) ||
      !isString(caseItem.id) ||
      !isString(caseItem.category) ||
      !isString(caseItem.status) ||
      !isString(caseItem.priority) ||
      !isString(caseItem.createdAt)
    ) {
      throw new Error('Item de denúncia com formato inválido.');
    }

    return {
      id: caseItem.id,
      category: normalizeCategory(caseItem.category),
      title: isString(caseItem.title) ? caseItem.title : undefined,
      description: isString(caseItem.description) ? caseItem.description : undefined,
      status: normalizeStatus(caseItem.status),
      priority: normalizePriority(caseItem.priority),
      createdAt: caseItem.createdAt,
    };
  });
};

export const parseCaseDetailsResponse = (payload: unknown): CaseDetails => {
  if (!isRecord(payload) || !isString(payload.id)) {
    throw new Error('Resposta de detalhes da denúncia inválida.');
  }

  return {
    id: payload.id,
    category: normalizeCategory(payload.category ?? payload.categoryId),
    title: isString(payload.title) ? payload.title : (isString(payload.content) ? payload.content : 'Denúncia sem título'),
    description: isString(payload.description) ? payload.description : (isString(payload.content) ? payload.content : ''),
    status: normalizeStatus(isString(payload.status) ? payload.status : 'Recebido'),
    priority: normalizePriority(payload.priority),
    createdAt: isString(payload.createdAt) ? payload.createdAt : new Date().toISOString(),
    updatedAt: isString(payload.updatedAt) ? payload.updatedAt : undefined,
  };
};

export const parseCreateCaseResponse = (payload: unknown): CreateCaseResponse => {
  if (!isRecord(payload) || !isString(payload.protocol)) {
    throw new Error('Resposta de criação de denúncia inválida.');
  }

  return {
    protocol: payload.protocol,
    message: isString(payload.message) ? payload.message : undefined,
  };
};
