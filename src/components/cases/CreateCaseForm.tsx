import type { FormEventHandler } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { isCaseCategoryId, type CaseCategoryId } from '../../types/case';

interface CreateCaseFormProps {
  title: string;
  description: string;
  categoryId: CaseCategoryId | '';

  attachments: File[];
  error: string | null;
  isLoading: boolean;
  turnstileToken: string;
  turnstileSiteKey?: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (categoryId: CaseCategoryId) => void;

  onAttachmentsChange: (attachments: File[]) => void;
  onTurnstileSuccess: (token: string) => void;
  onTurnstileExpire: () => void;
  onTurnstileError: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack?: () => void;
}

export const CreateCaseForm = ({
  title,
  description,
  categoryId,

  error,
  isLoading,
  turnstileToken,
  turnstileSiteKey,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,

  onAttachmentsChange,
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
        <label htmlFor="case-title">Assunto / Título</label>
        <input
          id="case-title"
          type="text"
          required
          maxLength={150}
          value={title}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
          className="create-case-control"
          placeholder="Ex: Conduta inadequada no setor financeiro..."
        />
      </div>

      <div className="create-case-field">
        <label htmlFor="case-description">Detalhes do Ocorrido</label>
        <textarea
          id="case-description"
          required
          minLength={10}
          rows={6}
          value={description}
          onChange={(event) => onDescriptionChange(event.currentTarget.value)}
          className="create-case-control create-case-textarea"
          placeholder="Descreva a situação com o máximo de detalhes possível (onde, quando, quem estava envolvido)..."
        />
      </div>

      <div className="create-case-field">
        <label htmlFor="case-attachments">Anexos / Evidências</label>
        <input
          id="case-attachments"
          type="file"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              onAttachmentsChange(Array.from(event.target.files));
            }
          }}
          className="create-case-control"
        />
      </div>

      <div className="create-case-turnstile">
        {turnstileSiteKey ? (
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={onTurnstileSuccess}
            onExpire={onTurnstileExpire}
            onError={onTurnstileError}
            options={{ language: 'pt-br', theme: 'dark' }}
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
