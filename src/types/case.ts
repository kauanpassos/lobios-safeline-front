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
    return [];
  }

  return payload.map((caseItem) => {
    const record = isRecord(caseItem) ? caseItem : {};
    const id = isString(record.id) ? record.id : String(Math.random());
    const category = normalizeCategory(record.category || record.categoryId);
    const status = normalizeStatus(isString(record.status) ? record.status : 'Recebido');
    const priority = normalizePriority(record.priority);
    const createdAt = isString(record.createdAt) ? record.createdAt : new Date().toISOString();
    const title = isString(record.title) ? record.title : (isString(record.description) ? record.description : 'Denúncia sem título');
    const description = isString(record.description) ? record.description : (isString(record.content) ? record.content : 'Sem descrição.');

    return {
      id,
      category,
      title,
      description,
      status,
      priority,
      createdAt,
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

export interface AdminCaseItem {
  id: string;
  categoryId: string;
  category: CaseCategory;
  title?: string;
  description?: string;
  content: string;
  status: CaseStatus;
  createdAtWindow?: string;
  createdAt?: string;
  priority: CasePriority;
  assignedUserId?: string;
  assignedUserName?: string;
}

export interface CaseMessageItem {
  id: string;
  caseId: string;
  senderId: string;
  senderName?: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

export interface CaseAttachmentItem {
  id: string;
  caseId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  contentType?: string;
  createdAt: string;
}

export const parseAdminCaseItems = (payload: unknown): AdminCaseItem[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => {
    const rawCategory = isRecord(item) && isString(item.categoryId) ? item.categoryId : 'outro';
    const rawStatus = isRecord(item) && isString(item.status) ? item.status : 'Recebido';
    const rawTitle = isRecord(item) && isString(item.title) ? item.title : undefined;
    const rawDescription = isRecord(item) && isString(item.description) ? item.description : undefined;
    const rawContent = isRecord(item) && isString(item.content) 
      ? item.content 
      : (rawDescription || rawTitle || 'Ocorrência registrada no canal SafeLine.');
    const rawId = isRecord(item) && isString(item.id) ? item.id : String(Math.random());
    const rawCreatedAtWindow = isRecord(item) && isString(item.createdAtWindow) ? item.createdAtWindow : undefined;
    const rawCreatedAt = isRecord(item) && isString(item.createdAt) ? item.createdAt : undefined;
    const rawPriority = isRecord(item) && isString(item.priority) ? normalizePriority(item.priority) : 'Média';
    const rawAssignedUserId = isRecord(item) && isString(item.assignedUserId) ? item.assignedUserId : undefined;
    const rawAssignedUserName = isRecord(item) && isString(item.assignedUserName) ? item.assignedUserName : undefined;

    return {
      id: rawId,
      categoryId: rawCategory,
      category: normalizeCategory(rawCategory),
      title: rawTitle,
      description: rawDescription || rawContent,
      content: rawContent,
      status: normalizeStatus(rawStatus),
      createdAtWindow: rawCreatedAtWindow,
      createdAt: rawCreatedAt,
      priority: rawPriority,
      assignedUserId: rawAssignedUserId,
      assignedUserName: rawAssignedUserName,
    };
  });
};

