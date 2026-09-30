import { useState } from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface CaseCreatedSuccessProps {
  protocol: string;
  onBack?: () => void;
  onReset: () => void;
}

export const CaseCreatedSuccess = ({ protocol, onBack, onReset }: CaseCreatedSuccessProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(protocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="glass-card fade-in create-case-success">
      <div className="create-case-success-icon">
        <CheckCircle2 size={64} />
      </div>
      <h2 className="create-case-success-title">Denúncia registrada com sucesso!</h2>
      <p className="create-case-success-description">
        Guarde o protocolo abaixo com segurança. Ele é a única chave para acompanhar este relato futuramente.
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
        <div className="create-case-protocol" style={{ margin: 0 }}>{protocol}</div>
        <Button variant="outline" onClick={handleCopy} icon={copied ? <Check size={18} color="#10B981" /> : <Copy size={18} />}>
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>

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
};
