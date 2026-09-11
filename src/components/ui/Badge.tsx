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
    <div className={`safeline-badge safeline-badge-${isSuccess ? 'success' : 'info'}`}>
      {icon === 'shield' && <ShieldCheck size={15} />}
      {icon === 'lock' && <Lock size={15} />}
      <span>{children}</span>
    </div>
  );
};
