import { useState } from 'react';
import { AuthLayout } from './pages/Auth/AuthLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { CreateCasePage } from './pages/Cases/CreateCasePage';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Logo } from './components/Logo';
import { LogOut, FileText, Send, MessageSquarePlus } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setActiveTab('login');
    setIsCreatingCase(false);
    localStorage.removeItem('@SafeLine:token');
  };

  if (userEmail) {
    return (
      <div style={{ minHeight: '100vh', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="bg-glow-container">
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
        </div>

        <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Logo size="sm" showSubtitle={false} />
          <Button variant="outline" onClick={handleLogout} icon={<LogOut size={16} />}>
            Sair
          </Button>
        </header>

        <main style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isCreatingCase ? (
            <CreateCasePage onBack={() => setIsCreatingCase(false)} />
          ) : (
            <div className="glass-card fade-in" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Badge icon="shield" variant="success">Sessão Segura & Criptografada</Badge>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{userEmail}</span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
                Bem-vindo ao Portal SafeLine - Lobios
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                Este é o seu espaço confidencial. Aqui você poderá enviar denúncias, sugestões e elogios com total garantia de anonimato e proteção de dados.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--bg-card-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <MessageSquarePlus size={28} color="#3B82F6" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Nova Manifestação</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Crie uma nova sugestão ou denúncia anônima para a empresa.
                  </p>
                  <Button variant="primary" style={{ marginTop: 'auto' }} icon={<Send size={16} />} onClick={() => setIsCreatingCase(true)}>
                    Criar Relato
                  </Button>
                </div>

                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--bg-card-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <FileText size={28} color="#10B981" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Acompanhar Relatos</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Consulte o andamento e as respostas dos seus protocolos.
                  </p>
                  <Button variant="secondary" style={{ marginTop: 'auto' }}>
                    Ver Meus Protocolos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <AuthLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'login' ? (
        <LoginPage onSuccess={handleLoginSuccess} />
      ) : (
        <RegisterPage onSuccess={() => setActiveTab('login')} />
      )}
    </AuthLayout>
  );
}

export default App;
