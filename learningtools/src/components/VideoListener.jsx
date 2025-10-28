import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Trophy, Zap, Volume2, Check, X } from 'lucide-react';
import questionsImportadas from '../utils/questionsDatabase.js';
import questionsScenesDatabase from '../utils/questionsScenesDatabase.js';

const VideoLearningApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const questions = gameMode === 'phrases'
    ? questionsImportadas
    : gameMode === 'scenes'
    ? questionsScenesDatabase
    : [];



  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const correct = index === currentQ.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowResult(false);
      setSelectedAnswer(null);
      setVideoPlayed(false);
    } else {
      // Reiniciar o jogo
      setCurrentQuestion(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setVideoPlayed(false);
    }
  };

    const handleModeSelect = (mode) => {
      setGameMode(mode);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
    };

    const handleBackToMenu = () => {
      setGameMode(null);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
    };

  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

    // Tela de seleção - adicionar ANTES do return principal
    if (!gameMode) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
          <div className="max-w-4xl w-full text-center">
            <h1 className="text-5xl font-bold mb-8">🎬 Video Learning</h1>
            <div className="grid md:grid-cols-2 gap-8 px-4">
              {/* Card Phrases */}
              <button
                onClick={() => handleModeSelect('phrases')}
                className="bg-gradient-to-br from-purple-500 to-blue-600 bg-opacity-80 hover:bg-opacity-90 backdrop-blur-lg p-12 rounded-3xl transition-all transform hover:scale-105 shadow-2xl border border-white border-opacity-30"
              >
                <div className="text-8xl mb-6">💬</div>
                <h2 className="text-3xl font-bold mb-3 text-white">Phrases</h2>
                <p className="text-lg text-gray-200">Frases famosas de filmes</p>
              </button>

              {/* Card Scenes */}
              <button
                onClick={() => handleModeSelect('scenes')}
                className="bg-gradient-to-br from-purple-500 to-blue-600 bg-opacity-80 hover:bg-opacity-90 backdrop-blur-lg p-12 rounded-3xl transition-all transform hover:scale-105 shadow-2xl border border-white border-opacity-30"
              >
                <div className="text-8xl mb-6">🎬</div>
                <h2 className="text-3xl font-bold mb-3 text-white">Scenes</h2>
                <p className="text-lg text-gray-200">Cenas completas</p>
              </button>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      {/* Header com Score */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-black bg-opacity-30 backdrop-blur-lg rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-orange-400" size={24} />
              <span className="text-xl font-semibold">{streak}x</span>
            </div>
          </div>
          <div className="text-sm text-gray-300">
            Questão {currentQuestion + 1} de {questions.length}
          </div>
        </div>
        <button
          onClick={handleBackToMenu}
          className="bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold"
        >
          ← Menu
        </button>
      </div>

      {/* Container Principal */}
      <div className="max-w-4xl mx-auto">
        {/* Vídeo */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${currentQ.videoId}?start=${currentQ.startTime}&end=${currentQ.endTime}&autoplay=${videoPlayed ? 1 : 0}&modestbranding=1&rel=0&showinfo=0`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Question"
            />
            <div className="absolute top-0 left-0 right-0 h-16 bg-black pointer-events-none z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Info do Vídeo */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex gap-2">
            <span className={`${getLevelColor(currentQ.level)} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
              {currentQ.level}
            </span>
            <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold">
              {currentQ.category}
            </span>
          </div>
          <button
            onClick={() => setVideoPlayed(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full transition-all transform hover:scale-105"
          >
            <Volume2 size={18} />
            <span className="text-sm font-semibold">Ouvir Novamente</span>
          </button>
        </div>

        {/* Pergunta */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-center text-black">
            O que foi dito no vídeo?
          </h2>
        </div>

        {/* Opções */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQ.correctIndex;

            let buttonClass = "w-full p-4 rounded-xl text-left transition-all transform hover:scale-102 font-medium ";

            if (!showResult) {
              buttonClass += "bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-lg text-black";
            } else {
              if (isSelected && isCorrect) {
                buttonClass += "bg-green-500 ring-4 ring-green-300";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-red-500 ring-4 ring-red-300";
              } else if (isCorrectAnswer) {
                buttonClass += "bg-green-500 ring-4 ring-green-300";
              } else {
                buttonClass += "bg-white bg-opacity-5";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="text-black">{option}</span>
                  {showResult && isSelected && (
                    isCorrect ?
                    <Check className="text-white" size={24} /> :
                    <X className="text-white" size={24} />
                  )}
                  {showResult && !isSelected && isCorrectAnswer && (
                    <Check className="text-white" size={24} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Resultado e Botão Next */}
        {showResult && (
          <div className="space-y-4">
            <div className={`${isCorrect ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center shadow-xl`}>
              <h3 className="text-2xl font-bold mb-2">
                {isCorrect ? '🎉 Correto!' : '❌ Incorreto'}
              </h3>
              <p className="text-lg">
                {isCorrect ?
                  `Você ganhou 10 pontos! Sequência: ${streak}x` :
                  'Não desista! Continue praticando.'
                }
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              <SkipForward size={24} />
              {currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Recomeçar'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-gray-300 text-sm">
        <p>💡 Dica: Assista o vídeo quantas vezes precisar antes de responder!</p>
      </div>
    </div>
  );
};

export default VideoLearningApp;