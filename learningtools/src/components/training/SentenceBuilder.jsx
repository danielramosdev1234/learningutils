import React, { useState, useEffect } from 'react';
import { Check, X, Lightbulb, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useXP } from '../../hooks/useXP';
import { trackExerciseComplete, trackError, trackUserAction } from '../../utils/analytics';
import { incrementPhraseCompleted } from '../../store/slices/userSlice';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseCard } from './PhraseCard';

const SentenceBuilder = () => {
  const dispatch = useDispatch();
  const { earnXP } = useXP();
  const textToSpeech = useTextToSpeech();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userSentence, setUserSentence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showPhraseCard, setShowPhraseCard] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [pronunciationCompleted, setPronunciationCompleted] = useState(false);

  const exercises = [
    {
      level: 1,
      translation: "Eu gosto de música",
      correctOrder: ["I", "like", "music"],
      words: ["music", "I", "like"],
      hint: "Sujeito + Verbo + Objeto",
      explanation: "Em inglês, a ordem básica é Sujeito-Verbo-Objeto (SVO)"
    },
    {
      level: 1,
      translation: "Ela estuda todos os dias",
      correctOrder: ["She", "studies", "every", "day"],
      words: ["day", "studies", "She", "every"],
      hint: "Lembre-se: 'studies' com 's' para 'she'",
      explanation: "Verbos na terceira pessoa do singular (he/she/it) ganham 's' no presente simples"
    },
    {
      level: 1,
      translation: "Nós jogamos futebol",
      correctOrder: ["We", "play", "soccer"],
      words: ["play", "We", "soccer"],
      hint: "Sujeito + Verbo + Objeto",
      explanation: "Ordem básica SVO: We (nós) + play (jogamos) + soccer (futebol)"
    },
    {
      level: 1,
      translation: "Eles comem pizza",
      correctOrder: ["They", "eat", "pizza"],
      words: ["pizza", "They", "eat"],
      hint: "Sujeito + Verbo + Objeto",
      explanation: "Ordem básica SVO: They (eles) + eat (comem) + pizza"
    },
    {
      level: 2,
      translation: "Eu não falo espanhol",
      correctOrder: ["I", "don't", "speak", "Spanish"],
      words: ["speak", "don't", "I", "Spanish"],
      hint: "Use 'don't' antes do verbo para negação",
      explanation: "Negativas no presente usam: sujeito + don't/doesn't + verbo base"
    },
    {
      level: 2,
      translation: "Você vai à escola de ônibus?",
      correctOrder: ["Do", "you", "go", "to", "school", "by", "bus", "?"],
      words: ["you", "to", "go", "?", "school", "Do", "by", "bus"],
      hint: "Perguntas começam com 'Do/Does'",
      explanation: "Perguntas sim/não usam: Do/Does + sujeito + verbo base"
    },
    {
      level: 2,
      translation: "Ela não gosta de café",
      correctOrder: ["She", "doesn't", "like", "coffee"],
      words: ["doesn't", "She", "coffee", "like"],
      hint: "Use 'doesn't' para 'she' na negativa",
      explanation: "Para terceira pessoa (he/she/it) na negativa, use 'doesn't' + verbo base"
    },
    {
      level: 2,
      translation: "Eles trabalham aqui?",
      correctOrder: ["Do", "they", "work", "here", "?"],
      words: ["they", "work", "Do", "here", "?"],
      hint: "Perguntas começam com 'Do'",
      explanation: "Perguntas com 'they' usam 'Do' + they + verbo base"
    },
    {
      level: 3,
      translation: "Ela está lendo um livro agora",
      correctOrder: ["She", "is", "reading", "a", "book", "now"],
      words: ["reading", "She", "now", "book", "is", "a"],
      hint: "Use 'is' + verbo com -ing para ações em progresso",
      explanation: "Presente contínuo: sujeito + am/is/are + verbo-ing"
    },
    {
      level: 3,
      translation: "Nós estivemos esperando por uma hora",
      correctOrder: ["We", "have", "been", "waiting", "for", "an", "hour"],
      words: ["hour", "have", "We", "waiting", "for", "been", "an"],
      hint: "Present Perfect Continuous: have/has + been + verbo-ing",
      explanation: "Usado para ações que começaram no passado e continuam até agora"
    },
    {
      level: 3,
      translation: "Eu estava estudando quando você ligou",
      correctOrder: ["I", "was", "studying", "when", "you", "called"],
      words: ["called", "I", "studying", "when", "was", "you"],
      hint: "Passado contínuo: was/were + verbo-ing",
      explanation: "Passado contínuo descreve ações em progresso no passado"
    },
    {
      level: 3,
      translation: "Eles vão viajar amanhã",
      correctOrder: ["They", "will", "travel", "tomorrow"],
      words: ["travel", "They", "tomorrow", "will"],
      hint: "Futuro simples: will + verbo base",
      explanation: "Futuro simples usa 'will' + verbo base para ações futuras"
    }
  ];

  const currentEx = exercises[currentExercise];

  const handleWordClick = (word) => {
    if (showFeedback) return;
    
    // Toca o áudio da palavra
    textToSpeech.speak(word);
    
    const newSentence = [...userSentence, word];
    setUserSentence(newSentence);
    
    trackUserAction('sentence_builder_word_clicked', {
      word,
      exerciseIndex: currentExercise,
      level: currentEx.level
    });
  };

  const handleRemoveWord = (index) => {
    if (showFeedback) return;
    const newSentence = userSentence.filter((_, i) => i !== index);
    setUserSentence(newSentence);
    
    trackUserAction('sentence_builder_word_removed', {
      exerciseIndex: currentExercise,
      level: currentEx.level
    });
  };

  const checkAnswer = () => {
    const correct = JSON.stringify(userSentence) === JSON.stringify(currentEx.correctOrder);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const points = currentEx.level * 10 + (showHint ? 0 : 5);
      setScore(score + points);
      setStreak(streak + 1);
      
      // Marcar exercício como completo
      setCompletedExercises(new Set([...completedExercises, currentExercise]));
      
      // Criar objeto phrase para o PhraseCard
      const phrase = {
        id: `sentence-builder-${currentExercise}-${Date.now()}`,
        text: currentEx.correctOrder.join(' '),
        translation: currentEx.translation,
        category: 'sentence-builder',
        difficulty: `level-${currentEx.level}`,
        index: currentExercise
      };
      
      setCurrentPhrase(phrase);
      setShowPhraseCard(true);
      
      // Ganhar XP (será ganho novamente quando completar a pronúncia)
      const xpAmount = currentEx.level * 5 + (showHint ? 0 : 2);
      earnXP('sentence_builder', {
        level: currentEx.level,
        exerciseIndex: currentExercise,
        usedHint: showHint,
        streak: streak + 1
      });
      
      // Track analytics
      trackExerciseComplete('sentence_builder', 100, xpAmount, {
        level: currentEx.level,
        exerciseIndex: currentExercise,
        usedHint: showHint,
        streak: streak + 1
      });
    } else {
      setStreak(0);
      
      trackExerciseComplete('sentence_builder', 0, 0, {
        level: currentEx.level,
        exerciseIndex: currentExercise,
        userAnswer: userSentence.join(' '),
        correctAnswer: currentEx.correctOrder.join(' ')
      });
    }
  };

  const handlePhraseCardComplete = () => {
    // Quando o PhraseCard for completado, marcar como completo
    setPronunciationCompleted(true);
    trackUserAction('sentence_builder_pronunciation_completed', {
      exerciseIndex: currentExercise,
      level: currentEx.level
    });
  };

  const handlePhraseCardNext = () => {
    // Quando clicar no botão Next do PhraseCard, avançar para o próximo exercício
    nextExercise();
  };

  const nextExercise = () => {
    // Resetar estados relacionados ao PhraseCard
    setShowPhraseCard(false);
    setCurrentPhrase(null);
    setPronunciationCompleted(false);
    
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserSentence([]);
      setShowFeedback(false);
      setShowHint(false);
      setLevel(exercises[currentExercise + 1].level);
    } else {
      // Reiniciar
      setCurrentExercise(0);
      setUserSentence([]);
      setShowFeedback(false);
      setShowHint(false);
      setLevel(1);
      setCompletedExercises(new Set());
      
      trackUserAction('sentence_builder_restarted', {
        totalScore: score,
        totalCompleted: completedExercises.size
      });
    }
  };

  const reset = () => {
    setUserSentence([]);
    setShowFeedback(false);
    setShowHint(false);
    setShowPhraseCard(false);
    setCurrentPhrase(null);
    setPronunciationCompleted(false);
    
    trackUserAction('sentence_builder_reset', {
      exerciseIndex: currentExercise
    });
  };

  const availableWords = currentEx.words.filter(
    word => !userSentence.includes(word) || 
    currentEx.words.filter(w => w === word).length > userSentence.filter(w => w === word).length
  );

  // Track quando o componente é montado
  useEffect(() => {
    trackUserAction('sentence_builder_opened', {
      level: currentEx.level
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                🎯 English Sentence Builder
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Aprenda a construir frases em inglês de forma divertida
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-indigo-100 px-3 md:px-4 py-2 rounded-lg">
                <div className="text-xs text-indigo-600 font-semibold">NÍVEL</div>
                <div className="text-xl md:text-2xl font-bold text-indigo-700">{currentEx.level}</div>
              </div>
              <div className="bg-green-100 px-3 md:px-4 py-2 rounded-lg">
                <div className="text-xs text-green-600 font-semibold">PONTOS</div>
                <div className="text-xl md:text-2xl font-bold text-green-700">{score}</div>
              </div>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg w-fit">
              <Zap className="text-orange-500" size={20} />
              <span className="text-orange-700 font-semibold text-sm md:text-base">
                Sequência: {streak} {streak === 1 ? 'acerto' : 'acertos'}! 🔥
              </span>
            </div>
          )}
        </div>

        {/* Exercise Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full w-fit">
                Exercício {currentExercise + 1} de {exercises.length}
              </span>
              <button
                onClick={() => {
                  setShowHint(!showHint);
                  if (!showHint) {
                    trackUserAction('sentence_builder_hint_shown', {
                      exerciseIndex: currentExercise
                    });
                  }
                }}
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                tabIndex={0}
                aria-label={showHint ? 'Esconder dica' : 'Mostrar dica'}
              >
                <Lightbulb size={18} />
                {showHint ? 'Esconder dica' : 'Mostrar dica'}
              </button>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Traduza para o inglês:
            </h2>
            <p className="text-lg md:text-xl text-gray-700 italic">"{currentEx.translation}"</p>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-amber-800 flex items-start gap-2 text-sm md:text-base">
                <Lightbulb size={20} className="mt-0.5 flex-shrink-0" />
                <span><strong>Dica:</strong> {currentEx.hint}</span>
              </p>
            </div>
          )}

          {/* User's Sentence */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sua frase:</h3>
            <div className="min-h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-wrap gap-2 items-center">
              {userSentence.length === 0 ? (
                <span className="text-gray-400 italic text-sm md:text-base">
                  Clique nas palavras abaixo para formar a frase...
                </span>
              ) : (
                userSentence.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleRemoveWord(index)}
                    disabled={showFeedback}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !showFeedback) {
                        e.preventDefault();
                        handleRemoveWord(index);
                      }
                    }}
                    tabIndex={showFeedback ? -1 : 0}
                    aria-label={`Remover palavra ${word}`}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                      showFeedback
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer'
                    }`}
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Words */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Palavras disponíveis:</h3>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordClick(word)}
                  disabled={showFeedback}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !showFeedback) {
                      e.preventDefault();
                      handleWordClick(word);
                    }
                  }}
                  tabIndex={showFeedback ? -1 : 0}
                  aria-label={`Adicionar palavra ${word}`}
                  className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                    showFeedback
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mb-6 p-4 md:p-6 rounded-xl ${
              isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <Check className="text-green-600 flex-shrink-0" size={28} />
                ) : (
                  <X className="text-red-600 flex-shrink-0" size={28} />
                )}
                <div className="flex-1">
                  <h4 className={`text-lg md:text-xl font-bold mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? '🎉 Perfeito!' : '❌ Não foi dessa vez!'}
                  </h4>
                  {!isCorrect && (
                    <>
                      <p className="text-red-700 mb-2 text-sm md:text-base">
                        <strong>Resposta correta:</strong> {currentEx.correctOrder.join(' ')}
                      </p>
                      <p className="text-red-700 mb-2 text-sm md:text-base">
                        <strong>Sua resposta:</strong> {userSentence.join(' ')}
                      </p>
                    </>
                  )}
                  <div className="bg-white bg-opacity-50 p-3 rounded-lg mt-3">
                    <p className="text-sm font-medium text-gray-800">
                      💡 {currentEx.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showFeedback ? (
              <>
                <button
                  onClick={checkAnswer}
                  disabled={userSentence.length !== currentEx.correctOrder.length}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && userSentence.length === currentEx.correctOrder.length) {
                      e.preventDefault();
                      checkAnswer();
                    }
                  }}
                  tabIndex={userSentence.length === currentEx.correctOrder.length ? 0 : -1}
                  aria-label="Verificar resposta"
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${
                    userSentence.length === currentEx.correctOrder.length
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Verificar Resposta
                </button>
                <button
                  onClick={reset}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      reset();
                    }
                  }}
                  tabIndex={0}
                  aria-label="Resetar frase"
                  className="px-4 md:px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <RotateCcw size={20} />
                  Resetar
                </button>
              </>
            ) : (
              !isCorrect && (
                <button
                  onClick={nextExercise}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      nextExercise();
                    }
                  }}
                  tabIndex={0}
                  aria-label={currentExercise < exercises.length - 1 ? 'Próximo exercício' : 'Recomeçar'}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm md:text-base"
                >
                  {currentExercise < exercises.length - 1 ? 'Próximo Exercício →' : '🔄 Recomeçar'}
                </button>
              )
            )}
          </div>
        </div>

        {/* PhraseCard - Aparece quando a resposta está correta */}
        {showPhraseCard && currentPhrase && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                🎉 Frase correta! Agora pronuncie:
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Complete a pronúncia e clique em "Próximo" para avançar
              </p>
            </div>
            
            <PhraseCard
              key={currentPhrase.id}
              phrase={currentPhrase}
              onSpeak={textToSpeech.speak2}
              textToSpeech={textToSpeech}
              onCorrectAnswer={handlePhraseCardComplete}
              onNextPhrase={handlePhraseCardNext}
              isActive={true}
              autoAdvance={false}
            />
            
            {/* Botão Next - Aparece quando a pronúncia está completa */}
            {pronunciationCompleted && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={nextExercise}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      nextExercise();
                    }
                  }}
                  tabIndex={0}
                  aria-label={currentExercise < exercises.length - 1 ? 'Próximo exercício' : 'Recomeçar'}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm md:text-base"
                >
                  {currentExercise < exercises.length - 1 ? 'Próximo Exercício →' : '🔄 Recomeçar'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Seu Progresso</h3>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentExercise + (showFeedback && isCorrect ? 1 : 0)) / exercises.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {currentExercise + (showFeedback && isCorrect ? 1 : 0)} de {exercises.length} exercícios completados
          </p>
        </div>
      </div>
    </div>
  );
};

export default SentenceBuilder;

