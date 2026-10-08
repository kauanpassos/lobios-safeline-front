import {
  ClipboardCheck,
  FileSearch,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Tags,
} from 'lucide-react';

const GUIDANCE_SECTIONS = [
  {
    title: 'Confidencialidade e acesso',
    description: 'Acesse somente os casos necessários à sua atuação. Preserve a identidade das pessoas envolvidas e não compartilhe relatos, anexos ou capturas fora dos canais autorizados.',
    icon: LockKeyhole,
  },
  {
    title: 'Triagem responsável',
    description: 'Leia o relato integralmente antes de agir. Diferencie fatos, interpretações e informações ainda não confirmadas; não antecipe conclusões nem prometa resultados.',
    icon: FileSearch,
  },
  {
    title: 'Classificação e atualização',
    description: 'Use categoria, prioridade e status para refletir o contexto e o andamento real. Revise essas informações quando surgirem novos elementos e registre apenas alterações necessárias.',
    icon: Tags,
  },
  {
    title: 'Comunicação com o colaborador',
    description: 'Conduza toda a comunicação pela área Mensagens, vinculada ao caso correto. Use linguagem respeitosa, objetiva e imparcial; solicite somente informações pertinentes.',
    icon: MessageSquareText,
  },
  {
    title: 'Informações sensíveis e evidências',
    description: 'Consulte anexos somente quando necessário. Evite copiar dados pessoais para comentários ou outros sistemas e siga os procedimentos internos de retenção e encaminhamento.',
    icon: ShieldCheck,
  },
  {
    title: 'Encerramento e acompanhamento',
    description: 'Atualize o status de acordo com a etapa efetivamente concluída. Antes de encerrar, confirme que as ações de atendimento foram registradas pelos meios previstos pela organização.',
    icon: ClipboardCheck,
  },
] as const;

export function RhGuidelinesPage() {
  return (
    <main className="rh-guidelines-page" aria-labelledby="rh-guidelines-title">
      <header className="rh-guidelines-heading">
        <span className="rh-guidelines-eyebrow">Referência operacional</span>
        <h1 id="rh-guidelines-title">Orientações para atuação do RH</h1>
        <p>
          Princípios para analisar, classificar e acompanhar denúncias com responsabilidade e confidencialidade.
        </p>
      </header>

      <div className="rh-guidelines-grid">
        {GUIDANCE_SECTIONS.map(({ title, description, icon: Icon }) => (
          <section className="rh-panel rh-guideline-card" key={title}>
            <span className="rh-guideline-card__icon" aria-hidden="true"><Icon size={21} /></span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </section>
        ))}
      </div>

      <aside className="rh-guidelines-reminder">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          O SafeLine apoia o registro e o acompanhamento operacional. A apuração deve seguir as políticas e os procedimentos internos da organização.
        </p>
      </aside>
    </main>
  );
}
