import { describe, expect, it } from 'vitest';
import { parseClaimsAdminUserPage, parseClaimsAuditEntries } from './claims';

describe('claims administration parsers', () => {
  it('parses a paged list of persisted and effective claims', () => {
    expect(parseClaimsAdminUserPage({
      users: [{
        id: 'user-1',
        name: 'Pessoa Colaboradora',
        email: 'user@example.test',
        roles: ['COLLABORATOR'],
        permissions: [],
        effectivePermissions: [
          'messages.read',
          'messages.write',
          'claims.roles.manage',
          'claims.permissions.manage',
        ],
      }],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    })).toMatchObject({
      users: [{ id: 'user-1', roles: ['COLLABORATOR'], permissions: [] }],
      page: 1,
      totalCount: 1,
    });
  });

  it('rejects roles that are not on the server role allowlist', () => {
    expect(() => parseClaimsAdminUserPage({
      users: [{
        id: 'user-1',
        name: 'Pessoa',
        email: 'user@example.test',
        roles: ['SUPER_ADMIN'],
        permissions: [],
        effectivePermissions: [],
      }],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    })).toThrow('Resposta inválida na administração de permissões.');
  });

  it('parses audit records and rejects malformed entries', () => {
    expect(parseClaimsAuditEntries([{
      id: 'audit-1',
      actorUserId: 'admin-1',
      affectedUserId: 'user-1',
      operation: 'GRANT',
      assignmentType: 'role',
      assignmentValue: 'HR',
      occurredAt: '2026-10-14T12:00:00Z',
    }])).toHaveLength(1);

    expect(() => parseClaimsAuditEntries([{ operation: 'GRANT' }])).toThrow(
      'Registro inválido no histórico de auditoria.'
    );
  });
});

