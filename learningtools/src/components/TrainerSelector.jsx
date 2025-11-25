import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hash, Mic, Zap, Video, MoreHorizontal, X, MessageCircle, Gift, Radio, House, HelpCircle } from 'lucide-react';
import { closeLevelUpModal } from '../store/slices/userSlice';
import { useUILanguage } from '../context/LanguageContext.jsx';
import { translateUI } from '../i18n/uiTranslations.js';

// ===================================
// 🚀 LAZY LOADING - CODE SPLITTING
// ===================================
// Apenas componentes estáticos são importados diretamente
import AuthButton from './auth/AuthButton';
import GuestBanner from './ui/GuestBanner';
import { LevelIndicator } from './leaderboard/LevelIndicator';
import StreakIndicator from './ui/StreakIndicator';
import WhatsAppFloatingButton from './ui/WhatsAppFloatingButton';

// Componentes pesados são carregados sob demanda
const NumberSpeechTrainer = lazy(() => import('./training/NumberSpeechTrainer'));
const ChallengeTrainer = lazy(() => import('./training/ChallengeTrainer'));
const VideoLearningApp = lazy(() => import('./training/VideoListener'));
const TranslateTrainer = lazy(() => import('./training/TranslateTrainer'));
const LiveRooms = lazy(() => import('./social/LiveRooms'));
const Dashboard = lazy(() => import('./Dashboard'));
const CategoryTrainer = lazy(() => import('./training/CategoryTrainer'));
const SentenceBuilder = lazy(() => import('./training/SentenceBuilder'));
const SpeakTrainingModes = lazy(() => import('./SpeakTrainingModes'));
const AIConversationTrainer = lazy(() => import('./training/AIConversationTrainer'));
const InviteFriendsScreen = lazy(() => import('./referral/InviteFriendsScreen'));
const GuestOnboarding = lazy(() => import('./ui/GuestOnboarding'));

// ===================================
// 🎯 LOADING COMPONENT
// ===================================
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Carregando...</p>
    </div>
  </div>
);

// ===================================
// 🛡️ ERROR BOUNDARY COMPONENT
// ===================================
class TrainerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Trainer loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Erro ao carregar conteúdo
            </h2>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro ao carregar este módulo. Tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===================================
// 🎨 NAVIGATION CONFIG
// ===================================
const TRAINER_ROUTES = {
  dashboard: {
    component: Dashboard,
    icon: House,
    label: 'navigation.home',
    color: 'blue',
    requiresAuth: true
  },
  'speak-training-modes': {
    component: SpeakTrainingModes,
    icon: Mic,
    label: 'navigation.speakTraining',
    color: 'purple',
    requiresAuth: true
  },
  'live-rooms': {
    component: LiveRooms,
    icon: Radio,
    label: 'navigation.liveRooms',
    color: 'green',
    requiresAuth: true
  },
  categories: {
    component: CategoryTrainer,
    icon: null,
    label: '',
    color: 'purple',
    requiresAuth: false
  },
  translate: {
    component: TranslateTrainer,
    icon: null,
    label: '',
    color: 'purple',
    requiresAuth: true
  },
  'sentence-builder': {
    component: SentenceBuilder,
    icon: null,
    label: '',
    color: 'purple',
    requiresAuth: true
  },
  numbers: {
    component: NumberSpeechTrainer,
    icon: null,
    label: '',
    color: 'purple',
    requiresAuth: true
  },
  challenge: {
    component: ChallengeTrainer,
    icon: Zap,
    label: 'Challenge',
    color: 'orange',
    requiresAuth: true
  },
  VideoLearningApp: {
    component: VideoLearningApp,
    icon: Video,
    label: 'navigation.video',
    color: 'red',
    requiresAuth: true
  },
  'ai-conversation': {
    component: AIConversationTrainer,
    icon: null,
    label: '',
    color: 'purple',
    requiresAuth: true
  },
};

// ===================================
// 🎯 CUSTOM HOOKS
// ===================================
const useTrainerNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'dashboard';
  const { mode: userMode } = useSelector(state => state.user);

  const navigateToTrainer = (trainer, additionalParams = {}) => {
    const newParams = new URLSearchParams({ mode: trainer, ...additionalParams });
    setSearchParams(newParams);

    if (window.va) {
      window.va('event', {
        name: 'trainer_selected',
        data: { mode: trainer }
      });
    }
  };

  // Guest mode enforcement
  useEffect(() => {
    if (userMode === 'guest' && mode !== 'categories') {
      navigateToTrainer('categories', { category: 'daily_basics' });
    }
  }, [userMode, mode]);

  return { currentTrainer: mode, navigateToTrainer };
};

