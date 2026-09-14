import React from 'react';
import {
  ShieldCheck,
  EyeOff,
  Scale,
  MessageCircleWarning,
  FileText,
} from 'lucide-react';

export const GuidelinesPage: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 text-white fade-in min-h-[80vh]">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
          <ShieldCheck className="text-blue-500" size={32} />
          Orientações e Privacidade
        </h1>

        <p className="text-slate-400 max-w-3xl text-lg">
          O SafeLine é um canal seguro e confidencial destinado ao recebimento
          de relatos sobre condutas que possam violar princípios éticos,
          políticas internas ou a legislação vigente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Card 1 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <EyeOff size={24} />
            </div>

            <h2 className="text-xl font-bold">
              Confidencialidade e Proteção
            </h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            As informações fornecidas neste canal são tratadas de forma
            confidencial e acessadas somente por pessoas autorizadas, de
            acordo com suas responsabilidades no processo de apuração e com a
            legislação aplicável.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck size={24} />
            </div>

            <h2 className="text-xl font-bold">
              Relato Anônimo ou Confidencial
            </h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Dependendo das opções disponibilizadas pela organização, você
            poderá escolher como deseja realizar seu relato:
          </p>

          <ul className="text-slate-300 text-sm space-y-3">
            <li>
              <strong className="text-white">Confidencial:</strong> sua
              identidade poderá ser conhecida por pessoas autorizadas, mas
              deverá ser protegida durante o processo de apuração.
            </li>

            <li>
              <strong className="text-white">Anônimo:</strong> o relato é
              realizado sem a identificação do autor, conforme as regras e
              limitações informadas pelo canal.
            </li>
          </ul>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
              <MessageCircleWarning size={24} />
            </div>

            <h2 className="text-xl font-bold">
              O que devo relatar?
            </h2>
          </div>

          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li>Fraudes, furtos ou desvios de recursos.</li>
            <li>Assédio moral, sexual ou discriminação.</li>
            <li>Corrupção, conflitos de interesse ou favorecimento indevido.</li>
            <li>Violações de segurança e saúde no trabalho.</li>
            <li>Uso indevido de recursos ou informações da organização.</li>
            <li>Vazamento de informações confidenciais.</li>
            <li>Outras condutas antiéticas ou potencialmente ilegais.</li>
          </ul>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <FileText size={24} />
            </div>

            <h2 className="text-xl font-bold">
              Como fazer um bom relato?
            </h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Sempre que possível, apresente informações objetivas que possam
            contribuir para a análise do caso.
          </p>

          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li>Descreva o que aconteceu.</li>
            <li>Informe quando e onde ocorreu.</li>
            <li>Indique as pessoas envolvidas ou que possam contribuir.</li>
            <li>Apresente documentos ou evidências disponíveis.</li>
          </ul>
        </div>

        {/* Card 5 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <FileText size={24} />
            </div>

            <h2 className="text-xl font-bold">
              Acompanhamento
            </h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            Ao finalizar um relato, você receberá um{' '}
            <strong className="text-white">Protocolo Único</strong>. Guarde-o
            em segurança. Por meio dele, você poderá acompanhar atualizações
            do caso, responder a solicitações de informações e, quando
            disponível, comunicar-se com a equipe responsável pela apuração.
          </p>
        </div>

        {/* Card 6 */}
        <div className="glass-card p-6 border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
              <Scale size={24} />
            </div>

            <h2 className="text-xl font-bold">
              Proteção contra Retaliação
            </h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            Não serão toleradas ameaças, intimidações, perseguições ou outras
            formas de retaliação contra pessoas que realizem relatos de boa-fé
            ou colaborem com uma apuração. Eventuais situações de retaliação
            também podem ser comunicadas por este canal.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl text-center">
        <p className="text-slate-400 text-sm leading-relaxed">
          Este canal deve ser utilizado de forma responsável e de boa-fé.
          Relatos intencionalmente falsos, fraudulentos ou realizados com o
          objetivo de prejudicar terceiros poderão estar sujeitos às medidas
          previstas nas políticas internas da organização.
        </p>
      </div>
    </div>
  );
};
