const DEVELOPMENT_API_URL = 'http://localhost:5016';
export const API_BASE_URL = import.meta.env.DEV
  ? DEVELOPMENT_API_URL
  : import.meta.env.VITE_API_URL || DEVELOPMENT_API_URL;
const TOKEN_STORAGE_KEY = '@SafeLine:token';

export type ResponseParser<T> = (payload: unknown) => T;

export const parseEmptyResponse: ResponseParser<void> = () => undefined;

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (
    error.status >= 500 &&
    typeof error.details === 'object' &&
    error.details !== null &&
    'detail' in error.details &&
    typeof error.details.detail === 'string'
  ) {
    const traceId = 'traceId' in error.details && typeof error.details.traceId === 'string'
      ? ` (Referência: ${error.details.traceId})`
      : '';
    return `${error.details.detail}${traceId}`;
  }

  return error.message || fallback;
}

export interface ApiFetchOptions extends RequestInit {
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions, parseResponse: ResponseParser<T>): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let data: unknown;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        const wasAuthenticated = !!localStorage.getItem(TOKEN_STORAGE_KEY);
        if (wasAuthenticated) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          window.dispatchEvent(new Event('safeline:unauthorized'));
        }
        throw new ApiError('Sua sessão expirou. Por favor, faça login novamente.', response.status, data);
      }

      if (response.status === 403) {
        throw new ApiError('Acesso negado. Você não tem permissão para visualizar este recurso.', response.status, data);
      }

      throw new ApiError(
        'Ocorreu um erro na comunicação com o servidor. Tente novamente mais tarde.',
        response.status,
        data
      );
    }

    try {
      return parseResponse(data);
    } catch (error: unknown) {
      throw new ApiError('Resposta inválida do servidor.', response.status, error);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('Erro de conexão. Verifique sua internet ou tente mais tarde.', { cause: error });
  }
}

// Objeto api para uso padrão de métodos REST (get, post, put, delete) similar ao Axios
export const api = {
  get: async <T>(path: string, options?: ApiFetchOptions) => {
    const data = await apiFetch<T>(path, { ...options, method: 'GET' }, (d) => d as T);
    return { data };
  },
  post: async <T>(path: string, body?: unknown, options?: ApiFetchOptions) => {
    const data = await apiFetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }, (d) => d as T);
    return { data };
  },
  put: async <T>(path: string, body?: unknown, options?: ApiFetchOptions) => {
    const data = await apiFetch<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }, (d) => d as T);
    return { data };
  },
  delete: async <T>(path: string, options?: ApiFetchOptions) => {
    const data = await apiFetch<T>(path, { ...options, method: 'DELETE' }, (d) => d as T);
    return { data };
  }
};
