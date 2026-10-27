import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Calendar,
  Tag,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../services/api';
import { parseCaseDetailsResponse, type CaseDetails } from '../../types/case';
import { formatProtocolCode } from '../../utils/protocol';
import { decodeHtmlEntities } from '../../utils/htmlEntities';

export function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorStatus(null);
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadDetails() {
      try {
        const data = await apiFetch(`/api/v1/cases/${id}`, {}, parseCaseDetailsResponse);
        if (!isMounted) return;

        setCaseDetails(data);
      } catch (err: unknown) {
        if (!isMounted) return;

        if (err instanceof Error && 'status' in err && typeof (err as { status: unknown }).status === 'number') {
          const status = (err as { status: number }).status;
          setErrorStatus(status);
        }
        setErrorMessage(err instanceof Error ? err.message : 'Erro ao carregar detalhes da denúncia.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const displayProtocol = formatProtocolCode(caseDetails?.protocol || id);
  const formattedDate = caseDetails?.createdAt
    ? new Date(caseDetails.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const decodedTitle = decodeHtmlEntities(caseDetails?.title);
  const decodedDescription = decodeHtmlEntities(caseDetails?.description);

  return (
    <div className="cases-page fade-in case-details-view">
      <section className="case-details-header">
        <Button
          variant="outline"
          onClick={() => navigate('/my-cases')}
          icon={<ArrowLeft size={16} />}
          className="case-details-back-btn"
        >
          Voltar
        </Button>
        <div className="case-details-header-info">
          <h1>Detalhes da Denúncia</h1>
          <p className="case-details-protocol-badge">
            Protocolo: <strong className="case-protocol-code">{displayProtocol}</strong>
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="cases-panel case-details-panel" aria-busy="true" aria-label="Carregando denúncia">
          <div className="safeline-skeleton safeline-skeleton-toolbar" />
          <div className="safeline-skeleton safeline-skeleton-table" style={{ marginTop: '16px' }} />
        </div>
      ) : errorStatus === 403 ? (
        <div className="cases-panel case-details-panel case-details-status-message">
          <ShieldAlert size={48} className="case-details-error-icon" />
          <h2>Acesso Negado (403)</h2>
          <p>
            Você não possui permissão para visualizar esta denúncia.
          </p>
          <Button variant="outline" onClick={() => navigate('/my-cases')} icon={<ArrowLeft size={16} />}>
            Voltar para Minhas Denúncias
          </Button>
        </div>
      ) : errorMessage ? (
        <div className="cases-panel case-details-panel case-details-status-message">
          <AlertCircle size={48} className="case-details-error-icon" />
          <h2>Erro ao carregar denúncia</h2>
          <p>{errorMessage}</p>
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={handleRetry}>
            Tentar Novamente
          </Button>
        </div>
      ) : caseDetails ? (
        <div className="cases-panel case-details-panel">
          {/* Cabeçalho da denúncia */}
          <div className="case-details-main-info">
            <div className="case-details-icon-wrap" aria-hidden="true">
              <FileText size={22} />
            </div>
            <div className="case-details-title-group">
              <h2 className="case-details-title">{decodedTitle}</h2>
              <div className="case-details-chips">
                <span className="case-detail-chip">
                  <Tag size={13} aria-hidden="true" />
                  <span>Categoria: <strong>{caseDetails.category}</strong></span>
                </span>
                {caseDetails.priority && (
                  <span className="case-detail-chip">
                    <Shield size={13} aria-hidden="true" />
                    <span>Prioridade: <strong>{caseDetails.priority}</strong></span>
                  </span>
                )}
                {formattedDate && (
                  <span className="case-detail-chip">
                    <Calendar size={13} aria-hidden="true" />
                    <span>Registrado em: <strong>{formattedDate}</strong></span>
                  </span>
                )}
              </div>
            </div>
            <div className="case-details-actions-top">
              <Button
                variant="outline"
                icon={<MessageSquare size={16} />}
                onClick={() => navigate(`/mensagens/${caseDetails.id}`)}
                className="case-details-chat-btn"
              >
                Abrir Mensagens
              </Button>
            </div>
          </div>

          {/* Status atual */}
          <div className="case-details-section">
            <h3 className="case-details-section-title">Status do Andamento</h3>
            <div className="case-details-status-display">
              <span className={`case-status-badge status-${caseDetails.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {caseDetails.status}
              </span>
            </div>
          </div>

          {/* Relato do ocorrido */}
          <div className="case-details-section">
            <h3 className="case-details-section-title">Descrição do Relato</h3>
            <div className="case-details-description-box">
              <p>{decodedDescription}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
