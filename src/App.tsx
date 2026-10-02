import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from './pages/Auth/AuthLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { CreateCasePage } from './pages/Cases/CreateCasePage';
import { MyCasesPage } from './pages/Cases/MyCasesPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { CaseDetailsPage } from './pages/Cases/CaseDetailsPage';
import { CaseChatPage } from './pages/Cases/CaseChatPage';
import { GuidelinesPage } from './pages/Guidelines/GuidelinesPage';
import { RhCasesListPage } from './pages/RH/RhCasesListPage';
import { RhCaseDetailsPage } from './pages/RH/RhCaseDetailsPage';

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('@SafeLine:token'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      navigate('/');
    };

    window.addEventListener('safeline:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('safeline:unauthorized', handleUnauthorized);
  }, [navigate]);

  const handleLoginSuccess = (_email?: string, role?: string) => {
    setIsAuthenticated(true);
    const userRole = role || localStorage.getItem('@SafeLine:role');
    const userEmail = localStorage.getItem('@SafeLine:email') || _email || '';
    const isAdmin = userRole === 'Admin' || userRole === 'HR' || userEmail.startsWith('rh@') || userEmail.startsWith('admin@') || userEmail.includes('adm');

    if (isAdmin) {
      navigate('/rh/cases');
    } else {
      navigate('/my-cases');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@SafeLine:token');
    localStorage.removeItem('@SafeLine:role');
    localStorage.removeItem('@SafeLine:email');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Rotas Privadas (Colaborador / RH)
  if (isAuthenticated) {
    const role = localStorage.getItem('@SafeLine:role');
    const email = localStorage.getItem('@SafeLine:email') || '';
    const isAdmin = role === 'Admin' || role === 'HR' || email.startsWith('rh@') || email.startsWith('admin@') || email.includes('adm');
    const defaultRedirect = isAdmin ? '/rh/cases' : '/my-cases';

    return (
      <DashboardLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/rh/cases" element={<RhCasesListPage />} />
          <Route path="/rh/casos" element={<RhCasesListPage />} />
          <Route path="/rh/cases/:id" element={<RhCaseDetailsPage />} />
          <Route path="/rh/casos/:id" element={<RhCaseDetailsPage />} />
          <Route path="/my-cases" element={<MyCasesPage />} />
          <Route path="/my-cases/:id" element={<CaseDetailsPage />} /> 
          <Route path="/new-report" element={<CreateCasePage onBack={() => navigate(defaultRedirect)} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/orientacoes" element={<GuidelinesPage />} />
          <Route path="/mensagens" element={<CaseChatPage />} />
          <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
        </Routes>
      </DashboardLayout>
    );
  }

  // Rotas Públicas (Login / Cadastro)
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

