import { apiFetch, parseEmptyResponse } from './api';
import {
  type AdminCaseItem,
  parseAdminCaseItems,
  parseAdminCaseDetailResponse,
  parseCaseMessageItems,
  parseCaseStatusHistoryItems,
  type CasePriority,
  type CaseStatusHistoryItem,
  type CaseStatus,
  type CaseMessageItem,
  type CaseAttachmentItem,
} from '../types/case';

export async function fetchAdminCases(limit = 50, signal?: AbortSignal): Promise<AdminCaseItem[]> {
  return apiFetch<AdminCaseItem[]>(
    `api/v1/admin/cases?limit=${limit}`,
    { method: 'GET', signal },
    parseAdminCaseItems
  );
}

export async function fetchCaseById(caseId: string, signal?: AbortSignal): Promise<AdminCaseItem> {
  return apiFetch<AdminCaseItem>(
    `api/v1/cases/${encodeURIComponent(caseId)}`,
    { method: 'GET', signal },
    parseAdminCaseDetailResponse
  );
}

export async function fetchCaseStatusHistory(
  caseId: string,
  signal?: AbortSignal
): Promise<CaseStatusHistoryItem[]> {
  return apiFetch<CaseStatusHistoryItem[]>(
    `api/v1/admin/cases/${encodeURIComponent(caseId)}/status-history`,
    { method: 'GET', signal },
    parseCaseStatusHistoryItems
  );
}

export async function updateCaseStatus(caseId: string, newStatus: CaseStatus): Promise<void> {
  return apiFetch<void>(
    `api/v1/admin/cases/${encodeURIComponent(caseId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ newStatus }),
    },
    parseEmptyResponse
  );
}

export async function updateCasePriority(caseId: string, priority: CasePriority): Promise<void> {
  return apiFetch<void>(
    `api/v1/admin/cases/${encodeURIComponent(caseId)}/priority`,
    {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    },
    parseEmptyResponse
  );
}

export async function assignCase(caseId: string, userId: string): Promise<void> {
  return apiFetch<void>(
    `api/cases/${encodeURIComponent(caseId)}/assign`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    },
    parseEmptyResponse
  );
}

export async function fetchCaseMessages(caseId: string, signal?: AbortSignal): Promise<CaseMessageItem[]> {
  return apiFetch<CaseMessageItem[]>(
    `api/cases/${encodeURIComponent(caseId)}/messages`,
    { method: 'GET', signal },
    (payload) => parseCaseMessageItems(payload, caseId)
  );
}

export async function sendCaseMessage(caseId: string, content: string): Promise<CaseMessageItem> {
  const payload = await apiFetch<unknown>(
    `api/cases/${encodeURIComponent(caseId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
    (response) => response
  );

  const [createdMessage] = parseCaseMessageItems([payload], caseId);
  if (!createdMessage) {
    throw new Error('Resposta inválida ao enviar mensagem.');
  }

  return createdMessage;
}

export async function fetchCaseAttachments(caseId: string, signal?: AbortSignal): Promise<CaseAttachmentItem[]> {
  return apiFetch<CaseAttachmentItem[]>(
    `api/cases/${encodeURIComponent(caseId)}/attachments`,
    { method: 'GET', signal },
    (payload: unknown) => {
      if (!Array.isArray(payload)) {
        throw new Error('Invalid case attachments response.');
      }

      return payload.map((attachment) => {
        if (
          typeof attachment !== 'object' ||
          attachment === null ||
          !('id' in attachment) ||
          typeof attachment.id !== 'string' ||
          !('caseId' in attachment) ||
          attachment.caseId !== caseId ||
          !('fileName' in attachment) ||
          typeof attachment.fileName !== 'string' ||
          !('downloadUrl' in attachment) ||
          typeof attachment.downloadUrl !== 'string' ||
          !('uploadedAt' in attachment) ||
          typeof attachment.uploadedAt !== 'string'
        ) {
          throw new Error('Invalid case attachment response.');
        }

        return {
          id: attachment.id,
          caseId,
          fileName: attachment.fileName,
          fileUrl: attachment.downloadUrl,
          fileSize: 'fileSize' in attachment && typeof attachment.fileSize === 'number'
            ? attachment.fileSize
            : undefined,
          contentType: 'contentType' in attachment && typeof attachment.contentType === 'string'
            ? attachment.contentType
            : undefined,
          createdAt: attachment.uploadedAt,
        };
      });
    }
  );
}
