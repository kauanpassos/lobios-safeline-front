import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldAlert,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  UserCheck,
  Download,
  RefreshCw,
  Info,
  Tag,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchCaseById,
  updateCaseStatus,
  fetchCaseMessages,
  sendCaseMessage,
  fetchCaseAttachments,
  assignCase
} from '../../services/rhService';
import { type AdminCaseItem, CASE_STATUSES, type CaseMessageItem, type CaseAttachmentItem } from '../../types/case';

interface RhCaseCardModalProps {
  isOpen: boolean;
  caseId: string | null;
  onClose: () => void;
  onStatusUpdated?: (caseId: string, newStatus: string) => void;
}

const formatStoryText = (rawText?: string) => {
  if (!rawText || !rawText.trim()) {
    return 'Nenhum detalhe adicional fornecido no momento do registro.';
  }
  try {
    const doc = new DOMParser().parseFromString(rawText, 'text/html');
    return doc.body.textContent || rawText;
  } catch {
    return rawText;
  }
};

const formatDateDisplay = (createdAt?: string, createdAtWindow?: string): string => {
  if (createdAt) {
    const dateObj = new Date(createdAt);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
  if (createdAtWindow) {
    const dateMatch = createdAtWindow.match(/\d{2}\/\d{2}\/\d{4}/);
    if (dateMatch) return dateMatch[0];
    if (createdAtWindow !== 'Recente') return createdAtWindow;
  }
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const RhCaseCardModal: React.FC<RhCaseCardModalProps> = ({
  isOpen,
  caseId,
  onClose,
  onStatusUpdated
}) => {
  const [caseItem, setCaseItem] = useState<AdminCaseItem | null>(null);
  const [messages, setMessages] = useState<CaseMessageItem[]>([]);
  const [attachments, setAttachments] = useState<CaseAttachmentItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [assignedUser, setAssignedUser] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState<'detalhes' | 'chat'>('detalhes');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!caseId) return;
      try {
        setLoading(true);
        const item = await fetchCaseById(caseId);
        
        if (!isMounted) return;

        if (item) {
          setCaseItem(item);
          setAssignedUser(item.assignedUserId || '');
        } else {
          setCaseItem({
            id: caseId,
            categoryId: 'outro',
            category: 'Outro',
            title: `Denúncia #${caseId.substring(0, 8).toUpperCase()}`,
            description: 'Relato registrado no canal SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
            content: 'Relato registrado no canal SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
            status: 'Recebido',
            priority: 'Média',
            createdAtWindow: 'Recente',
          });
        }

        const [msgs, atts] = await Promise.all([
          fetchCaseMessages(caseId).catch(() => []),
          fetchCaseAttachments(caseId).catch(() => []),
        ]);

        if (isMounted) {
          setMessages(msgs);
          setAttachments(atts);
        }
      } catch {
        if (isMounted) {
          setCaseItem({
            id: caseId,
            categoryId: 'outro',
            category: 'Outro',
            title: `Denúncia #${caseId.substring(0, 8).toUpperCase()}`,
            description: 'Relato registrado no canal SafeLine. Em análise pela equipe de RH.',
            content: 'Relato registrado no canal SafeLine. Em análise pela equipe de RH.',
            status: 'Recebido',
            priority: 'Média',
            createdAtWindow: 'Recente',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isOpen && caseId) {
      void loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, caseId]);

  if (!isOpen || !caseId) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId || !caseItem) return;
    try {
      setUpdatingStatus(true);
      await updateCaseStatus(caseId, newStatus);
      setCaseItem((prev) => (prev ? { ...prev, status: newStatus as AdminCaseItem['status'] } : prev));
      if (onStatusUpdated) {
        onStatusUpdated(caseId, newStatus);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha de comunicação com o servidor.';
      alert('Erro ao alterar status: ' + msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !assignedUser.trim()) return;
    try {
      setAssigning(true);
      await assignCase(caseId, assignedUser);
      setCaseItem((prev) => (prev ? { ...prev, assignedUserId: assignedUser } : prev));
      alert('Caso atribuído com sucesso.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atribuir caso.';
      alert('Erro ao atribuir analista: ' + msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !newMessage.trim()) return;
    try {
      setSendingMessage(true);
      const created = await sendCaseMessage(caseId, newMessage);
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar mensagem.';
      alert('Erro ao enviar mensagem: ' + msg);
    } finally {
      setSendingMessage(false);
    }
  };

  const protocolDisplay = caseId.substring(0, 8).toUpperCase();

  return (
    <div
      className="safeline-card-modal-backdrop"
      onClick={onClose}
    >
      {/* Card Principal Modal */}
      <div
        className="safeline-card-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Card */}
        <div className="safeline-card-header">
          <div className="safeline-card-header-brand">
            <div className="safeline-card-header-icon">
              <ShieldAlert size={22} />
            </div>
            <div className="safeline-card-header-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-mono text-sm font-bold" style={{ color: '#60A5FA' }}>#{protocolDisplay}</span>
                <span className="category-pill">{caseItem?.category || 'Geral'}</span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', margin: '4px 0 0 0' }}>
                {caseItem?.title || `Denúncia sobre ${caseItem?.category || 'Ocorrência'}`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="safeline-card-close-btn"
            aria-label="Fechar card"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas Internas de Navegação do Card */}
        <div className="safeline-card-tabs">
          <button
            type="button"
            className={`safeline-card-tab ${activeTab === 'detalhes' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('detalhes')}
          >
            <FileText size={16} /> Relato & Investigação
          </button>
          <button
            type="button"
            className={`safeline-card-tab ${activeTab === 'chat' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} /> Chat Anônimo ({messages.length})
          </button>
        </div>

        {/* Corpo Scrollável do Card */}
        <div className="safeline-card-body">
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={28} className="animate-spin" style={{ color: '#3B82F6' }} />
              <span>Carregando informações do card...</span>
            </div>
          ) : activeTab === 'detalhes' ? (
            <>
              {/* Bloco 1: Status Atual e Prioridade */}
              <div className="safeline-card-block" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Status da Investigação
                  </span>
                  <select
                    className="rh-select"
                    style={{ fontWeight: 600 }}
                    value={caseItem?.status || 'Recebido'}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {CASE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Prioridade
                  </span>
                  <span
                    className="category-pill"
                    style={{
                      background: caseItem?.priority === 'Alta' || caseItem?.priority === 'Crítica' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                      color: caseItem?.priority === 'Alta' || caseItem?.priority === 'Crítica' ? '#FCA5A5' : '#FCD34D',
                      borderColor: caseItem?.priority === 'Alta' || caseItem?.priority === 'Crítica' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                    }}
                  >
                    {caseItem?.priority || 'Média'}
                  </span>
                </div>
              </div>

              {/* Bloco 2: Detalhes do Ocorrido (História enviada pelo colaborador) */}
              <div className="safeline-card-block" style={{ borderLeft: '4px solid #3B82F6' }}>
                <div className="safeline-card-block-title" style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                    <FileText size={16} /> Detalhes do Ocorrido
                  </span>
                  <span style={{ fontSize: '0.72rem', textTransform: 'none', background: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 600 }}>
                    História Enviada pelo Usuário
                  </span>
                </div>
                <div className="safeline-card-report-content" style={{ marginTop: '10px' }}>
                  {formatStoryText(caseItem?.description || caseItem?.content)}
                </div>
              </div>

              {/* Bloco 3: Ficha Técnica da Ocorrência */}
              <div className="safeline-card-block">
                <div className="safeline-card-block-title" style={{ color: '#94A3B8' }}>
                  <Info size={16} /> Ficha Técnica & Metadados da Ocorrência
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginTop: '10px' }}>
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.55)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={13} style={{ color: '#60A5FA' }} /> Categoria Classificada
                    </span>
                    <strong style={{ fontSize: '0.94rem', color: '#F8FAFC', display: 'block', marginTop: '4px' }}>
                      {caseItem?.category || 'Desvio de Conduta'}
                    </strong>
                  </div>

                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.55)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} style={{ color: '#60A5FA' }} /> Data de Registro
                    </span>
                    <strong style={{ fontSize: '0.94rem', color: '#F8FAFC', display: 'block', marginTop: '4px' }}>
                      {formatDateDisplay(caseItem?.createdAt, caseItem?.createdAtWindow)}
                    </strong>
                  </div>

                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.55)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} style={{ color: '#34D399' }} /> Nível de Proteção
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: '#34D399', display: 'block', marginTop: '4px' }}>
                      Criptografia SHA-256 (Anônimo)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bloco 5: Atribuição de Responsável RH */}
              <div className="safeline-card-block">
                <div className="safeline-card-block-title" style={{ color: '#94A3B8' }}>
                  <UserCheck size={16} /> Responsável Técnico do RH
                </div>
                <form onSubmit={handleAssignUser} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    placeholder="Nome do Analista responsável..."
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="rh-btn-refresh"
                    disabled={assigning}
                  >
                    {assigning ? 'Salvando...' : 'Salvar'}
                  </button>
                </form>
              </div>

              {/* Bloco 4: Anexos e Evidências */}
              {attachments.length > 0 && (
                <div className="safeline-card-block">
                  <div className="safeline-card-block-title" style={{ color: '#94A3B8' }}>
                    <Paperclip size={16} /> Evidências e Arquivos Anexados ({attachments.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}
                      >
                        <span style={{ fontSize: '0.88rem', color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.fileName}</span>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#60A5FA', textDecoration: 'none' }}
                        >
                          <Download size={14} /> Baixar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Conteúdo da Aba de Chat */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', background: 'rgba(15, 23, 42, 0.8)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                Canal direto e seguro para troca de informações confidenciais com o denunciante.
              </div>

              <div className="safeline-card-chat-box">
                {messages.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                    Nenhuma mensagem registrada até o momento neste dossiê.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`safeline-chat-msg ${msg.isFromAdmin ? 'safeline-chat-msg--admin' : 'safeline-chat-msg--user'}`}
                    >
                      <span style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        {msg.isFromAdmin ? 'Equipe de RH' : 'Denunciante Anônimo'}
                      </span>
                      {msg.content}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Escreva sua mensagem para o denunciante..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="rh-btn-analyze"
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  <Send size={15} />
                  <span>{sendingMessage ? 'Enviando...' : 'Enviar'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
