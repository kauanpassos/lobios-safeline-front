export interface CreateCasePayload {
  categoryId: string;
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
  category: string; 
  snippet: string; 
  status: string;
  priority: string;
  updatedAt: string; 
}

export interface MyCaseApiItem {
  id: string;
  category: string;
  content: string;
  description: string;
  status: string;
  priority: string;
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
      category: caseItem.category,
      content: caseItem.content,
      description: caseItem.description,
      status: caseItem.status,
      priority: caseItem.priority,
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