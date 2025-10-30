import React, { useState, useEffect } from 'react';
import { Hash, Mic, Zap, Video } from 'lucide-react';
import NumberSpeechTrainer from './NumberSpeechTrainer';
import ChunkTrainer from './ChunkTrainer';
import ChallengeTrainer from './ChallengeTrainer';
import VideoLearningApp from './VideoListener';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';
import AuthButton from './AuthButton';
import GuestBanner from './GuestBanner';

export default function TrainerSelector() {
  // Ler o parâmetro da URL ao carregar
  const getInitialTrainer = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'challenge') return 'challenge';
    if (mode === 'numbers') return 'numbers';
    if (mode === 'VideoLearningApp') return 'VideoLearningApp';
    return 'chunk'; // padrão
  };

  const [activeTrainer, setActiveTrainer] = useState(getInitialTrainer());

  // Rastrear mudanças de página no Analytics
  useEffect(() => {
    if (window.va) {
      const path = window.location.pathname + window.location.search;
      window.va('pageview', { path });
    }
  }, [activeTrainer]);

  // Atualizar URL quando mudar de trainer
  const handleTrainerChange = (trainer) => {
    setActiveTrainer(trainer);
    const url = new URL(window.location);
    url.searchParams.set('mode', trainer);
    window.history.pushState({}, '', url);

    // Rastrear evento de mudança de trainer
    if (window.va) {
      window.va('event', {
        name: 'trainer_selected',
        data: { mode: trainer }
      });
    }
  };

  return (
    <div className="min-h-screen">

        {/* Banner para Guests */}
        <GuestBanner variant="minimal" />

      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
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
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video className="w-5 h-5" />
              Video
            </button>

            </div>

            {/* Botão de Auth (direita) */}
            <AuthButton />

          </div>
        </div>
      </nav>

      {/* Active Trainer Component */}
      <div className="transition-opacity duration-300">
        {activeTrainer === 'chunk' && <ChunkTrainer />}
        {activeTrainer === 'numbers' && <NumberSpeechTrainer />}
        {activeTrainer === 'challenge' && <ChallengeTrainer />}
        {activeTrainer === 'VideoLearningApp' && <VideoLearningApp />}
      </div>

      {/* Botão Flutuante WhatsApp */}
      <WhatsAppFloatingButton />

    </div>
  );
}