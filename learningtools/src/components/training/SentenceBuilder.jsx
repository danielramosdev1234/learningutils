import React, { useState, useEffect } from 'react';
import { Check, X, Lightbulb, RotateCcw, Trophy, Zap, Target, Play, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useXP } from '../../hooks/useXP';
import { trackExerciseComplete, trackError, trackUserAction } from '../../utils/analytics';
import { incrementPhraseCompleted, markPhraseCompleted, markSentenceBuilderPhraseCompleted, saveProgress } from '../../store/slices/userSlice';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseCard } from './PhraseCard';
import builderPhrasesData from '../../data/builder_phrases.json';

const WORD_COUNT_CATEGORIES = [
  { id: '3_words', name: '3 Words', count: 3, color: 'from-blue-500 to-indigo-600', emoji: '🔢' },
  { id: '4_words', name: '4 Words', count: 4, color: 'from-purple-500 to-pink-600', emoji: '🔢' },
  { id: '5_words', name: '5 Words', count: 5, color: 'from-green-500 to-teal-600', emoji: '🔢' },
  { id: '6_words', name: '6 Words', count: 6, color: 'from-yellow-500 to-orange-600', emoji: '🔢' },
  { id: '7_words', name: '7 Words', count: 7, color: 'from-red-500 to-rose-600', emoji: '🔢' },
  { id: '8_words', name: '8 Words', count: 8, color: 'from-cyan-500 to-blue-600', emoji: '🔢' },
  { id: '9_words', name: '9 Words', count: 9, color: 'from-teal-500 to-emerald-600', emoji: '🔢' },
  { id: '10_words', name: '10 Words', count: 10, color: 'from-indigo-500 to-purple-600', emoji: '🔢' }
];

