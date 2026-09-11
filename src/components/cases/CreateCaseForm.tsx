import type { FormEventHandler } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { isCaseCategoryId, type CaseCategoryId } from '../../types/case';

interface CreateCaseFormProps {
  content: string;
  categoryId: CaseCategoryId | '';
  error: string | null;
  isLoading: boolean;
  turnstileToken: string;
  turnstileSiteKey?: string;
  onContentChange: (content: string) => void;
  onCategoryChange: (categoryId: CaseCategoryId) => void;
  onTurnstileSuccess: (token: string) => void;
  onTurnstileExpire: () => void;
  onTurnstileError: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack?: () => void;
}

export const CreateCaseForm = ({
  content,
  categoryId,
  error,
  isLoading,
  turnstileToken,
  turnstileSiteKey,
  onContentChange,
  onCategoryChange,
  onTurnstileSuccess,
  onTurnstileExpire,
  onTurnstileError,
  onSubmit,
  onBack,
}: CreateCaseFormProps) => (
  <div className="glass-card fade-in create-case-form-card">
    <div className="create-case-heading">
      {onBack && (
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft size={16} />}>
          Voltar
        </Button>
      )}
      <h2>Criar nova denúncia</h2>
    </div>

    <form onSubmit={onSubmit} className="create-case-form">
      {error && <div className="create-case-error" role="alert">{error}</div>}

      <div className="create-case-field">
        <label htmlFor="case-category">Categoria</label>
        <select
          id="case-category"
          required
          value={categoryId}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (isCaseCategoryId(value)) {
              onCategoryChange(value);
            }
          }}
          className="create-case-control"
        >
          <option value="" disabled>Selecione o tipo de denúncia...</option>
          <option value="assédio">Assédio</option>
          <option value="fraude">Fraude</option>
          <option value="conduta">Desvio de Conduta</option>
          <option value="sugestao">Sugestão/Melhoria</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div className="create-case-field">
        <label htmlFor="case-content">Detalhes do Ocorrido</label>
        <textarea
          id="case-content"
          required
          minLength={10}
          rows={8}
          value={content}
          onChange={(event) => onContentChange(event.currentTarget.value)}
          className="create-case-control create-case-textarea"
          placeholder="Descreva a situação com o máximo de detalhes possível (onde, quando, quem estava envolvido)..."
        />
      </div>

      <div className="create-case-turnstile">
        {turnstileSiteKey ? (
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={onTurnstileSuccess}
            onExpire={onTurnstileExpire}
            onError={onTurnstileError}
            options={{ language: 'pt-BR', theme: 'dark' }}
          />
        ) : (
          <span className="create-case-warning">
            A validação de segurança não está configurada neste ambiente.
          </span>
        )}
      </div>

      <Button
        variant="primary"
        type="submit"
        disabled={isLoading || !turnstileToken}
        className="create-case-submit"
      >
        {isLoading ? 'Enviando de forma segura...' : 'Enviar denúncia'}
      </Button>
    </form>
  </div>
);
