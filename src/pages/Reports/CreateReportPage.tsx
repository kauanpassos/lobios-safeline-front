import React from 'react';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface CreateReportPageProps {
  onBack?: () => void;
}

export const CreateReportPage: React.FC<CreateReportPageProps> = ({ onBack }) => {
  return (
    <div className="glass-card fade-in" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        {onBack && (
          <Button variant="outline" onClick={onBack} icon={<ArrowLeft size={16} />}>
            Voltar
          </Button>
        )}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Criar Nova Manifestação</h2>
      </div>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Formulário de denúncia em construção...
      </p>
    </div>
  );
};
