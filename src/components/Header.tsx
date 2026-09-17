import React, { useEffect, useState } from 'react';
import { Moon, Shield, Sun, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('safeline-theme') !== 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const toggleTheme = () => {
    const nextIsDarkMode = !isDarkMode;
    setIsDarkMode(nextIsDarkMode);
    document.documentElement.dataset.theme = nextIsDarkMode ? 'dark' : 'light';
    localStorage.setItem('safeline-theme', nextIsDarkMode ? 'dark' : 'light');
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-brand" aria-label="SafeLine" style={{ marginLeft: 0, paddingLeft: '1rem' }}>
        <Shield size={38} strokeWidth={1.8} />
        <span>SAFELINE</span>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-theme-toggle"
          type="button"
          aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onClick={toggleTheme}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
  
        <button 
          className="topbar-profile" 
          type="button" 
          aria-label="Ir para o Meu Perfil" 
          onClick={() => navigate('/profile')}
        >
          <UserRound size={22} />
        </button>
      </div>
    </header>
  );
};
