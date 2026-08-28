import React, { useState } from 'react';
import { Mail, Lock, LogIn, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { LoginFormData } from '../../types/auth';

interface LoginPageProps {
  onSuccess?: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Insira um e-mail válido';
    }

    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulação de login (pronto para integração com backend)
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Login efetuado com sucesso!');
      if (onSuccess) {
        onSuccess(formData.email);
      }
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Acesse a sua conta
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Entre com seu e-mail e senha para acessar o portal SafeLine.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-accent-green)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <Input
        id="login-email"
        type="email"
        label="E-mail profissional ou pessoal"
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
        id="login-password"
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
        <a
          href="#forgot-password"
          onClick={(e) => {
            e.preventDefault();
            alert('Funcionalidade de recuperação de senha será ativada no próximo passo!');
          }}
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Esqueceu sua senha?
        </a>
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={<LogIn size={18} />}>
        Entrar no SafeLine
      </Button>
    </form>
  );
};
