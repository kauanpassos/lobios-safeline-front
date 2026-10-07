import React, { useState } from 'react';
import { Mail, Lock, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { parseLoginResponse, type LoginFormData } from '../../types/auth';
import { apiFetch } from '../../services/api';

interface LoginPageProps {
  onSuccess?: (email?: string, role?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (dataToValidate: LoginFormData): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!dataToValidate.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(dataToValidate.email)) {
      newErrors.email = 'Formato de e-mail inválido';
    }

    if (!dataToValidate.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (dataToValidate.password.length < 6) {
      newErrors.password = 'Mínimo de 6 caracteres requeridos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedData = {
      ...formData,
      email: formData.email.trim()
    };

    setFormData(sanitizedData);

    if (!validate(sanitizedData)) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: sanitizedData.email,
          password: sanitizedData.password
        }),
      }, parseLoginResponse);

      localStorage.setItem('@SafeLine:token', data.token);
      if (data.role) localStorage.setItem('@SafeLine:role', data.role);
      if (data.email) localStorage.setItem('@SafeLine:email', data.email);
      if (onSuccess) {
        onSuccess(data.email || sanitizedData.email, data.role);
      } else {
        setSuccessMessage('Login realizado com sucesso.');
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao conectar ao servidor.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <div className="auth-form-header">
        <h2>Acesso Seguro</h2>
        <p>Insira suas credenciais corporativas para acessar o painel de denúncias.</p>
      </div>

      {apiError && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="auth-fields">
        <Input
          id="login-email"
          type="email"
          label="E-mail profissional ou pessoal"
          placeholder="exemplo@empresa.com"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
          required
        />

        <div className="auth-password-field">
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
          <div className="auth-forgot-row">
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidade de recuperação de senha será ativada no próximo passo!');
              }}
              className="auth-forgot-link"
            >
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        fullWidth 
        isLoading={isLoading} 
        icon={<LogIn size={18} />}
        className="auth-form-button"
      >
        Entrar no Portal
      </Button>
    </form>
  );
};
