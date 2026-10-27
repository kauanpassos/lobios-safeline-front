import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  BookOpen,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Shield,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';
import { SidebarBrand } from './SidebarBrand';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('safeline-theme') !== 'light');

  const role = localStorage.getItem('@SafeLine:role');
  const isManagementRole = role === 'ADMIN' || role === 'HR' || role === 'HR_ADMIN' || role === 'HR_MANAGER';
  const canManageClaims = role === 'ADMIN' || role === 'HR_ADMIN' || role === 'HR_MANAGER';

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

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    document.documentElement.dataset.theme = nextMode ? 'dark' : 'light';
    localStorage.setItem('safeline-theme', nextMode ? 'dark' : 'light');
  };

  return (
    <aside className={`dashboard-sidebar${isCollapsed ? ' is-collapsed' : ''}${!isManagementRole ? ' no-topbar' : ''}`}>
      <SidebarBrand isCollapsed={isCollapsed} />

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {isManagementRole ? (
          <>
            <Link className={getMenuClassName('/rh/dashboard')} to="/rh/dashboard" title="Painel RH">
              <Home size={18} aria-hidden="true" /> {!isCollapsed && <span>Painel RH</span>}
            </Link>
            <Link className={getMenuClassName('/rh/cases')} to="/rh/cases" title="Gestão de Denúncias">
              <Shield size={18} aria-hidden="true" /> {!isCollapsed && <span>Gestão de Denúncias</span>}
            </Link>
            <Link className={getMenuClassName('/rh/mensagens')} to="/rh/mensagens" title="Mensagens">
              <MessageSquare size={18} aria-hidden="true" /> {!isCollapsed && <span>Mensagens</span>}
            </Link>
            {canManageClaims && (
              <Link className={getMenuClassName('/rh/acessos')} to="/rh/acessos" title="Acessos e permissões">
                <KeyRound size={18} aria-hidden="true" /> {!isCollapsed && <span>Acessos e permissões</span>}
              </Link>
            )}
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
        {!isManagementRole && (
          <button
            type="button"
            className={`sidebar-theme-toggle${isCollapsed ? ' is-collapsed' : ''}`}
            onClick={toggleTheme}
            title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && <span>{isDarkMode ? 'Modo claro' : 'Modo escuro'}</span>}
          </button>
        )}

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
