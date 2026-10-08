import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FileText, RefreshCw, ShieldAlert } from 'lucide-react';
import { CaseStatusBadge } from '../../components/rh/CaseStatusBadge';
import { MetricCard } from '../../components/rh/MetricCard';
import { RhAnalyticsChart } from '../../components/rh/RhAnalyticsChart';
import { fetchAdminCases } from '../../services/rhService';
import type { AdminCaseItem } from '../../types/case';
import {
  getCategoryDistribution,
  getMonthlyTrend,
  getStatusCount,
  getStatusDistribution,
  type CaseAnalyticsDimension,
  type CaseChartType,
} from './analytics/caseAnalytics';

const DASHBOARD_CASE_LIMIT = 100;

const formatDate = (value?: string): string => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informado' : date.toLocaleDateString('pt-BR');
};

export function RhDashboardPage() {
  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [dimension, setDimension] = useState<CaseAnalyticsDimension>('status');
  const [chartType, setChartType] = useState<CaseChartType>('bar');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadCases = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchAdminCases(DASHBOARD_CASE_LIMIT, controller.signal);
        if (!controller.signal.aborted) setCases(result);
      } catch (loadError: unknown) {
        if (!controller.signal.aborted) {
          setCases([]);
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as denúncias.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadCases();
    return () => controller.abort();
  }, [refreshVersion]);

  const statusDistribution = getStatusDistribution(cases);
  const pendingCases = getStatusCount(statusDistribution, ['Recebido', 'Em análise']);
  const inProgressCases = getStatusCount(statusDistribution, ['Em investigação', 'Aguardando informações']);
  const completedCases = getStatusCount(statusDistribution, ['Resolvido', 'Encerrado']);
  const highPriorityCases = cases.filter((item) => item.priority === 'Alta' || item.priority === 'Crítica').length;
  const points = dimension === 'status'
    ? statusDistribution
    : dimension === 'category'
      ? getCategoryDistribution(cases)
      : getMonthlyTrend(cases);
  const isTimeDimension = dimension === 'monthly';
  const chartTitle = dimension === 'status'
    ? 'Distribuição por status'
    : dimension === 'category'
      ? 'Distribuição por categoria'
      : 'Evolução mensal dos registros';
  const hasTemporalData = points.length >= 2;
  const recentHighPriorityCases = cases
    .filter((item) => item.priority === 'Alta' || item.priority === 'Crítica')
    .slice(0, 5);

  const handleDimensionChange = (value: string) => {
    if (value === 'status' || value === 'category' || value === 'monthly') {
      setDimension(value);
      setChartType(value === 'monthly' ? 'line' : 'bar');
    }
  };

  const handleChartTypeChange = (value: string) => {
    if (value === 'bar' || value === 'donut' || value === 'line') setChartType(value);
  };

  return (
    <div className="rh-dashboard">
      <header className="rh-page-header">
        <div>
          <h1 className="dashboard-page-title">Painel RH</h1>
          <p className="dashboard-page-subtitle">
            Visão analítica dos até {DASHBOARD_CASE_LIMIT} registros mais recentes disponibilizados pela API.
          </p>
        </div>
        <button
          type="button"
          className="rh-button rh-button--secondary"
          onClick={() => setRefreshVersion((version) => version + 1)}
          disabled={isLoading}
        >
          <RefreshCw size={16} aria-hidden="true" className={isLoading ? 'rh-spin' : ''} />
          Atualizar dados
        </button>
      </header>

      {error && (
        <div className="rh-alert rh-alert--error" role="alert">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>Não foi possível carregar os dados do painel.</span>
          <button
            type="button"
            className="rh-alert__action"
            onClick={() => setRefreshVersion((version) => version + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <section className="rh-stats-grid" aria-label="Indicadores dos casos carregados">
        <MetricCard title="Registros na amostra" value={isLoading ? '…' : cases.length} icon={<FileText size={22} />} tone="blue" />
        <MetricCard title="Aguardando triagem" value={isLoading ? '…' : pendingCases} icon={<Clock size={22} />} tone="purple" />
        <MetricCard title="Em atendimento" value={isLoading ? '…' : inProgressCases} icon={<ShieldAlert size={22} />} tone="amber" />
        <MetricCard title="Concluídos" value={isLoading ? '…' : completedCases} icon={<CheckCircle2 size={22} />} tone="green" />
      </section>

      {!isLoading && !error && (
        <>
          <section className="rh-panel rh-analytics-controls" aria-label="Configuração da visualização analítica">
            <label className="rh-select-field">
              <span>Indicador</span>
              <select value={dimension} onChange={(event) => handleDimensionChange(event.target.value)}>
                <option value="status">Distribuição por status</option>
                <option value="category">Distribuição por categoria</option>
                <option value="monthly">Evolução mensal</option>
              </select>
            </label>
            <label className="rh-select-field">
              <span>Visualização</span>
              <select value={chartType} onChange={(event) => handleChartTypeChange(event.target.value)}>
                {isTimeDimension ? (
                  <>
                    <option value="line">Linha</option>
                    <option value="bar">Barras</option>
                  </>
                ) : (
                  <>
                    <option value="bar">Barras</option>
                    <option value="donut">Rosca</option>
                  </>
                )}
              </select>
            </label>
            <p className="rh-analytics-sample-note">
              Os indicadores e gráficos refletem somente os registros carregados; não representam totais históricos.
            </p>
          </section>

          <RhAnalyticsChart title={chartTitle} points={points} chartType={chartType} />

          {dimension === 'monthly' && !hasTemporalData && (
            <p className="rh-analytics-note" role="status">
              Ainda não há registros em meses diferentes para comparar a evolução temporal.
            </p>
          )}

          <section className="rh-panel rh-priority-cases" aria-labelledby="rh-priority-cases-heading">
            <header className="rh-panel__header">
              <div>
                <h2 id="rh-priority-cases-heading">Casos com prioridade alta ou crítica</h2>
                <p>{highPriorityCases} caso(s) na amostra carregada.</p>
              </div>
              <button type="button" className="rh-button rh-button--link" onClick={() => navigate('/rh/cases')}>
                Abrir gestão de denúncias <ArrowRight size={16} aria-hidden="true" />
              </button>
            </header>
            {recentHighPriorityCases.length === 0 ? (
              <div className="rh-state rh-state--inline">
                <p>Não há casos com prioridade alta ou crítica nesta amostra.</p>
              </div>
            ) : (
              <div className="rh-table-scroll" role="region" aria-label="Casos prioritários" tabIndex={0}>
                <table className="rh-data-table rh-data-table--priority">
                  <thead>
                    <tr>
                      <th scope="col">Identificador</th>
                      <th scope="col">Categoria</th>
                      <th scope="col">Prioridade</th>
                      <th scope="col">Status</th>
                      <th scope="col">Data de registro</th>
                      <th scope="col">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHighPriorityCases.map((item) => (
                      <tr key={item.id}>
                        <td><span className="rh-case-code">#{item.id.slice(0, 8)}</span></td>
                        <td>{item.category}</td>
                        <td>{item.priority}</td>
                        <td><CaseStatusBadge status={item.status} /></td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="rh-icon-button"
                            aria-label={`Abrir detalhes do caso ${item.id.slice(0, 8)}`}
                            onClick={() => navigate(`/rh/cases/${encodeURIComponent(item.id)}`)}
                          >
                            <ArrowRight size={16} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {isLoading && (
        <div className="rh-state" role="status">
          <RefreshCw size={24} aria-hidden="true" className="rh-spin" />
          <span>Carregando indicadores…</span>
        </div>
      )}
    </div>
  );
}
