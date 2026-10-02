import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ShieldAlert,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { fetchAdminCases, updateCaseStatus } from '../../services/rhService';
import { type AdminCaseItem, CASE_STATUSES } from '../../types/case';
import { RhCaseCardModal } from '../../components/cases/RhCaseCardModal';

export const RhCasesListPage: React.FC = () => {
  const { id: urlCaseId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal de Card Moderno
  const [manualSelectedCaseId, setManualSelectedCaseId] = useState<string | null>(null);
  const activeCaseId = urlCaseId || manualSelectedCaseId;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCases(100);
      setCases(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar a lista de denúncias.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    const initLoad = async () => {
      try {
        setError(null);
        const data = await fetchAdminCases(100);
        if (isSubscribed) {
          setCases(data);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar a lista de denúncias.';
          setError(msg);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };
    void initLoad();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleQuickStatusChange = async (caseId: string, newStatus: string) => {
    try {
      setUpdatingId(caseId);
      await updateCaseStatus(caseId, newStatus);
      
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: newStatus as AdminCaseItem['status'] } : c))
      );

      if (selectedStatus !== 'todos' && selectedStatus.toLowerCase() !== newStatus.toLowerCase()) {
        setSelectedStatus('todos');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o servidor.';
      alert('Erro ao atualizar status: ' + msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const openCardModal = (caseId: string) => {
    setManualSelectedCaseId(caseId);
    window.history.pushState(null, '', `/rh/casos/${caseId}`);
  };

  const closeCardModal = () => {
    setManualSelectedCaseId(null);
    if (window.location.pathname.startsWith('/rh/casos/')) {
      navigate('/rh/casos', { replace: true });
    }
  };

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter((c) => c.status === 'Recebido' || c.status === 'Em análise').length;
    const inProgress = cases.filter((c) => c.status === 'Em investigação' || c.status === 'Aguardando informações').length;
    const completed = cases.filter((c) => c.status === 'Resolvido' || c.status === 'Encerrado').length;
    return { total, pending, inProgress, completed };
  }, [cases]);

  // Dynamic status badge inline styling
  const getStatusInlineStyle = (status: string) => {
    switch (status) {
      case 'Recebido':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', borderColor: 'rgba(59, 130, 246, 0.35)' };
      case 'Em análise':
        return { background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', borderColor: 'rgba(168, 85, 247, 0.35)' };
      case 'Em investigação':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.35)' };
      case 'Aguardando informações':
        return { background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.35)' };
      case 'Resolvido':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.35)' };
      case 'Encerrado':
        return { background: 'rgba(148, 163, 184, 0.15)', color: '#CBD5E1', borderColor: 'rgba(148, 163, 184, 0.35)' };
      default:
        return { background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.35)' };
    }
  };

  // Filtragem dinâmica
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'todos' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesCategory =
        selectedCategory === 'todas' || item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [cases, searchTerm, selectedStatus, selectedCategory]);

  const hasActiveFilters = searchTerm !== '' || selectedStatus !== 'todos' || selectedCategory !== 'todas';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('todos');
    setSelectedCategory('todas');
  };

  return (
    <div className="rh-cases-page">
      {/* Cabeçalho */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Gestão e Análise de Denúncias</h1>
          <p className="dashboard-page-subtitle">
            Acompanhe, filtre e gerencie o ciclo de investigação de ocorrências corporativas em tempo real.
          </p>
        </div>
        <button className="rh-btn-refresh" onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar Lista</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Métricas / KPI */}
      <div className="rh-stats-grid mb-6">
        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--total">
            <FileText size={22} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Total Registrado</span>
            <span className="rh-stat-value">{loading ? '...' : stats.total}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--pending">
            <Clock size={22} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Em Análise / Triagem</span>
            <span className="rh-stat-value">{loading ? '...' : stats.pending}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--progress">
            <ShieldAlert size={22} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Em Investigação</span>
            <span className="rh-stat-value">{loading ? '...' : stats.inProgress}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--success">
            <CheckCircle2 size={22} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Concluídos / Resolvidos</span>
            <span className="rh-stat-value">{loading ? '...' : stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="rh-filters-bar card-box mb-6">
        <div className="rh-search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="rh-search-input"
            placeholder="Buscar por ID (#código), relato ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rh-filters-group">
          <div className="rh-filter-item">
            <Filter size={16} />
            <select
              className="rh-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="recebido">Recebido</option>
              <option value="em análise">Em Análise</option>
              <option value="em investigação">Em Investigação</option>
              <option value="aguardando informações">Aguardando Informações</option>
              <option value="resolvido">Resolvido</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>

          <div className="rh-filter-item">
            <select
              className="rh-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="todas">Todas as Categorias</option>
              <option value="assédio">Assédio</option>
              <option value="fraude">Fraude</option>
              <option value="conduta">Desvio de Conduta</option>
              <option value="sugestão">Sugestão</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-secondary"
              style={{ height: '46px', fontSize: '0.82rem', gap: '6px' }}
              title="Limpar todos os filtros"
            >
              <RotateCcw size={14} />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Casos */}
      <div className="card-box">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-subtle">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-heading">Dossiês de Denúncias</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {filteredCases.length} {filteredCases.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-xs text-muted">
              Exibindo {filteredCases.length} de {cases.length} denúncias
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-primary mx-auto mb-2" />
            <span className="text-sm font-medium">Carregando denúncias e ocorrências...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 text-center text-gray flex flex-col items-center gap-3">
            <XCircle size={42} className="mx-auto text-muted opacity-50" />
            <p className="text-base font-semibold text-heading">Nenhuma denúncia encontrada para os filtros selecionados.</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="rh-btn-refresh mt-2">
                Limpar Filtros de Busca
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="rh-table">
              <thead>
                <tr>
                  <th>Código do Caso</th>
                  <th>Categoria</th>
                  <th>Relato do Colaborador</th>
                  <th>Status Atual</th>
                  <th>Janela de Registro</th>
                  <th style={{ textAlign: 'right' }}>Ações de Análise</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => {
                  const inlineStyle = getStatusInlineStyle(item.status);
                  return (
                    <tr 
                      key={item.id} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => openCardModal(item.id)}
                    >
                      <td>
                        <span className="font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs">
                          #{item.id.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>
                      <td className="max-w-md">
                        <p className="line-clamp-2 text-sm text-heading font-medium" title={item.description || item.content}>
                          {item.description || item.content || item.title || 'Sem descrição.'}
                        </p>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className="rh-status-select-inline"
                          style={inlineStyle}
                          value={item.status}
                          disabled={updatingId === item.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(item.id, e.target.value);
                          }}
                        >
                          {CASE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-sm text-muted font-medium">{item.createdAtWindow || 'Recente'}</td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="rh-btn-details-chat"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCardModal(item.id);
                          }}
                        >
                          <Eye size={15} />
                          <span>Detalhes & Chat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Modal Moderno */}
      <RhCaseCardModal
        isOpen={!!activeCaseId}
        caseId={activeCaseId}
        onClose={closeCardModal}
        onStatusUpdated={handleQuickStatusChange}
      />
    </div>
  );
};

