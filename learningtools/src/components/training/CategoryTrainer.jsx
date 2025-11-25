import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Briefcase, ShoppingBag, Plane, Users, Home, ArrowLeft, Play, Trophy, Target, Code, Activity, FileText, Mic, HelpCircle, Clock } from 'lucide-react';
import { PhraseCard } from './PhraseCard';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseRepository } from '../../services/phraseRepository';
import {
  markPhraseCompleted,
  markCategoryPhraseCompleted,
  incrementPhraseCompleted,
  saveProgress,
  updateChunkProgress,
  updateLastActivity
} from '../../store/slices/userSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import GuidedTourOverlay from '../ui/GuidedTourOverlay';
import LexySpeakingOnboarding from '../ui/LexySpeakingOnboarding';
import { useUILanguage } from '../../context/LanguageContext.jsx';
import { translateUI } from '../../i18n/uiTranslations.js';

const TOUR_STORAGE_KEY = 'learnfun_daily_basics_tour_v1';

const CategoryTrainer = ({ autoSelectCategory = null }) => {
  const dispatch = useDispatch();
  const { levelSystem, progress, userId, mode } = useSelector(state => state.user);
  const textToSpeech = useTextToSpeech();
  const { language } = useUILanguage();

  // Função para obter categorias traduzidas
  const getCategories = () => [
    {
      id: 'daily_basics',
      name: translateUI(language, 'categoryTrainer.dailyBasics'),
      icon: Home,
      color: 'from-blue-500 to-indigo-600',
      description: translateUI(language, 'categoryTrainer.dailyBasicsDesc'),
      emoji: '🏠'
    },
    {
      id: 'travel_survival',
      name: translateUI(language, 'categoryTrainer.travelSurvival'),
      icon: Plane,
      color: 'from-purple-500 to-pink-600',
      description: translateUI(language, 'categoryTrainer.travelSurvivalDesc'),
      emoji: '✈️'
    },
    {
      id: 'professional_english',
      name: translateUI(language, 'categoryTrainer.workProfessional'),
      icon: Briefcase,
      color: 'from-green-500 to-teal-600',
      description: translateUI(language, 'categoryTrainer.workProfessionalDesc'),
      emoji: '💼'
    },
    {
      id: 'shopping_money',
      name: translateUI(language, 'categoryTrainer.shoppingMoney'),
      icon: ShoppingBag,
      color: 'from-yellow-500 to-orange-600',
      description: translateUI(language, 'categoryTrainer.shoppingMoneyDesc'),
      emoji: '🛍️'
    },
    {
      id: 'social_english',
      name: translateUI(language, 'categoryTrainer.socialEnglish'),
      icon: Users,
      color: 'from-red-500 to-rose-600',
      description: translateUI(language, 'categoryTrainer.socialEnglishDesc'),
      emoji: '👥'
    },
    {
      id: 'tech_interview',
      name: translateUI(language, 'categoryTrainer.techInterview'),
      icon: Code,
      color: 'from-cyan-500 to-blue-600',
      description: translateUI(language, 'categoryTrainer.techInterviewDesc'),
      emoji: '💻'
    },
    {
      id: 'clinical_research',
      name: translateUI(language, 'categoryTrainer.clinicalResearch'),
      icon: Activity,
      color: 'from-teal-500 to-emerald-600',
      description: translateUI(language, 'categoryTrainer.clinicalResearchDesc'),
      emoji: '🔬'
    },
    {
      id: 'speak_phrases',
      name: translateUI(language, 'categoryTrainer.speakPhrases'),
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      description: translateUI(language, 'categoryTrainer.speakPhrasesDesc'),
      emoji: '🎤'
    },
    {
      id: 'essential_survival',
      name: translateUI(language, 'categoryTrainer.essentialQuestions'),
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-600',
      description: translateUI(language, 'categoryTrainer.essentialQuestionsDesc'),
      emoji: '❓'
    },
    {
      id: 'verb_tenses',
      name: translateUI(language, 'categoryTrainer.verbTenses'),
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      description: translateUI(language, 'categoryTrainer.verbTensesDesc'),
      emoji: '⏰'
    }
  ];

  const CATEGORIES = useMemo(() => getCategories(), [language]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allPhrases, setAllPhrases] = useState([]);
  const [categoryPhrases, setCategoryPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedInSession, setCompletedInSession] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLexyOnboarding, setShowLexyOnboarding] = useState(false);
  const [lexyMoment, setLexyMoment] = useState('intro'); // 'intro' | 'instruction' | 'speak' | 'waiting' | 'feedback' | 'next'
  const [userAccuracy, setUserAccuracy] = useState(0);
  const lexyInitializedRef = useRef(false);

  // Seleciona categoria automaticamente quando indicado (onboarding)
  useEffect(() => {
    if (!autoSelectCategory) return;

    const categoryExists = CATEGORIES.some(cat => cat.id === autoSelectCategory);
    if (!categoryExists) return;

    if (selectedCategory !== autoSelectCategory) {
      setSelectedCategory(autoSelectCategory);
    }
  }, [autoSelectCategory, selectedCategory, CATEGORIES]);

  // Carrega todas as frases
  useEffect(() => {
    const loadPhrases = async () => {
      try {
        const phrases = await PhraseRepository.fetchPhrases();
        setAllPhrases(phrases);
        setLoading(false);
      } catch (error) {
        console.error('Error loading phrases:', error);
        setLoading(false);
      }
    };
    loadPhrases();
  }, []);

  // Filtra frases quando categoria é selecionada
  useEffect(() => {
    if (selectedCategory && allPhrases.length > 0) {
      const filtered = selectedCategory === 'speak_phrases'
        ? allPhrases
        : allPhrases.filter(p => p.category === selectedCategory);
      setCategoryPhrases(filtered);

      let completedPhrasesInCategory;
      let startIndex = 0;

      if (selectedCategory === 'speak_phrases') {
        const chunkProgress = progress?.chunkTrainer;
        const chunkCurrentIndex = chunkProgress?.currentIndex || 0;
        const completedIndices = chunkProgress?.completedPhrases || [];

        if (chunkCurrentIndex >= 0 && chunkCurrentIndex < filtered.length) {
          startIndex = chunkCurrentIndex;
        } else if (chunkCurrentIndex >= filtered.length) {
          startIndex = Math.max(0, filtered.length - 1);
        } else {
          const firstIncompleteIndex = filtered.findIndex(
            (phrase, index) => !completedIndices.includes(index)
          );
          startIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
        }
      } else {
        const categoryProgress = progress?.categories?.[selectedCategory];
        completedPhrasesInCategory = categoryProgress?.completedPhrases || [];
        const savedLastIndex = categoryProgress?.lastIndex || 0;

        const firstIncompleteIndex = filtered.findIndex(
          phrase => !completedPhrasesInCategory.includes(phrase.id)
        );

        if (savedLastIndex >= 0 && savedLastIndex < filtered.length) {
          const phraseAtLastIndex = filtered[savedLastIndex];
          if (phraseAtLastIndex && !completedPhrasesInCategory.includes(phraseAtLastIndex.id)) {
            startIndex = savedLastIndex;
          } else if (firstIncompleteIndex !== -1) {
            startIndex = firstIncompleteIndex;
          } else {
            startIndex = 0;
          }
        } else if (firstIncompleteIndex !== -1) {
          startIndex = firstIncompleteIndex;
        } else {
          startIndex = 0;
        }
      }

      setCurrentIndex(startIndex);
      setCompletedInSession([]);
    }
  }, [selectedCategory, allPhrases]);

  useEffect(() => {
    if (
      !selectedCategory ||
      selectedCategory !== 'daily_basics' ||
      !categoryPhrases.length ||
      currentIndex !== 0 || // ⚠️ MUDANÇA CRÍTICA: só mostra na primeira frase
      mode !== 'guest'
    ) {
      return;
    }

    if (typeof window === 'undefined' || lexyInitializedRef.current) {
      return;
    }

    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!stored) {
      lexyInitializedRef.current = true;
      setLexyMoment('intro');
      setUserAccuracy(0);
      setShowLexyOnboarding(true);
    } else {
      lexyInitializedRef.current = true;
    }
  }, [selectedCategory, categoryPhrases, currentIndex, mode]);

