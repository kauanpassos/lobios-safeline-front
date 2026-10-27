import { Shield } from 'lucide-react';

interface SidebarBrandProps {
  isCollapsed: boolean;
}

export function SidebarBrand({ isCollapsed }: SidebarBrandProps) {
  return (
    <div className={`sidebar-brand-header${isCollapsed ? ' is-collapsed' : ''}`}>
      <div className="sidebar-brand-logo">
        <Shield size={26} strokeWidth={2} className="sidebar-brand-icon" aria-hidden="true" />
        {!isCollapsed && <span className="sidebar-brand-title">SAFELINE</span>}
      </div>
    </div>
  );
}
