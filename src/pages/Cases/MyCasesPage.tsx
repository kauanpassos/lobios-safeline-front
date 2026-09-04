import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Plus, Search, BookOpen, Shield } from 'lucide-react';
import { apiFetch } from '../../services/api';
import type { CaseSummary, MyCaseApiItem } from '../../types/case';

export const MyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoading(true);
        // Usa o endpoint correto que traz apenas os casos do usuário logado
        const data = await apiFetch<MyCaseApiItem[]>('/api/v1/cases/my');
        
        // Mapeia o retorno do backend para o formato que a UI espera
        const mappedCases: CaseSummary[] = data.map((item) => ({
          id: item.id,
          category: item.category || 'Manifestação',
          protocol: item.id.substring(0, 8).toUpperCase(), // Usa parte do ID como protocolo visual
          snippet: (item.description || item.content || '').substring(0, 60) + '...',
          status: item.status || 'Nova',
          updatedAt: new Date(item.createdAt).toLocaleDateString('pt-BR')
        }));

        setCases(mappedCases);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar suas manifestações.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  return (
    <div className="fade-in" style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>— Canal de Manifestações</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '4px' }}>Minhas manifestações</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Acompanhe o andamento das suas manifestações e responda quando o RH precisar.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => navigate('/nova-manifestacao')}
        >
          Nova manifestação
        </Button>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        {/* Filtros e Busca */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Button variant="primary" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid #8b5cf6' }}>
            Todos ({cases.length})
          </Button>
          
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'gray' }} />
            <input 
              placeholder="Buscar por protocolo ou assunto..." 
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--bg-card-border)', color: 'white', outline: 'none' }} 
            />
          </div>
        </div>

        {/* Tratamento de Erro */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Cabeçalho da Tabela */}
        <div style={{ display: 'flex', padding: '0 16px 12px 16px', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px solid var(--bg-card-border)', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>Protocolo / Assunto</div>
          <div style={{ width: '150px', textAlign: 'center' }}>Status</div>
          <div style={{ width: '150px', textAlign: 'right' }}>Última atualização</div>
        </div>

        {/* Lista de Casos */}
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>Sincronizando com o servidor de forma segura...</p>
        ) : cases.length === 0 && !error ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>Você ainda não possui manifestações registradas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cases.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', transition: 'background 0.2s', cursor: 'pointer' }}>
                <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <BookOpen size={20} color="#cbd5e1" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>{c.category}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{c.protocol} • {c.snippet}</div>
                  </div>
                </div>
                
                <div style={{ width: '150px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {c.status}
                  </span>
                </div>
                
                <div style={{ width: '150px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {c.updatedAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner de Acolhimento */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div style={{ padding: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
          <Shield color="#8b5cf6" size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Você não está sozinho(a)</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>Este é um canal seguro e confidencial. Suas manifestações são tratadas com seriedade e respeito.</p>
        </div>
        <Button variant="outline">Ver orientações</Button>
      </div>
      
    </div>
  );
};
