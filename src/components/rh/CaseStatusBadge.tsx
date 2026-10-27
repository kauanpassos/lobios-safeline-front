import type { CaseStatus } from '../../types/case';

const STATUS_MODIFIERS: Record<CaseStatus, string> = {
  Recebido: 'received',
  'Em análise': 'analysis',
  'Em investigação': 'investigation',
  'Aguardando informações': 'waiting',
  Resolvido: 'resolved',
  Encerrado: 'closed',
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const modifier = STATUS_MODIFIERS[status] || 'received';

  return (
    <span className={`rh-status-badge rh-status-badge--${modifier}`}>
      <span className="rh-status-badge__dot" aria-hidden="true" />
      {status}
    </span>
  );
}
