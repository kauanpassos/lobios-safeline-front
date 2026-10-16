import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, FileSearch, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../services/api';
import { parseMyCaseApiItems, type CaseSummary } from '../../types/case';

const TABS = ['Todas', 'Em andamento', 'Resolvidas', 'Encerradas'] as const;
type TabType = typeof TABS[number];

export const MyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const canViewPriority = ['ADMIN', 'HR', 'HR_ADMIN'].includes(
    localStorage.getItem('@SafeLine:role') ?? ''
  );
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const showPriorityColumn = canViewPriority && cases.some((item) => Boolean(item.priority));

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCases() {
      try {
        const data = await apiFetch('/api/v1/cases/my', {}, parseMyCaseApiItems);
        if (!isMounted) return;

        const formatDate = (dateStr?: string) => {
          if (!dateStr) return 'Recente';
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
        };

        setCases(data.map((item) => ({
          id: item.id,
          category: item.category || 'Outro',
          title: item.title || 'Denúncia sem título',
          description: item.description || 'Detalhes protegidos. Clique para visualizar.',
          status: item.status || 'Recebido',
          priority: item.priority,
          updatedAt: formatDate(item.createdAt),
        })));
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar suas denúncias. Tente novamente.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCases();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Filtro de aba
      if (activeTab === 'Em andamento' && ['Resolvido', 'Encerrado'].includes(c.status)) return false;
      if (activeTab === 'Resolvidas' && c.status !== 'Resolvido') return false;
      if (activeTab === 'Encerradas' && c.status !== 'Encerrado') return false;

      // Filtro de busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [cases, activeTab, searchTerm]);

  const tabCounts = useMemo(() => {
    return {
      Todas: cases.length,
      'Em andamento': cases.filter((c) => !['Resolvido', 'Encerrado'].includes(c.status)).length,
      Resolvidas: cases.filter((c) => c.status === 'Resolvido').length,
      Encerradas: cases.filter((c) => c.status === 'Encerrado').length,
    };
  }, [cases]);

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
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`case-tab${activeTab === tab ? ' active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab} ({tabCounts[tab]})
                </button>
              ))}
            </div>
            <label className="case-search">
              <Search size={21} aria-hidden="true" />
              <input
                placeholder="Buscar por assunto..."
                aria-label="Buscar por assunto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <div className="cases-error" role="alert">
              <AlertCircle size={24} />
              <span>{error}</span>
              <Button variant="outline" icon={<RefreshCw size={17} />} onClick={handleRetry}>Tentar novamente</Button>
            </div>
          )}

          <div className={`cases-table${showPriorityColumn ? ' has-priority' : ''}`} role="table" aria-label="Lista de denúncias">
            <div className="cases-table-header" role="row">
              <span>Assunto</span>
              <span>Categoria</span>
              {showPriorityColumn && <span>Prioridade</span>}
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
            ) : filteredCases.length === 0 ? (
              <div className="cases-empty" role="row">
                <BookOpen size={48} strokeWidth={1.5} />
                <strong>Nenhuma denúncia encontrada.</strong>
                <span>Nenhum registro atende aos filtros selecionados.</span>
                <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/new-report')}>Nova denúncia</Button>
              </div>
            ) : (
              filteredCases.map((item) => (
                <div className="case-row" key={item.id} role="row">
                  <span><strong>{item.title}</strong><small>{item.description}</small></span>
                  <span>{item.category}</span>
                  {showPriorityColumn && <span>{item.priority ?? '—'}</span>}
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
