import type { ReactNode } from 'react';
import { Logo } from '../../components/Logo';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout = ({ children, activeTab, onTabChange }: AuthLayoutProps) => {
  return (
    <div className="auth-layout-grid">
      
      {/* Esquerda: Contexto, Marca e Segurança (Atmosphere Layer) */}
      <div className="auth-brand-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Logo size="lg" showSubtitle={false} />
          
          <div style={{ marginTop: '2rem', maxWidth: '320px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '1rem' }}>
              Canal de denúncias corporativo.
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', lineHeight: 1.5 }}>
              Um ambiente projetado estruturalmente para garantir a integridade, sigilo e segurança dos seus dados.
            </p>
          </div>
        </div>

        {/* Informação de segurança nativamente integrada, não flutuante */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Badge icon="shield" variant="success">
            Canal 100% Seguro & Criptografado
          </Badge>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: 0.8 }}>
            <ShieldCheck size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                Privacidade Estrutural Garantida
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Nenhum dado pessoal é exposto ao enviar manifestações. Operação sob os mais rígidos padrões de compliance.
              </span>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>
            &copy; {new Date().getFullYear()} Lobios Tecnologia.
          </span>
        </div>
      </div>

      {/* Direita: Interação Principal (Main Surface) */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          
          {/* Navegação de Contexto */}
          <nav 
            aria-label="Opções de acesso"
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface-dark)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => onTabChange('login')}
              aria-current={activeTab === 'login' ? 'page' : undefined}
              style={{
                flex: 1,
                padding: '0.625rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'login' ? '#FFFFFF' : 'var(--color-text-muted)',
                backgroundColor: activeTab === 'login' ? 'var(--color-primary)' : 'transparent',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
            >
              Entrar no Portal
            </button>
            <button
              type="button"
              onClick={() => onTabChange('register')}
              aria-current={activeTab === 'register' ? 'page' : undefined}
              style={{
                flex: 1,
                padding: '0.625rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'register' ? '#FFFFFF' : 'var(--color-text-muted)',
                backgroundColor: activeTab === 'register' ? 'var(--color-primary)' : 'transparent',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
            >
              Criar Conta
            </button>
          </nav>

          {/* O formulário injetado aqui */}
          {children}
          
        </div>
      </div>
    </div>
  );
};