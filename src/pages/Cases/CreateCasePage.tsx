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
          content={createCase.content}
          categoryId={createCase.categoryId}
          error={createCase.error}
          isLoading={createCase.isLoading}
          turnstileToken={createCase.turnstileToken}
          turnstileSiteKey={TURNSTILE_SITE_KEY}
          onContentChange={createCase.setContent}
          onCategoryChange={createCase.setCategoryId}
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
