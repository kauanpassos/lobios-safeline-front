import type { ReactNode } from 'react';
import { Logo } from '../../components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout = ({ children, activeTab, onTabChange }: AuthLayoutProps) => {
  return (
    <div className="auth-layout-grid">
      <div className="auth-brand-panel">
        <Logo size="lg" showSubtitle={false} />

        <div className="auth-brand-content">
          <h1 className="auth-brand-title">
            Canal de denúncias corporativo.
          </h1>
          <p className="auth-brand-description">
            Um ambiente projetado estruturalmente para garantir a integridade, sigilo e segurança dos seus dados.
          </p>
        </div>

        <span className="auth-brand-footer">
          &copy; {new Date().getFullYear()} SafeLine.
        </span>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <nav aria-label="Opções de acesso" className="auth-segmented-control">
            <button
              type="button"
              onClick={() => onTabChange('login')}
              aria-current={activeTab === 'login' ? 'page' : undefined}
              className="auth-tab-btn"
            >
              Entrar no Portal
            </button>
            <button
              type="button"
              onClick={() => onTabChange('register')}
              aria-current={activeTab === 'register' ? 'page' : undefined}
              className="auth-tab-btn"
            >
              Criar Conta
            </button>
          </nav>
          
          {children}
        </div>
      </div>
    </div>
  );
};
