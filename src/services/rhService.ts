import { apiFetch, parseEmptyResponse } from './api';
import {
  type AdminCaseItem,
  parseAdminCaseItems,
  type CaseMessageItem,
  type CaseAttachmentItem,
  normalizeCategory,
  normalizeStatus,
  normalizePriority
} from '../types/case';

export async function fetchAdminCases(limit = 50): Promise<AdminCaseItem[]> {
  return apiFetch<AdminCaseItem[]>(
    `api/v1/admin/cases?limit=${limit}`,
    { method: 'GET' },
    parseAdminCaseItems
  );
}

export async function fetchCaseById(caseId: string): Promise<AdminCaseItem | null> {
  try {
    const item = await apiFetch<Record<string, unknown>>(
      `api/v1/cases/${caseId}`,
      { method: 'GET' },
      (payload) => (typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {})
    );

    if (item && typeof item === 'object') {
      const rawCategory = typeof item.categoryId === 'string' ? item.categoryId : (typeof item.category === 'string' ? item.category : 'outro');
      const rawStatus = typeof item.status === 'string' ? item.status : 'Recebido';
      const rawTitle = typeof item.title === 'string' ? item.title : undefined;
      const rawDescription = typeof item.description === 'string' ? item.description : (typeof item.content === 'string' ? item.content : undefined);
      const rawContent = typeof item.content === 'string' ? item.content : (rawDescription || 'Ocorrência registrada no SafeLine.');

      return {
        id: typeof item.id === 'string' ? item.id : (typeof item.Id === 'string' ? item.Id : caseId),
        categoryId: rawCategory,
        category: normalizeCategory(rawCategory),
        title: rawTitle,
        description: rawDescription || rawContent,
        content: rawContent,
        status: normalizeStatus(rawStatus),
        createdAtWindow: typeof item.createdAtWindow === 'string' ? item.createdAtWindow : (typeof item.createdAt === 'string' ? item.createdAt : 'Recente'),
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
        priority: normalizePriority(item.priority),
        assignedUserId: typeof item.assignedUserId === 'string' ? item.assignedUserId : undefined,
        assignedUserName: typeof item.assignedUserName === 'string' ? item.assignedUserName : undefined,
      };
    }
  } catch {
    // Fallback para lista de denúncias
  }

  try {
    const allCases = await fetchAdminCases(100);
    return allCases.find((c) => c.id === caseId) || null;
  } catch {
    return null;
  }
}

export async function updateCaseStatus(caseId: string, newStatus: string): Promise<void> {
  return apiFetch<void>(
    `api/v1/admin/cases/${caseId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ newStatus }),
    },
    parseEmptyResponse
  );
}

export async function assignCase(caseId: string, userId: string): Promise<void> {
  return apiFetch<void>(
    `api/cases/${caseId}/assign`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    },
    parseEmptyResponse
  );
}

export async function fetchCaseMessages(caseId: string): Promise<CaseMessageItem[]> {
  return apiFetch<CaseMessageItem[]>(
    `api/cases/${caseId}/messages`,
    { method: 'GET' },
    (payload: unknown) => {
      if (!Array.isArray(payload)) return [];
      return payload.map((msg: Record<string, unknown>) => ({
        id: typeof msg.id === 'string' ? msg.id : String(Math.random()),
        caseId: typeof msg.caseId === 'string' ? msg.caseId : caseId,
        senderId: typeof msg.senderId === 'string' ? msg.senderId : (typeof msg.userId === 'string' ? msg.userId : ''),
        senderName: typeof msg.senderName === 'string' ? msg.senderName : (msg.isFromAdmin || msg.senderRole === 'Admin' || msg.senderRole === 'HR' ? 'Equipe de RH' : 'Denunciante Anônimo'),
        content: typeof msg.content === 'string' ? msg.content : '',
        isFromAdmin: Boolean(msg.isFromAdmin || msg.senderRole === 'Admin' || msg.senderRole === 'HR'),
        createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : (typeof msg.sentAt === 'string' ? msg.sentAt : new Date().toISOString()),
      }));
    }
  );
}

export async function sendCaseMessage(caseId: string, content: string): Promise<CaseMessageItem> {
  return apiFetch<CaseMessageItem>(
    `api/cases/${caseId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
    (payload: unknown) => {
      const item = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
      return {
        id: typeof item.id === 'string' ? item.id : String(Math.random()),
        caseId: typeof item.caseId === 'string' ? item.caseId : caseId,
        senderId: typeof item.senderId === 'string' ? item.senderId : '',
        senderName: typeof item.senderName === 'string' ? item.senderName : 'Equipe de RH',
        content: typeof item.content === 'string' ? item.content : content,
        isFromAdmin: true,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : (typeof item.sentAt === 'string' ? item.sentAt : new Date().toISOString()),
      };
    }
  );
}

export async function fetchCaseAttachments(caseId: string): Promise<CaseAttachmentItem[]> {
  return apiFetch<CaseAttachmentItem[]>(
    `api/cases/${caseId}/attachments`,
    { method: 'GET' },
    (payload: unknown) => {
      if (!Array.isArray(payload)) return [];
      return payload.map((att: Record<string, unknown>) => ({
        id: typeof att.id === 'string' ? att.id : String(Math.random()),
        caseId: typeof att.caseId === 'string' ? att.caseId : caseId,
        fileName: typeof att.fileName === 'string' ? att.fileName : 'Anexo',
        fileUrl: typeof att.fileUrl === 'string' ? att.fileUrl : (typeof att.downloadUrl === 'string' ? att.downloadUrl : '#'),
        fileSize: typeof att.fileSize === 'number' ? att.fileSize : undefined,
        contentType: typeof att.contentType === 'string' ? att.contentType : undefined,
        createdAt: typeof att.createdAt === 'string' ? att.createdAt : (typeof att.uploadedAt === 'string' ? att.uploadedAt : new Date().toISOString()),
      }));
    }
  );
}

