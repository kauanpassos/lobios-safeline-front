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
  updatedAt: string; 
}

export interface MyCaseApiItem {
  id: string;
  category: string;
  content: string;
  description: string;
  status: string;
  createdAt: string;
}