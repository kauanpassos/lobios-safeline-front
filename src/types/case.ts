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

export const normalizePriority = (value: unknown): CasePriority | null => {
  if (typeof value === 'string' && (CASE_PRIORITIES as readonly string[]).includes(value)) {
    return value as CasePriority;
  }

  return null;
};

export const normalizeCaseTitle = (value: string): string =>
  value.trim().split(/\s+/).filter(Boolean).join(' ');

export const normalizeCaseDescription = (value: string): string =>
  value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export interface CreateCasePayload {
  categoryId: CaseCategoryId;
  title: string;
  description: string;
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
  priority: CasePriority | null;
  updatedAt: string;
}

export interface MyCaseApiItem {
  id: string;
  category: CaseCategory;
  title?: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority | null;
  createdAt: string;
}

export interface CaseDetails {
  id: string;
  category: CaseCategory;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority | null;
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
    throw new Error('Invalid cases response.');
  }

  return payload.map((caseItem) => {
    if (!isRecord(caseItem)) {
      throw new Error('Invalid case item response.');
    }

    const record = caseItem;
    const categoryValue = record.category ?? record.categoryId;
    const titleValue = isString(record.title) ? record.title : undefined;
    const descriptionValue = isString(record.description) ? record.description : record.content;

    if (
      !isString(record.id) ||
      !isString(categoryValue) ||
      !isString(record.status) ||
      !isString(record.createdAt) ||
      (!titleValue && !isString(descriptionValue))
    ) {
      throw new Error('Invalid case item response.');
    }

    const id = record.id;
    const category = normalizeCategory(categoryValue);
    const status = normalizeStatus(record.status);
    const priority = normalizePriority(record.priority);
    const createdAt = record.createdAt;
    const description = isString(descriptionValue) ? descriptionValue : '';
    const title = titleValue || description;

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
  priority: CasePriority | null;
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
    const rawPriority = isRecord(item) && isString(item.priority) ? normalizePriority(item.priority) : null;
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
