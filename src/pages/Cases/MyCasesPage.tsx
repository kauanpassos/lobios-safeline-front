import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, FileSearch, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../services/api';
import { parseMyCaseApiItems, type CaseSummary } from '../../types/case';

const tabs = ['Todas', 'Em andamento', 'Resolvidas', 'Encerradas'];

export const MyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch('/api/v1/cases/my', {}, parseMyCaseApiItems);
      setCases(data.map((item) => ({
        id: item.id,
        category: item.category || 'Denúncia',
        protocol: item.protocol || item.id.substring(0, 8).toUpperCase(),
        snippet: (item.description || item.content || '').substring(0, 60) + '...',
        status: item.status || 'Recebido', // Alinhado com o novo domínio do backend!
        priority: item.priority,
        updatedAt: new Date(item.createdAt).toLocaleDateString('pt-BR'),
      })));
    } catch {
      setError('Não foi possível carregar suas denúncias. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCases();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCases]);

  return (
    <div className="cases-page fade-in">
      <section className="cases-heading">
        <div>
          <h1>MINHAS DENÚNCIAS</h1>
          <p>Acompanhe o andamento das suas denúncias e consulte informações adicionais sempre que precisar, em um ambiente seguro e confidencial.</p>
        </div>
        <Button variant="primary" icon={<Plus size={21} />} onClick={() => navigate('/new-report')} className="cases-new-button">
          Nova denúncia
        </Button>
      </section>

      {isLoading ? (
        <div className="cases-loading" aria-busy="true" aria-label="Carregando denúncias">
          <div className="safeline-skeleton safeline-skeleton-toolbar" />
          <div className="safeline-skeleton safeline-skeleton-table" />
        </div>
      ) : (
        <section className="cases-panel">
          <div className="cases-toolbar">
            <div className="case-tabs" role="tablist" aria-label="Filtros de denúncias">
              {tabs.map((tab, index) => (
                <button key={tab} type="button" className={`case-tab${index === 0 ? ' active' : ''}`} role="tab" aria-selected={index === 0}>
                  {tab} ({index === 0 ? cases.length : 0})
                </button>
              ))}
            </div>
            <label className="case-search">
              <Search size={21} aria-hidden="true" />
              <input placeholder="Buscar por protocolo ou assunto..." aria-label="Buscar por protocolo ou assunto" />
            </label>
          </div>

          {error && (
            <div className="cases-error" role="alert">
              <AlertCircle size={24} />
              <span>{error}</span>
              <Button variant="outline" icon={<RefreshCw size={17} />} onClick={loadCases}>Tentar novamente</Button>
            </div>
          )}

          <div className="cases-table" role="table" aria-label="Lista de denúncias">
            <div className="cases-table-header" role="row">
              <span>Protocolo / Assunto</span>
              <span>Categoria</span>
              <span>Prioridade</span>
              <span>Status</span>
              <span>Última atualização</span>
              <span>Ações</span>
            </div>

            {error ? (
              <div className="cases-empty" role="row">
                <FileSearch size={54} strokeWidth={1.5} />
                <strong>Não foi possível carregar suas denúncias.</strong>
                <span>Verifique sua conexão e tente novamente.</span>
              </div>
            ) : cases.length === 0 ? (
              <div className="cases-empty" role="row">
                <BookOpen size={48} strokeWidth={1.5} />
                <strong>Você ainda não possui denúncias em andamento.</strong>
                <span>Registre uma denúncia para acompanhar seu andamento por aqui.</span>
                <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/new-report')}>Nova denúncia</Button>
              </div>
            ) : (
              cases.map((item) => (
                <div className="case-row" key={item.id} role="row">
                  <span><strong>{item.protocol}</strong><small>{item.snippet}</small></span>
                  <span>{item.category}</span>
                  <span>{item.priority}</span>
                  <span><em>{item.status}</em></span>
                  <span>{item.updatedAt}</span>
                  <span>
                    <button 
                      className="row-action" 
                      type="button"
                      onClick={() => navigate(`/my-cases/${item.id}`)}
                    >
                      Ver detalhes
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};
