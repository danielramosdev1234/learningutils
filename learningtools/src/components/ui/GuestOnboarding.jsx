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
import { useUILanguage } from '../../context/LanguageContext.jsx';
import { translateUI } from '../../i18n/uiTranslations.js';

const TOTAL_STEPS = 3;

const iconMap = {
  sparkles: Sparkles,
  book: BookOpen,
  users: Users,
  check: CheckCircle,
  volume: Volume2,
  mic: Mic
};

const getStepContent = (step, language) => {
  switch (step) {
    case 1:
      return {
        title: translateUI(language, 'onboarding.step1Title'),
        description: translateUI(language, 'onboarding.step1Description'),
        bullets: [
          { icon: 'sparkles', text: translateUI(language, 'onboarding.step1Bullet1') },
          { icon: 'book', text: translateUI(language, 'onboarding.step1Bullet2') },
          { icon: 'users', text: translateUI(language, 'onboarding.step1Bullet3') }
        ],
        primaryLabel: translateUI(language, 'onboarding.step1Primary')
      };
    case 2:
      return {
        title: translateUI(language, 'onboarding.step2Title'),
        description: translateUI(language, 'onboarding.step2Description'),
        bullets: [
          { icon: 'book', text: translateUI(language, 'onboarding.step2Bullet1') },
          { icon: 'sparkles', text: translateUI(language, 'onboarding.step2Bullet2') },
          { icon: 'check', text: translateUI(language, 'onboarding.step2Bullet3') }
        ],
        image: categoriesImage,
        primaryLabel: translateUI(language, 'onboarding.step2Primary')
      };
    case 3:
      return {
        title: translateUI(language, 'onboarding.step3Title'),
        description: translateUI(language, 'onboarding.step3Description'),
        bullets: [
          { icon: 'volume', text: translateUI(language, 'onboarding.step3Bullet1') },
          { icon: 'mic', text: translateUI(language, 'onboarding.step3Bullet2') },
          { icon: 'check', text: translateUI(language, 'onboarding.step3Bullet3') }
        ],
        primaryLabel: translateUI(language, 'onboarding.step3Primary')
      };
    default:
      return null;
  }
};

export const GuestOnboarding = ({ open, step, onNext, onSkip }) => {
  const { language } = useUILanguage();
  const content = useMemo(() => getStepContent(step, language), [step, language]);

  if (!open || !content) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              {translateUI(language, 'onboarding.guidedTour')}
            </div>
            <div className="text-xs font-medium text-purple-500 mt-1">
              {translateUI(language, 'onboarding.stepOf', { step, total: TOTAL_STEPS })}
            </div>
          </div>

          <button
            onClick={onSkip}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={translateUI(language, 'onboarding.closeTourAria')}
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

