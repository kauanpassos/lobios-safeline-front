import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CaseCreatedSuccessProps {
  protocol: string;
  onBack?: () => void;
  onReset: () => void;
}

export const CaseCreatedSuccess = ({ protocol, onBack, onReset }: CaseCreatedSuccessProps) => (
  <div className="glass-card fade-in create-case-success">
    <div className="create-case-success-icon">
      <CheckCircle2 size={64} />
    </div>
    <h2 className="create-case-success-title">Denúncia registrada!</h2>
    <p className="create-case-success-description">
      Guarde seu protocolo com segurança. Ele é a única forma de acompanhar o andamento deste relato.
    </p>
    <div className="create-case-protocol">{protocol}</div>
    <div className="create-case-actions">
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          Voltar ao Início
        </Button>
      )}
      <Button variant="primary" onClick={onReset}>
        Fazer nova denúncia
      </Button>
    </div>
  </div>
);
