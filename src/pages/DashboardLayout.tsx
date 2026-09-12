import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

// Aqui definimos os "cabos" que esse componente aceita receber
interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="dashboard-shell">
      <Header />

      <div className="dashboard-body">
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
