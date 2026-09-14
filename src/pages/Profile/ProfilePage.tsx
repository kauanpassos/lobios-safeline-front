import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm';
import { Loader2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error } = useProfile();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 text-white min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-slate-400">
          Consulte suas informações pessoais e gerencie suas credenciais de acesso.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 glass-card">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 bg-red-500/10 border border-red-500/30 text-red-400 p-10 rounded-xl text-center fade-in">
          <AlertCircle size={48} strokeWidth={1.5} />
          <p className="text-lg">{error}</p>
        </div>
      ) : profile ? (
        <div className="flex flex-col gap-6 fade-in">
          <ProfileInfo profile={profile} />
          
          <ChangePasswordForm />
        </div>
      ) : (
        <div className="glass-card p-10 text-center text-slate-400 fade-in">
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
};
