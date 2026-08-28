import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
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
  id,
  className = '',
  style,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          type={inputType}
          style={{
            width: '100%',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: icon ? '44px' : '16px',
            paddingRight: isPassword ? '44px' : '16px',
            backgroundColor: 'var(--bg-input)',
            border: error ? '1px solid var(--color-danger)' : '1px solid var(--bg-card-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-main)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-primary)',
            outline: 'none',
            transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
              e.currentTarget.style.backgroundColor = 'var(--bg-input-focus)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--bg-card-border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = 'var(--bg-input)';
            }
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s ease',
            }}
            tabIndex={-1}
            title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
