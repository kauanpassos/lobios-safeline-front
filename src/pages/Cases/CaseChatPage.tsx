import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Shield, Send, AlertCircle } from 'lucide-react';
import { useChatConnection, type CaseMessage } from '../../hooks/useChatConnection';
import { api } from '../../services/api';

export function CaseChatPage() {
  const { caseId } = useParams<{ caseId: string }>();

  // Estados do Chat
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('@SafeLine:token');

  // Rola para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Callback de recebimento do SignalR
  const handleMessageReceived = useCallback((incomingMessage: CaseMessage) => {
    setMessages((prev) => {
      const exists = prev.some(
        (m) =>
          m.id === incomingMessage.id ||
          (m.content === incomingMessage.content &&
            m.senderUserId === incomingMessage.senderUserId &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(incomingMessage.createdAt).getTime()) < 2000)
      );
      if (exists) return prev;
      return [...prev, incomingMessage];
    });
  }, []);

  // Inicializa o Hook de tempo real
  const { isConnected, isReconnecting, connectionError } = useChatConnection({
    caseId,
    token,
    onMessageReceived: handleMessageReceived,
  });

  // Carrega o histórico de mensagens da API
  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!caseId) return;

      try {
        setIsLoadingHistory(true);
        setError(null);
        const response = await api.get<CaseMessage[]>(`/api/cases/${caseId}/messages`);
        if (isMounted) {
          setMessages(response.data);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar o histórico de mensagens.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  // Mantém a rolagem no fim
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Envia a mensagem via REST
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !caseId || isSending) return;

    const contentToSend = newContent.trim();
    setNewContent('');
    setIsSending(true);

    try {
      const response = await api.post<CaseMessage>(`/api/cases/${caseId}/messages`, {
        content: contentToSend,
      });
      // Exibe otimisticamente
      handleMessageReceived(response.data);
    } catch {
      setError('Falha ao enviar mensagem. Tente novamente.');
      setNewContent(contentToSend);
    } finally {
      setIsSending(false);
    }
  };

  if (!caseId) {
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

  return (
    <div className="cases-page fade-in">
      <section className="cases-heading">
        <div>
          <h1>ATENDIMENTO DO CASO #{caseId.substring(0, 8)}</h1>
          <p>Comunicação confidencial com a equipe de análise.</p>
        </div>
      </section>

      <div className="cases-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>

        {/* Header de Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9AAEC9', fontSize: '0.85rem' }}>
            <Shield size={16} style={{ color: '#3B82F6' }} />
            Conexão segura estabelecida
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: isConnected ? '#10B981' : isReconnecting ? '#F59E0B' : '#EF4444',
                animation: isReconnecting ? 'pulse 1.5s infinite' : 'none'
              }} 
            />
            <span style={{ color: '#F1F5F9' }}>
              {isConnected ? 'Em tempo real' : isReconnecting ? 'Reconectando...' : 'Off-line'}
            </span>
          </div>
        </div>

        {/* Alertas */}
        {(error || connectionError) && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} />
            {error || connectionError}
          </div>
        )}

        {/* Histórico de Mensagens */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoadingHistory ? (
            <div style={{ margin: 'auto', color: '#9AAEC9', fontSize: '0.9rem' }}>Sincronizando histórico...</div>
          ) : messages.length === 0 ? (
            <div style={{ margin: 'auto', color: '#9AAEC9', fontSize: '0.9rem', textAlign: 'center' }}>
              Nenhuma mensagem registrada.<br/>Você pode adicionar informações ou dúvidas abaixo.
            </div>
          ) : (
            messages.map((msg, index) => {
              const senderRole = (msg.senderRole ?? '').toLowerCase();
              const isHr = senderRole === 'hr' || senderRole === 'hr_manager' || senderRole === 'admin';
              return (
                <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: isHr ? 'flex-start' : 'flex-end', width: '100%' }}>
                  <div style={{
                      maxWidth: '75%', padding: '12px 16px', fontSize: '0.9rem', lineHeight: '1.4', color: '#F1F5F9',
                      backgroundColor: isHr ? 'rgba(255,255,255,0.05)' : '#2563EB',
                      borderRadius: isHr ? '0 12px 12px 12px' : '12px 0 12px 12px',
                      border: isHr ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                    <div style={{ fontSize: '0.75rem', color: isHr ? '#9AAEC9' : '#BFDBFE', marginBottom: '4px', fontWeight: 600 }}>
                      {isHr ? 'Equipe de Análise' : 'Você'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                    <div style={{ fontSize: '0.7rem', color: isHr ? '#64748B' : '#93C5FD', marginTop: '8px', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={isSending}
            placeholder="Escreva sua mensagem aqui..."
            style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '12px 16px', color: '#F1F5F9', fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={isSending || !newContent.trim()}
            style={{
              backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px',
              padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (isSending || !newContent.trim()) ? 'not-allowed' : 'pointer', opacity: (isSending || !newContent.trim()) ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
