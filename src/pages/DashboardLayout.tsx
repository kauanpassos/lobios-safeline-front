import React from 'react';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar onLogout={onLogout} />
      <main style={{ flex: 1, backgroundColor: 'transparent', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};