import React from 'react';
import { 
  BookOpen, 
  Globe, 
  Hash, 
  Zap, 
  ArrowLeft,
  ArrowRight,
  Mic,
  Target,
  Puzzle
} from 'lucide-react';

const SpeakTrainingModes = ({ onNavigate }) => {
  const handleModeSelect = (mode) => {
    if (onNavigate) {
      onNavigate(mode);
    } else {
      const url = new URL(window.location);
      url.searchParams.set('mode', mode);
      window.history.pushState({}, '', url);
      window.location.reload();
    }
  };

  const trainingModes = [
    {
      id: 'categories',
      name: 'Categories',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-600',
      description: 'Practice phrases by real-world situations and topics',
      emoji: '📚',
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    },
    {
      id: 'translate',
      name: 'Translate',
      icon: Globe,
      color: 'from-purple-500 to-pink-600',
      description: 'Practice translation and improve your vocabulary',
      emoji: '🌍',
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    {
      id: 'numbers',
      name: 'Numbers',
      icon: Hash,
      color: 'from-blue-500 to-cyan-600',
      description: 'Master English numbers pronunciation',
      emoji: '🔢',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      id: 'challenge',
      name: 'Challenge',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      description: 'Test your skills with timed challenges',
      emoji: '⚡',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600'
    },
    {
      id: 'sentence-builder',
      name: 'Sentence Builder',
      icon: Puzzle,
      color: 'from-cyan-500 to-blue-600',
      description: 'Build sentences with drag & drop',
      emoji: '🧩',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => handleModeSelect('dashboard')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleModeSelect('dashboard');
              }
            }}
            tabIndex={0}
            aria-label="Voltar para o dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Speak Training Modes
            </h1>
            <p className="text-gray-600 text-lg md:text-xl">
              Choose your preferred way to practice pronunciation
            </p>
          </div>
        </div>

        {/* Training Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trainingModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleModeSelect(mode.id);
                  }
                }}
                tabIndex={0}
                aria-label={`Abrir modo ${mode.name}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left group hover:scale-105"
              >
                {/* Header com ícone e emoji */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`${mode.gradient} p-4 rounded-xl shadow-md`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-4xl">{mode.emoji}</span>
                </div>

                {/* Título e descrição */}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {mode.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {mode.description}
                </p>

                {/* Call to action */}
                <div className="mt-4 flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  <span>Start Training</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <p className="text-gray-700 font-semibold">Tips for Better Results</p>
          </div>
          <p className="text-gray-600 text-sm">
            💡 Practice daily for at least 10 minutes. Each mode targets different skills to help you become fluent!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeakTrainingModes;

