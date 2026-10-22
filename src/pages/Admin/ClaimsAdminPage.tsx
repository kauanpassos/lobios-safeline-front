import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Check, CheckCircle2, KeyRound, RefreshCw, Search, Shield, UserRound } from 'lucide-react';
import { ApiError, getApiErrorMessage } from '../../services/api';
import {
  fetchClaimsAdminUsers,
  fetchClaimsAudit,
  grantUserPermission,
  grantUserRole,
  revokeUserPermission,
} from '../../services/claimsService';
import type { ClaimsAdminUser, ClaimsAuditEntry } from '../../types/claims';
import type { ApplicationPermission } from '../../types/auth';
import type { UserRole } from '../../types/user';
import { SelectableChips, type SelectableChipOption } from '../../components/ui/SelectableChips';
import './ClaimsAdminPage.css';

const ALL_ROLES: readonly UserRole[] = ['COLLABORATOR', 'HR', 'HR_MANAGER', 'ADMIN'];
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
  'claims.roles.manage',
  'claims.permissions.manage',
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
const HR_MANAGER_ROLES: readonly UserRole[] = ['COLLABORATOR', 'HR'];
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
  'claims.roles.manage': 'Gerenciar papéis de usuários',
  'claims.permissions.manage': 'Gerenciar permissões de usuários',
};

// Mirrors backend CanAssignPermissionToTarget: determines which explicit permissions
// are valid for a given target role. ManageUserRoles and ManageUserPermissions are never
// explicitly assignable. DeleteCases and DeleteAttachments require ADMIN. Case management
// permissions (ReadAllCases, ManageCaseStatus, ManageCasePriority, AssignCases) require
// HR, HR_ADMIN, HR_MANAGER, or ADMIN.
const HR_PLUS_ROLES: ReadonlySet<UserRole> = new Set<UserRole>(['HR', 'HR_ADMIN', 'HR_MANAGER', 'ADMIN']);
const ADMIN_ONLY_ROLES: ReadonlySet<UserRole> = new Set<UserRole>(['ADMIN']);
const CASE_MANAGEMENT_PERMISSIONS: ReadonlySet<ApplicationPermission> = new Set<ApplicationPermission>([
  'cases.read.all',
  'cases.status.manage',
  'cases.priority.manage',
  'cases.assign',
]);
const ADMIN_ONLY_PERMISSIONS: ReadonlySet<ApplicationPermission> = new Set<ApplicationPermission>([
  'cases.delete',
  'attachments.delete',
]);
const NEVER_ASSIGNABLE_PERMISSIONS: ReadonlySet<ApplicationPermission> = new Set<ApplicationPermission>([
  'claims.roles.manage',
  'claims.permissions.manage',
]);

function isPermissionCompatibleWithRole(
  permission: ApplicationPermission,
  targetRole: UserRole
): boolean {
  if (NEVER_ASSIGNABLE_PERMISSIONS.has(permission)) return false;
  if (ADMIN_ONLY_PERMISSIONS.has(permission)) return ADMIN_ONLY_ROLES.has(targetRole);
  if (CASE_MANAGEMENT_PERMISSIONS.has(permission)) return HR_PLUS_ROLES.has(targetRole);
  return true;
}

function getIncompatibilityReason(
  permission: ApplicationPermission,
  targetRole: UserRole
): string | null {
  if (NEVER_ASSIGNABLE_PERMISSIONS.has(permission)) {
    return 'Permissão atribuída automaticamente pelo cargo — não pode ser concedida manualmente.';
  }
  if (ADMIN_ONLY_PERMISSIONS.has(permission) && !ADMIN_ONLY_ROLES.has(targetRole)) {
    return `Permissão restrita ao cargo Administrador. Incompatível com ${ROLE_LABELS[targetRole]}.`;
  }
  if (CASE_MANAGEMENT_PERMISSIONS.has(permission) && !HR_PLUS_ROLES.has(targetRole)) {
    return `Permissão de gestão de casos requer cargo de RH ou superior. Incompatível com ${ROLE_LABELS[targetRole]}.`;
  }
  return null;
}

