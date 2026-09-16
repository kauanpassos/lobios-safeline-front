import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm';
import { Loader2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error } = useProfile();

  return (
    <div className="profile-page fade-in">
      <header className="profile-page-header">
        <div>
          <p className="profile-eyebrow">Conta e acesso</p>
          <h1>Meu perfil</h1>
          <p className="profile-page-description">
            Consulte suas informações e mantenha suas credenciais protegidas.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="profile-state profile-card">
          <Loader2 className="profile-spinner" size={32} />
        </div>
      ) : error ? (
        <div className="profile-state profile-state-error">
          <AlertCircle size={48} strokeWidth={1.5} />
          <p>{error}</p>
        </div>
      ) : profile ? (
        <div className="profile-content">
          <ProfileInfo profile={profile} />
          <ChangePasswordForm />
        </div>
      ) : (
        <div className="profile-state profile-card">
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
};
