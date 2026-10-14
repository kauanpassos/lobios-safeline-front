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

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
  values.some((candidate) => candidate === value);

export const isCaseCategoryId = (value: string): value is CaseCategoryId =>
  isOneOf(CASE_CATEGORY_IDS, value);

const decodeNumericHtmlEntities = (value: string): string =>
  value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (entity, hexadecimal: string | undefined, decimal: string | undefined) => {
    const codePoint = Number.parseInt(hexadecimal ?? decimal ?? '', hexadecimal ? 16 : 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  });

export const normalizeCategory = (value: unknown): CaseCategory => {
  if (typeof value !== 'string') throw new Error('Invalid case category.');
  const normalizedValue = decodeNumericHtmlEntities(value);

  const categories: Record<CaseCategoryId, CaseCategory> = {
    assédio: 'Assédio',
    fraude: 'Fraude',
    conduta: 'Conduta',
    sugestao: 'Sugestão',
    outro: 'Outro',
  };

  if (isCaseCategoryId(normalizedValue)) {
    return categories[normalizedValue];
  }

  if (isOneOf(CASE_CATEGORIES, normalizedValue)) return normalizedValue;
  throw new Error('Invalid case category.');
};

export const normalizeStatus = (value: string): CaseStatus => {
  const legacyStatuses: Record<string, CaseStatus> = {
    Nova: 'Recebido',
    'Em Análise': 'Em análise',
    Concluída: 'Resolvido',
    Deletar: 'Encerrado',
  };

  if (isOneOf(CASE_STATUSES, value)) return value;

  if (legacyStatuses[value]) {
    return legacyStatuses[value];
  }

  throw new Error('Invalid case status.');
};

export const normalizePriority = (value: unknown): CasePriority | null => {
  if (typeof value === 'string' && isOneOf(CASE_PRIORITIES, value)) {
    return value;
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
const parseStringArray = (value: unknown): string[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || !value.every(isString)) {
    throw new Error('Invalid string array response.');
  }
  return value;
};

const parseAssignedUsers = (value: unknown): { id: string; name: string }[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new Error('Invalid assigned users response.');

  const assignedUsers: { id: string; name: string }[] = [];
  for (const user of value) {
    if (!isRecord(user) || !isString(user.id) || !isString(user.name)) {
      throw new Error('Invalid assigned users response.');
    }
    assignedUsers.push({ id: user.id, name: user.name });
  }

  return assignedUsers;
};

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
      Number.isNaN(Date.parse(record.createdAt)) ||
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
  if (
    !isRecord(payload) ||
    !isString(payload.id) ||
    !isString(payload.category ?? payload.categoryId) ||
    !isString(payload.status) ||
    !isString(payload.createdAt) ||
    Number.isNaN(Date.parse(payload.createdAt))
  ) {
    throw new Error('Resposta de detalhes da denúncia inválida.');
  }

  const title = isString(payload.title)
    ? payload.title
    : isString(payload.description)
      ? payload.description
      : payload.content;
  if (!isString(title) || !title.trim()) {
    throw new Error('Resposta de detalhes da denúncia inválida.');
  }

  return {
    id: payload.id,
    category: normalizeCategory(payload.category ?? payload.categoryId),
    title,
    description: isString(payload.description) ? payload.description : (isString(payload.content) ? payload.content : ''),
    status: normalizeStatus(payload.status),
    priority: normalizePriority(payload.priority),
    createdAt: payload.createdAt,
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
  updatedAt?: string;
  priority: CasePriority | null;
  assignedUserIds: string[];
  assignedUsers?: { id: string; name: string }[];
}

export interface CaseStatusHistoryItem {
  id: string;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  createdAt: string;
}

export interface CaseMessageItem {
  id: string;
  caseId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
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
    throw new Error('Invalid admin cases response.');
  }

  return payload.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item.id) ||
      !isString(item.categoryId) ||
      !isString(item.status) ||
      !isString(item.title) ||
      !isString(item.description) ||
      !isString(item.createdAtWindow) ||
      (item.createdAt !== undefined &&
        (!isString(item.createdAt) || Number.isNaN(Date.parse(item.createdAt)))) ||
      (item.updatedAt !== undefined &&
        item.updatedAt !== null &&
        (!isString(item.updatedAt) || Number.isNaN(Date.parse(item.updatedAt))))
    ) {
      throw new Error('Invalid admin case item response.');
    }

    return {
      id: item.id,
      categoryId: item.categoryId,
      category: normalizeCategory(item.categoryId),
      title: item.title,
      description: item.description,
      content: item.description,
      status: normalizeStatus(item.status),
      createdAtWindow: item.createdAtWindow,
      createdAt: isString(item.createdAt) ? item.createdAt : undefined,
      updatedAt: isString(item.updatedAt) ? item.updatedAt : undefined,
      priority: normalizePriority(item.priority),
      assignedUserIds: parseStringArray(item.assignedUserIds),
      assignedUsers: parseAssignedUsers(item.assignedUsers),
    };
  });
};

