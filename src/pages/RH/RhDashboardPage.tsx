import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, FileText, Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchAdminCases } from '../../services/rhService';
import type { AdminCaseItem } from '../../types/case';


export const RhDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCases(100);
      setCases(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível carregar as denúncias. Verifique se seu usuário possui permissão de RH.';
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
          const msg = err instanceof Error ? err.message : 'Não foi possível carregar as denúncias. Verifique se seu usuário possui permissão de RH.';
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

  // Métricas calculadas
  const totalCases = cases.length;
  const pendingCases = cases.filter((c) => c.status === 'Recebido').length;
  const inProgressCases = cases.filter((c) => c.status === 'Em análise' || c.status === 'Em investigação').length;
  const resolvedCases = cases.filter((c) => c.status === 'Resolvido' || c.status === 'Encerrado').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Recebido':
        return <span className="status-badge status-badge--pending">Recebido</span>;
      case 'Em análise':
      case 'Em investigação':
        return <span className="status-badge status-badge--progress">Em Análise</span>;
      case 'Resolvido':
      case 'Encerrado':
        return <span className="status-badge status-badge--completed">Resolvido</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="rh-dashboard">
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Painel de Gestão e Compliance (RH)</h1>
          <p className="dashboard-page-subtitle">
            Acompanhamento centralizado e análise de denúncias corporativas da empresa.
          </p>
        </div>
        <button className="rh-btn-refresh" onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {error && (
        <div className="alert alert--error mb-6">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="rh-stats-grid mb-8">
        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--total">
            <FileText size={24} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Total de Ocorrências</span>
            <span className="rh-stat-value">{loading ? '...' : totalCases}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--pending">
            <Clock size={24} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Aguardando Análise</span>
            <span className="rh-stat-value">{loading ? '...' : pendingCases}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--progress">
            <ShieldAlert size={24} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Em Investigação</span>
            <span className="rh-stat-value">{loading ? '...' : inProgressCases}</span>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon rh-stat-icon--success">
            <CheckCircle2 size={24} />
          </div>
          <div className="rh-stat-content">
            <span className="rh-stat-label">Casos Resolvidos</span>
            <span className="rh-stat-value">{loading ? '...' : resolvedCases}</span>
          </div>
        </div>
      </div>

      {/* Seção de Denúncias Recentes */}
      <div className="rh-recent-section card-box">
        <div className="card-box-header">
          <div>
            <h2 className="text-xl font-bold">Ocorrências Recentes</h2>
            <p className="text-sm text-gray font-normal">Denúncias mais recentes registradas pelos colaboradores</p>
          </div>
          <button className="rh-btn-view-all" onClick={() => navigate('/rh/casos')}>
            <span>Ver Todas</span>
            <ArrowRight size={15} className="rh-btn-arrow" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray">Carregando dados das denúncias...</div>
        ) : cases.length === 0 ? (
          <div className="py-8 text-center text-gray">Nenhuma denúncia registrada até o momento.</div>
        ) : (
          <div className="table-responsive mt-4">
            <table className="rh-table">
              <thead>
                <tr>
                  <th>ID / Código</th>
                  <th>Categoria</th>
                  <th>Resumo do Relato</th>
                  <th>Status</th>
                  <th>Janela de Registro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((item) => (
                  <tr 
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/rh/casos/${item.id}`)}
                  >
                    <td className="font-mono font-semibold text-primary">#{item.id ? item.id.substring(0, 8) : '--------'}</td>
                    <td>
                      <span className="category-pill">{item.category}</span>
                    </td>
                    <td className="max-w-xs truncate" title={item.description || item.content}>{item.description || item.content || item.title || 'Sem descrição'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-sm text-gray">{item.createdAtWindow || 'Recente'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="rh-btn-analyze"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rh/casos/${item.id}`);
                        }}
                      >
                        <ShieldAlert size={14} />
                        <span>Analisar Caso</span>
                        <ArrowRight size={13} className="rh-btn-arrow-small" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
