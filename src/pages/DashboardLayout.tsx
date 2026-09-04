import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="dashboard-shell">
      <Header />
      <div className="dashboard-body">
        <Sidebar onLogout={onLogout} />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};