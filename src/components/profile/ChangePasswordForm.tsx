import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiFetch, parseEmptyResponse } from '../../services/api';
import { isNewPasswordAllowed, isStrongPassword } from '../../utils/passwordValidation';

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

    if (!isStrongPassword(newPassword)) {
      setError('A nova senha deve ter 8 ou mais caracteres, incluindo maiúscula, minúscula, número e caractere especial.');
      return;
    }

    if (!isNewPasswordAllowed(currentPassword, newPassword)) {
      setError('A nova senha não pode ser igual à senha atual. Escolha outra senha.');
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
    } catch (err: unknown) {
      setError(err instanceof Error
        ? err.message
        : 'Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="profile-card profile-security fade-in">
      <div className="profile-section-heading">
        <div className="profile-section-icon"><Lock size={20} /></div>
        <div>
          <h3>Segurança da conta</h3>
          <p>Atualize sua senha periodicamente para manter o acesso protegido.</p>
        </div>
      </div>
      <div className="profile-security-content">
        <div className="profile-security-intro">
          <KeyRound size={18} />
          <span>Crie a senha com 8 ou mais caracteres, incluindo maiúscula, minúscula, número e caractere especial.</span>
        </div>
      </div>

      {error && (
        <div className="profile-alert profile-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="profile-alert profile-alert-success">
          <CheckCircle2 size={18} />
          <span>Senha alterada com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-password-form">
        <div className="profile-field">
          <label htmlFor="currentPassword">Senha atual</label>
          <input
            id="currentPassword"
            type="password"
            className="safeline-input"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(null); setSuccess(false); }}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="newPassword">Nova senha</label>
          <input
            id="newPassword"
            type="password"
            className="safeline-input"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(null); setSuccess(false); }}
            required
            minLength={8}
            placeholder="Ex.: SafeLine@2026"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="confirmPassword">Confirmar nova senha</label>
          <input
            id="confirmPassword"
            type="password"
            className="safeline-input"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setSuccess(false); }}
            required
            placeholder="Repita a nova senha"
          />
        </div>

        <div className="profile-form-actions">
          <Button type="submit" variant="primary" disabled={isLoading} className="profile-submit-button">
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <KeyRound size={18} />
                Atualizar Senha
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
};
