import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';



export function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="cases-page fade-in">
      {/* Cabeçalho da Página */}
      <section className="cases-heading" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
          >
            Voltar
          </Button>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Detalhes da Denúncia</h1>
            <p style={{ color: '#B7C9E2', fontSize: '0.9rem' }}>
              Identificador: <strong style={{ color: '#F1F5F9', letterSpacing: '0.05em' }}>{id}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Card de Conteúdo */}
      <div className="cases-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(100,116,139,0.22)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(147,197,253,0.2)' }}>
            <FileText size={20} style={{ color: '#93C5FD' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#F1F5F9', marginBottom: '2px' }}>Informações do Registro</h2>
            <p style={{ fontSize: '0.82rem', color: '#829ABB' }}>Os dados completos desta denúncia serão carregados aqui.</p>
          </div>
        </div>

        <p style={{ color: '#B7C9E2', fontSize: '0.95rem' }}>
          Buscando informações do protocolo <strong style={{ color: '#F1F5F9' }}>{id}</strong>…
        </p>
      </div>
    </div>
  );
}
