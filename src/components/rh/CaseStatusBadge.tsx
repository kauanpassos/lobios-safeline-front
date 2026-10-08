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
  return (
    <span className={`rh-status-badge rh-status-badge--${STATUS_MODIFIERS[status]}`}>
      {status}
    </span>
  );
}
