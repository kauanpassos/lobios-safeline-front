import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Paperclip,
  Send,
  User,
  FileText,
  AlertTriangle,
  RefreshCw,
  Download
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


export const RhCaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseItem, setCaseItem] = useState<AdminCaseItem | null>(null);
  const [messages, setMessages] = useState<CaseMessageItem[]>([]);
  const [attachments, setAttachments] = useState<CaseAttachmentItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'detalhes' | 'chat' | 'anexos'>('detalhes');
  
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [assignedUser, setAssignedUser] = useState('');
  const [assigning, setAssigning] = useState(false);
  
  const [, setError] = useState<string | null>(null);

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return 'Recente';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Recente' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recente';
    }
  };

  const loadCaseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const found = await fetchCaseById(id);
      
      if (found) {
        setCaseItem(found);
        setAssignedUser(found.assignedUserId || '');
      } else {
        setCaseItem({
          id,
          categoryId: 'outro',
          category: 'Outro',
          title: `Ocorrência #${id.substring(0, 8).toUpperCase()}`,
          description: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
          content: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
          status: 'Recebido',
          priority: 'Média',
          createdAtWindow: 'Recente',
        });
      }

      const [msgList, attList] = await Promise.all([
        fetchCaseMessages(id).catch(() => []),
        fetchCaseAttachments(id).catch(() => []),
      ]);
      setMessages(msgList);
      setAttachments(attList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar os detalhes do caso.';
      setError(msg);
      setCaseItem((prev) => prev || {
        id,
        categoryId: 'outro',
        category: 'Outro',
        title: `Ocorrência #${id.substring(0, 8).toUpperCase()}`,
        description: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
        content: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
        status: 'Recebido',
        priority: 'Média',
        createdAtWindow: 'Recente',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setError(null);
        const found = await fetchCaseById(id);
        if (!isSubscribed) return;

        if (found) {
          setCaseItem(found);
          setAssignedUser(found.assignedUserId || '');
        } else {
          setCaseItem({
            id,
            categoryId: 'outro',
            category: 'Outro',
            title: `Ocorrência #${id.substring(0, 8).toUpperCase()}`,
            description: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
            content: 'Relato registrado no canal de denúncias corporativo SafeLine. Em análise pela equipe de Compliance e Recursos Humanos.',
            status: 'Recebido',
            priority: 'Média',
            createdAtWindow: 'Recente',
          });
        }

        const [msgList, attList] = await Promise.all([
          fetchCaseMessages(id).catch(() => []),
          fetchCaseAttachments(id).catch(() => []),
        ]);
        if (!isSubscribed) return;
        setMessages(msgList);
        setAttachments(attList);
      } catch (err: unknown) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Erro ao carregar os detalhes do caso.';
        setError(msg);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    void fetchDetails();

    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !caseItem) return;
    try {
      setUpdatingStatus(true);
      await updateCaseStatus(id, newStatus);
      setCaseItem((prev) => (prev ? { ...prev, status: newStatus as AdminCaseItem['status'] } : prev));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de comunicação com o servidor.';
      alert('Não foi possível alterar o status: ' + msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !assignedUser.trim()) return;
    try {
      setAssigning(true);
      await assignCase(id, assignedUser);
      setCaseItem((prev) => (prev ? { ...prev, assignedUserId: assignedUser } : prev));
      alert('Caso atribuído com sucesso para o analista.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atribuir analista.';
      alert('Erro ao atribuir analista: ' + msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMessage.trim()) return;
    try {
      setSendingMessage(true);
      const created = await sendCaseMessage(id, newMessage);
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar mensagem.';
      alert('Erro ao enviar mensagem: ' + msg);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray flex flex-col items-center justify-center gap-3">
        <RefreshCw size={28} className="animate-spin text-primary mx-auto mb-2" />
        <span className="text-base font-medium">Carregando investigação e dossiê da denúncia...</span>
      </div>
    );
  }

  const caseIdDisplay = caseItem?.id ? caseItem.id.substring(0, 8) : (id ? id.substring(0, 8) : '--------');

  if (!caseItem && !loading) {
    return (
      <div className="card-box text-center py-12 max-w-xl mx-auto my-8">
        <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-heading">Denúncia não encontrada</h2>
        <p className="text-gray mb-6 text-sm">O caso solicitado não existe ou você não possui acesso.</p>
        <button className="rh-btn-refresh mx-auto" onClick={() => navigate('/rh/casos')}>
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="rh-case-details-page">
      {/* Header com Navegação */}
      <div className="mb-6 flex items-center justify-between">
        <button className="btn-back flex items-center gap-2 text-gray hover:text-heading" onClick={() => navigate('/rh/casos')}>
          <ArrowLeft size={18} />
          Voltar para Lista de Denúncias
        </button>
        <button className="rh-btn-refresh" onClick={loadCaseData}>
          <RefreshCw size={14} /> Atualizar Dossiê
        </button>
      </div>

      {/* Cartão de Cabeçalho do Caso */}
      <div className="card-box mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-lg font-bold text-primary">#{caseIdDisplay}</span>
              <span className="category-pill">{caseItem?.category || 'Geral'}</span>
            </div>
            <h1 className="text-2xl font-bold text-heading">Análise de Ocorrência Corporativa</h1>
            <p className="text-sm text-gray mt-1">
              Registrado na janela: <strong>{caseItem?.createdAtWindow || 'Recente'}</strong>
            </p>
          </div>

          {/* Seletor de Status do RH */}
          <div className="rh-status-control-box">
            <label className="text-xs font-semibold text-gray uppercase block mb-1">Status da Investigação:</label>
            <select
              className="rh-select rh-status-select-large"
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
        </div>
      </div>

      {/* Card de Destaque: Motivo & Descrição da Denúncia para Análise do RH */}
      <div className="card-box mb-6 border-l-4 border-l-blue-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray uppercase tracking-wider">Motivo da Denúncia</span>
              <h2 className="text-xl font-bold text-heading mt-0.5">
                {caseItem?.title || `Ocorrência sobre ${caseItem?.category || 'Desvio de Conduta'}`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="category-pill">{caseItem?.category}</span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              caseItem?.priority === 'Alta' || caseItem?.priority === 'Crítica'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              Prioridade: {caseItem?.priority || 'Média'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <span className="text-xs font-semibold text-gray uppercase block mb-2">Descrição Detalhada e Relato do Colaborador:</span>
          <div className="rh-report-content p-4 rounded-xl leading-relaxed whitespace-pre-wrap text-sm border font-medium">
            {caseItem?.description || caseItem?.content || 'Nenhuma descrição adicional foi informada no momento do registro.'}
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="rh-tabs mb-6">
        <button
          className={`rh-tab ${activeTab === 'detalhes' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('detalhes')}
        >
          <FileText size={16} /> Dossiê Completo
        </button>
        <button
          className={`rh-tab ${activeTab === 'chat' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} /> Chat com Denunciante ({messages.length})
        </button>
        <button
          className={`rh-tab ${activeTab === 'anexos' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('anexos')}
        >
          <Paperclip size={16} /> Anexos e Evidências ({attachments.length})
        </button>
      </div>

      {/* Conteúdo da Aba 1: Detalhes & Atribuição */}
      {activeTab === 'detalhes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-box">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Histórico & Linha do Tempo da Investigação
            </h2>
            <div className="timeline-list space-y-3">
              <div className="timeline-item flex items-start gap-3 text-sm">
                <div className="timeline-dot bg-primary mt-1" />
                <div>
                  <span className="font-semibold text-heading">Status atual da denúncia: "{caseItem?.status || 'Em análise'}"</span>
                  <p className="text-gray text-xs">Atualizado e registrado no canal administrativo</p>
                </div>
              </div>
              <div className="timeline-item flex items-start gap-3 text-sm">
                <div className="timeline-dot bg-emerald-500 mt-1" />
                <div>
                  <span className="font-semibold text-heading">Denúncia Recebida no Sistema SafeLine</span>
                  <p className="text-gray text-xs">Protocolo anônimo gerado com criptografia SHA-256</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar lateral de Atribuição */}
          <div className="card-box h-fit">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <User size={18} /> Atribuição de Responsável (RH)
            </h3>
            <form onSubmit={handleAssignUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray block mb-1">Analista Responsável:</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ID ou Nome do Analista do RH"
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                />
              </div>
              <button type="submit" className="rh-btn-refresh w-full justify-center" disabled={assigning}>
                {assigning ? 'Atribuindo...' : 'Salvar Atribuição'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t text-xs text-gray space-y-2">
              <p>
                <strong>Prioridade:</strong> {caseItem?.priority || 'Média'}
              </p>
              <p>
                <strong>Sigilo:</strong> Protegido por criptografia e políticas de Compliance corporativo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: Chat com Denunciante */}
      {activeTab === 'chat' && (
        <div className="card-box">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            Comunicação Direta e Anônima com o Denunciante
          </h2>
          <p className="text-sm text-gray mb-6">
            Utilize este canal para solicitar esclarecimentos ou evidências adicionais ao denunciante. O anonimato do colaborador é preservado.
          </p>

          <div className="rh-chat-container space-y-4 mb-6 max-h-96 overflow-y-auto p-4 bg-gray-50 border rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray py-8">Nenhuma mensagem trocada até o momento.</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isFromAdmin ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xl p-3 rounded-xl text-sm ${
                      msg.isFromAdmin
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <span className="text-xs opacity-75 font-semibold block mb-1">
                      {msg.isFromAdmin ? 'Equipe de RH / Compliance' : 'Denunciante Anônimo'}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray mt-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Escreva uma mensagem ou solicitação para o denunciante..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={sendingMessage || !newMessage.trim()}>
              <Send size={16} />
              {sendingMessage ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}

      {/* Conteúdo da Aba 3: Anexos */}
      {activeTab === 'anexos' && (
        <div className="card-box">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Paperclip size={20} className="text-primary" />
            Evidências e Arquivos Anexados
          </h2>
          {attachments.length === 0 ? (
            <div className="text-center py-12 text-gray">
              <Paperclip size={36} className="mx-auto mb-2 opacity-40" />
              Nenhum anexo ou arquivo de evidência foi anexado a este caso.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((att) => (
                <div key={att.id} className="p-4 border rounded-lg flex items-center justify-between bg-white hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary" />
                    <div>
                      <p className="font-semibold text-sm text-heading">{att.fileName}</p>
                      <p className="text-xs text-gray">{att.contentType || 'Arquivo de evidência'}</p>
                    </div>
                  </div>
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <Download size={14} /> Baixar
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
