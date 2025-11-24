import { useSelector } from 'react-redux';
import { ArrowRight, Clock } from 'lucide-react';
import { useUILanguage } from '../context/LanguageContext.jsx';
import { translateUI } from '../i18n/uiTranslations.js';

const ContinueCard = () => {
  const lastActivity = useSelector((state) => state.user.lastActivity);
  const { language } = useUILanguage();

  if (!lastActivity) {
    return null;
  }

  const handleContinue = () => {
    if (lastActivity.resumeUrl) {
      console.log('Navigating to:', lastActivity.resumeUrl);
      window.location.href = lastActivity.resumeUrl;
    } else {
      console.warn('No resumeUrl found in lastActivity:', lastActivity);
    }
  };

  const getTimeSinceActivity = () => {
    const now = new Date();
    const activityDate = new Date(lastActivity.timestamp);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));

    if (diffInMinutes < 60) {
      return language === 'en-US'
        ? `${diffInMinutes} min ago`
        : `há ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return language === 'en-US'
        ? `${diffInHours}h ago`
        : `há ${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return language === 'en-US' ? 'Yesterday' : 'Ontem';
    }

    return language === 'en-US'
      ? `${diffInDays} days ago`
      : `há ${diffInDays} dias`;
  };

  const getTrainerIcon = () => {
    switch (lastActivity.trainerType) {
      case 'categories':
        return '📚';
      case 'challenge':
        return '⚡';
      case 'translate':
        return '🌍';
      case 'numbers':
        return '🔢';
      case 'sentenceBuilder':
        return '🏗️';
      case 'video':
        return '🎬';
      default:
        return '📖';
    }
  };

  return (
    <div
      className="group w-full bg-white rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleContinue}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-4 flex-1">
          <div className="w-14 h-14 bg-purple-700 rounded-xl flex items-center justify-center text-3xl shrink-0">
            {getTrainerIcon()}
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <h3 className="text-gray-900 text-lg font-bold">
              {language === 'en-US' ? 'Continue practicing' : 'Continue praticando'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed ">
              {lastActivity.displayText}
            </p>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Clock className="w-3 h-3" strokeWidth={2} />
              <span>{getTimeSinceActivity()}</span>
            </div>
          </div>
        </div>
        <button
          className="shrink-0 w-12 h-12 bg-gray-100 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all group-hover:translate-x-1 duration-200"
          onClick={(e) => {
            e.stopPropagation();
            handleContinue();
          }}
          aria-label={language === 'en-US' ? 'Continue training' : 'Continuar treinamento'}
        >
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ContinueCard;