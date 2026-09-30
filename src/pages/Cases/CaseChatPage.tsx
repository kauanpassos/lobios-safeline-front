import { MessageSquare, Shield } from 'lucide-react';

export function CaseChatPage() {
  return (
    <div className="cases-page fade-in">
      <section className="cases-heading">
        <div>
          <h1>MENSAGENS E ATENDIMENTO</h1>
          <p>Comunicação direta, criptografada e restrita entre você e a equipe responsável pela denúncia.</p>
        </div>
      </section>

      <div className="cases-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px', textAlign: 'center', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(147,197,253,0.2)' }}>
          <MessageSquare size={32} style={{ color: '#60A5FA' }} />
        </div>
        <strong style={{ color: '#F1F5F9', fontSize: '1.1rem' }}>Selecione uma denúncia para abrir o chat</strong>
        <p style={{ color: '#9AAEC9', fontSize: '0.9rem', maxWidth: '480px' }}>
          Acesse <strong style={{ color: '#F1F5F9' }}>"Minhas Denúncias"</strong> e clique em <em>Ver detalhes</em> para visualizar as interações e conversar de forma confidencial sobre um caso específico.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontSize: '0.82rem', marginTop: '8px' }}>
          <Shield size={16} />
          <span>Canal protegido por autorização de acesso (BOLA/IDOR Guard).</span>
        </div>
      </div>
    </div>
  );
}
