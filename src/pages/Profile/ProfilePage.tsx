import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { Loader2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error } = useProfile();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 text-white min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-slate-400">
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 glass-card">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-lg text-center">
          <p>{error}</p>
        </div>
      ) : profile ? (
        <div className="flex flex-col gap-6">
          <ProfileInfo profile={profile} />
          
          <div className="glass-card p-6 border-slate-700">
            <h3 className="text-xl font-bold mb-4">Segurança da Conta</h3>
            <p className="text-slate-400 mb-4 text-sm">
              Para atualizar sua senha ou alterar informações sensíveis, entre em contato com o administrador do sistema.
            </p>
            <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 rounded-md border border-slate-700 cursor-not-allowed">
              Alterar Senha
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center text-slate-400">
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
};