useEffect(() => {
  // ⚠️ ADICIONAR ESTE EFEITO
  if (mode === 'guest' && selectedCategory !== 'daily_basics') {
    setSelectedCategory('daily_basics');
  }
}, [mode, selectedCategory]);



  const handleLexyMomentComplete = (nextMoment) => {
    console.log(`🦊 Lexy completou momento: ${lexyMoment} → ${nextMoment}`);
    setLexyMoment(nextMoment);
  };

  const handleLexySkip = () => {
    console.log('⏭️ Usuário pulou onboarding');
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'skipped');
    }
    setShowLexyOnboarding(false);
    setLexyMoment('intro');
    setUserAccuracy(0);
  };

  const handleLexyFinish = () => {
    console.log('✅ Onboarding concluído');
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'completed');
    }
    setShowLexyOnboarding(false);
    setLexyMoment('intro');
    setUserAccuracy(0);
  };

  const handleUserSpeakComplete = (accuracy) => {
    console.log(`🎤 Usuário completou ação com ${accuracy}% de acurácia`);
    setUserAccuracy(accuracy);

    // Se estava no momento 'listen', avança para 'speak'
    if (lexyMoment === 'listen') {
      setLexyMoment('speak');
    } else {
      // Se estava em 'waiting', avança para 'feedback'
      setLexyMoment('feedback');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setCurrentIndex(0);
    setCompletedInSession([]);
  };

  const handleCorrectAnswer = () => {
    const currentPhrase = categoryPhrases[currentIndex];

    dispatch(markPhraseCompleted({
      phraseId: currentPhrase.id,
      phraseIndex: currentIndex
    }));

    if (selectedCategory === 'speak_phrases') {
      const chunkProgress = progress?.chunkTrainer || {};
      const completedPhrases = chunkProgress.completedPhrases || [];
      const updatedCompletedPhrases = completedPhrases.includes(currentIndex)
        ? completedPhrases
        : [...completedPhrases, currentIndex];

      dispatch(updateChunkProgress({
        currentIndex: currentIndex,
        completedPhrases: updatedCompletedPhrases
      }));
    } else {
      dispatch(markCategoryPhraseCompleted({
        categoryId: selectedCategory,
        phraseId: currentPhrase.id,
        currentIndex: currentIndex
      }));
    }

    dispatch(incrementPhraseCompleted());
    setCompletedInSession([...completedInSession, currentPhrase.id]);

    // Update last activity
    if (mode === 'authenticated' && userId) {
      const categoryName = CATEGORIES.find(cat => cat.id === selectedCategory)?.name || selectedCategory;

      dispatch(updateLastActivity({
        trainerType: 'categories',
        mode: 'phrases',
        categoryId: selectedCategory,
        phraseId: currentPhrase.id,
        phraseIndex: currentIndex,
        resumeUrl: `/?mode=categories&category=${selectedCategory}`,
        displayText: `${categoryName} - Phrase ${currentIndex + 1}`
      }));

      setTimeout(() => {
        dispatch(saveProgress());
        console.log('💾 Progresso de categoria salvo:', selectedCategory, currentPhrase.id);
      }, 1000);
    }
  };

  const handleNextPhrase = () => {
    let newIndex;
    if (currentIndex < categoryPhrases.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      newIndex = 0;
    }

    setCurrentIndex(newIndex);

    if (selectedCategory === 'speak_phrases') {
      const chunkProgress = progress?.chunkTrainer || {};
      const completedPhrases = chunkProgress.completedPhrases || [];

      dispatch(updateChunkProgress({
        currentIndex: newIndex,
        completedPhrases: completedPhrases
      }));

      if (mode === 'authenticated' && userId) {
        setTimeout(() => {
          dispatch(saveProgress());
        }, 500);
      }
    }
  };

  const getCategoryStats = (categoryId) => {
    const categoryPhrasesCount = categoryId === 'speak_phrases'
      ? allPhrases.length
      : allPhrases.filter(p => p.category === categoryId).length;

    let completedCount;
    if (categoryId === 'speak_phrases') {
      const chunkProgress = progress?.chunkTrainer || {};
      const completedIndices = chunkProgress.completedPhrases || [];
      completedCount = completedIndices.length;
    } else {
      const categoryProgress = progress?.categories?.[categoryId];
      const completedPhrasesInCategory = categoryProgress?.completedPhrases || [];

      completedCount = completedPhrasesInCategory.length > 0
        ? completedPhrasesInCategory.length
        : allPhrases.filter(p =>
            p.category === categoryId &&
            levelSystem?.globalCompletedPhrases?.includes(p.id)
          ).length;
    }

    return {
      total: categoryPhrasesCount,
      completed: completedCount,
      percentage: categoryPhrasesCount > 0 ? Math.round((completedCount / categoryPhrasesCount) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{translateUI(language, 'categoryTrainer.loadingCategories')}</p>
        </div>
      </div>
    );
  }

  // Tela de seleção de categoria
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {translateUI(language, 'categoryTrainer.practiceByCategory')}
            </h1>
            <p className="text-gray-600 text-lg">
              {translateUI(language, 'categoryTrainer.chooseTopicMaster')}
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map((category) => {
              const stats = getCategoryStats(category.id);
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left group hover:scale-105"
                >
                  {/* Header com ícone e emoji */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${category.color} p-4 rounded-xl shadow-md`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-4xl">{category.emoji}</span>
                  </div>

                  {/* Título e descrição */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>

                  {/* Estatísticas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{translateUI(language, 'categoryTrainer.progress')}</span>
                      <span className="font-bold text-gray-800">
                        {stats.completed}/{stats.total} {translateUI(language, 'categoryTrainer.phrases')}
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
                        {stats.percentage}% {translateUI(language, 'categoryTrainer.complete')}
                      </span>
                      {stats.percentage === 100 && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    <Play className="w-5 h-5 mr-2" />
                    {translateUI(language, 'categoryTrainer.startPracticing')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="mt-12 bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">
              💡 <strong>{translateUI(language, 'categoryTrainer.tipTitle')}</strong> {translateUI(language, 'categoryTrainer.tipText')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de prática
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const currentPhrase = categoryPhrases[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / categoryPhrases.length) * 100);

  if (!currentPhrase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">{translateUI(language, 'categoryTrainer.noPhrasesAvailable')}</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            {translateUI(language, 'categoryTrainer.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // Calcula plural para "frases completadas"
  const getCompletedText = () => {
    const count = completedInSession.length;
    const pluralSuffix = language === 'en-US'
      ? (count > 1 ? 's' : '')
      : (count > 1 ? 's' : '');

    return translateUI(language, 'categoryTrainer.completedThisSession', {
      count,
      plural: pluralSuffix
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <LevelIndicator variant="full" />
        {/* Header com categoria e progresso */}
        <div className="mb-6">
            {mode !== 'guest' && (
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {translateUI(language, 'categoryTrainer.backToCategories')}
          </button>
           )}

          <div className={`bg-gradient-to-r ${currentCategory.color} rounded-xl p-6 shadow-lg text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentCategory.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
                  <p className="text-white/90">{currentCategory.description}</p>
                </div>
              </div>
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {translateUI(language, 'categoryTrainer.phraseOf', {
                    current: currentIndex + 1,
                    total: categoryPhrases.length
                  })}
                </span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completadas nesta sessão */}
            {completedInSession.length > 0 && (
              <div className="mt-3 text-sm">
                🎉 {getCompletedText()}
              </div>
            )}
          </div>
        </div>

        {/* Card da frase */}
        <PhraseCard
          key={`${selectedCategory}-${currentPhrase.id}`}
          phrase={currentPhrase}
          onSpeak={textToSpeech.speak2}
          textToSpeech={textToSpeech}
          onCorrectAnswer={handleCorrectAnswer}
          onNextPhrase={handleNextPhrase}
          isActive={true}
          autoAdvance={false}
          lexyOnboardingActive={showLexyOnboarding}
          lexyMoment={lexyMoment}
          onUserSpeakComplete={handleUserSpeakComplete}
        />
      </div>

      {showLexyOnboarding && (
        <LexySpeakingOnboarding
          visible={showLexyOnboarding}
          moment={lexyMoment}
          userAccuracy={userAccuracy}
          onMomentComplete={handleLexyMomentComplete}
          onSkip={handleLexySkip}
          onFinish={handleLexyFinish}
        />
      )}
    </div>
  );
};

export default CategoryTrainer;