// Maps each role to its default effective permissions, mirroring backend GetEffectivePermissions.
// COLLABORATOR: basic messaging and attachments.
// HR: operational case management + messaging (no claims management).
// HR_MANAGER: same as HR + claims roles/permissions management.
// ADMIN: all permissions.
const ROLE_DEFAULT_PERMISSIONS: Readonly<Record<UserRole, readonly ApplicationPermission[]>> = {
  COLLABORATOR: [
    'messages.read',
    'messages.write',
    'attachments.read',
    'attachments.upload',
  ],
  HR: [
    'cases.read.all',
    'cases.status.manage',
    'cases.priority.manage',
    'messages.read',
    'messages.write',
    'attachments.read',
    'attachments.upload',
  ],
  // Legacy alias — same permissions as HR_MANAGER
  HR_ADMIN: [
    'cases.read.all',
    'cases.status.manage',
    'cases.priority.manage',
    'cases.assign',
    'messages.read',
    'messages.write',
    'attachments.read',
    'attachments.upload',
    'claims.roles.manage',
    'claims.permissions.manage',
  ],
  HR_MANAGER: [
    'cases.read.all',
    'cases.status.manage',
    'cases.priority.manage',
    'cases.assign',
    'messages.read',
    'messages.write',
    'attachments.read',
    'attachments.upload',
    'claims.roles.manage',
    'claims.permissions.manage',
  ],
  ADMIN: [
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
    'claims.roles.manage',
    'claims.permissions.manage',
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  COLLABORATOR: 'Colaborador',
  HR: 'RH',
  HR_ADMIN: 'Gerente de RH',
  HR_MANAGER: 'Gerente de RH',
  ADMIN: 'Administrador',
};

function getActionError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Acesso negado. Verifique seu papel, as permissões do token e as restrições aplicáveis ao usuário selecionado.';
  }

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
  const rolesCanGrant = isAdmin ? ALL_ROLES : HR_MANAGER_ROLES;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<ClaimsAdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ClaimsAdminUser | null>(null);
  const [auditEntries, setAuditEntries] = useState<ClaimsAuditEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Single role per user draft state
  const currentRole: UserRole = selectedUser?.roles[0] || 'COLLABORATOR';
  const [roleDraft, setRoleDraft] = useState<UserRole>('COLLABORATOR');

  useEffect(() => {
    if (selectedUser) {
      setRoleDraft(selectedUser.roles[0] || 'COLLABORATOR');
    }
  }, [selectedUser]);

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  // Role-implied permissions based on the current draft role (preview)
  const roleImpliedPermissions = useMemo(
    () => new Set<ApplicationPermission>(ROLE_DEFAULT_PERMISSIONS[roleDraft]),
    [roleDraft]
  );

  // Combined permission display: role-implied ∪ compatible explicitly assigned.
  // When the draft role changes, explicit permissions that are incompatible with the
  // new role are automatically excluded, mirroring backend CanAssignPermissionToTarget.
  const effectivePermissionsDisplay: readonly ApplicationPermission[] = useMemo(() => {
    const combined = new Set<ApplicationPermission>(ROLE_DEFAULT_PERMISSIONS[roleDraft]);
    for (const p of selectedUser?.permissions ?? []) {
      if (isPermissionCompatibleWithRole(p, roleDraft)) {
        combined.add(p);
      }
    }
    return [...combined];
  }, [roleDraft, selectedUser?.permissions]);

  const permissionsCanManage = isAdmin
    ? ALL_PERMISSIONS
    : (roleDraft === 'HR' || roleDraft === 'HR_ADMIN' || roleDraft === 'HR_MANAGER')
      ? HR_ADMIN_OPERATIONAL_PERMISSIONS
      : HR_ADMIN_PERMISSIONS;

  const roleChipOptions: SelectableChipOption<UserRole>[] = useMemo(() => {
    const userEmail = selectedUser?.email.toLowerCase() ?? '';
    const isDesignatedAdmin = DESIGNATED_ADMIN_EMAILS.has(userEmail);

    const roleDescriptions: Record<UserRole, string> = {
      COLLABORATOR: 'Acesso padrão para envio e acompanhamento de relatos',
      HR: 'Gestão e acompanhamento operacional de casos do RH',
      HR_ADMIN: 'Administração de casos e atribuição de cargos de RH',
      HR_MANAGER: 'Administração de casos e atribuição de cargos de RH',
      ADMIN: 'Acesso irrestrito às configurações e segurança',
    };

    return ALL_ROLES.map((role) => {
      const canOperatorManage = rolesCanGrant.includes(role);
      const isDesignatedOnly = role === 'ADMIN' && !isDesignatedAdmin;

      let disabled = false;
      let disabledReason: string | undefined;

      if (!canOperatorManage) {
        disabled = true;
        disabledReason = 'Seu papel operacional não tem permissão para atribuir este cargo.';
      } else if (isDesignatedOnly) {
        disabled = true;
        disabledReason = 'O cargo de Administrador é restrito aos e-mails institucionais autorizados.';
      }

      return {
        value: role,
        label: ROLE_LABELS[role],
        description: roleDescriptions[role],
        disabled,
        disabledReason,
      };
    });
  }, [rolesCanGrant, selectedUser]);

  const permissionChipOptions: SelectableChipOption<ApplicationPermission>[] = useMemo(() => {
    return ALL_PERMISSIONS.map((permission) => {
      const isRoleImplied = roleImpliedPermissions.has(permission);
      const isAllowedToManage = permissionsCanManage.includes(permission);
      const incompatibilityReason = getIncompatibilityReason(permission, roleDraft);

      let disabled = false;
      let disabledReason: string | undefined;

      if (isRoleImplied) {
        disabled = true;
        disabledReason = `Permissão concedida automaticamente pelo cargo ${ROLE_LABELS[roleDraft]}.`;
      } else if (incompatibilityReason) {
        disabled = true;
        disabledReason = incompatibilityReason;
      } else if (!isAllowedToManage) {
        disabled = true;
        disabledReason = 'Operador não possui autorização para conceder esta permissão.';
      }

      return {
        value: permission,
        label: PERMISSION_LABELS[permission],
        description: permission,
        disabled,
        disabledReason,
      };
    });
  }, [permissionsCanManage, roleImpliedPermissions, roleDraft]);

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
    setRoleDraft(updatedUser.roles[0] || 'COLLABORATOR');
    setUsers((currentUsers) => currentUsers.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    ));
    setFeedback(description);
    setError(null);
    setRefreshVersion((version) => version + 1);
  };

  // 1. Role selection: changes selection temporarily without triggering API or console logs
  const handleRoleSelect = (selectedRoles: UserRole[]) => {
    if (selectedRoles.length > 0) {
      setRoleDraft(selectedRoles[0]);
    }
  };

  // 2. Explicit confirmation flow before saving role
  const handleConfirmRoleChange = async () => {
    if (!selectedUser || isSaving || roleDraft === currentRole) return;

    // Log explicit message to console only on confirmation
    console.log("Tem certeza de que deseja alterar o cargo deste usuário?");

    // Explicit confirmation modal/dialog
    const confirmed = window.confirm("Tem certeza de que deseja alterar o cargo deste usuário?");
    if (!confirmed) return;

    setIsSaving(true);
    setError(null);
    setFeedback(null);
    setIsLoadingAudit(true);
    setIsLoadingUsers(true);
    try {
      const updatedUser = await grantUserRole(selectedUser.id, roleDraft);
      applyUpdatedUser(
        updatedUser,
        `Cargo alterado com sucesso para ${ROLE_LABELS[roleDraft]}.`
      );
      // Log completion message
      console.log("Alteração Concluida");
    } catch (requestError: unknown) {
      setError(getActionError(requestError, 'Não foi possível alterar o cargo do usuário.'));
      setIsLoadingUsers(true);
      setIsLoadingAudit(Boolean(selectedUser));
      setRefreshVersion((version) => version + 1);
    } finally {
      setIsSaving(false);
    }
  };

  // Permission toggle handler
  const handlePermissionToggle = async (
    permission: ApplicationPermission,
    nextSelected: boolean
  ) => {
    if (!selectedUser || isSaving || roleDraft !== currentRole) return;

    const operation = nextSelected ? 'conceder' : 'revogar';
    const confirmed = window.confirm(
      `Confirmar ${operation} a permissão "${PERMISSION_LABELS[permission]}" para ${selectedUser.name}?`
    );
    if (!confirmed) return;

    setPendingPermission(permission);
    setIsSaving(true);
    setError(null);
    setFeedback(null);
    setIsLoadingAudit(true);
    setIsLoadingUsers(true);
    try {
      const action = nextSelected
        ? () => grantUserPermission(selectedUser.id, permission)
        : () => revokeUserPermission(selectedUser.id, permission);
      const updatedUser = await action();
      applyUpdatedUser(
        updatedUser,
        `Permissão "${PERMISSION_LABELS[permission]}" ${operation === 'conceder' ? 'concedida' : 'revogada'} para ${selectedUser.name}.`
      );
    } catch (requestError: unknown) {
      setError(getActionError(requestError, `Não foi possível ${operation} a permissão.`));
      setIsLoadingUsers(true);
      setIsLoadingAudit(Boolean(selectedUser));
      setRefreshVersion((version) => version + 1);
    } finally {
      setPendingPermission(null);
      setIsSaving(false);
    }
  };

  return (
    <section className="claims-admin" aria-labelledby="claims-admin-title">
      <header className="claims-admin__header">
        <div>
          <p className="claims-admin__eyebrow"><Shield size={15} aria-hidden="true" /> Gestão de acessos</p>
          <h1 id="claims-admin-title">Gerenciamento de usuários e cargos</h1>
          <p>Pesquise colaboradores e gerencie cargos e permissões de acesso da organização.</p>
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
                      setIsLoadingAudit(true);
                      setError(null);
                      setFeedback(null);
                    }}
                  >
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <small>{ROLE_LABELS[user.roles[0] || 'COLLABORATOR']}</small>
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
              <p>Os dados de acesso, cargo atribuído e histórico de alterações serão exibidos aqui.</p>
            </div>
          ) : (
            <>
              <header className="claims-admin__panel-heading">
                <div>
                  <p className="claims-admin__eyebrow">Colaborador selecionado</p>
                  <h2 id="claims-details-title">{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                </div>
              </header>

              <div className="claims-admin__section">
                <SelectableChips<UserRole>
                  label="Cargo"
                  helperText="Selecione o cargo exclusivo do usuário. A troca de cargo substitui a atribuição anterior."
                  options={roleChipOptions}
                  value={[roleDraft]}
                  onChange={handleRoleSelect}
                  multiple={false}
                  min={1}
                  showCounter={false}
                  disabled={isSaving}
                />

                <div className="claims-admin__save-action">
                  {roleDraft !== currentRole ? (
                    <div className="claims-admin__draft-alert" role="status">
                      <div className="claims-admin__draft-info">
                        <AlertCircle size={18} className="claims-admin__draft-icon" aria-hidden="true" />
                        <div>
                          <p className="claims-admin__draft-title">Alteração de cargo pendente</p>
                          <p className="claims-admin__draft-desc">
                            De <strong>{ROLE_LABELS[currentRole]}</strong> para <strong>{ROLE_LABELS[roleDraft]}</strong>.
                          </p>
                        </div>
                      </div>
                      <div className="claims-admin__draft-buttons">
                        <button
                          type="button"
                          className="claims-admin__button claims-admin__button--secondary"
                          onClick={() => setRoleDraft(currentRole)}
                          disabled={isSaving}
                        >
                          Descartar
                        </button>
                        <button
                          type="button"
                          className="claims-admin__button"
                          onClick={handleConfirmRoleChange}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <RefreshCw size={15} className="claims-admin__spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          <span>Confirmar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="claims-admin__muted">
                      Cargo atual ativo: <strong>{ROLE_LABELS[currentRole]}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="claims-admin__section">
                <SelectableChips<ApplicationPermission>
                  label="Permissões de acesso adicionais"
                  helperText={
                    roleDraft !== currentRole
                      ? 'Existe uma alteração de cargo pendente. Confirme ou descarte a alteração antes de modificar as permissões adicionais.'
                      : 'Permissões operacionais concedidas de forma complementar ao cargo.'
                  }
                  options={permissionChipOptions}
                  value={effectivePermissionsDisplay as ApplicationPermission[]}
                  onToggle={handlePermissionToggle}
                  pendingValues={pendingPermission ? [pendingPermission as ApplicationPermission] : []}
                  disabled={isSaving || roleDraft !== currentRole}
                  searchable={true}
                  searchPlaceholder="Buscar permissão..."
                  emptySearchMessage="Nenhuma permissão encontrada com o termo pesquisado."
                />
              </div>

              <div className="claims-admin__section">
                <h3>Histórico de alterações</h3>
                {isLoadingAudit ? (
                  <p className="claims-admin__state" role="status"><RefreshCw size={17} className="claims-admin__spin" />Carregando histórico…</p>
                ) : auditEntries.length === 0 ? (
                  <p className="claims-admin__muted">Nenhuma alteração registrada para este colaborador.</p>
                ) : (
                  <ol className="claims-admin__audit">
                    {auditEntries.map((entry) => (
                      <li key={entry.id}>
                        <strong>
                          {entry.operation === 'REVOKE' ? 'Revogado' : 'Atribuído'}:{' '}
                          {entry.assignmentType === 'role'
                            ? ROLE_LABELS[entry.assignmentValue as UserRole] || entry.assignmentValue
                            : PERMISSION_LABELS[entry.assignmentValue as ApplicationPermission] || entry.assignmentValue}
                        </strong>
                        <span>Operação: {entry.assignmentType === 'role' ? 'Cargo' : 'Permissão'}</span>
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
