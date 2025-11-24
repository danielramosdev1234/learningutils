import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Trophy, Zap, Volume2, Check, X } from 'lucide-react';
import questionsImportadas from '../../utils/questionsDatabase.js';
import questionsScenesDatabase from '../../utils/questionsScenesDatabase.js';
import { useXP } from '../../hooks/useXP';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import { useDispatch, useSelector } from 'react-redux';  // ✅ CORRIGIDO
import { updateLastActivity } from '../../store/slices/userSlice';



const VideoLearningApp = () => {
  const dispatch = useDispatch();
  const { earnXP } = useXP();
  
  // ... rest of the code
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [videoPlayCount, setVideoPlayCount] = useState(0);
  const [gameMode, setGameMode] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showTranslations, setShowTranslations] = useState(false);
  const { mode } = useSelector(state => state.user);


   const questions = gameMode === 'phrases'
      ? questionsImportadas
      : gameMode === 'scenes' && currentVideoId
      ? questionsScenesDatabase.filter(q => q.videoId === currentVideoId)
      : [];

  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = questions.map(q => {
        const shuffledOptions = [...q.options];
        const correctAnswer = shuffledOptions[q.correctIndex];

        // Embaralhar array (Fisher-Yates)
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        return {
          ...q,
          options: shuffledOptions,
          correctIndex: shuffledOptions.indexOf(correctAnswer)
        };
      });
      setShuffledQuestions(shuffled);
    }
  }, [questions.length, gameMode, currentVideoId]);





  // Selecionar vídeo aleatório ao escolher modo scenes
  useEffect(() => {
    if (gameMode === 'scenes' && !currentVideoId) {
      selectRandomVideo();
    }
  }, [gameMode]);

  const selectRandomVideo = () => {
    const uniqueVideoIds = [...new Set(questionsScenesDatabase.map(q => q.videoId))];
    const randomVideoId = uniqueVideoIds[Math.floor(Math.random() * uniqueVideoIds.length)];
    setCurrentVideoId(randomVideoId);
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setScore(0);
    setStreak(0);
    setShowFinalResults(false);
    setShowResult(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
      setVideoPlayCount(0);
  };

  const questionsToUse = shuffledQuestions.length > 0 ? shuffledQuestions : questions;
  const currentQ = questionsToUse[currentQuestion];


  const handleAnswerSelect = async (index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const correct = index === currentQ.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
      
      // Ganha XP por acertar questão de vídeo
      // Phrases: 5 XP | Scenes: 10 XP
      const xpAmount = gameMode === 'phrases' ? 2 : 5;
    
      setScore(score + xpAmount);
      setStreak(streak + 1);
      
      try {
        await earnXP('video', {
          amount: xpAmount,
          questionId: currentQ.id || currentQuestion,
          videoId: currentQ.videoId,
          gameMode
        });
    
        // ✅ CORRIGIDO: Track last activity for authenticated users
        if (mode === 'authenticated') {
          dispatch(updateLastActivity({
            trainerType: 'video',                                    // ✅ Tipo correto
            mode: gameMode,                                          // ✅ 'phrases' ou 'scenes'
            phraseId: currentQ.id || `video-q-${currentQuestion}`,  // ✅ ID da questão
            phraseIndex: currentQuestion,                            // ✅ Índice correto
            resumeUrl: '/?mode=video',                               // ✅ URL correta
            displayText: `Video ${gameMode === 'phrases' ? 'Phrases' : 'Scenes'} - Question ${currentQuestion + 1}` // ✅ Texto descritivo
          }));
        }
      } catch (error) {
        console.error('Erro ao ganhar XP:', error);
      }
    } else {
      setStreak(0);
      setWrongAnswers(wrongAnswers + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questionsToUse.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowResult(false);
      setSelectedAnswer(null);
      setVideoPlayCount(0);
      setShowTranslations(false);
    } else {
      // Mostrar resultados finais no modo scenes
      if (gameMode === 'scenes') {
        setShowFinalResults(true);
      } else {
        // Reiniciar no modo phrases
        setCurrentQuestion(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setVideoPlayCount(0);
      }
    }
  };

  const handleModeSelect = (mode) => {
    setGameMode(mode);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setCurrentVideoId(null);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setShowFinalResults(false);
  };

  const handleNextVideo = () => {
    selectRandomVideo();
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

const processOptionText = (text) => {
  if (showTranslations) {
    return text; // Mostra tudo, incluindo parênteses
  }
  // Remove texto entre parênteses
  return text.replace(/\s*\([^)]*\)/g, '');
};

  // Tela de seleção
  if (!gameMode) {
    return (

      <div className=" bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">

        <div className="max-w-4xl w-full text-center">
            {/* Level Indicator */}
                              <LevelIndicator variant="full" />
          <h1 className="text-5xl font-bold mb-8">🎬 Video Learning</h1>
          <div className="grid md:grid-cols-2 gap-8 px-4">
            <button
              onClick={() => handleModeSelect('phrases')}
              className="bg-gradient-to-br from-purple-500 to-blue-600 bg-opacity-80 hover:bg-opacity-90 backdrop-blur-lg p-12 rounded-3xl transition-all transform hover:scale-105 shadow-2xl border border-white border-opacity-30"
            >
              <div className="text-8xl mb-6">💬</div>
              <h2 className="text-3xl font-bold mb-3 text-white">Phrases</h2>
              <p className="text-lg text-gray-200">Frases famosas de filmes</p>
            </button>

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


  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Carregando questões...</p>
        </div>
      </div>
    );
  }

  // Tela de resultados finais (apenas para modo scenes)
  if (showFinalResults && gameMode === 'scenes') {
    const totalQuestions = questionsToUse.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-white p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
              </div>
              <h2 className="text-4xl font-bold mb-2 text-black">Vídeo Concluído!</h2>
              <p className="text-xl text-black">Confira seus resultados</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-black bg-opacity-30 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold">Score Total</span>
                  <span className="text-3xl font-bold text-yellow-400">{score}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ width: `${(score / (totalQuestions * 10)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-700 bg-opacity-20 rounded-2xl p-6 border-2 border-green-500">
                  <div className="flex items-center justify-center mb-2">
                    <Check className="text-green-200" size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold ">{correctAnswers}</div>
                    <div className="text-sm text-gray-300">Acertos</div>
                  </div>
                </div>

                <div className="bg-red-700 bg-opacity-20 rounded-2xl p-6 border-2 border-red-500">
                  <div className="flex items-center justify-center mb-2">
                    <X className="text-red-200" size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{wrongAnswers}</div>
                    <div className="text-sm text-gray-300">Erros</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500 bg-opacity-20 rounded-2xl p-6 border-2 border-blue-500">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{percentage}%</div>
                  <div className="text-lg text-gray-300">Taxa de Acerto</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNextVideo}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >

                Treinar Próximo Vídeo
              </button>

              <button
                onClick={() => {
                  setShowFinalResults(false);
                  setCurrentQuestion(0);
                  setCorrectAnswers(0);
                  setWrongAnswers(0);
                  setScore(0);
                  setStreak(0);
                  setShowResult(false);
                      setSelectedAnswer(null);
                      setIsCorrect(false);
                      setVideoPlayCount(0);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >

                Repetir Este Vídeo
              </button>

              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-600 hover:bg-gray-700 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-white p-4">
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
            Questão {currentQuestion + 1} de {questionsToUse.length}
          </div>
        </div>
        <button
          onClick={handleBackToMenu}
          className="mt-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold transition-all"
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
              key={`video-${currentQ.videoId}-${videoPlayCount}`}
              src={`https://www.youtube.com/embed/${currentQ.videoId}?start=${currentQ.startTime}&end=${currentQ.endTime}&autoplay=${videoPlayCount > 0 ? 1 : 0}&enablejsapi=1&modestbranding=1&rel=0&showinfo=0`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Question"
            />
            <div className="absolute top-0 left-0 w-full h-full cursor-not-allowed" onClick={() => setVideoPlayCount(videoPlayCount + 1)}/>
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
            onClick={() => setVideoPlayCount(videoPlayCount + 1)}
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
                  <span className="text-black">{processOptionText(option)}</span>
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
                {isCorrect ? (
                  <>
                    Você acertou! Sequência: {streak}x
                    <br />
                    <span className="text-yellow-300 font-bold">
                      +{gameMode === 'phrases' ? 2 : 5} XP ganho!
                    </span>
                  </>
                ) : (
                  'Não desista! Continue praticando.'
                )}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              <SkipForward size={24} />
              {currentQuestion < questionsToUse.length - 1 ? 'Próxima Questão' : 'Ver Resultados'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-black text-sm">
        <p>💡 Dica: Assista o vídeo quantas vezes precisar antes de responder!</p>
      </div>
    </div>
  );
};

export default VideoLearningApp;