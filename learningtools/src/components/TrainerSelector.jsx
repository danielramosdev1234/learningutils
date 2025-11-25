import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Hash, Mic, Zap, Video, MoreHorizontal, X, MessageCircle, Globe, Gift, Radio, House, BookOpen, ArrowUp01, HelpCircle, Puzzle } from 'lucide-react';
import NumberSpeechTrainer from './training/NumberSpeechTrainer';
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
import SentenceBuilder from './training/SentenceBuilder';
import SpeakTrainingModes from './SpeakTrainingModes';
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
import AIConversationTrainer from './training/AIConversationTrainer';
import { useUILanguage } from '../context/LanguageContext.jsx';
import { translateUI } from '../i18n/uiTranslations.js';

const ONBOARDING_STORAGE_KEY = 'learnfun_guest_onboarding_v1';

const TrainerSelector = () => {
  const getInitialTrainer = () => {

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'guest') {
              return 'categories';
            }
    if (mode === 'categories') return 'categories';
    if (mode === 'live-rooms') return 'live-rooms';
    if (mode === 'translate') return 'translate';
    if (mode === 'challenge') return 'challenge';
    if (mode === 'numbers') return 'numbers';
    if (mode === 'VideoLearningApp') return 'VideoLearningApp';
    if (mode === 'sentence-builder') return 'sentence-builder';
    if (mode === 'speak-training-modes') return 'speak-training-modes';
    if (mode === 'dashboard') return 'dashboard';
    if (mode === 'ai-conversation') return 'ai-conversation';
    return 'dashboard';
  };

   const [activeTrainer, setActiveTrainer] = useState(
      getInitialTrainer() || 'dashboard'
    );
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { levelSystem, stats, profile, mode } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [autoSelectCategory, setAutoSelectCategory] = useState(null);
  const { language } = useUILanguage();

  useEffect(() => {
    // ⚠️ ADICIONAR ESTE EFEITO
    if (mode === 'guest' && activeTrainer !== 'categories') {
      setActiveTrainer('categories');
      setAutoSelectCategory('daily_basics');
      const url = new URL(window.location);
      url.searchParams.set('mode', 'categories');
      url.searchParams.set('category', 'daily_basics');
      window.history.pushState({}, '', url);
    }
  }, [mode, activeTrainer]);

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

  // Lê parâmetro 'category' da URL quando o modo for 'categories'
  useEffect(() => {
    if (activeTrainer === 'categories') {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      if (categoryParam) {
        setAutoSelectCategory(categoryParam);
      }
    }
  }, [activeTrainer]);

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
           {mode !== 'guest' && (
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

                                                        </button>
              {/* Speak Training Button */}
              <button
                onClick={() => handleTrainerChange('speak-training-modes')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTrainerChange('speak-training-modes');
                  }
                }}
                tabIndex={0}
                aria-label="Abrir modos de treinamento de fala"
                aria-current={activeTrainer === 'speak-training-modes' ? 'page' : undefined}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'speak-training-modes'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-5 h-5" aria-hidden="true" />
                {translateUI(language, 'navigation.speakTraining')}
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
                {translateUI(language, 'navigation.liveRooms')}
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
                {translateUI(language, 'navigation.video')}
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
        )}
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
      {activeTrainer === 'ai-conversation' && <AIConversationTrainer />}
        {activeTrainer === 'dashboard' && <Dashboard onNavigate={handleTrainerChange} />}
        {activeTrainer === 'speak-training-modes' && <SpeakTrainingModes onNavigate={handleTrainerChange} />}
        {activeTrainer === 'translate' && <TranslateTrainer />}
        {activeTrainer === 'sentence-builder' && <SentenceBuilder />}
        {activeTrainer === 'numbers' && <NumberSpeechTrainer />}
        {activeTrainer === 'challenge' && <ChallengeTrainer />}
        {activeTrainer === 'VideoLearningApp' && <VideoLearningApp />}
        {activeTrainer === 'live-rooms' && <LiveRooms />}
      </div>

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
              <h3 id="more-menu-title" className="text-lg font-bold text-gray-800">
                {translateUI(language, 'navigation.moreOptions')}
              </h3>
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
                  <div className="font-bold text-lg">{translateUI(language, 'navigation.whatsappCommunity')}</div>
                  <div className="text-sm text-gray-600">
                    {translateUI(language, 'navigation.whatsappCommunitySubtitle')}
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
                      <div className="font-bold text-lg">{translateUI(language, 'navigation.inviteFriends')}</div>
                      <div className="text-sm text-gray-600">
                        {translateUI(language, 'navigation.inviteFriendsSubtitle')}
                      </div>
                    </div>
                    <div className="text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

              {/* FAQ */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  navigate('/faq');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowMoreMenu(false);
                    navigate('/faq');
                  }
                }}
                tabIndex={0}
                aria-label="Ver perguntas frequentes"
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-blue-500">
                  <HelpCircle className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{translateUI(language, 'navigation.faq')}</div>
                  <div className="text-sm text-gray-600">
                    {/* Texto extra permanece em PT-BR por enquanto */}
                    Tire suas dúvidas sobre o LearnFun
                  </div>
                </div>
                <div className="text-blue-600">
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
          {mode !== 'guest' && (
        <div className="grid grid-cols-5 gap-1 px-2">
          {/* Speak Button - Vai direto para speak-training-modes */}
          <button
            onClick={() => handleTrainerChange('speak-training-modes')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrainerChange('speak-training-modes');
              }
            }}
            tabIndex={0}
            aria-label="Abrir modos de treinamento de fala"
            aria-current={activeTrainer === 'speak-training-modes' ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'speak-training-modes' || activeTrainer === 'categories' || activeTrainer === 'translate' || activeTrainer === 'numbers' || activeTrainer === 'challenge' || activeTrainer === 'sentence-builder'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <Mic className={`w-6 h-6 ${activeTrainer === 'speak-training-modes' ? 'scale-110' : ''}`} aria-hidden="true" />
            <span className="text-xs font-semibold">{translateUI(language, 'navigation.speakTraining')}</span>
            {(activeTrainer === 'speak-training-modes' || activeTrainer === 'categories' || activeTrainer === 'translate' || activeTrainer === 'numbers' || activeTrainer === 'challenge' || activeTrainer === 'sentence-builder') && (
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
              <span className="text-xs font-semibold">{translateUI(language, 'navigation.liveRooms')}</span>
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
            <span className="text-xs font-semibold">{translateUI(language, 'navigation.home')}</span>
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
            <span className="text-xs font-semibold">{translateUI(language, 'navigation.video')}</span>
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
            <span className="text-xs font-semibold">{translateUI(language, 'navigation.more')}</span>
            {(showMoreMenu || activeTrainer === 'challenge') && (
              <div className="w-8 h-1 bg-gray-800 rounded-full mt-1" aria-hidden="true" />
            )}
          </button>
        </div>
         )}
      </nav>

      {/* Botão Flutuante WhatsApp - Desktop Only */}
      <div className="hidden md:block">
        <WhatsAppFloatingButton />
      </div>


    </div>
  );
};

export default TrainerSelector;