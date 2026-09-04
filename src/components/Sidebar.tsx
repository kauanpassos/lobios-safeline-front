import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Função auxiliar para pintar o menu ativo
  const getMenuStyles = (path: string) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      textDecoration: 'none',
      transition: 'background 0.2s',
      backgroundColor: isActive ? '#7C3AED' : 'transparent',
      color: isActive ? '#ffffff' : '#cbd5e1',
      fontWeight: isActive ? '600' : 'normal',
    };
  };

  const getMenuClassName = (path: string) => `sidebar-link${location.pathname === path ? ' is-active' : ''}`;

  return (
    <aside style={{ 
      width: isCollapsed ? '76px' : '260px',
      minHeight: 'calc(100vh - 92px)',
      display: 'flex', 
      flexDirection: 'column', 
      padding: isCollapsed ? '24px 10px' : '24px 16px',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderRight: '1px solid var(--bg-card-border)',
      boxShadow: '8px 0 24px rgba(2, 6, 23, 0.18)',
      flexShrink: 0,
      transition: 'width 150ms ease, padding 150ms ease',
      position: 'relative'
    }}>
      
      {/* Navegação principal */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 auto', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(2, 6, 23, 0.18)' }} aria-label="Navegação principal">
        <Link className={getMenuClassName('/my-cases')} to="/my-cases" title="Minhas denúncias" style={getMenuStyles('/my-cases')}>
          <Home size={18} aria-hidden="true" /> {!isCollapsed && 'Minhas denúncias'}
        </Link>
        
        <Link className={getMenuClassName('/new-report')} to="/new-report" title="Nova denúncia" style={getMenuStyles('/new-report')}>
          <PlusCircle size={18} aria-hidden="true" /> {!isCollapsed && 'Nova denúncia'}
        </Link>
        
        <Link className={getMenuClassName('/orientacoes')} to="#" title="Orientações" style={getMenuStyles('/orientacoes')}>
          <BookOpen size={18} aria-hidden="true" /> {!isCollapsed && 'Orientações'}
        </Link>
        
        <Link className={getMenuClassName('/profile')} to="/profile" title="Meu perfil" style={getMenuStyles('/profile')}>
          <User size={18} aria-hidden="true" /> {!isCollapsed && 'Meu perfil'}
        </Link>

        <button className="sidebar-logout"
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '12px', padding: '12px', color: '#f87171', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', width: '100%', marginTop: '8px' }}
        >
          <LogOut size={18} /> {!isCollapsed && 'Sair do sistema'}
        </button>
      </nav>

      <button className="sidebar-collapse" type="button" aria-label={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'} onClick={() => setIsCollapsed((collapsed) => !collapsed)}>
        {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>
    </aside>
  );
};