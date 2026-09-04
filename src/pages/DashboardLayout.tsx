import React from 'react';
import { Sidebar } from '../components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw', 
      overflowX: 'hidden',
      backgroundColor: '#0f172a' // Garantindo o fundo escuro padrão do seu app
    }}>
      {/* Menu Lateral */}
      <Sidebar onLogout={onLogout} />
      
      {/* Área Principal de Conteúdo */}
      <main style={{ 
        flex: 1, 
        backgroundColor: 'transparent', 
        overflowY: 'auto',
        position: 'relative', // Ajuda se houver modais/popups nas páginas filhas
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </main>
    </div>
  );
};