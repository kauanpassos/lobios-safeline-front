import { useState, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = ({
  label,
  icon,
  error,
  helperText,
  type = 'text',
  id: customId,
  className = '',
  style,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', ...style }}>
      <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {label}
      </label>

      <div className="safeline-input-wrapper">
        {icon && (
          <div style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
            {icon}
          </div>
        )}

        <input
          id={id}
          type={inputType}
          className={`safeline-input ${className}`}
          style={{ 
            paddingLeft: icon ? '2.75rem' : '1rem',
            paddingRight: isPassword ? '2.75rem' : '1rem'
          }}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            aria-pressed={showPassword}
            style={{
              position: 'absolute',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span id={errorId} role="alert" style={{ fontSize: '0.8rem', color: 'var(--color-error)', fontWeight: 500 }}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};