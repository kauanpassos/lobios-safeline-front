import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="dashboard-shell no-topbar">
      <div className="dashboard-body no-topbar">
        <Sidebar onLogout={onLogout} />

        <main className="dashboard-main">
          <div className="dashboard-content fade-in">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
