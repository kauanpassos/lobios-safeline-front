import React, { useEffect, useRef } from 'react';
import {
  BookOpenText,
  ClipboardList,
  EyeOff,
  FileText,
  MessageCircleWarning,
  ShieldCheck,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

gsap.registerPlugin(ScrollTrigger);

const TOUR_COMPLETED_KEY = 'safeline_tour_completed';

const TOUR_STEPS = [
  {
    element: '#tour-step-1',
    popover: {
      title: 'Orientações do SafeLine',
      description: 'Este espaço explica como registrar um relato e acompanhar o caso com segurança.',
    },
  },
  {
    element: '#tour-step-2',
    popover: {
      title: 'Acesso às informações',
      description: 'Quando você está autenticado, o caso é associado à sua conta para permitir o acompanhamento. O acesso é limitado pelas permissões do sistema.',
    },
  },
  {
    element: '#tour-step-3',
    popover: {
      title: 'O que relatar',
      description: 'Registre fatos relacionados ao trabalho, como assédio, fraude, discriminação ou conflitos de interesse.',
    },
  },
  {
    element: '#tour-step-4',
    popover: {
      title: 'Como descrever a situação',
      description: 'Conte o que aconteceu, quando e onde. Separe o que presenciou do que soube por outras pessoas.',
    },
  },
  {
    element: '#tour-step-5',
    popover: {
      title: 'Depois do envio',
      description: 'Guarde o protocolo apresentado ao concluir o relato. Ele ajuda a localizar o registro posteriormente.',
    },
  },
];

export const GuidelinesPage: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const scroller = containerRef.current?.closest('.dashboard-main');
    const cards = gsap.utils.toArray<HTMLElement>('.guideline-card');

    gsap.fromTo(
      cards,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          ...(scroller ? { scroller } : {}),
          start: 'top 90%',
          once: true,
        },
      }
    );
  }, { scope: containerRef });

  useEffect(() => {
    const role = localStorage.getItem('@SafeLine:role');
    if (!['User', 'Collaborator', 'COLLABORATOR'].includes(role ?? '')) {
      return;
    }

    if (localStorage.getItem(TOUR_COMPLETED_KEY) === 'true') {
      return;
    }

    let isUnmounting = false;
    let tourInstance: ReturnType<typeof driver> | null = null;
    const frameId = window.requestAnimationFrame(() => {
      if (isUnmounting) {
        return;
      }

      const steps = TOUR_STEPS.filter(({ element }) => document.querySelector(element));
      if (steps.length === 0) {
        return;
      }

      tourInstance = driver({
        steps,
        animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        allowClose: true,
        allowKeyboardControl: true,
        allowScroll: true,
        overlayClickBehavior: 'close',
        skipMissingElement: true,
        showProgress: true,
        progressText: '{{current}} de {{total}}',
        nextBtnText: 'Próximo',
        prevBtnText: 'Voltar',
        doneBtnText: 'Concluir',
        closeBtnLabel: 'Fechar tour',
        popoverClass: 'safeline-tour-popover',
        onDestroyed: () => {
          if (!isUnmounting) {
            localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
          }
        },
      });
      tourInstance.drive();
    });

    return () => {
      isUnmounting = true;
      window.cancelAnimationFrame(frameId);
      if (tourInstance?.isActive()) {
        tourInstance.destroy();
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="guidelines-page fade-in"
      aria-labelledby="guidelines-title"
    >
      <header id="tour-step-1" className="guidelines-heading">
        <div className="guidelines-heading-icon" aria-hidden="true">
          <BookOpenText size={26} />
        </div>
        <div>
          <h1 id="guidelines-title">Orientações para registrar um relato</h1>
          <p>
            Veja como descrever uma situação e acompanhar o registro pelo SafeLine.
          </p>
        </div>
      </header>

      <div
        className="guidelines-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <section id="tour-step-2" className="glass-card guideline-card">
          <div className="guideline-card-heading">
            <EyeOff size={22} aria-hidden="true" />
            <h2>Privacidade e acesso</h2>
          </div>
          <p>
            Ao enviar um relato autenticado, o registro fica associado à sua conta
            para que você possa acompanhá-lo. As informações são disponibilizadas
            conforme as permissões do sistema; evite incluir dados pessoais que
            não sejam necessários para entender o ocorrido.
          </p>
        </section>

        <section id="tour-step-3" className="glass-card guideline-card">
          <div className="guideline-card-heading">
            <MessageCircleWarning size={22} aria-hidden="true" />
            <h2>O que relatar</h2>
          </div>
          <ul>
            <li>Assédio, discriminação ou desrespeito no ambiente de trabalho.</li>
            <li>Fraude, desvio de recursos ou conflito de interesses.</li>
            <li>Outras condutas que possam contrariar políticas da organização.</li>
          </ul>
        </section>

        <section id="tour-step-4" className="glass-card guideline-card">
          <div className="guideline-card-heading">
            <FileText size={22} aria-hidden="true" />
            <h2>Como descrever</h2>
          </div>
          <ul>
            <li>Explique o que aconteceu com suas próprias palavras.</li>
            <li>Informe quando e onde ocorreu, mesmo que seja uma estimativa.</li>
            <li>Diferencie o que presenciou do que foi relatado por terceiros.</li>
            <li>Inclua evidências relevantes, se estiverem disponíveis.</li>
          </ul>
        </section>

        <section id="tour-step-5" className="glass-card guideline-card">
          <div className="guideline-card-heading">
            <ClipboardList size={22} aria-hidden="true" />
            <h2>Após o envio</h2>
          </div>
          <p>
            Guarde o protocolo exibido ao concluir o envio e consulte a área
            <strong> Minhas denúncias</strong> para acompanhar as atualizações
            disponíveis para sua conta.
          </p>
        </section>
      </div>

      <aside className="guidelines-note">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          Use o canal de boa-fé e relate informações verdadeiras. Não é necessário
          ter provas para registrar uma preocupação; descreva os fatos com clareza.
        </p>
      </aside>
    </section>
  );
};
