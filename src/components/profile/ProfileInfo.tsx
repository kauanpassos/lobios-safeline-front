import React from 'react';
import { User, Mail, Shield, Building, Calendar } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface ProfileInfoProps {
  profile: UserProfile;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formattedDate = new Date(profile.joinedAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="glass-card fade-in p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-800 border-2 border-slate-700 shadow-xl text-3xl md:text-4xl font-bold text-slate-300">
          {getInitials(profile.name)}
        </div>

        <div className="flex-1 w-full">
          <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
          <p className="text-slate-400 mb-8 flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            {profile.role}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <Mail size={14} /> E-mail
              </span>
              <span className="text-slate-200">{profile.email}</span>
            </div>

            {profile.department && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Building size={14} /> Departamento
                </span>
                <span className="text-slate-200">{profile.department}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <User size={14} /> ID do Usuário
              </span>
              <span className="text-slate-200 font-mono text-sm">{profile.id}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> Membro desde
              </span>
              <span className="text-slate-200">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