// ===================================
// 🎨 NAVIGATION BUTTON COMPONENT
// ===================================
const NavButton = ({
  trainer,
  isActive,
  onClick,
  variant = 'desktop'
}) => {
  const { language } = useUILanguage();
  const route = TRAINER_ROUTES[trainer];

  if (!route || !route.icon) return null;

  const Icon = route.icon;
  const label = route.label.startsWith('navigation.')
    ? translateUI(language, route.label)
    : route.label;

  const colorClasses = {
    purple: isActive
      ? 'bg-purple-500 text-white shadow-lg scale-105'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    green: isActive
      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    orange: isActive
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    red: isActive
      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    blue: isActive
      ? 'bg-purple-500 text-white shadow-lg scale-105'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  if (variant === 'mobile') {
    const mobileColorClasses = {
      purple: isActive ? 'text-purple-600' : 'text-gray-400',
      green: isActive ? 'text-green-600' : 'text-gray-400',
      red: isActive ? 'text-red-600' : 'text-gray-400',
      blue: isActive ? 'text-blue-600' : 'text-gray-400',
    };

    return (
      <button
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 py-3 transition-all ${mobileColorClasses[route.color]}`}
      >
        <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} aria-hidden="true" />
        <span className="text-xs font-semibold">{label}</span>
        {isActive && (
          <div className={`w-8 h-1 bg-${route.color}-600 rounded-full mt-1`} aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${colorClasses[route.color]}`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
};

// ===================================
// 🎯 MAIN COMPONENT
// ===================================
const TrainerSelector = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [autoSelectCategory, setAutoSelectCategory] = useState(null);

  const { currentTrainer, navigateToTrainer } = useTrainerNavigation();
  const { mode } = useSelector(state => state.user);
  const { language } = useUILanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Handle category auto-selection
  useEffect(() => {
    if (currentTrainer === 'categories') {
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        setAutoSelectCategory(categoryParam);
      }
    }
  }, [currentTrainer, searchParams]);

  // Analytics tracking
  useEffect(() => {
    if (window.va) {
      const path = window.location.pathname + window.location.search;
      window.va('pageview', { path });
    }
  }, [currentTrainer]);

  const handleWhatsAppClick = () => {
    setShowMoreMenu(false);
    window.open('https://chat.whatsapp.com/ICDjTirl4Tu00SNRBYK71W', '_blank');

    if (window.va) {
      window.va('event', {
        name: 'whatsapp_community_clicked',
        data: { source: 'more_menu' }
      });
    }
  };

  // Get current trainer component
  const CurrentTrainerComponent = TRAINER_ROUTES[currentTrainer]?.component || Dashboard;
  const trainerProps = currentTrainer === 'categories' ? { autoSelectCategory } :
                       currentTrainer === 'dashboard' ? { onNavigate: navigateToTrainer } :
                       currentTrainer === 'speak-training-modes' ? { onNavigate: navigateToTrainer } : {};

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <GuestBanner variant="minimal" />

      {/* DESKTOP NAVIGATION */}
      <nav className="bg-white shadow-md sticky top-0 z-50 hidden md:block">
        {mode !== 'guest' && (
          <div className="mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex justify-center gap-4 flex-1">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1 rounded-md">
                      <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">
                      <span className="text-gray-800">Learn</span>
                      <span className="text-purple-600">Fun</span>
                    </h1>
                  </div>
                </div>

                {/* Navigation Buttons */}
                {['dashboard', 'speak-training-modes', 'live-rooms', 'challenge', 'VideoLearningApp'].map(trainer => (
                  <NavButton
                    key={trainer}
                    trainer={trainer}
                    isActive={currentTrainer === trainer}
                    onClick={() => navigateToTrainer(trainer)}
                    variant="desktop"
                  />
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <StreakIndicator variant="compact" />
                <LevelIndicator variant="compact" />
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE TOP BAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1 rounded-md">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-gray-800">Learn</span>
                <span className="text-purple-600">Fun</span>
              </h1>
            </div>
            <StreakIndicator variant="compact" />
            <LevelIndicator variant="compact" />
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* TRAINER CONTENT - with Error Boundary and Suspense */}
      <TrainerErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <div className="transition-opacity duration-300">
            <CurrentTrainerComponent {...trainerProps} />
          </div>
        </Suspense>
      </TrainerErrorBoundary>

      {/* MORE MENU MODAL - Mobile */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {translateUI(language, 'navigation.moreOptions')}
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* WhatsApp Community */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-green-500">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{translateUI(language, 'navigation.whatsappCommunity')}</div>
                  <div className="text-sm text-gray-600">
                    {translateUI(language, 'navigation.whatsappCommunitySubtitle')}
                  </div>
                </div>
              </button>

              {/* Invite Friends */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowInviteModal(true);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{translateUI(language, 'navigation.inviteFriends')}</div>
                  <div className="text-sm text-gray-600">
                    {translateUI(language, 'navigation.inviteFriendsSubtitle')}
                  </div>
                </div>
              </button>

              {/* FAQ */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  navigate('/faq');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-blue-500">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{translateUI(language, 'navigation.faq')}</div>
                  <div className="text-sm text-gray-600">
                    Tire suas dúvidas sobre o LearnFun
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <Suspense fallback={<LoadingFallback />}>
            <InviteFriendsScreen onBack={() => setShowInviteModal(false)} />
          </Suspense>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-lg z-40 md:hidden">
        {mode !== 'guest' && (
          <div className="grid grid-cols-5 gap-1 px-2">
            {['speak-training-modes', 'live-rooms', 'dashboard', 'VideoLearningApp'].map(trainer => (
              <NavButton
                key={trainer}
                trainer={trainer}
                isActive={currentTrainer === trainer}
                onClick={() => navigateToTrainer(trainer)}
                variant="mobile"
              />
            ))}

            {/* More Button */}
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center gap-1 py-3 transition-all ${
                showMoreMenu ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              <MoreHorizontal className={`w-6 h-6 ${showMoreMenu ? 'scale-110' : ''}`} />
              <span className="text-xs font-semibold">{translateUI(language, 'navigation.more')}</span>
              {showMoreMenu && (
                <div className="w-8 h-1 bg-gray-800 rounded-full mt-1" />
              )}
            </button>
          </div>
        )}
      </nav>

      {/* WhatsApp Floating Button - Desktop */}
      <div className="hidden md:block">
        <WhatsAppFloatingButton />
      </div>
    </div>
  );
};

export default TrainerSelector;