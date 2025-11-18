import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Globe, Hash, Zap, Video, Radio,
  TrendingUp, Target, Flame, Trophy,
  ArrowRight, Star, Clock, Users,
  CheckCircle, Award, MessageCircle, Gift, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import LevelRankingModal from './modals/LevelRankingModal';
import StreakModal from './modals/StreakModal';
import wordByWordImg from '../assets/wordbyword.png';
import translatePracticeImg from '../assets/translatepractice.png';
import numerosImg from '../assets/numeros.png';
import challengeImg from '../assets/challenge.png';
import videoListenerImg from '../assets/videolistener.png';
import liveRoomImg from '../assets/liveroom.png';
import categoriesImg from '../assets/categories.png';
import { LevelIndicator } from './leaderboard/LevelIndicator';
import PWAInstallCard from './ui/PWAInstallCard';
import { useUILanguage } from '../context/LanguageContext.jsx';
import { translateUI } from '../i18n/uiTranslations.js';

const Dashboard = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { levelSystem, userId, stats } = useSelector(state => state.user);
  const streak = stats?.streak || { current: 0, longest: 0, history: [] };
  const { language } = useUILanguage();

  const formatDayUnit = (count) => {
    if (language === 'en-US') {
      return count === 1 ? 'day' : 'days';
    }
    return count === 1 ? 'dia' : 'dias';
  };

  const formatFreezeLabel = (count) => {
    // Mantém "freeze" em ambos idiomas, pluralizando em EN
    if (language === 'en-US') {
      return count === 1 ? 'freeze' : 'freezes';
    }
    return count === 1 ? 'freeze' : 'freezes';
  };

  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!levelSystem) return null;

  const { currentLevel, globalCompletedIndices = [] } = levelSystem;

  const totalNeededForLevel = currentLevel * 10;
  const totalCompleted = globalCompletedIndices.length;
  const progressPercent = (totalCompleted / totalNeededForLevel) * 100;
  const remaining = totalNeededForLevel - totalCompleted;
  const isLevelComplete = totalCompleted >= totalNeededForLevel;

  // Calcula quais frases ainda faltam
  const allIndices = Array.from({ length: totalNeededForLevel }, (_, i) => i);
  const remainingIndices = allIndices
    .filter(idx => !globalCompletedIndices.includes(idx))
    .map(idx => idx + 1)
    .sort((a, b) => a - b);

  const displayIndices = remainingIndices;

  const features = [
    {
      id: 'categories',
      titleKey: 'dashboard.categoriesTitle',
      descriptions: [
        'dashboard.categoriesDesc1',
        'dashboard.categoriesDesc2',
        'dashboard.categoriesDesc3',
        'dashboard.categoriesDesc4'
      ],
      icon: BookOpen,
      gradient: 'from-indigo-500 to-purple-500',
      path: '/?mode=categories',
      src: categoriesImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'speak',
      titleKey: 'dashboard.speakTitle',
      descriptions: [
        'dashboard.speakDesc1',
        'dashboard.speakDesc2',
        'dashboard.speakDesc3',
        'dashboard.speakDesc4',
        'dashboard.speakDesc5'
      ],
      icon: Mic,
      gradient: 'from-purple-500 to-pink-500',
      path: '/?mode=categories',
      src: wordByWordImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'translate',
      titleKey: 'dashboard.translateTitle',
      descriptions: [
        'dashboard.translateDesc1',
        'dashboard.translateDesc2',
        'dashboard.translateDesc3',
        'dashboard.translateDesc4'
      ],
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/?mode=speak-training-modes',
      src: translatePracticeImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'numbers',
      titleKey: 'dashboard.numbersTitle',
      descriptions: [
        'dashboard.numbersDesc1',
        'dashboard.numbersDesc2',
        'dashboard.numbersDesc3',
        'dashboard.numbersDesc4'
      ],
      icon: Hash,
      gradient: 'from-green-500 to-teal-500',
      path: '/?mode=speak-training-modes',
      src: numerosImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'challenge',
      titleKey: 'dashboard.challengeTitle',
      descriptions: [
        'dashboard.challengeDesc1',
        'dashboard.challengeDesc2',
        'dashboard.challengeDesc3',
        'dashboard.challengeDesc4'
      ],
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-500',
      path: '/?mode=speak-training-modes',
      highlight: true,
      src: challengeImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'video',
      titleKey: 'dashboard.videoTitle',
      descriptions: [
        'dashboard.videoDesc1',
        'dashboard.videoDesc2',
        'dashboard.videoDesc3',
        'dashboard.videoDesc4'
      ],
      icon: Video,
      gradient: 'from-red-500 to-pink-500',
      path: '/?mode=VideoLearningApp',
      src: videoListenerImg,
      alt: 'exemplo word by word'
    },
    {
      id: 'live-rooms',
      titleKey: 'dashboard.liveRoomsTitle',
      descriptions: [
        'dashboard.liveRoomsDesc1',
        'dashboard.liveRoomsDesc2',
        'dashboard.liveRoomsDesc3',
        'dashboard.liveRoomsDesc4'
      ],
      icon: Radio,
      gradient: 'from-indigo-500 to-purple-500',
      path: '/?mode=live-rooms',
      badgeKey: 'dashboard.liveRoomsBadge',
      src: liveRoomImg,
      alt: 'exemplo word by word'
    }
  ];

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const scrollToSlide = (index) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = window.innerWidth - 64;
      const gap = 16;
      const scrollPosition = index * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = window.innerWidth - 64;
      const gap = 16;
      const slideIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentSlide(Math.min(Math.max(0, slideIndex), features.length - 1));
    }
  };

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section com conteúdo textual para IAs - Visível apenas para bots e screen readers */}
      <div className="sr-only">
        <h1>{translateUI(language, 'dashboard.seoTitle')}</h1>
        <p>{translateUI(language, 'dashboard.seoDescription')}</p>
        <p>{translateUI(language, 'dashboard.seoDescription2')}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* PWA Install Card */}
        <PWAInstallCard />

        {/* Level Indicator */}
        <LevelIndicator variant="full" />

        {/* Streak Progress Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4" onClick={() => setShowModal(true)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
              <span className="text-sm font-bold text-gray-800">
                {translateUI(language, 'dashboard.streakTitle', {
                  count: streak.current,
                  unit: formatDayUnit(streak.current),
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {streak.freezes > 0 && (
                <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">
                    {streak.freezes} {formatFreezeLabel(streak.freezes)}
                  </span>
                </div>
              )}
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </div>

          {/* Progress bar com 7 círculos */}
          <div className="flex items-center gap-2">
            {[...Array(7)].map((_, index) => {
              const currentStreakMod = streak.current % 7;
              const isCompleted = index < currentStreakMod;
              const isTrophy = index === 6;

              return (
                <React.Fragment key={index}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md scale-110'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isTrophy ? (
                      <Gift className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} fill={isCompleted ? 'currentColor' : 'none'} />
                    ) : isCompleted ? (
                      <Flame className="w-4 h-4 text-white" fill="currentColor" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  {index < 6 && (
                    <div className={`flex-1 h-1 rounded transition-all ${isCompleted && index < currentStreakMod - 1 ? 'bg-orange-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="espaçobaixo">
            <style>{`
              .espaçobaixo {
                padding-bottom: 20px;
                padding-top: 20px;
              }
            `}</style>
            <p className="text-xs text-gray-600 mt-3 text-center">
              {(() => {
                const daysForNext = 7 - (streak.current % 7 || 7);
                const dayLabel = formatDayUnit(daysForNext);
                const freezeCount = Math.floor(streak.current / 7);

                if (streak.current === 0) {
                  return translateUI(language, 'dashboard.consistentStudy');
                }

                if (streak.current < 7) {
                  return translateUI(language, 'dashboard.streakKeepGoing', {
                    days: daysForNext,
                    unit: dayLabel,
                  });
                }

                return translateUI(language, 'dashboard.streakAmazing', {
                  freezeCount,
                  freezeLabel: formatFreezeLabel(freezeCount),
                  days: daysForNext,
                  dayLabel,
                });
              })()}
            </p>
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-yellow-800">
                  🔥 {translateUI(language, 'dashboard.streakBonusTitle')}
                </span>
                <span className="text-yellow-600 text-base font-bold">+2 XP</span>
              </div>
              <p className="text-yellow-700 text-sm">
                {translateUI(language, 'dashboard.streakBonusText')}
              </p>
            </div>
          </div>
        </div>

        {showModal && (
          <StreakModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}

        <LevelRankingModal
          isOpen={showRankingModal}
          onClose={() => setShowRankingModal(false)}
          currentUserId={userId}
        />

        {/* Features - Grid no Desktop, Carrossel no Mobile */}
        {isMobile ? (
          <div className="relative">
            {/* Carrossel Mobile */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="flex-shrink-0 snap-center"
                  style={{ width: 'calc(100vw - 4rem)' }}
                >
                  <FeatureCard
                    feature={feature}
                    onNavigate={handleNavigate}
                  />
                </div>
              ))}
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-2 rounded-full ${
                  currentSlide === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-all`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Indicadores */}
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-purple-600'
                        : 'w-2 bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === features.length - 1}
                className={`p-2 rounded-full ${
                  currentSlide === features.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-all`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}

        {/* Seção de Recursos e Benefícios - Visível apenas para bots e screen readers */}
        <div className="sr-only">
          <h2>{translateUI(language, 'dashboard.whyLearnfun')}</h2>
          <div>
            <h3>{translateUI(language, 'dashboard.conversationPractice')}</h3>
            <p>{translateUI(language, 'dashboard.conversationDesc')}</p>
          </div>
          <div>
            <h3>{translateUI(language, 'dashboard.gamifiedSystem')}</h3>
            <p>{translateUI(language, 'dashboard.gamifiedDesc')}</p>
          </div>
          <div>
            <h3>{translateUI(language, 'dashboard.phoneticAnalysis')}</h3>
            <p>{translateUI(language, 'dashboard.phoneticDesc')}</p>
          </div>
          <div>
            <h3>{translateUI(language, 'dashboard.multipleTraining')}</h3>
            <p>{translateUI(language, 'dashboard.multipleDesc')}</p>
          </div>
          <div>
            <h3>{translateUI(language, 'dashboard.bestPlatform')}</h3>
            <p>{translateUI(language, 'dashboard.bestPlatformDesc1')}</p>
            <p>{translateUI(language, 'dashboard.bestPlatformDesc2')}</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {translateUI(language, 'dashboard.ctaTitle')}
          </h3>
          <p className="text-gray-600 mb-6">
            {translateUI(language, 'dashboard.ctaSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleNavigate('/?mode=speak-training-modes')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {translateUI(language, 'dashboard.ctaChallengeButton')}
            </button>
            <button
              onClick={() => handleNavigate('/?mode=live-rooms')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              {translateUI(language, 'dashboard.ctaLiveRoomButton')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

const FeatureCard = ({ feature, onNavigate }) => {
  const Icon = feature.icon;
  const { language } = useUILanguage();

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full">
      {/* Header with gradient and icon */}
      <div className={`bg-gradient-to-r ${feature.gradient} p-4 relative`}>
        <div className="flex items-center gap-3 text-white">
          <Icon className="w-6 h-6" />
          <h3 className="text-xl font-bold">{translateUI(language, feature.titleKey)}</h3>
        </div>

        {/* Badge */}
        {feature.badgeKey && (
          <div className="absolute top-4 right-4 bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full">
            {translateUI(language, feature.badgeKey)}
          </div>
        )}

        {/* Highlight Border */}
        {feature.highlight && (
          <div className="absolute inset-0 border-4 border-yellow-300 rounded-2xl animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="text-gray-700 text-sm leading-relaxed mb-4">
          <ul className="space-y-2">
            {feature.descriptions.map((descKey, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{translateUI(language, descKey)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Imagem do exemplo */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex-1">
          <img
            src={feature.src}
            alt={feature.alt}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* CTA Button - sempre no final */}
        <button
          onClick={() => onNavigate(feature.path)}
          className={`w-full bg-gradient-to-r ${feature.gradient} text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105 mt-auto`}
        >
          {translateUI(language, 'dashboard.featureStartTraining')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
};

export default Dashboard;

// CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    0% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
  }

  .animate-fadeOut {
    animation: fadeOut 3s ease-in-out forwards;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
if (!document.head.querySelector('style[data-dashboard]')) {
  style.setAttribute('data-dashboard', 'true');
  document.head.appendChild(style);
}