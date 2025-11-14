import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Hash, Mic, Zap, Video, MoreHorizontal, X, MessageCircle, Globe, Gift, Radio, House, BookOpen, ArrowUp01 } from 'lucide-react';
import NumberSpeechTrainer from './training/NumberSpeechTrainer';
import ChunkTrainer from './training/ChunkTrainer';
import ChallengeTrainer from './training/ChallengeTrainer';
import VideoLearningApp from './training/VideoListener';
import WhatsAppFloatingButton from './ui/WhatsAppFloatingButton';
import AuthButton from './auth/AuthButton';
import GuestBanner from './ui/GuestBanner';
import { LevelIndicator } from './leaderboard/LevelIndicator';
import StreakIndicator from './ui/StreakIndicator';
import TranslateTrainer from './training/TranslateTrainer';
import { ReferralButton } from './referral/ReferralButton';
import { InviteFriendsScreen } from './referral/InviteFriendsScreen';
import LiveRooms from './social/LiveRooms';
import Dashboard from './Dashboard';
import CategoryTrainer from './training/CategoryTrainer';
import { LevelUpModal } from './modals/LevelUpModal';
import {
  updateChunkProgress,
  incrementPhraseCompleted,
  saveProgress,
  closeLevelUpModal,
  updateLevelSystemIndices,
  markPhraseCompleted
} from '../store/slices/userSlice';
import GuestOnboarding from './ui/GuestOnboarding';

const ONBOARDING_STORAGE_KEY = 'learnfun_guest_onboarding_v1';

const TrainerSelector = () => {
  const getInitialTrainer = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'categories') return 'categories';
    if (mode === 'live-rooms') return 'live-rooms';
    if (mode === 'chunk') return 'chunk';
    if (mode === 'translate') return 'translate';
    if (mode === 'challenge') return 'challenge';
    if (mode === 'numbers') return 'numbers';
    if (mode === 'VideoLearningApp') return 'VideoLearningApp';
    if (mode === 'dashboard') return 'dashboard';
    return 'dashboard';
  };

   const [activeTrainer, setActiveTrainer] = useState(
      getInitialTrainer() || 'dashboard'
    );
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSpeakMenu, setShowSpeakMenu] = useState(false);
  const { levelSystem, stats, profile, mode } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [autoSelectCategory, setAutoSelectCategory] = useState(null);



  useEffect(() => {
    if (window.va) {
      const path = window.location.pathname + window.location.search;
      window.va('pageview', { path });
    }
  }, [activeTrainer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (mode === 'guest') {
      const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setOnboardingStep(1);
      }
    } else {
      setShowOnboarding(false);
    }
  }, [mode]);

  const finishOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
    }
    setShowOnboarding(false);
    setOnboardingStep(1);
    setAutoSelectCategory(null);
  };

  const handleOnboardingSkip = () => {
    finishOnboarding();
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === 1) {
      handleTrainerChange('categories');
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      handleTrainerChange('categories');
      setAutoSelectCategory('daily_basics');
      setOnboardingStep(3);
    } else {
      finishOnboarding();
    }
  };

