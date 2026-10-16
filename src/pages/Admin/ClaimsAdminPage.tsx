import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, RefreshCw, Search, Shield, UserRound } from 'lucide-react';
import { ApiError, getApiErrorMessage } from '../../services/api';
import {
  fetchClaimsAdminUsers,
  fetchClaimsAudit,
  grantUserPermission,
  grantUserRole,
  revokeUserPermission,
  revokeUserRole,
} from '../../services/claimsService';
import type { ClaimsAdminUser, ClaimsAuditEntry } from '../../types/claims';
import type { ApplicationPermission } from '../../types/auth';
import type { UserRole } from '../../types/user';
import './ClaimsAdminPage.css';

const ALL_ROLES: readonly UserRole[] = ['COLLABORATOR', 'HR', 'HR_ADMIN', 'ADMIN'];
const DESIGNATED_ADMIN_EMAILS = new Set([
  'admin@lobios.com.br',
  'kauansilva16ksp@gmail.com',
]);
const ALL_PERMISSIONS: readonly ApplicationPermission[] = [
  'cases.read.all',
  'cases.status.manage',
  'cases.priority.manage',
  'cases.assign',
  'cases.delete',
  'messages.read',
  'messages.write',
  'attachments.read',
  'attachments.upload',
  'attachments.delete',
];
const HR_ADMIN_PERMISSIONS: readonly ApplicationPermission[] = [
  'messages.read',
  'messages.write',
  'attachments.read',
  'attachments.upload',
];
const HR_ADMIN_OPERATIONAL_PERMISSIONS: readonly ApplicationPermission[] = [
  'cases.read.all',
  'cases.status.manage',
  'cases.priority.manage',
  'cases.assign',
  ...HR_ADMIN_PERMISSIONS,
];
const HR_ADMIN_ROLES: readonly UserRole[] = ['COLLABORATOR', 'HR'];
const PERMISSION_LABELS: Record<ApplicationPermission, string> = {
  'cases.read.all': 'Ler todos os casos',
  'cases.status.manage': 'Alterar status de casos',
  'cases.priority.manage': 'Alterar prioridade de casos',
  'cases.assign': 'Atribuir casos',
  'cases.delete': 'Excluir casos',
  'messages.read': 'Ler mensagens',
  'messages.write': 'Enviar mensagens',
  'attachments.read': 'Ler anexos',
  'attachments.upload': 'Enviar anexos',
  'attachments.delete': 'Excluir anexos',
};
const ROLE_LABELS: Record<UserRole, string> = {
  COLLABORATOR: 'Colaborador',
  HR: 'RH',
  HR_ADMIN: 'Administrador de RH',
  ADMIN: 'Administrador',
};

function getActionError(error: unknown, fallback: string): string {
  if (error instanceof ApiError &&
      typeof error.details === 'object' &&
      error.details !== null &&
      'message' in error.details &&
      typeof error.details.message === 'string') {
    return error.details.message;
  }

  return getApiErrorMessage(error, fallback);
}

