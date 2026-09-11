import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from './pages/Auth/AuthLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { CreateCasePage } from './pages/Cases/CreateCasePage';
import { MyCasesPage } from './pages/Cases/MyCasesPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { ProfilePage } from './pages/Profile/ProfilePage';

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('@SafeLine:token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/my-cases');
  };

  const handleLogout = () => {
    localStorage.removeItem('@SafeLine:token');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Rotas Privadas
  if (isAuthenticated) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/my-cases" element={<MyCasesPage />} />
          <Route path="/new-report" element={<CreateCasePage onBack={() => navigate('/my-cases')} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/my-cases" replace />} />
        </Routes>
      </DashboardLayout>
    );
  }

  // Rotas Públicas
  return (
    <Routes>
      <Route path="/" element={
        <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'login' ? (
            <LoginPage onSuccess={handleLoginSuccess} />
          ) : (
            <RegisterPage onSuccess={() => setActiveTab('login')} />
          )}
        </AuthLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