const handleCloseLevelUpModal = () => {
    dispatch(closeLevelUpModal());
  };

  const handleTrainerChange = (trainer) => {
    setActiveTrainer(trainer);
    setShowMoreMenu(false);
    const url = new URL(window.location);
    url.searchParams.set('mode', trainer);
    window.history.pushState({}, '', url);

    if (window.va) {
      window.va('event', {
        name: 'trainer_selected',
        data: { mode: trainer }
      });
    }
  };

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

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Banner para Guests */}
      <GuestBanner variant="minimal" />

      {/* TOP Navigation Bar - Desktop Only */}
      <nav className="bg-white shadow-md sticky top-0 z-50 hidden md:block">
        <div className=" mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex justify-center gap-4 flex-1">
                 <div className="flex items-center gap-3">
                            {/* Logo LearnFun com Zap icon */}
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

                             {/* Home Button */}
                                                        <button
                                                          onClick={() => handleTrainerChange('dashboard')}
                                                          onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                              e.preventDefault();
                                                              handleTrainerChange('dashboard');
                                                            }
                                                          }}
                                                          tabIndex={0}
                                                          aria-label="Ir para página inicial"
                                                          aria-current={activeTrainer === 'dashboard' ? 'page' : undefined}
                                                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                                            activeTrainer === 'dashboard'
                                                              ? 'bg-purple-500 text-white shadow-lg scale-105'
                                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                          }`}
                                                        >
                                                          <House className="w-5 h-5" aria-hidden="true" />
                                                          Home
                                                        </button>
                {/* Categories Button */}
                <button
                                                           onClick={() => handleTrainerChange('categories')}
                                                           onKeyDown={(e) => {
                                                             if (e.key === 'Enter' || e.key === ' ') {
                                                               e.preventDefault();
                                                               handleTrainerChange('categories');
                                                             }
                                                           }}
                                                           tabIndex={0}
                                                           aria-label="Abrir categorias de frases"
                                                           aria-current={activeTrainer === 'categories' ? 'page' : undefined}
                                                           className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                                             activeTrainer === 'categories'
                                                               ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                                                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                           }`}
                                                         >
                                                           <BookOpen className="w-5 h-5" aria-hidden="true" />
                                                           Categories
                                                         </button>
              {/* Chunk Trainer Button */}
              <button
                onClick={() => handleTrainerChange('chunk')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('chunk');
                  }
                }}
                tabIndex={0}
                aria-label="Treinar pronúncia de frases"
                aria-current={activeTrainer === 'chunk' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'chunk'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-5 h-5" aria-hidden="true" />
                Speak phrases
              </button>

              {/* Translate Trainer Button - NOVO */}
              <button
                onClick={() => handleTrainerChange('translate')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('translate');
                  }
                }}
                tabIndex={0}
                aria-label="Treinar tradução"
                aria-current={activeTrainer === 'translate' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'translate'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
                Translate
              </button>

              {/* Number Trainer Button */}
              <button
                onClick={() => handleTrainerChange('numbers')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('numbers');
                  }
                }}
                tabIndex={0}
                aria-label="Treinar números em inglês"
                aria-current={activeTrainer === 'numbers' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'numbers'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Hash className="w-5 h-5" />
                Number
              </button>



              <button
                onClick={() => handleTrainerChange('live-rooms')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('live-rooms');
                  }
                }}
                tabIndex={0}
                aria-label="Abrir salas ao vivo"
                aria-current={activeTrainer === 'live-rooms' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'live-rooms'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Radio className="w-5 h-5" aria-hidden="true" />
                Live Rooms
              </button>

              {/* Challenge Mode Button */}
              <button
                onClick={() => handleTrainerChange('challenge')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('challenge');
                  }
                }}
                tabIndex={0}
                aria-label="Abrir modo desafio"
                aria-current={activeTrainer === 'challenge' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'challenge'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-5 h-5" aria-hidden="true" />
                Challenge
              </button>

              {/* VideoLearningApp Button */}
              <button
                onClick={() => handleTrainerChange('VideoLearningApp')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('VideoLearningApp');
                  }
                }}
                tabIndex={0}
                aria-label="Abrir aprendizado com vídeo"
                aria-current={activeTrainer === 'VideoLearningApp' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'VideoLearningApp'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-5 h-5" aria-hidden="true" />
                Video
              </button>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-3">
                <StreakIndicator variant="compact" />
                <LevelIndicator variant="compact" />


            {/* Botão de Auth (direita) */}
                <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE Top Bar - Simple header with Logo */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo LearnFun com Zap icon */}
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

      {/* Active Trainer Component */}
      <div className="transition-opacity duration-300">
          {activeTrainer === 'categories' && (
            <CategoryTrainer autoSelectCategory={autoSelectCategory} />
          )}
        {activeTrainer === 'dashboard' && <Dashboard onNavigate={handleTrainerChange} />}
        {activeTrainer === 'chunk' && <ChunkTrainer />}
        {activeTrainer === 'translate' && <TranslateTrainer />}
        {activeTrainer === 'numbers' && <NumberSpeechTrainer />}
        {activeTrainer === 'challenge' && <ChallengeTrainer />}
        {activeTrainer === 'VideoLearningApp' && <VideoLearningApp />}
        {activeTrainer === 'live-rooms' && <LiveRooms />}
      </div>

      {showSpeakMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setShowSpeakMenu(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSpeakMenu(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Fechar menu de opções de fala"
        >
          <div
            className="absolute bottom-20 left-0 right-0  rounded-t-3xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="speak-menu-title"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 id="speak-menu-title" className="text-lg font-bold text-gray-800">Speak Options</h3>
              <button
                onClick={() => setShowSpeakMenu(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowSpeakMenu(false);
                  }
                }}
                tabIndex={0}
                aria-label="Fechar menu"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 space-y-3">
                {/* Categories Phrases */}
                                            <button
                                              onClick={() => {
                                                handleTrainerChange('categories');
                                                setShowSpeakMenu(false);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                  e.preventDefault();
                                                  handleTrainerChange('categories');
                                                  setShowSpeakMenu(false);
                                                }
                                              }}
                                              tabIndex={0}
                                              aria-label="Abrir categorias de frases"
                                              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                                                activeTrainer === 'categories'
                                                  ? 'bg-purple-500 text-white shadow-lg'
                                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                                              }`}
                                            >
                                              <div className={`p-3 rounded-full ${
                                                activeTrainer === 'categories' ? ' bg-opacity-20' : 'bg-purple-100'
                                              }`}>
                                                <BookOpen  className={`w-6 h-6 ${
                                                  activeTrainer === 'categories' ? 'text-white' : 'text-purple-600'
                                                }`} aria-hidden="true" />
                                              </div>
                                              <div className="text-left flex-1">
                                                <div className="font-bold text-lg">Categories</div>
                                                <div className={`text-sm ${
                                                  activeTrainer === 'categories' ? 'text-white text-opacity-90' : 'text-gray-600'
                                                }`}>
                                                  Escolha frases por situações.
                                                </div>
                                              </div>
                                              {activeTrainer === 'categories' && (
                                                <div className="w-2 h-2  rounded-full" aria-hidden="true" />
                                              )}
                                            </button>
              {/* Speak Phrases */}
              <button
                onClick={() => {
                  handleTrainerChange('chunk');
                  setShowSpeakMenu(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('chunk');
                    setShowSpeakMenu(false);
                  }
                }}
                tabIndex={0}
                aria-label="Treinar pronúncia de frases"
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  activeTrainer === 'chunk'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  activeTrainer === 'chunk' ? ' bg-opacity-20' : 'bg-purple-100'
                }`}>
                  <Mic className={`w-6 h-6 ${
                    activeTrainer === 'chunk' ? 'text-white' : 'text-purple-600'
                  }`} aria-hidden="true" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Speak Phrases</div>
                  <div className={`text-sm ${
                    activeTrainer === 'chunk' ? 'text-white text-opacity-90' : 'text-gray-600'
                  }`}>
                    Practice pronunciation
                  </div>
                </div>
                {activeTrainer === 'chunk' && (
                  <div className="w-2 h-2  rounded-full" aria-hidden="true" />
                )}
              </button>



              {/* Translate */}
              <button
                 onClick={() => {
                   handleTrainerChange('translate');
                   setShowSpeakMenu(false);
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     handleTrainerChange('translate');
                     setShowSpeakMenu(false);
                   }
                 }}
                 tabIndex={0}
                 aria-label="Treinar tradução"
                 className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                   activeTrainer === 'translate'
                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                     : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                 }`}
               >
                 <div className={`p-3 rounded-full ${
                   activeTrainer === 'translate' ? ' bg-opacity-20' : 'bg-pink-100'
                 }`}>
                   <Globe className={`w-6 h-6 ${
                     activeTrainer === 'translate' ? 'text-white' : 'text-pink-600'
                   }`} aria-hidden="true" />
                 </div>
                 <div className="text-left flex-1">
                   <div className="font-bold text-lg">Translate</div>
                   <div className={`text-sm ${
                     activeTrainer === 'translate' ? 'text-white text-opacity-90' : 'text-gray-600'
                   }`}>
                     Translate and practice
                   </div>
                 </div>
                 {activeTrainer === 'translate' && (
                   <div className="w-2 h-2  rounded-full" aria-hidden="true" />
                 )}
               </button>

               {/* Numbers */}
                             <button
                               onClick={() => {
                                 handleTrainerChange('numbers');
                                 setShowSpeakMenu(false);
                               }}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                   e.preventDefault();
                                   handleTrainerChange('numbers');
                                   setShowSpeakMenu(false);
                                 }
                               }}
                               tabIndex={0}
                               aria-label="Treinar números em inglês"
                               className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                                 activeTrainer === 'numbers'
                                   ? 'bg-purple-500 text-white shadow-lg'
                                   : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                               }`}
                             >
                               <div className={`p-3 rounded-full ${
                                 activeTrainer === 'numbers' ? ' bg-opacity-20' : 'bg-purple-100'
                               }`}>
                                 <ArrowUp01 className={`w-6 h-6 ${
                                   activeTrainer === 'numbers' ? 'text-white' : 'text-purple-600'
                                 }`} aria-hidden="true" />
                               </div>
                               <div className="text-left flex-1">
                                 <div className="font-bold text-lg">Numbers</div>
                                 <div className={`text-sm ${
                                   activeTrainer === 'numbers' ? 'text-white text-opacity-90' : 'text-gray-600'
                                 }`}>
                                   Practice Numbers pronunciation
                                 </div>
                               </div>
                               {activeTrainer === 'numbers' && (
                                 <div className="w-2 h-2  rounded-full" aria-hidden="true" />
                               )}
                             </button>

              {/* Challenge Mode */}
              <button
                onClick={() => {
                  handleTrainerChange('challenge');
                  setShowSpeakMenu(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('challenge');
                    setShowSpeakMenu(false);
                  }
                }}
                tabIndex={0}
                aria-label="Abrir modo desafio"
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  activeTrainer === 'challenge'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  activeTrainer === 'challenge' ? ' bg-opacity-20' : 'bg-orange-100'
                }`}>
                  <Zap className={`w-6 h-6 ${
                    activeTrainer === 'challenge' ? 'text-white' : 'text-orange-600'
                  }`} aria-hidden="true" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Challenge Mode</div>
                  <div className={`text-sm ${
                    activeTrainer === 'challenge' ? 'text-white text-opacity-90' : 'text-gray-600'
                  }`}>
                    Test your skills!
                  </div>
                </div>
                {activeTrainer === 'challenge' && (
                  <div className="w-2 h-2  rounded-full" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MORE MENU Modal - Mobile Only */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setShowMoreMenu(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowMoreMenu(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Fechar menu de mais opções"
        >
          <div
            className="absolute bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-menu-title"
          >
            {/* Header do Menu */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 id="more-menu-title" className="text-lg font-bold text-gray-800">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowMoreMenu(false);
                  }
                }}
                tabIndex={0}
                aria-label="Fechar menu"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-3">

              {/* WhatsApp Community */}
              <button
                onClick={handleWhatsAppClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWhatsAppClick();
                  }
                }}
                tabIndex={0}
                aria-label="Abrir comunidade do WhatsApp"
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-green-500">
                  <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">LearnFun Community</div>
                  <div className="text-sm text-gray-600">
                    Suporte e Dicas • WhatsApp
                  </div>
                </div>
                <div className="text-green-600" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </button>

              {/* ✅ NOVO: Invite Friends */}
              <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowInviteModal(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowMoreMenu(false);
                        setShowInviteModal(true);
                      }
                    }}
                    tabIndex={0}
                    aria-label="Convidar amigos"
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-gray-800 transition-all"
                  >
                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Gift className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-lg">Convide Amigos</div>
                      <div className="text-sm text-gray-600">
                        Ganhe +5 pular frases • Grátis
                      </div>
                    </div>
                    <div className="text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
            </div>
          </div>
        </div>
      )}



        {/* Modal Invite Friends */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              <InviteFriendsScreen onBack={() => setShowInviteModal(false)} />
            </div>
          )}

      {/* BOTTOM Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-lg z-40 md:hidden">
        <div className="grid grid-cols-5 gap-1 px-2">
          {/* Speak Button */}
          <button
            onClick={() => setShowSpeakMenu(!showSpeakMenu)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSpeakMenu(!showSpeakMenu);
              }
            }}
            tabIndex={0}
            aria-label="Abrir menu de treinamento de fala"
            aria-expanded={showSpeakMenu}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              showSpeakMenu || activeTrainer === 'chunk' || activeTrainer === 'translate' || activeTrainer === 'challenge'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <Mic className={`w-6 h-6 ${activeTrainer === 'chunk' ? 'scale-110' : ''}`} aria-hidden="true" />
            <span className="text-xs font-semibold">Speak</span>
            {activeTrainer === 'chunk' && (
              <div className="w-8 h-1 bg-purple-600 rounded-full mt-1" aria-hidden="true" />
            )}
          </button>



            <button
              onClick={() => handleTrainerChange('live-rooms')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTrainerChange('live-rooms');
                }
              }}
              tabIndex={0}
              aria-label="Abrir salas ao vivo"
              aria-current={activeTrainer === 'live-rooms' ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-3 transition-all ${
                activeTrainer === 'live-rooms' ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Radio className={`w-6 h-6 ${activeTrainer === 'live-rooms' ? 'scale-110' : ''}`} aria-hidden="true" />
              <span className="text-xs font-semibold">Live</span>
              {activeTrainer === 'live-rooms' && (
                <div className="w-8 h-1 bg-green-600 rounded-full mt-1" aria-hidden="true" />
              )}
            </button>

          {/* Home Button */}
          <button
            onClick={() => handleTrainerChange('dashboard')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrainerChange('dashboard');
              }
            }}
            tabIndex={0}
            aria-label="Ir para página inicial"
            aria-current={activeTrainer === 'dashboard' ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'dashboard' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <House className={`w-6 h-6 ${activeTrainer === 'dashboard' ? 'scale-110' : ''}`} aria-hidden="true" />
            <span className="text-xs font-semibold">Home</span>
            {activeTrainer === 'dashboard' && (
              <div className="w-8 h-1 bg-blue-600 rounded-full mt-1" aria-hidden="true" />
            )}
          </button>

          {/* Video Button */}
          <button
            onClick={() => handleTrainerChange('VideoLearningApp')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrainerChange('VideoLearningApp');
              }
            }}
            tabIndex={0}
            aria-label="Abrir aprendizado com vídeo"
            aria-current={activeTrainer === 'VideoLearningApp' ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'VideoLearningApp' ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            <Video className={`w-6 h-6 ${activeTrainer === 'VideoLearningApp' ? 'scale-110' : ''}`} aria-hidden="true" />
            <span className="text-xs font-semibold">Video</span>
            {activeTrainer === 'VideoLearningApp' && (
              <div className="w-8 h-1 bg-red-600 rounded-full mt-1" aria-hidden="true" />
            )}
          </button>



          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowMoreMenu(!showMoreMenu);
              }
            }}
            tabIndex={0}
            aria-label="Abrir menu de mais opções"
            aria-expanded={showMoreMenu}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              showMoreMenu || activeTrainer === 'challenge' ? 'text-gray-800' : 'text-gray-400'
            }`}
          >
            <MoreHorizontal className={`w-6 h-6 ${showMoreMenu ? 'scale-110' : ''}`} aria-hidden="true" />
            <span className="text-xs font-semibold">More</span>
            {(showMoreMenu || activeTrainer === 'challenge') && (
              <div className="w-8 h-1 bg-gray-800 rounded-full mt-1" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Botão Flutuante WhatsApp - Desktop Only */}
      <div className="hidden md:block">
        <WhatsAppFloatingButton />
      </div>

      {showOnboarding && (
        <GuestOnboarding
          open={showOnboarding}
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

export default TrainerSelector;