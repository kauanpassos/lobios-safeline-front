import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import { CaseStatusBadge } from '../../components/rh/CaseStatusBadge';
import { ApiError } from '../../services/api';
import {
  assignCase,
  fetchCaseAttachments,
  fetchCaseById,
  fetchCaseStatusHistory,
  updateCasePriority,
  updateCaseStatus,
  searchHrAssignees,
} from '../../services/rhService';
import {
  CASE_PRIORITIES,
  CASE_STATUSES,
  type AdminCaseItem,
  type CaseAttachmentItem,
  type CasePriority,
  type CaseStatus,
  type CaseStatusHistoryItem,
} from '../../types/case';
import type { HrAssignee } from '../../types/user';
import { decodeHtmlEntities } from '../../utils/htmlEntities';

type Feedback = { type: 'success' | 'error'; text: string };

const getLoadError = (error: unknown, resource: string): string => {
  if (error instanceof ApiError && error.status === 403) {
    return 'Sua conta não tem permissão para acessar este conteúdo.';
  }
  if (error instanceof ApiError && error.status === 404) {
    return 'O caso solicitado não foi encontrado.';
  }
  return `Não foi possível carregar ${resource}. Tente novamente.`;
};

const formatDate = (value?: string): string => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informado' : date.toLocaleString('pt-BR');
};

