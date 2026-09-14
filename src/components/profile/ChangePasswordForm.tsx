import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiFetch, parseEmptyResponse } from '../../services/api';

export const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }, parseEmptyResponse);
      
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border-slate-700 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-blue-400" size={24} />
        <h3 className="text-xl font-bold text-white">Segurança da Conta</h3>
      </div>
      <p className="text-slate-400 mb-6 text-sm">
        Crie uma senha forte e evite reaproveitar senhas de outros sites.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md mb-4 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-md mb-4 text-sm">
          <CheckCircle2 size={16} />
          <span>Senha alterada com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-300" htmlFor="currentPassword">Senha Atual</label>
          <input
            id="currentPassword"
            type="password"
            className="safeline-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-300" htmlFor="newPassword">Nova Senha</label>
          <input
            id="newPassword"
            type="password"
            className="safeline-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-300" htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input
            id="confirmPassword"
            type="password"
            className="safeline-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="mt-2">
          <Button type="submit" variant="primary" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Atualizar Senha'}
          </Button>
        </div>
      </form>
    </div>
  );
};
