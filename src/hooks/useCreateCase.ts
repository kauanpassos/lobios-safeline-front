import { useCallback, useState, type FormEventHandler } from 'react';
import { apiFetch } from '../services/api';
import {
  parseCreateCaseResponse,
  type CaseCategoryId,
  type CreateCasePayload,
} from '../types/case';

interface UseCreateCaseResult {
  title: string;
  description: string;
  categoryId: CaseCategoryId | '';
  attachments: File[];
  turnstileToken: string;
  protocol: string | null;
  error: string | null;
  isLoading: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategoryId: (categoryId: CaseCategoryId) => void;
  setAttachments: (attachments: File[]) => void;
  setTurnstileToken: (token: string) => void;
  handleTurnstileError: () => void;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  reset: () => void;
}

export const useCreateCase = (): UseCreateCaseResult => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<CaseCategoryId | ''>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
    event.preventDefault();

    if (!categoryId) {
      setError('Selecione uma categoria antes de enviar.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Preencha o título e a descrição da denúncia.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateCasePayload = {
        categoryId,
        title: title.trim(),
        description: description.trim(),
        priority: 'Média',
        turnstileToken,
      };

      const data = await apiFetch('/api/v1/cases', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, parseCreateCaseResponse);

      setProtocol(data.protocol);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setAttachments([]);
      setTurnstileToken('');
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error
        ? submissionError.message
        : 'Ocorreu um erro desconhecido ao registrar o caso.');
    } finally {
      setTurnstileToken('');
      setIsLoading(false);
    }
  }, [categoryId, title, description, turnstileToken]);

  const reset = useCallback(() => {
    setProtocol(null);
    setError(null);
    setTitle('');
    setDescription('');
    setCategoryId('');
    setAttachments([]);
    setTurnstileToken('');
  }, []);

  return {
    title,
    description,
    categoryId,
    attachments,
    turnstileToken,
    protocol,
    error,
    isLoading,
    setTitle,
    setDescription,
    setCategoryId,
    setAttachments,
    setTurnstileToken,
    handleTurnstileError,
    handleSubmit,
    reset,
  };
};
