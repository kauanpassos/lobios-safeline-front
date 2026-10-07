import React, { useState } from 'react';
import { Mail, Lock, UserPlus, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { RegisterFormData } from '../../types/auth';
import { apiFetch, parseEmptyResponse } from '../../services/api';

interface RegisterPageProps {
  onSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (dataToValidate: RegisterFormData): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!dataToValidate.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(dataToValidate.email)) {
      newErrors.email = 'Insira um e-mail válido';
    }

    if (!dataToValidate.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (dataToValidate.password.length < 6) {
      newErrors.password = 'A senha deve conter no mínimo 6 caracteres';
    }

    if (dataToValidate.password !== dataToValidate.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedData = {
      ...formData,
      email: formData.email.trim(),
      name: formData.name?.trim() ?? ''
    };

    setFormData(sanitizedData);
    
    if (!validate(sanitizedData)) return;

    setIsLoading(true);
    setApiError(null);

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: sanitizedData.name,
          email: sanitizedData.email,
          password: sanitizedData.password
        }),
      }, parseEmptyResponse);

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao conectar ao servidor.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-success-state">
        <div className="auth-success-icon">
          <CheckCircle2 size={36} />
        </div>
        <h3>Conta criada com sucesso!</h3>
        <p>Seu cadastro foi realizado no SafeLine. Você já pode realizar o login com suas credenciais corporativas.</p>
        {onSuccess && (
          <Button type="button" variant="primary" fullWidth onClick={onSuccess}>
            Ir para o login
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form auth-register-form">
      <div className="auth-form-header">
        <h2>Criar nova conta</h2>
        <p>Cadastre-se para acompanhar suas denúncias no canal SafeLine.</p>
      </div>

      {apiError && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{apiError}</span>
        </div>
      )}

      <Input
        id="register-name"
        type="text"
        label="Nome completo (Opcional)"
        placeholder="Seu nome (pode ser omitido)"
        icon={<User size={18} />}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        helperText="Opcional: seu nome não será revelado nas denúncias"
      />

      <Input
        id="register-email"
        type="email"
        label="E-mail"
        placeholder="seu.email@empresa.com"
        icon={<Mail size={18} />}
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          if (errors.email) setErrors({ ...errors, email: undefined });
        }}
        error={errors.email}
        required
      />

      <Input
        id="register-password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        icon={<Lock size={18} />}
        value={formData.password}
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value });
          if (errors.password) setErrors({ ...errors, password: undefined });
        }}
        error={errors.password}
        required
      />

      <Input
        id="register-confirm-password"
        type="password"
        label="Confirmar Senha"
        placeholder="••••••••"
        icon={<Lock size={18} />}
        value={formData.confirmPassword}
        onChange={(e) => {
          setFormData({ ...formData, confirmPassword: e.target.value });
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
        }}
        error={errors.confirmPassword}
        required
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={<UserPlus size={18} />} className="auth-form-button">
        Cadastrar no SafeLine
      </Button>
    </form>
  );
};
