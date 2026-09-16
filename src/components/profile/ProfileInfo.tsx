import React from 'react';
import { Mail, Shield, Calendar } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface ProfileInfoProps {
  profile: UserProfile;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile }) => {
  const getInitials = (name?: string) => {
    const safeName = name?.trim() || profile.email?.trim() || 'Usuário';

    return safeName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const hasVerifiedIdentity = Boolean(profile.id?.trim() && profile.email?.trim() && profile.role);

  const formattedDate = new Date(profile.joinedAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <section className="profile-card profile-identity fade-in">
      <div className="profile-identity-header">
        <div className="profile-avatar">
          {getInitials(profile.name)}
        </div>
        <div>
          <p className="profile-eyebrow">Conta e acesso</p>
          <h2>{profile.name?.trim() || profile.email || 'Usuário'}</h2>
          {hasVerifiedIdentity && (
            <span className="profile-role">
              <Shield size={14} />
              Identidade verificada
            </span>
          )}
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="profile-detail">
          <div className="profile-detail-icon"><Mail size={18} /></div>
          <div>
            <p className="profile-detail-label">E-mail</p>
            <p className="profile-detail-value">{profile.email}</p>
          </div>
        </div>

        <div className="profile-detail">
          <div className="profile-detail-icon"><Calendar size={18} /></div>
          <div>
            <p className="profile-detail-label">Membro desde</p>
            <p className="profile-detail-value">{formattedDate}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
