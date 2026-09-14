const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5016';
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

export async function apiFetch<T>(path: string, options: RequestInit, parseResponse: ResponseParser<T>): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

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
      throw new ApiError(
        'Ocorreu um erro na comunicação com o servidor. Tente novamente mais tarde.',
        response.status,
        null
      );
    }

    try {
      return parseResponse(data);
    } catch {
      throw new ApiError('Resposta inválida do servidor.', response.status, null);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new Error('Erro de conexão. Verifique sua internet ou tente mais tarde.', { cause: error });
  }
}