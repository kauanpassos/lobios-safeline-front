import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../services/api';
import { parseCaseDetailsResponse, type CaseDetails } from '../../types/case';

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

  return (
    <div className="cases-page fade-in">
      <section className="cases-heading" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            variant="outline"
            onClick={() => navigate('/my-cases')}
            icon={<ArrowLeft size={16} />}
          >
            Voltar
          </Button>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Detalhes da Denúncia</h1>
            <p style={{ color: '#B7C9E2', fontSize: '0.9rem' }}>
              ID do Registro: <strong style={{ color: '#F1F5F9' }}>{id}</strong>
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="cases-panel" style={{ padding: '32px' }}>
          <div className="safeline-skeleton safeline-skeleton-toolbar" />
        </div>
      ) : errorStatus === 403 ? (
        <div className="cases-panel" style={{ padding: '32px', textAlign: 'center', color: '#F87171' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px auto' }} />
          <h2>Acesso Negado (403)</h2>
          <p style={{ color: '#9AAEC9', marginTop: '8px' }}>
            Você não possui permissão para visualizar esta denúncia.
          </p>
        </div>
      ) : errorMessage ? (
        <div className="cases-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px auto', color: '#F87171' }} />
          <h2>Erro ao carregar denúncia</h2>
          <p style={{ color: '#9AAEC9', margin: '8px 0 16px 0' }}>{errorMessage}</p>
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={handleRetry}>Tentar Novamente</Button>
        </div>
      ) : caseDetails ? (
        <div className="cases-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(100,116,139,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(147,197,253,0.2)' }}>
              <FileText size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#F1F5F9', marginBottom: '2px' }}>{caseDetails.title}</h2>
              <p style={{ fontSize: '0.85rem', color: '#829ABB' }}>Categoria: {caseDetails.category} | Prioridade: {caseDetails.priority}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#93C5FD', marginBottom: '8px' }}>Status Atual</h3>
            <span style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(59,130,246,0.2)', color: '#60A5FA', fontWeight: 600, fontSize: '0.85rem' }}>
              {caseDetails.status}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: '#93C5FD', marginBottom: '8px' }}>Descrição do Relato</h3>
            <p style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{caseDetails.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
