import { MessageSquare } from 'lucide-react';

export function CaseChatPage() {
  return (
    <div className="cases-page fade-in">
      <section className="cases-heading">
        <div>
          <h1>MENSAGENS</h1>
          <p>Acompanhe as comunicações entre você e a equipe de RH referentes às suas denúncias.</p>
        </div>
      </section>

      <div className="cases-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: '16px' }}>
        <MessageSquare size={52} strokeWidth={1.2} style={{ color: '#4B6A8A', opacity: 0.5 }} />
        <strong style={{ color: '#F1F5F9', fontSize: '1.05rem' }}>Nenhuma mensagem no momento.</strong>
        <span style={{ color: '#9AAEC9', fontSize: '0.9rem' }}>Quando a equipe de RH entrar em contato, as mensagens aparecerão aqui.</span>
      </div>
    </div>
  );
}
