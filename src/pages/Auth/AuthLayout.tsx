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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
            maxWidth: '680px',
          }}
        >
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--color-text-brand)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Canal de denúncias corporativo.
          </h1>
          <p
            style={{
              color: 'var(--color-text-brand-muted)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              maxWidth: '680px',
            }}
          >
            Um ambiente projetado estruturalmente para garantir a integridade, sigilo e segurança dos seus dados.
          </p>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-brand-muted)',
            opacity: 0.7,
          }}
        >
          &copy; {new Date().getFullYear()} Lobios Tecnologia.
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
