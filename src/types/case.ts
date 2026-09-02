export interface CreateCasePayload {
  categoryId: string;
  content: string;
  turnstileToken: string;
}

export interface CreateCaseResponse {
  protocol: string;
  message?: string;
}