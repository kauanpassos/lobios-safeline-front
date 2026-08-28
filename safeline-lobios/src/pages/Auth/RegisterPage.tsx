import React, { useState } from 'react';
import { Mail, Lock, UserPlus, CheckCircle2, User } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { RegisterFormData } from '../../types/auth';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulação de cadastro
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '12px 0' }}>
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderRadius: '50%',
            color: 'var(--color-accent-green)',
            display: 'flex',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Conta criada com sucesso!
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '320px' }}>
          Seu cadastro foi realizado no SafeLine. Você já pode realizar o login com suas credenciais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Criar nova conta
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Cadastre-se para acompanhar suas manifestações no canal SafeLine.
        </p>
      </div>

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

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={<UserPlus size={18} />}>
        Cadastrar no SafeLine
      </Button>
    </form>
  );
};