export const parseAdminCaseDetailResponse = (payload: unknown): AdminCaseItem => {
  if (
    !isRecord(payload) ||
    !isString(payload.id) ||
    !isString(payload.categoryId) ||
    !isString(payload.status) ||
    !isString(payload.title) ||
    !isString(payload.description) ||
    !isString(payload.createdAtWindow) ||
    !isString(payload.createdAt) ||
    Number.isNaN(Date.parse(payload.createdAt)) ||
    (payload.updatedAt !== undefined &&
      payload.updatedAt !== null &&
      (!isString(payload.updatedAt) || Number.isNaN(Date.parse(payload.updatedAt))))
  ) {
    throw new Error('Invalid admin case details response.');
  }

  return {
    id: payload.id,
    categoryId: payload.categoryId,
    category: normalizeCategory(payload.categoryId),
    title: payload.title,
    description: payload.description,
    content: isString(payload.content) ? payload.content : payload.description,
    status: normalizeStatus(payload.status),
    createdAtWindow: payload.createdAtWindow,
    createdAt: payload.createdAt,
    updatedAt: isString(payload.updatedAt) ? payload.updatedAt : undefined,
    priority: normalizePriority(payload.priority),
    assignedUserIds: parseStringArray(payload.assignedUserIds),
    assignedUsers: parseAssignedUsers(payload.assignedUsers),
  };
};

export const parseCaseStatusHistoryItems = (payload: unknown): CaseStatusHistoryItem[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid case status history response.');
  }

  return payload.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item.id) ||
      !isString(item.previousStatus) ||
      !isString(item.newStatus) ||
      !isString(item.createdAt) ||
      Number.isNaN(Date.parse(item.createdAt))
    ) {
      throw new Error('Invalid case status history item response.');
    }

    return {
      id: item.id,
      previousStatus: normalizeStatus(item.previousStatus),
      newStatus: normalizeStatus(item.newStatus),
      createdAt: item.createdAt,
    };
  });
};

export const parseCaseMessageItems = (payload: unknown, expectedCaseId: string): CaseMessageItem[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid case messages response.');
  }

  return payload.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item.id) ||
      !isString(item.caseId) ||
      item.caseId !== expectedCaseId ||
      !isString(item.content)
    ) {
      throw new Error('Invalid case message response.');
    }

    const senderRole = isString(item.senderRole) ? item.senderRole : '';
    const createdAt = isString(item.createdAt)
      ? item.createdAt
      : isString(item.sentAt)
        ? item.sentAt
        : null;

    if (createdAt === null || Number.isNaN(Date.parse(createdAt))) {
      throw new Error('Invalid case message timestamp.');
    }

    const senderId = isString(item.senderUserId)
      ? item.senderUserId
      : isString(item.senderId)
        ? item.senderId
        : isString(item.userId)
          ? item.userId
          : '';
    const normalizedSenderRole = senderRole.toLowerCase();
    const isFromAdmin = normalizedSenderRole === 'admin' || normalizedSenderRole === 'hr' || normalizedSenderRole === 'hr_manager';

    return {
      id: item.id,
      caseId: item.caseId,
      senderId,
      senderName: isFromAdmin ? 'Equipe de RH' : 'Colaborador',
      senderRole,
      content: item.content,
      isFromAdmin,
      createdAt,
    };
  });
};
