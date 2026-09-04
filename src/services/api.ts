// Retirado o "/api" do final do localhost para evitar duplicação
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

  try {
    // Agora o path inteiro (ex: /api/v1/cases) é concatenado à base pura
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
      console.error(`[API Error] Status ${response.status}:`, data);
      
      throw new ApiError(
        'Ocorreu um erro na comunicação com o servidor. Tente novamente mais tarde.',
        response.status,
        null
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API Network Error:', error);
    throw new Error('Erro de conexão. Verifique sua internet ou tente mais tarde.', { cause: error });
  }
}