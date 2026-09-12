import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CaseDetailsPage() {
  // Pega o ID que virá na URL (ex: /my-cases/12345)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1>Detalhes da Denúncia</h1>
      </header>

      <main>
        <div className="card">
          <p>Buscando informações do protocolo: <strong>{id}</strong>...</p>
          {/* Aqui depois vamos fazer o fetch na API e renderizar os dados do caso! */}
        </div>
      </main>
    </div>
  );
}
