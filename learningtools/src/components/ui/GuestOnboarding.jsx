import React, { useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  CheckCircle,
  Volume2,
  Mic,
  ArrowRight
} from 'lucide-react';
import categoriesImage from '../../assets/categories.png';

const TOTAL_STEPS = 3;

const iconMap = {
  sparkles: Sparkles,
  book: BookOpen,
  users: Users,
  check: CheckCircle,
  volume: Volume2,
  mic: Mic
};

const getStepContent = (step) => {
  switch (step) {
    case 1:
      return {
        title: 'Bem-vindo ao LearnFun!',
        description: 'Vamos te mostrar rapidamente como dominar o inglês com treinos guiados.',
        bullets: [
          { icon: 'sparkles', text: 'Escolha modos de prática pensados para situações reais.' },
          { icon: 'book', text: 'Aprenda frases organizadas por temas essenciais.' },
          { icon: 'users', text: 'Participe de experiências ao vivo quando quiser evoluir mais.' }
        ],
        primaryLabel: 'Ver categorias'
      };
    case 2:
      return {
        title: 'Explore o modo Categories',
        description: 'Cada categoria reúne frases prontas para você usar no dia a dia.',
        bullets: [
          { icon: 'book', text: 'Veja o tema, descrição e progresso de cada coleção.' },
          { icon: 'sparkles', text: 'Escolha o que quer treinar agora com total liberdade.' },
          { icon: 'check', text: 'Revise quantas vezes quiser para fixar o conteúdo.' }
        ],
        image: categoriesImage,
        primaryLabel: 'Explorar Daily Basics'
      };
    case 3:
      return {
        title: 'Daily Basics na prática',
        description: 'Aqui está sua primeira frase para destravar conversas do dia a dia.',
        bullets: [
          { icon: 'volume', text: 'Clique em “Ouvir” para escutar a pronúncia nativa.' },
          { icon: 'mic', text: 'Use o microfone para repetir e receber feedback imediato.' },
          { icon: 'check', text: 'Marque como concluída e avance para a próxima expressão.' }
        ],
        primaryLabel: 'Começar prática'
      };
    default:
      return null;
  }
};

export const GuestOnboarding = ({ open, step, onNext, onSkip }) => {
  const content = useMemo(() => getStepContent(step), [step]);

  if (!open || !content) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              Tour guiado
            </div>
            <div className="text-xs font-medium text-purple-500 mt-1">
              Passo {step} de {TOTAL_STEPS}
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Pular tutorial"
          >
            ✕
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
          {content.title}
        </h2>

        <p className="text-gray-600 mb-6">
          {content.description}
        </p>

        {content.image && (
          <div className="mb-6">
            <img
              src={content.image}
              alt="Categorias do LearnFun"
              className="w-full rounded-2xl border border-gray-100 shadow-sm"
            />
          </div>
        )}

        <div className="space-y-3 mb-8">
          {content.bullets.map((bullet, index) => {
            const IconComponent = iconMap[bullet.icon] || Sparkles;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-full">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  {bullet.text}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={onSkip}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Pular tutorial
          </button>

          <button
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-transform transform hover:-translate-y-0.5"
          >
            {content.primaryLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestOnboarding;

