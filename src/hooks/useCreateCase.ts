import { useCallback, useState, type FormEventHandler } from 'react';
import { apiFetch } from '../services/api';
import {
  parseCreateCaseResponse,
  type CaseCategoryId,
  type CreateCasePayload,
} from '../types/case';

interface UseCreateCaseResult {
  content: string;
  categoryId: CaseCategoryId | '';
  turnstileToken: string;
  protocol: string | null;
  error: string | null;
  isLoading: boolean;
  setContent: (content: string) => void;
  setCategoryId: (categoryId: CaseCategoryId) => void;
  setTurnstileToken: (token: string) => void;
  handleTurnstileError: () => void;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  reset: () => void;
}

export const useCreateCase = (): UseCreateCaseResult => {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<CaseCategoryId | ''>('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('');
    setError('Não foi possível validar a segurança. Tente novamente.');
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
    event.preventDefault();

    if (!categoryId) {
      setError('Selecione uma categoria antes de enviar.');
      return;
    }

    if (!turnstileToken) {
      setError('Por favor, valide o sistema anti-bot (Turnstile) antes de enviar.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateCasePayload = { categoryId, content, turnstileToken };
      const data = await apiFetch('/api/v1/cases', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, parseCreateCaseResponse);

      setProtocol(data.protocol);
      setContent('');
      setCategoryId('');
      setTurnstileToken('');
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error
        ? submissionError.message
        : 'Ocorreu um erro desconhecido ao registrar o caso.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, content, turnstileToken]);

  const reset = useCallback(() => {
    setProtocol(null);
    setError(null);
    setContent('');
    setCategoryId('');
    setTurnstileToken('');
  }, []);

  return {
    content,
    categoryId,
    turnstileToken,
    protocol,
    error,
    isLoading,
    setContent,
    setCategoryId,
    setTurnstileToken,
    handleTurnstileError,
    handleSubmit,
    reset,
  };
};
