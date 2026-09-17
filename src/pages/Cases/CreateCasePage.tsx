import { CreateCaseForm } from '../../components/cases/CreateCaseForm';
import { CaseCreatedSuccess } from '../../components/cases/CaseCreatedSuccess';
import { useCreateCase } from '../../hooks/useCreateCase';

interface CreateCasePageProps {
  onBack?: () => void;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const CreateCasePage = ({ onBack }: CreateCasePageProps) => {
  const createCase = useCreateCase();

  return (
    <div className="create-case-page">
      {createCase.protocol ? (
        <CaseCreatedSuccess
          protocol={createCase.protocol}
          onBack={onBack}
          onReset={createCase.reset}
        />
      ) : (
        <CreateCaseForm
          title={createCase.title}
          description={createCase.description}
          categoryId={createCase.categoryId}
          priority={createCase.priority}
          attachments={createCase.attachments}
          error={createCase.error}
          isLoading={createCase.isLoading}
          turnstileToken={createCase.turnstileToken}
          turnstileSiteKey={TURNSTILE_SITE_KEY}
          onTitleChange={createCase.setTitle}
          onDescriptionChange={createCase.setDescription}
          onCategoryChange={createCase.setCategoryId}
          onPriorityChange={createCase.setPriority}
          onAttachmentsChange={createCase.setAttachments}
          onTurnstileSuccess={createCase.setTurnstileToken}
          onTurnstileExpire={() => createCase.setTurnstileToken('')}
          onTurnstileError={createCase.handleTurnstileError}
          onSubmit={createCase.handleSubmit}
          onBack={onBack}
        />
      )}
    </div>
  );
};
