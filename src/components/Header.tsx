import React, { useEffect, useRef, useState } from 'react';
import { Moon, Shield, Sun, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('safeline-theme') !== 'light');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    const nextIsDarkMode = !isDarkMode;
    setIsDarkMode(nextIsDarkMode);
    document.documentElement.dataset.theme = nextIsDarkMode ? 'dark' : 'light';
    localStorage.setItem('safeline-theme', nextIsDarkMode ? 'dark' : 'light');
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-brand" aria-label="SafeLine">
        <Shield size={38} strokeWidth={1.8} />
        <span>SAFELINE</span>
      </div>

      <div className="topbar-actions" ref={menuRef}>
        <button className="topbar-profile" type="button" aria-label="Abrir menu de perfil" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((isOpen) => !isOpen)}>
          <UserRound size={22} />
        </button>
        {isMenuOpen && (
          <div className="profile-popover" role="menu">
            <button type="button" role="menuitem" onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}>
              <UserRound size={17} /> Meu Perfil
            </button>
            <button type="button" role="menuitem" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
              {isDarkMode ? 'Modo claro' : 'Modo escuro'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
