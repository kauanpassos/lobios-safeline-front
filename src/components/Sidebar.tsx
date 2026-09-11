import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const getMenuClassName = (path: string) =>
    `sidebar-link${location.pathname === path ? ' is-active' : ''}${isCollapsed ? ' is-collapsed' : ''}`;

  return (
    <aside className={`dashboard-sidebar${isCollapsed ? ' is-collapsed' : ''}`}>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        <Link className={getMenuClassName('/my-cases')} to="/my-cases" title="Minhas denúncias">
          <Home size={18} aria-hidden="true" /> {!isCollapsed && 'Minhas denúncias'}
        </Link>
        <Link className={getMenuClassName('/new-report')} to="/new-report" title="Nova denúncia">
          <PlusCircle size={18} aria-hidden="true" /> {!isCollapsed && 'Nova denúncia'}
        </Link>
        <Link className={getMenuClassName('/orientacoes')} to="#" title="Orientações">
          <BookOpen size={18} aria-hidden="true" /> {!isCollapsed && 'Orientações'}
        </Link>
        <Link className={getMenuClassName('/profile')} to="/profile" title="Meu perfil">
          <User size={18} aria-hidden="true" /> {!isCollapsed && 'Meu perfil'}
        </Link>
        <button className={`sidebar-logout${isCollapsed ? ' is-collapsed' : ''}`} onClick={onLogout}>
          <LogOut size={18} /> {!isCollapsed && 'Sair do sistema'}
        </button>
      </nav>
      <button className="sidebar-collapse" type="button" aria-label={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'} onClick={() => setIsCollapsed((collapsed) => !collapsed)}>
        {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>
    </aside>
  );
};
