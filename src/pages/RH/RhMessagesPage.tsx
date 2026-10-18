import { useEffect, useRef, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, MessageSquare, RefreshCw, Send, Shield } from 'lucide-react';
import { CaseStatusBadge } from '../../components/rh/CaseStatusBadge';
import { ApiError } from '../../services/api';
import { fetchAdminCases, fetchCaseMessages, sendCaseMessage } from '../../services/rhService';
import { useChatConnection } from '../../hooks/useChatConnection';
import type { AdminCaseItem, CaseMessageItem } from '../../types/case';

const MAX_MESSAGE_LENGTH = 5000;

interface MessagesResult {
  caseId: string;
  refreshVersion: number;
  messages: CaseMessageItem[];
  error: string | null;
}

const getMessageError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
    if (error.status === 403) return 'Sua conta não tem permissão para acessar as mensagens deste caso.';
    if (error.status === 404) return 'Este caso não está mais disponível.';
  }
  return 'Não foi possível carregar as mensagens. Tente novamente.';
};

export function RhMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCaseId = searchParams.get('caseId') ?? '';
  const selectedCaseIdRef = useRef(selectedCaseId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [messagesResult, setMessagesResult] = useState<MessagesResult | null>(null);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [casesRefreshVersion, setCasesRefreshVersion] = useState(0);
  const [messagesRefreshVersion, setMessagesRefreshVersion] = useState(0);

  const token = localStorage.getItem('@SafeLine:token');

  // Atualiza a referência do case selecionado
  useEffect(() => {
    selectedCaseIdRef.current = selectedCaseId;
  }, [selectedCaseId]);

  // Rolagem automática para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesResult?.messages]);

  // Carregamento da lista de Casos (Lado Esquerdo)
  useEffect(() => {
    const controller = new AbortController();

    const loadCases = async () => {
      setIsLoadingCases(true);
      setCasesError(null);
      try {
        const result = await fetchAdminCases(100, controller.signal);
        if (!controller.signal.aborted) setCases(result);
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setCases([]);
          setCasesError(error instanceof ApiError && error.status === 403
            ? 'Sua conta não tem permissão para consultar os casos.'
            : error instanceof ApiError && error.status === 401
              ? 'Sua sessão expirou. Entre novamente para continuar.'
              : 'Não foi possível carregar os casos. Tente novamente.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingCases(false);
      }
    };

    void loadCases();
    return () => controller.abort();
  }, [casesRefreshVersion]);

  // Dados do caso e das mensagens atuais
  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null;
  const currentMessagesResult = messagesResult?.caseId === selectedCaseId &&
    messagesResult.refreshVersion === messagesRefreshVersion
    ? messagesResult
    : null;
  const messages = currentMessagesResult?.messages ?? [];
  const messagesError = currentMessagesResult?.error ?? null;
  const isLoadingMessages = Boolean(selectedCaseId && selectedCase && !casesError && !currentMessagesResult);

  type IncomingChatMessage = Partial<CaseMessageItem> & {
    senderRole?: string;
    senderName?: string;
    senderUserId?: string;
    senderId?: string;
    content?: string;
    createdAt?: string;
    id?: string;
  };

  // Callback de recebimento via SignalR
  const handleMessageReceived = useCallback((incomingMessage: IncomingChatMessage) => {
    setMessagesResult((current) => {
      if (!current || current.caseId !== selectedCaseIdRef.current) return current;

      const incomingCreatedAt = incomingMessage.createdAt ?? new Date().toISOString();
      const messageContent = incomingMessage.content ?? '';
      const senderRole = incomingMessage.senderRole ?? '';
      const isIncomingFromAdmin = ['admin', 'hr', 'hr_admin'].includes(senderRole.toLowerCase());

      const exists = current.messages.some(
        (m) =>
          m.id === incomingMessage.id ||
          (m.content === messageContent &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(incomingCreatedAt).getTime()) < 2000)
      );

      if (exists) return current;

      const newMessage: CaseMessageItem = {
        ...incomingMessage,
        id: incomingMessage.id ?? `${selectedCaseIdRef.current}-${Date.now()}`,
        caseId: selectedCaseIdRef.current,
        content: messageContent,
        createdAt: incomingCreatedAt,
        senderRole,
        isFromAdmin: isIncomingFromAdmin,
        senderName: incomingMessage.senderName || (isIncomingFromAdmin ? 'Equipe de Análise' : 'Colaborador'),
        senderId: incomingMessage.senderId ?? incomingMessage.senderUserId ?? '',
      };

      return { ...current, messages: [...current.messages, newMessage] };
    });
  }, []);

  // Hook de Conexão em Tempo Real
  const { isConnected, isReconnecting, connectionError } = useChatConnection({
    caseId: selectedCaseId,
    token,
    onMessageReceived: handleMessageReceived,
  });

  // Carregamento do histórico REST do caso (Lado Direito)
  useEffect(() => {
    if (!selectedCaseId || isLoadingCases || casesError || !selectedCase) return;

    const controller = new AbortController();
    const requestCaseId = selectedCaseId;
    const requestRefreshVersion = messagesRefreshVersion;

    const loadMessages = async () => {
      try {
        const result = await fetchCaseMessages(requestCaseId, controller.signal);
        if (!controller.signal.aborted) {
          setMessagesResult({
            caseId: requestCaseId,
            refreshVersion: requestRefreshVersion,
            messages: result,
            error: null,
          });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setMessagesResult({
            caseId: requestCaseId,
            refreshVersion: requestRefreshVersion,
            messages: [],
            error: getMessageError(error),
          });
        }
      }
    };

    void loadMessages();
    return () => controller.abort();
  }, [selectedCaseId, selectedCase, isLoadingCases, casesError, messagesRefreshVersion]);

  // Ação de selecionar um caso na lista
  const selectCase = (caseId: string) => {
    selectedCaseIdRef.current = caseId;
    setMessageText('');
    setSendFeedback(null);
    setSendError(null);
    setSearchParams(caseId ? { caseId } : {}, { replace: false });
  };

  // Envio de mensagem
  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageText.trim();
    if (!selectedCase || !currentMessagesResult || messagesError || !content || isSending || content.length > MAX_MESSAGE_LENGTH) return;

    const sendingCaseId = selectedCase.id;
    const sendingRefreshVersion = messagesRefreshVersion;
    setIsSending(true);
    setSendFeedback(null);
    setSendError(null);

    try {
      const createdMessage = await sendCaseMessage(sendingCaseId, content);
      
      // Adiciona ao estado otimisticamente
      setMessagesResult((current) => current?.caseId === sendingCaseId &&
        current.refreshVersion === sendingRefreshVersion
        ? { ...current, messages: [...current.messages, createdMessage] }
        : current);
        
      if (selectedCaseIdRef.current === sendingCaseId) {
        setMessageText('');
        setSendFeedback('Mensagem enviada.');
      }
    } catch (error: unknown) {
      if (selectedCaseIdRef.current !== sendingCaseId) return;
      if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
        setMessagesResult((current) => current?.caseId === sendingCaseId &&
          current.refreshVersion === sendingRefreshVersion
          ? { ...current, error: getMessageError(error) }
          : current);
      } else {
        setSendError(error instanceof ApiError && error.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível enviar a mensagem. Tente novamente.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rh-messages-page">
      <header className="rh-page-header">
        <div>
          <h1 className="dashboard-page-title">Mensagens</h1>
          <p className="dashboard-page-subtitle">
            Comunicação vinculada a um caso selecionado. O acesso também é validado pela API.
          </p>
        </div>
        <button
          type="button"
          className="rh-button rh-button--secondary"
          onClick={() => setCasesRefreshVersion((version) => version + 1)}
          disabled={isLoadingCases}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Atualizar casos
        </button>
      </header>

      <div className="rh-message-layout">
        {/* LADO ESQUERDO: LISTA DE CASOS */}
        <aside className="rh-panel rh-case-list" aria-labelledby="rh-message-cases-heading">
          <header className="rh-panel__header">
            <div>
              <h2 id="rh-message-cases-heading">Casos</h2>
              <p>Selecione uma denúncia para abrir o histórico.</p>
            </div>
          </header>

          {isLoadingCases ? (
            <div className="rh-state rh-state--inline" role="status">
              <RefreshCw size={20} aria-hidden="true" className="rh-spin" />
              <span>Carregando casos…</span>
            </div>
          ) : casesError ? (
            <div className="rh-state rh-state--inline" role="alert">
              <AlertTriangle size={20} aria-hidden="true" />
              <p>Não foi possível carregar os casos.</p>
              <button
                type="button"
                className="rh-button rh-button--secondary"
                onClick={() => setCasesRefreshVersion((version) => version + 1)}
              >
                Tentar novamente
              </button>
            </div>
          ) : cases.length === 0 ? (
            <div className="rh-state rh-state--inline">
              <MessageSquare size={20} aria-hidden="true" />
              <p>Nenhum caso está disponível para atendimento.</p>
            </div>
          ) : (
            <ul className="rh-case-list__items">
              {cases.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`rh-case-list__item${selectedCaseId === item.id ? ' is-selected' : ''}`}
                    aria-pressed={selectedCaseId === item.id}
                    onClick={() => selectCase(item.id)}
                  >
                    <span className="rh-case-list__item-heading">
                      <span className="rh-case-code">#{item.id.slice(0, 8)}</span>
                      <CaseStatusBadge status={item.status} />
                    </span>
                    <span className="rh-case-list__item-title">{item.title || item.category}</span>
                    <span className="rh-case-list__item-description">
                      {item.description || item.content || 'Sem descrição.'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* LADO DIREITO: CHAT E MENSAGENS */}
        <section className="rh-panel rh-message-panel" aria-labelledby="rh-message-panel-heading" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedCaseId ? (
            <div className="rh-state rh-message-empty">
              <MessageSquare size={32} aria-hidden="true" />
              <h2 id="rh-message-panel-heading">Selecione um caso</h2>
              <p>Escolha uma denúncia na lista para consultar o histórico e enviar uma mensagem.</p>
            </div>
          ) : isLoadingCases ? (
            <div className="rh-state rh-message-empty" role="status">
              <RefreshCw size={24} aria-hidden="true" className="rh-spin" />
              <span>Carregando casos…</span>
            </div>
          ) : !selectedCase ? (
            <div className="rh-state rh-message-empty" role="alert">
              <AlertTriangle size={28} aria-hidden="true" />
              <h2 id="rh-message-panel-heading">Caso indisponível</h2>
              <p>{casesError
                ? 'Não foi possível validar o acesso porque a lista de casos não carregou.'
                : messagesError || 'Caso indisponível ou sem autorização para acesso.'}</p>
              <button type="button" className="rh-button rh-button--secondary" onClick={() => selectCase('')}>
                Limpar seleção
              </button>
            </div>
          ) : isLoadingMessages ? (
            <div className="rh-state rh-message-empty" role="status">
              <RefreshCw size={24} aria-hidden="true" className="rh-spin" />
              <span>Carregando histórico…</span>
            </div>
          ) : (
            <>
              {/* CABEÇALHO DO CHAT COM STATUS SIGNALR */}
              <header className="rh-message-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 id="rh-message-panel-heading">{selectedCase.title || selectedCase.category}</h2>
                  <p>
                    Caso #{selectedCase.id.slice(0, 8)} · {selectedCase.category} · {selectedCase.status}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
                    <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: isConnected ? '#10B981' : isReconnecting ? '#F59E0B' : '#EF4444',
                        animation: isReconnecting ? 'pulse 1.5s infinite' : 'none'
                      }} 
                    />
                    {isConnected ? 'Online' : isReconnecting ? 'Reconectando...' : 'Offline'}
                  </div>

                  <button
                    type="button"
                    className="rh-button rh-button--secondary"
                    onClick={() => setMessagesRefreshVersion((version) => version + 1)}
                    disabled={isLoadingMessages}
                  >
                    <RefreshCw size={15} aria-hidden="true" /> Atualizar
                  </button>
                </div>
              </header>

              {/* ALERTA DE ERRO DE CONEXÃO SIGNALR */}
              {connectionError && (
                <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #FCA5A5' }}>
                  <Shield size={14} />
                  Aviso: {connectionError} As mensagens recebidas podem sofrer atrasos.
                </div>
              )}

              {/* ÁREA DO HISTÓRICO */}
              <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
                {messagesError ? (
                  <div className="rh-state rh-message-error" role="alert">
                    <AlertTriangle size={22} aria-hidden="true" />
                    <p>{messagesError}</p>
                    <button
                      type="button"
                      className="rh-button rh-button--secondary"
                      onClick={() => setMessagesRefreshVersion((version) => version + 1)}
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rh-state rh-message-history-empty">
                    <MessageSquare size={24} aria-hidden="true" />
                    <p>Nenhuma mensagem neste caso. Você pode iniciar a conversa abaixo.</p>
                  </div>
                ) : (
                  <ol className="rh-message-history" aria-label={`Histórico do caso ${selectedCase.id.slice(0, 8)}`} aria-live="polite">
                    {messages.map((message) => (
                      <li
                        key={message.id}
                        className={`rh-message${message.isFromAdmin ? ' rh-message--staff' : ' rh-message--collaborator'}`}
                      >
                        <div className="rh-message__meta">
                          <strong>{message.senderName || (message.isFromAdmin ? 'Equipe de Análise' : 'Colaborador')}</strong>
                          <time dateTime={message.createdAt}>
                            {new Date(message.createdAt).toLocaleString('pt-BR')}
                          </time>
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                      </li>
                    ))}
                    {/* Elemento âncora para a rolagem */}
                    <div ref={messagesEndRef} />
                  </ol>
                )}
              </div>

              {/* ÁREA DE ENVIO */}
              {messagesError === null && (
                <form className="rh-message-composer" onSubmit={(event) => void handleSendMessage(event)}>
                  {sendFeedback && <p className="rh-message-composer__success" role="status">{sendFeedback}</p>}
                  {sendError && <p className="rh-message-composer__error" role="alert">{sendError}</p>}
                  <label htmlFor="rh-message-content" className="sr-only">Nova mensagem</label>
                  <textarea
                    id="rh-message-content"
                    value={messageText}
                    onChange={(event) => {
                      setMessageText(event.target.value);
                      setSendError(null);
                      setSendFeedback(null);
                    }}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={3}
                    placeholder="Escreva uma mensagem sobre este caso…"
                    disabled={isSending}
                  />
                  <div className="rh-message-composer__footer">
                    <span>{messageText.length}/{MAX_MESSAGE_LENGTH}</span>
                    <button
                      type="submit"
                      className="rh-button rh-button--primary"
                      disabled={isSending || !messageText.trim()}
                    >
                      <Send size={15} aria-hidden="true" />
                      {isSending ? 'Enviando…' : 'Enviar mensagem'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
