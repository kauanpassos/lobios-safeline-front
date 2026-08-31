import type { ButtonHTMLAttributes, ReactNode } from 'react';
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
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const baseClass = `safeline-btn safeline-btn-${variant} ${className}`;

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={baseClass}
      style={{ width: fullWidth ? '100%' : 'auto', ...style }}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Processando...</span>
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};