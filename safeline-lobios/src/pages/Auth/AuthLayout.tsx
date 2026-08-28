import type { ReactNode } from 'react';
import { Logo } from '../../components/Logo';
import { Badge } from '../../components/ui/Badge';
import { EyeOff } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout = ({ children, activeTab, onTabChange }: AuthLayoutProps) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Background Animated Gradient Mesh */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Header Branding */}
        <Logo size="md" showSubtitle={true} />

        {/* Security / Anonymity Highlight Badge */}
        <Badge icon="shield" variant="success">
          Canal 100% Seguro & Anônimo
        </Badge>

        {/* Main Card container */}
        <div
          className="glass-card"
          style={{
            width: '100%',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Navigation Tabs (Login vs Register) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <button
              type="button"
              onClick={() => onTabChange('login')}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === 'login' ? '#FFFFFF' : 'var(--color-text-muted)',
                backgroundColor: activeTab === 'login' ? 'var(--color-primary)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => onTabChange('register')}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === 'register' ? '#FFFFFF' : 'var(--color-text-muted)',
                backgroundColor: activeTab === 'register' ? 'var(--color-primary)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Criar Conta
            </button>
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Informational Security Footer Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.04)',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              borderRadius: '50%',
              color: '#3B82F6',
              display: 'flex',
            }}
          >
            <EyeOff size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Privacidade Garantida
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              Nenhum dado pessoal é exposto ao enviar sugestões ou denúncias.
            </span>
          </div>
        </div>

        {/* Copyright Footer */}
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Lobios - Segurança Tecnologia e Inovação. Todos os direitos reservados.
        </span>
      </div>
    </div>
  );
};
