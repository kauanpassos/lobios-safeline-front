import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
          border: '1px solid rgba(255,255,255,0.1)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-main)',
          border: '1px solid var(--bg-card-border)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted)',
          border: 'none',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: 'var(--shadow-button)',
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 20px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.95rem',
        fontWeight: 600,
        fontFamily: 'var(--font-primary)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.65 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        ...getVariantStyles(),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading && variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading && variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Aguarde...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
