import { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatProtocolCode } from '../../utils/protocol';

interface CaseCreatedSuccessProps {
  protocol: string;
  onBack?: () => void;
  onReset: () => void;
}

export const CaseCreatedSuccess = ({ protocol, onBack, onReset }: CaseCreatedSuccessProps) => {
  const [copied, setCopied] = useState(false);
  const formattedProtocol = formatProtocolCode(protocol);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="glass-card fade-in create-case-success">
      <div className="create-case-success-icon">
        <CheckCircle2 size={52} />
      </div>
      <h2 className="create-case-success-title">Denúncia registrada com sucesso!</h2>
      <p className="create-case-success-description">
        Guarde seu código de protocolo com segurança. Ele é a sua chave exclusiva para acompanhar este relato confidencialmente.
      </p>

      <div className="create-case-protocol-card">
        <div className="create-case-protocol-header">
          <span className="create-case-protocol-eyebrow">Código Único de Protocolo</span>
        </div>
        <div className="create-case-protocol-row">
          <span className="create-case-protocol-code" aria-label={`Protocolo ${formattedProtocol}`}>
            {formattedProtocol}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            icon={copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            className="create-case-copy-btn"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </div>

      <div className="create-case-actions">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            icon={<ArrowLeft size={16} />}
            className="create-case-action-btn"
          >
            Minhas denúncias
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onReset}
          icon={<Plus size={16} />}
          className="create-case-action-btn"
        >
          Fazer nova denúncia
        </Button>
      </div>
    </div>
  );
};
