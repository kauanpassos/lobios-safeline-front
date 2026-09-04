import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { apiFetch } from '../../services/api';
import { parseCreateCaseResponse, type CreateCasePayload } from '../../types/case';

interface CreateCasePageProps {
  onBack?: () => void;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const CreateCasePage: React.FC<CreateCasePageProps> = ({ onBack }) => {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(''); 
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      setError('Por favor, valide o sistema anti-bot (Turnstile) antes de enviar.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/v1/cases', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          content,
          turnstileToken
        } satisfies CreateCasePayload),
      }, parseCreateCaseResponse);

      setProtocol(data.protocol);
      setContent('');
      setCategoryId('');
      setTurnstileToken(''); 
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao registrar o caso.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {protocol ? (
        <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <CheckCircle2 size={64} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', color: '#10B981' }}>
            Denúncia registrada!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
            Guarde seu protocolo com segurança. Ele é a única forma de acompanhar o andamento deste relato.
          </p>
          <div style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.5)', 
            padding: '24px', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-card-border)',
            marginBottom: '32px',
            fontSize: '2.5rem',
            letterSpacing: '4px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {protocol}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Voltar ao Início
              </Button>
            )}
            <Button variant="primary" onClick={() => setProtocol(null)}>
              Fazer nova denúncia
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-card fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {onBack && (
              <Button variant="outline" onClick={onBack} icon={<ArrowLeft size={16} />}>
                Voltar
              </Button>
            )}
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Criar nova denúncia</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '16px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="case-category" style={{ fontSize: '1rem', fontWeight: 600 }}>Categoria</label>
              <select 
                id="case-category"
                required 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', 
                  backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--bg-card-border)',
                  color: 'white', outline: 'none', fontSize: '1rem'
                }}
              >
                <option value="" disabled>Selecione o tipo de denúncia...</option>
                <option value="assédio">Assédio</option>
                <option value="fraude">Fraude</option>
                <option value="conduta">Desvio de Conduta</option>
                <option value="sugestao">Sugestão/Melhoria</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="case-content" style={{ fontSize: '1rem', fontWeight: 600 }}>Detalhes do Ocorrido</label>
              <textarea
                id="case-content"
                required
                minLength={10}
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', 
                  backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--bg-card-border)',
                  color: 'white', outline: 'none', resize: 'vertical', fontSize: '1rem'
                }}
                placeholder="Descreva a situação com o máximo de detalhes possível (onde, quando, quem estava envolvido)..."
              />
            </div>

            <div style={{ padding: '8px 0' }}>
              {TURNSTILE_SITE_KEY ? (
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => {
                    setTurnstileToken('');
                    setError('Não foi possível validar a segurança. Tente novamente.');
                  }}
                  options={{ language: 'pt-BR', theme: 'dark' }}
                />
              ) : (
                <span style={{ color: 'var(--color-warning)', fontSize: '0.9rem' }}>
                  A validação de segurança não está configurada neste ambiente.
                </span>
              )}
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading || !turnstileToken}
              style={{ marginTop: '8px', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              {isLoading ? 'Enviando de forma segura...' : 'Enviar denúncia anônima'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