const SentenceBuilder = () => {
  const dispatch = useDispatch();
  const { earnXP } = useXP();
  const textToSpeech = useTextToSpeech();
  const { levelSystem, progress, userId, mode } = useSelector(state => state.user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPhrases, setCategoryPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showPhraseCard, setShowPhraseCard] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [pronunciationCompleted, setPronunciationCompleted] = useState(false);
  const [completedInSession, setCompletedInSession] = useState([]);

  // Carrega frases quando categoria é selecionada
  useEffect(() => {
    if (selectedCategory && builderPhrasesData.phrases[selectedCategory]) {
      const phrases = builderPhrasesData.phrases[selectedCategory].map((phrase, index) => ({
        id: `builder-${selectedCategory}-${index}`,
        english: phrase.english,
        portuguese: phrase.portuguese,
        context: phrase.context,
        category: phrase.category,
        wordCount: WORD_COUNT_CATEGORIES.find(cat => cat.id === selectedCategory)?.count || 0
      }));
      
      setCategoryPhrases(phrases);
      
      // Carrega progresso da categoria
      const categoryProgress = progress?.sentenceBuilder?.[selectedCategory];
      const completedPhrasesInCategory = categoryProgress?.completedPhrases || [];
      
      // Encontra a primeira frase não completada
      const firstIncompleteIndex = phrases.findIndex(
        phrase => !completedPhrasesInCategory.includes(phrase.id)
      );
      
      const startIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
      setCurrentIndex(startIndex);
      setCompletedInSession([]);
      setUserSentence([]);
      setShowFeedback(false);
      setShowPhraseCard(false);
      setCurrentPhrase(null);
      setPronunciationCompleted(false);
    }
  }, [selectedCategory, progress?.sentenceBuilder]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    trackUserAction('sentence_builder_category_selected', { categoryId });
  };

  const handleWordClick = (word) => {
    if (showFeedback) return;
    
    // Toca o áudio da palavra
    textToSpeech.speak(word);
    
    const newSentence = [...userSentence, word];
    setUserSentence(newSentence);
    
    trackUserAction('sentence_builder_word_clicked', {
      word,
      exerciseIndex: currentIndex,
      category: selectedCategory
    });
  };

  const handleRemoveWord = (index) => {
    if (showFeedback) return;
    const newSentence = userSentence.filter((_, i) => i !== index);
    setUserSentence(newSentence);
    
    trackUserAction('sentence_builder_word_removed', {
      exerciseIndex: currentIndex,
      category: selectedCategory
    });
  };

  const getCorrectOrder = (phrase) => {
    // Remove pontuação e divide em palavras
    return phrase.english
      .replace(/[.,!?;:]/g, '')
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.trim());
  };

  const getShuffledWords = (phrase) => {
    const words = getCorrectOrder(phrase);
    // Embaralha as palavras usando Fisher-Yates
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const checkAnswer = () => {
    const currentPhraseData = categoryPhrases[currentIndex];
    if (!currentPhraseData) return;

    const correctOrder = getCorrectOrder(currentPhraseData);
    const correct = JSON.stringify(userSentence) === JSON.stringify(correctOrder);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setStreak(streak + 1);
      
      // Criar objeto phrase para o PhraseCard
      const phrase = {
        id: currentPhraseData.id,
        text: currentPhraseData.english,
        translation: currentPhraseData.portuguese,
        category: 'sentence-builder',
        difficulty: selectedCategory,
        index: currentIndex
      };
      
      setCurrentPhrase(phrase);
      setShowPhraseCard(true);
      
      // Ganhar XP
      earnXP('sentence_builder', {
        category: selectedCategory,
        exerciseIndex: currentIndex,
        streak: streak + 1
      });
      
      // Track analytics
      trackExerciseComplete('sentence_builder', 100, 0, {
        category: selectedCategory,
        exerciseIndex: currentIndex,
        streak: streak + 1
      });
      
      dispatch(incrementPhraseCompleted());
    } else {
      setStreak(0);
      
      trackExerciseComplete('sentence_builder', 0, 0, {
        category: selectedCategory,
        exerciseIndex: currentIndex,
        userAnswer: userSentence.join(' '),
        correctAnswer: correctOrder.join(' ')
      });
    }
  };

  const handlePhraseCardComplete = () => {
    setPronunciationCompleted(true);
    trackUserAction('sentence_builder_pronunciation_completed', {
      exerciseIndex: currentIndex,
      category: selectedCategory
    });
  };

  const handlePhraseCardNext = () => {
    // Marcar frase como completa
    const currentPhraseData = categoryPhrases[currentIndex];
    if (currentPhraseData) {
      dispatch(markPhraseCompleted({
        phraseId: currentPhraseData.id,
        phraseIndex: currentIndex
      }));
      
      // Salvar progresso específico do sentence builder
      dispatch(markSentenceBuilderPhraseCompleted({
        categoryId: selectedCategory,
        phraseId: currentPhraseData.id,
        currentIndex: currentIndex
      }));
      
      if (mode === 'authenticated' && userId) {
        setTimeout(() => {
          dispatch(saveProgress());
        }, 500);
      }
      
      setCompletedInSession([...completedInSession, currentPhraseData.id]);
    }
    
    // Avançar para próximo exercício
    nextExercise();
  };

  const nextExercise = () => {
    // Resetar estados relacionados ao PhraseCard
    setShowPhraseCard(false);
    setCurrentPhrase(null);
    setPronunciationCompleted(false);
    setUserSentence([]);
    setShowFeedback(false);
    setShowHint(false);
    setShuffledWords([]);
    
    if (currentIndex < categoryPhrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reinicia do começo quando acabar
      setCurrentIndex(0);
    }
  };

  const reset = () => {
    setUserSentence([]);
    setShowFeedback(false);
    setShowHint(false);
    setShowPhraseCard(false);
    setCurrentPhrase(null);
    setPronunciationCompleted(false);
    // Re-embaralhar palavras ao resetar
    if (currentPhraseData) {
      setShuffledWords(getShuffledWords(currentPhraseData));
    }
    
    trackUserAction('sentence_builder_reset', {
      exerciseIndex: currentIndex,
      category: selectedCategory
    });
  };

  // Calcula estatísticas da categoria
  const getCategoryStats = (categoryId) => {
    const phrases = builderPhrasesData.phrases[categoryId] || [];
    const total = phrases.length;
    
    const categoryProgress = progress?.sentenceBuilder?.[categoryId];
    const completedPhrasesInCategory = categoryProgress?.completedPhrases || [];
    
    const completedCount = completedPhrasesInCategory.length;

    return {
      total,
      completed: completedCount,
      percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0
    };
  };

  const currentPhraseData = categoryPhrases[currentIndex];
  
  // Memoizar palavras embaralhadas para evitar re-embaralhamento a cada render
  const [shuffledWords, setShuffledWords] = useState([]);
  
  useEffect(() => {
    if (currentPhraseData) {
      setShuffledWords(getShuffledWords(currentPhraseData));
    }
  }, [currentPhraseData?.id]);
  
  const availableWords = currentPhraseData 
    ? shuffledWords.filter(
        word => {
          const wordCountInSentence = userSentence.filter(w => w === word).length;
          const wordCountInShuffled = shuffledWords.filter(w => w === word).length;
          return wordCountInSentence < wordCountInShuffled;
        }
      )
    : [];

  const correctOrder = currentPhraseData ? getCorrectOrder(currentPhraseData) : [];

  // Track quando o componente é montado
  useEffect(() => {
    trackUserAction('sentence_builder_opened', {});
  }, []);

  // Tela de seleção de categoria
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-4 shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              🎯 Sentence Builder
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a word count and build sentences!
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORD_COUNT_CATEGORIES.map((category) => {
              const stats = getCategoryStats(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left group hover:scale-105"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-br ${category.color} p-4 rounded-xl shadow-md`}>
                      <span className="text-2xl font-bold text-white">{category.count}</span>
                    </div>
                    <span className="text-3xl">{category.emoji}</span>
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {category.name}
                  </h3>

                  {/* Estatísticas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-bold text-gray-800">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {stats.percentage}% Complete
                      </span>
                      {stats.percentage === 100 && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Tela de exercício
  if (!currentPhraseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading phrases...</p>
        </div>
      </div>
    );
  }

  const categoryInfo = WORD_COUNT_CATEGORIES.find(cat => cat.id === selectedCategory);
  const stats = getCategoryStats(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentIndex(0);
                  setUserSentence([]);
                  setShowFeedback(false);
                  setShowPhraseCard(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                tabIndex={0}
                aria-label="Voltar para seleção de categorias"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  🎯 Sentence Builder
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  {categoryInfo?.name} - {stats.completed}/{stats.total} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {streak > 0 && (
                <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg">
                  <Zap className="text-orange-500" size={20} />
                  <span className="text-orange-700 font-semibold text-sm md:text-base">
                    {streak} 🔥
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full w-fit">
                Phrase {currentIndex + 1} of {categoryPhrases.length}
              </span>
              <button
                onClick={() => {
                  setShowHint(!showHint);
                  if (!showHint) {
                    trackUserAction('sentence_builder_hint_shown', {
                      exerciseIndex: currentIndex
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
            <p className="text-lg md:text-xl text-gray-700 italic">"{currentPhraseData.portuguese}"</p>
            {currentPhraseData.context && (
              <p className="text-sm text-gray-500 mt-2">Context: {currentPhraseData.context}</p>
            )}
          </div>

          {/* Hint */}
          {showHint && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-amber-800 flex items-start gap-2 text-sm md:text-base">
                <Lightbulb size={20} className="mt-0.5 flex-shrink-0" />
                <span><strong>Dica:</strong> A frase tem {categoryInfo?.count} palavras. Organize-as na ordem correta!</span>
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
                        <strong>Resposta correta:</strong> {correctOrder.join(' ')}
                      </p>
                      <p className="text-red-700 mb-2 text-sm md:text-base">
                        <strong>Sua resposta:</strong> {userSentence.join(' ')}
                      </p>
                    </>
                  )}
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
                  disabled={userSentence.length !== correctOrder.length}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && userSentence.length === correctOrder.length) {
                      e.preventDefault();
                      checkAnswer();
                    }
                  }}
                  tabIndex={userSentence.length === correctOrder.length ? 0 : -1}
                  aria-label="Verificar resposta"
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${
                    userSentence.length === correctOrder.length
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
                  aria-label="Próximo exercício"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm md:text-base"
                >
                  Próximo Exercício →
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
                Complete a pronúncia e clique em "Next" para avançar
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
                  onClick={handlePhraseCardNext}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePhraseCardNext();
                    }
                  }}
                  tabIndex={0}
                  aria-label="Próximo exercício"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm md:text-base"
                >
                  Próximo Exercício →
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
              className={`h-full bg-gradient-to-r ${categoryInfo?.color} rounded-full transition-all duration-500`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {stats.completed} de {stats.total} frases completadas ({stats.percentage}%)
          </p>
          {completedInSession.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              🎉 {completedInSession.length} frase{completedInSession.length > 1 ? 's' : ''} completada{completedInSession.length > 1 ? 's' : ''} nesta sessão!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceBuilder;
