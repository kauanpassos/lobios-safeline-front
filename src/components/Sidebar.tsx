import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, User, LogOut, ChevronLeft, ChevronRight, MessageSquare, Shield } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = localStorage.getItem('@SafeLine:role');
  const email = localStorage.getItem('@SafeLine:email') || '';
  const isAdmin = role === 'Admin' || role === 'HR' || email.startsWith('rh@') || email.startsWith('admin@') || email.includes('adm');

  const getMenuClassName = (path: string) =>
    `sidebar-link${location.pathname === path ? ' is-active' : ''}${isCollapsed ? ' is-collapsed' : ''}`;

  const toggleCollapse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed((prev) => !prev);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem('@SafeLine:role');
    localStorage.removeItem('@SafeLine:email');
    onLogout();
  };

  return (
    <aside className={`dashboard-sidebar${isCollapsed ? ' is-collapsed' : ''}`}>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        {isAdmin ? (
          <>
            <Link className={getMenuClassName('/rh/cases')} to="/rh/cases" title="Gestão de Denúncias">
              <Shield size={18} aria-hidden="true" /> {!isCollapsed && <span>Gestão de Denúncias</span>}
            </Link>
            <Link className={getMenuClassName('/mensagens')} to="/mensagens" title="Mensagens">
              <MessageSquare size={18} aria-hidden="true" /> {!isCollapsed && <span>Mensagens</span>}
            </Link>
            <Link className={getMenuClassName('/orientacoes')} to="/orientacoes" title="Orientações">
              <BookOpen size={18} aria-hidden="true" /> {!isCollapsed && <span>Orientações</span>}
            </Link>
            <Link className={getMenuClassName('/profile')} to="/profile" title="Meu perfil">
              <User size={18} aria-hidden="true" /> {!isCollapsed && <span>Meu perfil</span>}
            </Link>
          </>
        ) : (
          <>
            <Link className={getMenuClassName('/my-cases')} to="/my-cases" title="Minhas denúncias">
              <Home size={18} aria-hidden="true" /> {!isCollapsed && <span>Minhas denúncias</span>}
            </Link>
            <Link className={getMenuClassName('/new-report')} to="/new-report" title="Nova denúncia">
              <PlusCircle size={18} aria-hidden="true" /> {!isCollapsed && <span>Nova denúncia</span>}
            </Link>
            <Link className={getMenuClassName('/mensagens')} to="/mensagens" title="Mensagens">
              <MessageSquare size={18} aria-hidden="true" /> {!isCollapsed && <span>Mensagens</span>}
            </Link>
            <Link className={getMenuClassName('/orientacoes')} to="/orientacoes" title="Orientações">
              <BookOpen size={18} aria-hidden="true" /> {!isCollapsed && <span>Orientações</span>}
            </Link>
            <Link className={getMenuClassName('/profile')} to="/profile" title="Meu perfil">
              <User size={18} aria-hidden="true" /> {!isCollapsed && <span>Meu perfil</span>}
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className={`sidebar-logout${isCollapsed ? ' is-collapsed' : ''}`}
          onClick={handleLogoutClick}
          title="Sair do sistema"
        >
          <LogOut size={18} /> {!isCollapsed && <span>Sair do sistema</span>}
        </button>

        <button
          type="button"
          className="sidebar-collapse-btn"
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
};


