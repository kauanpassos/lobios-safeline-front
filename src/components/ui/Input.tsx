import { useState, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = ({
  label, icon, error, helperText, type = 'text', id: customId, className = '', style, ...props
}: InputProps) => {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="safeline-field" style={style}>
      <label htmlFor={id} className="safeline-field-label">{label}</label>
      <div className="safeline-input-wrapper">
        {icon && <div className="safeline-input-icon">{icon}</div>}
        <input
          id={id}
          type={inputType}
          className={`safeline-input ${icon ? 'has-icon' : ''} ${isPassword ? 'has-password-toggle' : ''} ${className}`}
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
            className="safeline-password-toggle"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span id={errorId} role="alert" className="safeline-field-error">{error}</span>}
      {helperText && !error && <span id={helperId} className="safeline-field-helper">{helperText}</span>}
    </div>
  );
};