export function RhCaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState<AdminCaseItem | null>(null);
  const [attachments, setAttachments] = useState<CaseAttachmentItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<CaseStatusHistoryItem[]>([]);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedUser, setAssignedUser] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<HrAssignee | null>(null);
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<HrAssignee[]>([]);
  const [isSearchingAssignees, setIsSearchingAssignees] = useState(false);
  const [assigneeSearchError, setAssigneeSearchError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loadedCaseId, setLoadedCaseId] = useState<string | null>(null);
  const [loadedRefreshVersion, setLoadedRefreshVersion] = useState(-1);
  const feedbackCaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    const search = assignedUser.trim();
    if (search.length < 2 || selectedAssignee?.name === search) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void searchHrAssignees(search, controller.signal)
        .then(setAssigneeSuggestions)
        .catch(() => {
          if (!controller.signal.aborted) {
            setAssigneeSuggestions([]);
            setAssigneeSearchError('Não foi possível pesquisar responsáveis. Tente novamente.');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearchingAssignees(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [assignedUser, selectedAssignee]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadCase = async () => {
      const [caseResult, attachmentsResult, historyResult] = await Promise.allSettled([
        fetchCaseById(id, controller.signal),
        fetchCaseAttachments(id, controller.signal),
        fetchCaseStatusHistory(id, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (caseResult.status === 'fulfilled') {
        setCaseItem(caseResult.value);
        setAssignedUser('');
        setSelectedAssignee(null);
        setAssigneeSuggestions([]);
        setIsSearchingAssignees(false);
        setAssigneeSearchError(null);
        setDetailError(null);
      } else {
        setDetailError(getLoadError(caseResult.reason, 'os detalhes do caso'));
      }

      if (attachmentsResult.status === 'fulfilled') {
        setAttachments(attachmentsResult.value);
        setAttachmentsError(null);
      } else {
        setAttachments([]);
        setAttachmentsError(getLoadError(attachmentsResult.reason, 'os anexos'));
      }

      if (historyResult.status === 'fulfilled') {
        setStatusHistory(historyResult.value);
        setHistoryError(null);
      } else {
        setStatusHistory([]);
        setHistoryError(getLoadError(historyResult.reason, 'o histórico de status'));
      }

      if (feedbackCaseIdRef.current !== id) {
        setFeedback(null);
        feedbackCaseIdRef.current = id;
      }
      setLoadedCaseId(id);
      setLoadedRefreshVersion(refreshVersion);
    };

    void loadCase();
    return () => controller.abort();
  }, [id, refreshVersion]);

  const handleStatusChange = async (status: CaseStatus) => {
    if (!id || !caseItem || status === caseItem.status) return;
    setIsUpdatingStatus(true);
    setFeedback(null);

    try {
      await updateCaseStatus(id, status);
      setCaseItem((current) => current ? { ...current, status } : current);
      setFeedback({ type: 'success', text: `Status atualizado para “${status}”.` });
      setRefreshVersion((version) => version + 1);
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        text: error instanceof ApiError && error.status === 403
          ? 'Sua conta não tem permissão para alterar o status.'
          : 'Não foi possível atualizar o status. O valor anterior foi mantido.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: CasePriority) => {
    if (!id || !caseItem || priority === caseItem.priority) return;
    setIsUpdatingPriority(true);
    setFeedback(null);

    try {
      await updateCasePriority(id, priority);
      setCaseItem((current) => current ? { ...current, priority } : current);
      setFeedback({ type: 'success', text: `Prioridade atualizada para “${priority}”.` });
      setRefreshVersion((version) => version + 1);
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        text: error instanceof ApiError && error.status === 403
          ? 'Sua conta não tem permissão para alterar a prioridade.'
          : 'Não foi possível atualizar a prioridade. O valor anterior foi mantido.',
      });
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignee = selectedAssignee;
    if (
      !id ||
      !caseItem ||
      !assignee ||
      caseItem.assignedUserIds.includes(assignee.id)
    ) return;

    setIsAssigning(true);
    setFeedback(null);

    try {
      await assignCase(id, assignee.id);
      setCaseItem((current) => current
        ? {
            ...current,
            assignedUserIds: [...current.assignedUserIds, assignee.id],
            assignedUsers: [...(current.assignedUsers ?? []), assignee],
          }
        : current);
      setAssignedUser('');
      setSelectedAssignee(null);
      setFeedback({ type: 'success', text: 'Responsável adicionado ao caso.' });
      setRefreshVersion((version) => version + 1);
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        text: error instanceof ApiError && error.status === 403
          ? 'Sua conta não tem permissão para atribuir este caso.'
          : 'Não foi possível salvar o responsável selecionado. Tente novamente.',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const refreshDetails = () => {
    setFeedback(null);
    setRefreshVersion((version) => version + 1);
  };

  if (!id) {
    return (
      <section className="rh-state rh-page-state" role="alert">
        <AlertTriangle size={28} aria-hidden="true" />
        <h1>Identificador inválido</h1>
        <p>Não foi informado um identificador de caso válido.</p>
        <button type="button" className="rh-button rh-button--secondary" onClick={() => navigate('/rh/cases')}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar à lista
        </button>
      </section>
    );
  }

  const isLoading = loadedCaseId !== id || loadedRefreshVersion !== refreshVersion;

  if (isLoading) {
    return (
      <div className="rh-state rh-page-state" role="status">
        <RefreshCw size={24} aria-hidden="true" className="rh-spin" />
        <span>Carregando detalhes do caso…</span>
      </div>
    );
  }

  if (detailError || !caseItem) {
    return (
      <section className="rh-state rh-page-state" role="alert">
        <AlertTriangle size={28} aria-hidden="true" />
        <h1>Detalhes indisponíveis</h1>
        <p>{detailError || 'O caso solicitado não foi encontrado.'}</p>
        <div className="rh-state__actions">
          <button type="button" className="rh-button rh-button--secondary" onClick={() => navigate('/rh/cases')}>
            <ArrowLeft size={16} aria-hidden="true" /> Voltar à lista
          </button>
          <button type="button" className="rh-button rh-button--primary" onClick={refreshDetails}>
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  const protocolCode = caseItem.protocolCode || caseItem.publicProtocolHash || `#${caseItem.id.slice(0, 8)}`;
  const reportText = decodeHtmlEntities(caseItem.description || caseItem.content || 'O relato não possui descrição.');

  return (
    <div className="rh-case-details-page">
      <header className="rh-page-header rh-case-page-header">
        <button type="button" className="rh-button rh-button--secondary" onClick={() => navigate('/rh/cases')}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para denúncias
        </button>
        <div className="rh-case-header-actions">
          <button
            type="button"
            className="rh-button rh-button--secondary"
            onClick={() => navigate(`/rh/mensagens?caseId=${encodeURIComponent(caseItem.id)}`)}
          >
            <MessageSquare size={16} aria-hidden="true" /> Abrir comunicação
          </button>
          <button
            type="button"
            className="rh-button rh-button--secondary"
            onClick={refreshDetails}
            disabled={isLoading}
          >
            <RefreshCw size={16} aria-hidden="true" /> Atualizar
          </button>
        </div>
      </header>

      {feedback && (
        <div className={`rh-alert rh-alert--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.type === 'success'
            ? <CheckCircle2 size={18} aria-hidden="true" />
            : <AlertTriangle size={18} aria-hidden="true" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <section className="rh-panel rh-case-identity" aria-labelledby="rh-case-title">
        <div>
          <span className="rh-case-code">{protocolCode}</span>
          <span className="rh-category">{caseItem.category}</span>
          <h1 id="rh-case-title">{decodeHtmlEntities(caseItem.title || `Protocolo ${protocolCode}`)}</h1>
          <p>Registrado em {formatDate(caseItem.createdAt)}</p>
        </div>
        <div className="rh-case-identity__state">
          <CaseStatusBadge status={caseItem.status} />
          {caseItem.priority && (
            <span className={`rh-priority-badge rh-priority-badge--${caseItem.priority.toLowerCase()}`} data-priority={caseItem.priority}>
              Prioridade {caseItem.priority.toLocaleLowerCase('pt-BR')}
            </span>
          )}
        </div>
      </section>

      <div className="rh-case-workspace">
        <div className="rh-case-workspace__main">
          <section className="rh-panel rh-case-context" aria-labelledby="rh-case-context-heading">
            <header className="rh-case-section-heading">
              <FileText size={19} aria-hidden="true" />
              <div>
                <h2 id="rh-case-context-heading">Contexto da denúncia</h2>
                <p>Relato original enviado pelo colaborador.</p>
              </div>
            </header>
            <p className="rh-case-context__report">{reportText}</p>
            <dl className="rh-case-metadata">
              <div>
                <dt>Categoria</dt>
                <dd>{caseItem.category}</dd>
              </div>
              <div>
                <dt>Registrado em</dt>
                <dd>{formatDate(caseItem.createdAt)}</dd>
              </div>
              <div>
                <dt>Última atualização</dt>
                <dd>{formatDate(caseItem.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rh-panel rh-case-history" aria-labelledby="rh-case-history-heading">
            <header className="rh-case-section-heading">
              <Clock3 size={19} aria-hidden="true" />
              <div>
                <h2 id="rh-case-history-heading">Histórico de atendimento</h2>
                <p>Alterações de status registradas para este caso.</p>
              </div>
            </header>
            {historyError ? (
              <div className="rh-inline-error" role="alert">
                <p>{historyError}</p>
                <button
                  type="button"
                  className="rh-button rh-button--secondary"
                  onClick={refreshDetails}
                >
                  Tentar novamente
                </button>
              </div>
            ) : statusHistory.length === 0 ? (
              <p className="rh-case-history__empty">Ainda não há alterações de status registradas.</p>
            ) : (
              <ol className="rh-case-timeline">
                {statusHistory.map((entry) => (
                  <li key={entry.id}>
                    <span className="rh-case-timeline__marker" aria-hidden="true" />
                    <div>
                      <p><strong>{entry.previousStatus}</strong> <span aria-hidden="true">→</span> {entry.newStatus}</p>
                      <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rh-panel rh-case-attachments" aria-labelledby="rh-attachments-heading">
            <header className="rh-case-section-heading">
              <Paperclip size={19} aria-hidden="true" />
              <div>
                <h2 id="rh-attachments-heading">Anexos e evidências</h2>
                <p>Arquivos enviados junto à denúncia.</p>
              </div>
            </header>
            {attachmentsError ? (
              <div className="rh-inline-error" role="alert">
                <p>{attachmentsError}</p>
                <button type="button" className="rh-button rh-button--secondary" onClick={refreshDetails}>
                  Tentar novamente
                </button>
              </div>
            ) : attachments.length === 0 ? (
              <p className="rh-case-history__empty">Nenhum anexo foi enviado para este caso.</p>
            ) : (
              <ul className="rh-attachment-list">
                {attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <span>
                      <FileText size={20} aria-hidden="true" />
                      <span>
                        <strong>{attachment.fileName}</strong>
                        <small>{attachment.contentType || 'Arquivo anexado'}</small>
                      </span>
                    </span>
                    <a
                      className="rh-button rh-button--secondary"
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={15} aria-hidden="true" /> Baixar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="rh-case-workspace__aside" aria-label="Classificação e ações">
          <section className="rh-panel rh-case-classification" aria-labelledby="rh-classification-heading">
            <header className="rh-case-section-heading">
              <span className="rh-case-section-heading__symbol" aria-hidden="true">#</span>
              <div>
                <h2 id="rh-classification-heading">Classificação</h2>
                <p>Organização e prioridade do caso.</p>
              </div>
            </header>
            <div className="rh-field">
              <span>Categoria</span>
              <span className="rh-field__read-only">{caseItem.category}</span>
            </div>
            <label className="rh-field">
              <span>Prioridade</span>
              <select
                value={caseItem.priority ?? ''}
                disabled={isUpdatingPriority}
                onChange={(event) => {
                  const priority = CASE_PRIORITIES.find((candidate) => candidate === event.target.value);
                  if (priority) void handlePriorityChange(priority);
                }}
              >
                {!caseItem.priority && <option value="" disabled>Não classificada</option>}
                {CASE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            {isUpdatingPriority && <span className="rh-inline-loading" role="status">Salvando prioridade…</span>}
          </section>

          <section className="rh-panel rh-case-actions" aria-labelledby="rh-case-actions-heading">
            <header className="rh-case-section-heading">
              <CheckCircle2 size={19} aria-hidden="true" />
              <div>
                <h2 id="rh-case-actions-heading">Ações de atendimento</h2>
                <p>Atualize o andamento e a responsabilidade.</p>
              </div>
            </header>
            <label className="rh-field">
              <span>Status do atendimento</span>
              <select
                value={caseItem.status}
                disabled={isUpdatingStatus}
                onChange={(event) => {
                  const status = CASE_STATUSES.find((candidate) => candidate === event.target.value);
                  if (status) void handleStatusChange(status);
                }}
              >
                {CASE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            {isUpdatingStatus && <span className="rh-inline-loading" role="status">Salvando status…</span>}
            <form className="rh-assignment-form" onSubmit={(event) => void handleAssignUser(event)}>
              <div className="rh-field">
                <span>Responsáveis atribuídos</span>
                <span className="rh-field__current">
                  <UserRound size={15} aria-hidden="true" />
                  {caseItem.assignedUserIds.length > 0
                    ? caseItem.assignedUserIds
                      .map((userId) => caseItem.assignedUsers?.find((user) => user.id === userId)?.name ?? userId)
                      .join(', ')
                    : 'Nenhum responsável atribuído'}
                </span>
              </div>
              <label className="rh-field" htmlFor="rh-assignee">
                <span>Buscar responsável de RH</span>
                <input
                  id="rh-assignee"
                  type="text"
                  value={assignedUser}
                  onChange={(event) => {
                    const value = event.target.value;
                    setAssignedUser(value);
                    setSelectedAssignee(null);
                    setAssigneeSuggestions([]);
                    setIsSearchingAssignees(value.trim().length >= 2);
                    setAssigneeSearchError(null);
                  }}
                  autoComplete="off"
                  placeholder="Digite o nome ou e-mail"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={assigneeSuggestions.length > 0}
                  aria-controls="rh-assignee-options"
                />
              </label>
              {isSearchingAssignees && <span className="rh-inline-loading" role="status">Pesquisando responsáveis…</span>}
              {assigneeSearchError && <span className="rh-inline-error" role="alert">{assigneeSearchError}</span>}
              {assigneeSuggestions.length > 0 && (
                <ul id="rh-assignee-options" className="rh-assignee-options" role="listbox" aria-label="Responsáveis encontrados">
                  {assigneeSuggestions.map((assignee) => (
                    <li key={assignee.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedAssignee?.id === assignee.id}
                        disabled={caseItem.assignedUserIds.includes(assignee.id)}
                        onClick={() => {
                          setSelectedAssignee(assignee);
                          setAssignedUser(assignee.name);
                          setAssigneeSuggestions([]);
                          setIsSearchingAssignees(false);
                        }}
                      >
                        <UserRound size={15} aria-hidden="true" />
                        <span>{assignee.name}</span>
                        {caseItem.assignedUserIds.includes(assignee.id) && <small>Já atribuído</small>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {assignedUser.trim().length >= 2 &&
                !selectedAssignee &&
                !isSearchingAssignees &&
                !assigneeSearchError &&
                assigneeSuggestions.length === 0 && (
                  <span className="rh-inline-loading" role="status">Nenhum responsável encontrado.</span>
                )}
              <button
                type="submit"
                className="rh-button rh-button--primary"
                disabled={isAssigning || !selectedAssignee || caseItem.assignedUserIds.includes(selectedAssignee.id)}
              >
                {isAssigning ? 'Atribuindo…' : 'Adicionar responsável'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
