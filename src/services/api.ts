const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5016';
const TOKEN_STORAGE_KEY = '@SafeLine:token';

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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

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
    const errorData = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
    const message = typeof errorData.detail === 'string'
      ? errorData.detail
      : typeof errorData.message === 'string'
        ? errorData.message
        : 'Ocorreu um erro ao comunicar com o servidor.';

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}