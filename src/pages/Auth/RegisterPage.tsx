import React, { useEffect, useRef, useState } from 'react';
import { Mail, Lock, UserPlus, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { RegisterFormData } from '../../types/auth';
import { apiFetch } from '../../services/api';

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
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Insira um e-mail válido';
    }

    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve conter no mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. BLINDAGEM: Sanitiza os dados
    const sanitizedEmail = formData.email.trim();
    const sanitizedName = formData.name?.trim() ?? '';
    setFormData(prev => ({ ...prev, email: sanitizedEmail, name: sanitizedName }));

    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          password: formData.password
        }),
      });

      setIsSuccess(true);
      
      if (onSuccess) {
        redirectTimeoutRef.current = window.setTimeout(onSuccess, 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao conectar ao servidor.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '12px 0' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-success-subtle)', borderRadius: '50%', color: 'var(--color-success)', display: 'flex' }}>
          <CheckCircle2 size={36} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Conta criada com sucesso!
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '320px', lineHeight: 1.5 }}>
          Seu cadastro foi realizado no SafeLine. Você já pode realizar o login com suas credenciais corporativas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Criar nova conta
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Cadastre-se para acompanhar suas manifestações no canal SafeLine.
        </p>
      </div>

      {apiError && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{apiError}</span>
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

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={<UserPlus size={18} />} style={{ marginTop: '0.5rem' }}>
        Cadastrar no SafeLine
      </Button>
    </form>
  );
};