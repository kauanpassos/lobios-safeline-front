import React from 'react';
import { Home, PlusCircle, BookOpen, User, Shield, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <aside style={{ 
      width: '260px', 
      height: '100vh', 
      position: 'sticky', 
      top: 0,
      display: 'flex', 
      flexDirection: 'column', 
      padding: '24px',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderRight: '1px solid var(--bg-card-border)'
    }}>
      
      {/* Logos e Título */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield color="#8b5cf6" />
          Lobios
        </h2>
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e2e8f0' }}>SafeLine</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Um espaço seguro para você ser ouvido.</p>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <a href="/meus-casos" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          <Home size={18} /> Minhas manifestações
        </a>
        <a href="/nova-manifestacao" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#cbd5e1', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}>
          <PlusCircle size={18} /> Nova manifestação
        </a>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#cbd5e1', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}>
          <BookOpen size={18} /> Orientações
        </a>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#cbd5e1', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}>
          <User size={18} /> Meu perfil
        </a>

        {/* Botão de Sair */}
        <button 
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#ef4444', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', marginTop: '16px' }}
        >
          <LogOut size={18} /> Sair do sistema
        </button>
      </nav>

      {/* Footer de Privacidade */}
      <div style={{ marginTop: 'auto', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Shield size={16} color="var(--color-text-muted)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Sua privacidade é importante para nós.
          </p>
        </div>
        <a href="#" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'underline' }}>
          Saiba como suas informações são tratadas.
        </a>
      </div>
    </aside>
  );
};