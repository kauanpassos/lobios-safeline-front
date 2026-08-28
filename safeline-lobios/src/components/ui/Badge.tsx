import type { ReactNode } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  icon?: 'shield' | 'lock';
  variant?: 'success' | 'info';
}

export const Badge = ({ children, icon = 'shield', variant = 'success' }: BadgeProps) => {
  const isSuccess = variant === 'success';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: isSuccess ? 'var(--color-accent-green-bg)' : 'rgba(59, 130, 246, 0.12)',
        color: isSuccess ? 'var(--color-accent-green)' : '#60A5FA',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
      }}
    >
      {icon === 'shield' && <ShieldCheck size={15} />}
      {icon === 'lock' && <Lock size={15} />}
      <span>{children}</span>
    </div>
  );
};
