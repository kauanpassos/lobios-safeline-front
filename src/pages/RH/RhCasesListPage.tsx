import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { CaseStatusBadge } from '../../components/rh/CaseStatusBadge';

import { getApiErrorMessage } from '../../services/api';
import { fetchAdminCases } from '../../services/rhService';
import {
  CASE_PRIORITIES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  type AdminCaseItem,
  type CasePriority,
  type CaseStatus,
} from '../../types/case';
import { decodeHtmlEntities } from '../../utils/htmlEntities';

const formatDate = (value?: string, fallback?: string): string => {
  if (!value) return fallback || 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback || 'Não informado' : date.toLocaleString('pt-BR');
};

export function RhCasesListPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<CasePriority | 'all'>('all');

  useEffect(() => {
    const controller = new AbortController();

    const loadCases = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const result = await fetchAdminCases(100, controller.signal);
        if (!controller.signal.aborted) {
          setCases(result);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setLoadError(getApiErrorMessage(error, 'Não foi possível carregar as denúncias. Tente novamente.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadCases();
    return () => controller.abort();
  }, [refreshVersion]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');
  const filteredCases = cases.filter((item) => {
    const matchesSearch = !normalizedSearch || [
      item.protocolCode,
      item.publicProtocolHash,
      item.id,
      item.title,
      item.description,
      item.category,
      item.priority,
    ].some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalizedSearch));
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });
  const hasFilters = Boolean(normalizedSearch) ||
    selectedStatus !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  return (
    <div className="rh-cases-page">
      <header className="rh-page-header">
        <div>
          <h1 className="dashboard-page-title">Gestão de denúncias</h1>
          <p className="dashboard-page-subtitle">
            Consulte e localize os até 100 casos mais recentes retornados pela API. Abra um caso para gerenciá-lo.
          </p>
        </div>
        <button
          type="button"
          className="rh-button rh-button--secondary"
          onClick={() => setRefreshVersion((version) => version + 1)}
          disabled={isLoading}
        >
          <RefreshCw size={16} aria-hidden="true" className={isLoading ? 'rh-spin' : ''} />
          Atualizar lista
        </button>
      </header>

      {loadError && (
        <div className="rh-alert rh-alert--error" role="alert">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>{loadError}</span>
          <button
            type="button"
            className="rh-alert__action"
            onClick={() => setRefreshVersion((version) => version + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <section className="rh-panel rh-filter-panel" aria-label="Pesquisa e filtros">
        <label className="rh-search-field">
          <span className="rh-visually-hidden">Pesquisar casos</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por protocolo, relato ou categoria"
          />
        </label>

        <div className="rh-filter-controls">
          <div className="rh-filter-controls__fields">
            <label className="rh-select-field">
              <span className="rh-visually-hidden">Filtrar por status</span>
              <select
                value={selectedStatus}
                onChange={(event) => {
                  const status = CASE_STATUSES.find((candidate) => candidate === event.target.value);
                  setSelectedStatus(status ?? 'all');
                }}
              >
                <option value="all">Todos os status</option>
                {CASE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            <label className="rh-select-field">
              <span className="rh-visually-hidden">Filtrar por categoria</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {CASE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>

            <label className="rh-select-field">
              <span className="rh-visually-hidden">Filtrar por prioridade</span>
              <select
                value={selectedPriority}
                onChange={(event) => {
                  const priority = CASE_PRIORITIES.find((candidate) => candidate === event.target.value);
                  setSelectedPriority(priority ?? 'all');
                }}
              >
                <option value="all">Todas as prioridades</option>
                {CASE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>

            {hasFilters && (
              <button type="button" className="rh-button rh-button--secondary" onClick={resetFilters}>
                <RotateCcw size={15} aria-hidden="true" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rh-panel rh-list-panel" aria-labelledby="rh-cases-heading" aria-busy={isLoading}>
        <header className="rh-panel__header">
          <div>
            <h2 id="rh-cases-heading">Denúncias e casos</h2>
            <p>{filteredCases.length} {filteredCases.length === 1 ? 'resultado' : 'resultados'} na amostra carregada</p>
          </div>
        </header>

        {isLoading ? (
          <div className="rh-state" role="status">
            <RefreshCw size={24} aria-hidden="true" className="rh-spin" />
            <span>Carregando denúncias…</span>
          </div>
        ) : loadError && cases.length === 0 ? (
          <div className="rh-state">
            <ShieldAlert size={28} aria-hidden="true" />
            <p>{loadError}</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="rh-state">
            <FileText size={28} aria-hidden="true" />
            <p>{hasFilters ? 'Nenhum caso corresponde aos filtros.' : 'Nenhum caso foi encontrado.'}</p>
            {hasFilters && (
              <button type="button" className="rh-button rh-button--secondary" onClick={resetFilters}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="rh-table-scroll" role="region" aria-label="Lista de casos" tabIndex={0}>
            <table className="rh-data-table rh-data-table--cases">
              <thead>
                <tr>
                  <th scope="col">Protocolo</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Resumo</th>
                  <th scope="col">Status</th>
                  <th scope="col">Prioridade</th>
                  <th scope="col">Registrado em</th>
                  <th scope="col">Atualizado em</th>
                  <th scope="col"><span className="rh-visually-hidden">Detalhes</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="rh-case-code">
                        {item.protocolCode || item.publicProtocolHash || `#${item.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td className="rh-table-summary" title={decodeHtmlEntities(item.description || item.content || '')}>
                      {decodeHtmlEntities(item.description || item.content || item.title || 'Sem descrição.')}
                    </td>
                    <td><CaseStatusBadge status={item.status} /></td>
                    <td>{item.priority || 'Não classificada'}</td>
                    <td>{formatDate(item.createdAt, item.createdAtWindow)}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                    <td>
                      <div className="rh-table-actions">
                        <button
                          type="button"
                          className="rh-icon-button"
                          aria-label={`Abrir detalhes do caso ${item.protocolCode || item.id.slice(0, 8)}`}
                          onClick={() => navigate(`/rh/cases/${encodeURIComponent(item.id)}`)}
                        >
                          <FileText size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
