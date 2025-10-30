import React, { useState, useEffect } from 'react';
import { Hash, Mic, Zap, Video, MoreHorizontal, X, MessageCircle } from 'lucide-react';
import NumberSpeechTrainer from './NumberSpeechTrainer';
import ChunkTrainer from './ChunkTrainer';
import ChallengeTrainer from './ChallengeTrainer';
import VideoLearningApp from './VideoListener';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';
import AuthButton from './AuthButton';
import GuestBanner from './GuestBanner';
import { LevelIndicator } from './LevelIndicator';

export default function TrainerSelector() {
  const getInitialTrainer = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'challenge') return 'challenge';
    if (mode === 'numbers') return 'numbers';
    if (mode === 'VideoLearningApp') return 'VideoLearningApp';
    return 'chunk';
  };

  const [activeTrainer, setActiveTrainer] = useState(getInitialTrainer());
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (window.va) {
      const path = window.location.pathname + window.location.search;
      window.va('pageview', { path });
    }
  }, [activeTrainer]);

  const handleTrainerChange = (trainer) => {
    setActiveTrainer(trainer);
    setShowMoreMenu(false); // Fecha o menu More ao selecionar
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex justify-center gap-4 flex-1">
              {/* Chunk Trainer Button */}
              <button
                onClick={() => handleTrainerChange('chunk')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'chunk'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-5 h-5" />
                Speak
              </button>

              {/* Number Trainer Button */}
              <button
                onClick={() => handleTrainerChange('numbers')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'numbers'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Hash className="w-5 h-5" />
                Number
              </button>

              {/* Challenge Mode Button */}
              <button
                onClick={() => handleTrainerChange('challenge')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'challenge'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-5 h-5" />
                Challenge
              </button>

              {/* VideoLearningApp Button */}
              <button
                onClick={() => handleTrainerChange('VideoLearningApp')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTrainer === 'VideoLearningApp'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-5 h-5" />
                Video
              </button>
            </div>

            {/* Level Badge */}
            <LevelIndicator variant="compact" />

            {/* Botão de Auth (direita) */}
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* MOBILE Top Bar - Simple header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800">English Practice</h1>
            <LevelIndicator variant="compact" />
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Active Trainer Component */}
      <div className="transition-opacity duration-300">
        {activeTrainer === 'chunk' && <ChunkTrainer />}
        {activeTrainer === 'numbers' && <NumberSpeechTrainer />}
        {activeTrainer === 'challenge' && <ChallengeTrainer />}
        {activeTrainer === 'VideoLearningApp' && <VideoLearningApp />}
      </div>

      {/* MORE MENU Modal - Mobile Only */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Menu */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-3">
              {/* Challenge Mode */}
              <button
                onClick={() => handleTrainerChange('challenge')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  activeTrainer === 'challenge'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  activeTrainer === 'challenge' ? 'bg-white bg-opacity-20' : 'bg-orange-100'
                }`}>
                  <Zap className={`w-6 h-6 ${
                    activeTrainer === 'challenge' ? 'text-white' : 'text-orange-600'
                  }`} />
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
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </button>

              {/* WhatsApp Community */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 text-gray-800 transition-all"
              >
                <div className="p-3 rounded-full bg-green-500">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">LearnFun Community</div>
                  <div className="text-sm text-gray-600">
                    Suporte e Dicas • WhatsApp
                  </div>
                </div>
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-lg z-40 md:hidden">
        <div className="grid grid-cols-4 gap-1 px-2">
          {/* Speak Button */}
          <button
            onClick={() => handleTrainerChange('chunk')}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'chunk' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Mic className={`w-6 h-6 ${activeTrainer === 'chunk' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">Speak</span>
            {activeTrainer === 'chunk' && (
              <div className="w-8 h-1 bg-purple-600 rounded-full mt-1" />
            )}
          </button>

          {/* Number Button */}
          <button
            onClick={() => handleTrainerChange('numbers')}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'numbers' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <Hash className={`w-6 h-6 ${activeTrainer === 'numbers' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">Number</span>
            {activeTrainer === 'numbers' && (
              <div className="w-8 h-1 bg-blue-600 rounded-full mt-1" />
            )}
          </button>

          {/* Video Button */}
          <button
            onClick={() => handleTrainerChange('VideoLearningApp')}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              activeTrainer === 'VideoLearningApp' ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            <Video className={`w-6 h-6 ${activeTrainer === 'VideoLearningApp' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">Video</span>
            {activeTrainer === 'VideoLearningApp' && (
              <div className="w-8 h-1 bg-red-600 rounded-full mt-1" />
            )}
          </button>

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${
              showMoreMenu || activeTrainer === 'challenge' ? 'text-gray-800' : 'text-gray-400'
            }`}
          >
            <MoreHorizontal className={`w-6 h-6 ${showMoreMenu ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">More</span>
            {(showMoreMenu || activeTrainer === 'challenge') && (
              <div className="w-8 h-1 bg-gray-800 rounded-full mt-1" />
            )}
          </button>
        </div>
      </nav>

      {/* Botão Flutuante WhatsApp - Desktop Only */}
      <div className="hidden md:block">
        <WhatsAppFloatingButton />
      </div>
    </div>
  );
}