export function ClaimsAdminPage() {
  const operatorRole = localStorage.getItem('@SafeLine:role');
  const isAdmin = operatorRole === 'ADMIN';
  const rolesCanGrant = isAdmin ? ALL_ROLES : HR_ADMIN_ROLES;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<ClaimsAdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ClaimsAdminUser | null>(null);
  const [auditEntries, setAuditEntries] = useState<ClaimsAuditEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedPermission, setSelectedPermission] = useState<ApplicationPermission | ''>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const assignableRoles = useMemo(
    () => rolesCanGrant.filter((role) =>
      (role !== 'ADMIN' ||
        DESIGNATED_ADMIN_EMAILS.has(selectedUser?.email.toLowerCase() ?? '')) &&
      !selectedUser?.roles.includes(role)
    ),
    [rolesCanGrant, selectedUser]
  );
  const permissionsCanManage = isAdmin
    ? ALL_PERMISSIONS
    : selectedUser?.roles.includes('HR')
      ? HR_ADMIN_OPERATIONAL_PERMISSIONS
      : HR_ADMIN_PERMISSIONS;
  const assignablePermissions = useMemo(
    () => permissionsCanManage.filter((permission) => !selectedUser?.permissions.includes(permission)),
    [permissionsCanManage, selectedUser]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchClaimsAdminUsers(search, page, pageSize, controller.signal)
      .then((result) => {
        setUsers(result.users);
        setTotalCount(result.totalCount);
        setSelectedUser((currentUser) => {
          if (!currentUser) return currentUser;
          return result.users.find((user) => user.id === currentUser.id) ?? currentUser;
        });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getActionError(requestError, 'Não foi possível carregar os usuários.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingUsers(false);
      });

    return () => controller.abort();
  }, [search, page, refreshVersion]);

  const selectedUserId = selectedUser?.id;
  useEffect(() => {
    if (!selectedUserId) return;

    const controller = new AbortController();
    void fetchClaimsAudit(selectedUserId, controller.signal)
      .then(setAuditEntries)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getActionError(requestError, 'Não foi possível carregar a auditoria.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingAudit(false);
      });

    return () => controller.abort();
  }, [selectedUserId, refreshVersion]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setSelectedUser(null);
    setIsLoadingUsers(true);
    setError(null);
  };

  const applyUpdatedUser = (updatedUser: ClaimsAdminUser, description: string) => {
    setSelectedUser(updatedUser);
    setSelectedRole('');
    setSelectedPermission('');
    setUsers((currentUsers) => currentUsers.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    ));
    setFeedback(description);
    setError(null);
    setRefreshVersion((version) => version + 1);
  };

  const runChange = async (
    action: () => Promise<ClaimsAdminUser>,
    assignmentType: 'papel' | 'permissão',
    assignmentName: string,
    operation: 'conceder' | 'revogar'
  ) => {
    if (!selectedUser || isSaving) return;
    const confirmed = window.confirm(
      `Confirmar ${operation} a ${assignmentType} "${assignmentName}" para ${selectedUser.name} (${selectedUser.email})?`
    );
    if (!confirmed) return;

    setIsSaving(true);
    setError(null);
    setFeedback(null);
    setIsLoadingAudit(true);
    setIsLoadingUsers(true);
    try {
      const updatedUser = await action();
      applyUpdatedUser(
        updatedUser,
        `${assignmentType === 'papel' ? 'Papel' : 'Permissão'} "${assignmentName}" ${operation === 'conceder' ? 'concedido' : 'revogado'} para ${selectedUser.name}. A sessão afetada precisará autenticar-se novamente.`
      );
    } catch (requestError: unknown) {
      setError(getActionError(requestError, `Não foi possível ${operation} a ${assignmentType}.`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="claims-admin" aria-labelledby="claims-admin-title">
      <header className="claims-admin__header">
        <div>
          <p className="claims-admin__eyebrow"><Shield size={15} aria-hidden="true" /> Administração segura</p>
          <h1 id="claims-admin-title">Gerenciamento de acessos</h1>
          <p>Pesquise usuários e administre papéis e permissões persistidos.</p>
        </div>
        <button
          className="claims-admin__button claims-admin__button--secondary"
          type="button"
          onClick={() => {
            setIsLoadingUsers(true);
            setIsLoadingAudit(Boolean(selectedUser));
            setError(null);
            setRefreshVersion((version) => version + 1);
          }}
          disabled={isLoadingUsers || isSaving}
        >
          <RefreshCw size={16} aria-hidden="true" /> Atualizar
        </button>
      </header>

      {error && <p className="claims-admin__notice claims-admin__notice--error" role="alert"><AlertCircle size={18} />{error}</p>}
      {feedback && <p className="claims-admin__notice claims-admin__notice--success" role="status"><CheckCircle2 size={18} />{feedback}</p>}

      <div className="claims-admin__layout">
        <section className="claims-admin__panel" aria-labelledby="claims-users-title">
          <header className="claims-admin__panel-heading">
            <div>
              <h2 id="claims-users-title">Usuários</h2>
              <p>{totalCount} resultado(s)</p>
            </div>
          </header>
          <form className="claims-admin__search" onSubmit={handleSearch}>
            <label className="claims-admin__visually-hidden" htmlFor="claims-user-search">Pesquisar por nome ou e-mail</label>
            <input
              id="claims-user-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nome ou e-mail"
              maxLength={100}
            />
            <button className="claims-admin__button" type="submit" aria-label="Pesquisar usuários">
              <Search size={17} aria-hidden="true" /> Pesquisar
            </button>
          </form>

          {isLoadingUsers ? (
            <p className="claims-admin__state" role="status"><RefreshCw size={18} className="claims-admin__spin" />Carregando usuários…</p>
          ) : users.length === 0 ? (
            <p className="claims-admin__state"><UserRound size={20} />Nenhum usuário encontrado.</p>
          ) : (
            <ul className="claims-admin__users">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    className={`claims-admin__user${selectedUser?.id === user.id ? ' is-selected' : ''}`}
                    type="button"
                    aria-pressed={selectedUser?.id === user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedRole('');
                      setSelectedPermission('');
                      setIsLoadingAudit(true);
                      setError(null);
                      setFeedback(null);
                    }}
                  >
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <small>{user.roles.map((role) => ROLE_LABELS[role]).join(' · ')}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className="claims-admin__pagination">
            <button
              className="claims-admin__button claims-admin__button--secondary"
              type="button"
              disabled={page <= 1 || isLoadingUsers}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Anterior
            </button>
            <span>Página {page} de {pageCount}</span>
            <button
              className="claims-admin__button claims-admin__button--secondary"
              type="button"
              disabled={page >= pageCount || isLoadingUsers}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Próxima
            </button>
          </footer>
        </section>

        <section className="claims-admin__panel claims-admin__details" aria-labelledby="claims-details-title">
          {!selectedUser ? (
            <div className="claims-admin__state claims-admin__state--empty">
              <KeyRound size={28} />
              <h2 id="claims-details-title">Selecione um usuário</h2>
              <p>As permissões atuais, operações disponíveis e o histórico de auditoria serão exibidos aqui.</p>
            </div>
          ) : (
            <>
              <header className="claims-admin__panel-heading">
                <div>
                  <p className="claims-admin__eyebrow">Usuário selecionado</p>
                  <h2 id="claims-details-title">{selectedUser.name}</h2>
                  <p>{selectedUser.email} · ID {selectedUser.id}</p>
                </div>
              </header>

              <div className="claims-admin__section">
                <h3>Papéis atribuídos</h3>
                <p className="claims-admin__muted">
                  O papel ADMIN é restrito às contas: {[...DESIGNATED_ADMIN_EMAILS].join(', ')}.
                </p>
                <ul className="claims-admin__assignments">
                  {selectedUser.roles.map((role) => (
                    <li key={role}>
                      <span><strong>{ROLE_LABELS[role]}</strong><small>{role}</small></span>
                      <button
                        className="claims-admin__button claims-admin__button--danger"
                        type="button"
                        disabled={isSaving || selectedUser.roles.length === 1 || !rolesCanGrant.includes(role)}
                        onClick={() => void runChange(
                          () => revokeUserRole(selectedUser.id, role),
                          'papel', ROLE_LABELS[role], 'revogar'
                        )}
                      >
                        Revogar
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="claims-admin__grant">
                  <label htmlFor="claims-role-select">Papel permitido</label>
                  <select
                    id="claims-role-select"
                    value={selectedRole}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedRole(assignableRoles.find((role) => role === value) ?? '');
                    }}
                  >
                    <option value="">Selecione um papel</option>
                    {assignableRoles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                  </select>
                  <button
                    className="claims-admin__button"
                    type="button"
                    disabled={!selectedRole || isSaving}
                    onClick={() => {
                      if (selectedRole) {
                        void runChange(
                          () => grantUserRole(selectedUser.id, selectedRole),
                          'papel', ROLE_LABELS[selectedRole], 'conceder'
                        );
                      }
                    }}
                  >
                    Conceder papel
                  </button>
                </div>
              </div>

              <div className="claims-admin__section">
                <h3>Permissões explicitamente atribuídas</h3>
                {selectedUser.permissions.length === 0 ? (
                  <p className="claims-admin__muted">Nenhuma permissão adicional atribuída.</p>
                ) : (
                  <ul className="claims-admin__assignments">
                    {selectedUser.permissions.map((permission) => (
                      <li key={permission}>
                        <span><strong>{PERMISSION_LABELS[permission]}</strong><small>{permission}</small></span>
                        <button
                          className="claims-admin__button claims-admin__button--danger"
                          type="button"
                          disabled={isSaving || !permissionsCanManage.includes(permission)}
                          onClick={() => void runChange(
                            () => revokeUserPermission(selectedUser.id, permission),
                            'permissão', PERMISSION_LABELS[permission], 'revogar'
                          )}
                        >
                          Revogar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="claims-admin__grant">
                  <label htmlFor="claims-permission-select">Permissão permitida</label>
                  <select
                    id="claims-permission-select"
                    value={selectedPermission}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedPermission(assignablePermissions.find((permission) => permission === value) ?? '');
                    }}
                  >
                    <option value="">Selecione uma permissão</option>
                    {assignablePermissions.map((permission) => (
                      <option key={permission} value={permission}>{PERMISSION_LABELS[permission]}</option>
                    ))}
                  </select>
                  <button
                    className="claims-admin__button"
                    type="button"
                    disabled={!selectedPermission || isSaving}
                    onClick={() => {
                      if (selectedPermission) {
                        void runChange(
                          () => grantUserPermission(selectedUser.id, selectedPermission),
                          'permissão', PERMISSION_LABELS[selectedPermission], 'conceder'
                        );
                      }
                    }}
                  >
                    Conceder permissão
                  </button>
                </div>
              </div>

              <div className="claims-admin__section">
                <h3>Permissões efetivas por papel e atribuição</h3>
                <ul className="claims-admin__effective">
                  {selectedUser.effectivePermissions.map((permission) => (
                    <li key={permission}>{PERMISSION_LABELS[permission]}</li>
                  ))}
                </ul>
              </div>

              <div className="claims-admin__section">
                <h3>Histórico de auditoria</h3>
                {isLoadingAudit ? (
                  <p className="claims-admin__state" role="status"><RefreshCw size={17} className="claims-admin__spin" />Carregando auditoria…</p>
                ) : auditEntries.length === 0 ? (
                  <p className="claims-admin__muted">Nenhuma alteração registrada para este usuário.</p>
                ) : (
                  <ol className="claims-admin__audit">
                    {auditEntries.map((entry) => (
                      <li key={entry.id}>
                        <strong>{entry.operation === 'GRANT' ? 'Concedido' : 'Revogado'}: {entry.assignmentValue}</strong>
                        <span>Tipo: {entry.assignmentType} · Operador: {entry.actorUserId}</span>
                        <time dateTime={entry.occurredAt}>{new Date(entry.occurredAt).toLocaleString('pt-BR')}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
