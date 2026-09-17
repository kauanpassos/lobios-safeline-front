import { useCallback, useState, type FormEventHandler } from 'react';
import { apiFetch } from '../services/api';
import {
  parseCreateCaseResponse,
  type CaseCategoryId,
  type CasePriority,
  type CreateCasePayload,
} from '../types/case';

interface UseCreateCaseResult {
  title: string;
  description: string;
  categoryId: CaseCategoryId | '';
  priority: CasePriority;
  attachments: File[];
  turnstileToken: string;
  protocol: string | null;
  error: string | null;
  isLoading: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategoryId: (categoryId: CaseCategoryId) => void;
  setPriority: (priority: CasePriority) => void;
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
  const [priority, setPriority] = useState<CasePriority>('Média');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('');
    // Silently clear the token — no UI error on mount.
    // If the user tries to submit without a token, handleSubmit already blocks and shows the message.
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
      const payload: CreateCasePayload = { categoryId, title, description, priority, turnstileToken };
      // TODO: Firebase Storage upload logic for `attachments` will go here
      const data = await apiFetch('/api/v1/cases', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, parseCreateCaseResponse);

      setProtocol(data.protocol);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setPriority('Média');
      setAttachments([]);
      setTurnstileToken('');
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error
        ? submissionError.message
        : 'Ocorreu um erro desconhecido ao registrar o caso.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, title, description, priority, attachments, turnstileToken]);

  const reset = useCallback(() => {
    setProtocol(null);
    setError(null);
    setTitle('');
    setDescription('');
    setCategoryId('');
    setPriority('Média');
    setAttachments([]);
    setTurnstileToken('');
  }, []);

  return {
    title,
    description,
    categoryId,
    priority,
    attachments,
    turnstileToken,
    protocol,
    error,
    isLoading,
    setTitle,
    setDescription,
    setCategoryId,
    setPriority,
    setAttachments,
    setTurnstileToken,
    handleTurnstileError,
    handleSubmit,
    reset,
  };
};
