import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Briefcase, ShoppingBag, Plane, Users, Home, ArrowLeft, Play, Trophy, Target, Code, Activity, FileText, Mic } from 'lucide-react';
import { PhraseCard } from './PhraseCard';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseRepository } from '../../services/phraseRepository';
import {
  markPhraseCompleted,
  markCategoryPhraseCompleted,
  incrementPhraseCompleted,
  saveProgress,
  updateChunkProgress
} from '../../store/slices/userSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import GuidedTourOverlay from '../ui/GuidedTourOverlay';

const CATEGORIES = [
  {
    id: 'daily_basics',
    name: 'Daily Basics',
    icon: Home,
    color: 'from-blue-500 to-indigo-600',
    description: 'Essential everyday phrases',
    emoji: '🏠'
  },
  {
    id: 'travel_survival',
    name: 'Travel Survival',
    icon: Plane,
    color: 'from-purple-500 to-pink-600',
    description: 'Phrases for travelers',
    emoji: '✈️'
  },
  {
    id: 'professional_english',
    name: 'Work & Professional',
    icon: Briefcase,
    color: 'from-green-500 to-teal-600',
    description: 'Business communication',
    emoji: '💼'
  },
  {
    id: 'shopping_money',
    name: 'Shopping & Money',
    icon: ShoppingBag,
    color: 'from-yellow-500 to-orange-600',
    description: 'Shopping and payments',
    emoji: '🛍️'
  },
  {
    id: 'social_english',
    name: 'Social English',
    icon: Users,
    color: 'from-red-500 to-rose-600',
    description: 'Casual conversations',
    emoji: '👥'
  },
{
    id: 'tech_interview',
    name: 'Tech Interview',
    icon: Code,
    color: 'from-cyan-500 to-blue-600',
    description: 'Tech Interview - Fullstack Developer',
    emoji: '💻'
  },
{
  id: 'clinical_research',
  name: 'Clinical Research',
  icon: Activity, // ou FileText
  color: 'from-teal-500 to-emerald-600',
  description: 'Clinical trials and research',
  emoji: '🔬'
},
{
  id: 'speak_phrases',
  name: 'Speak Phrases',
  icon: Mic,
  color: 'from-purple-500 to-pink-600',
  description: 'Practice phrases specialized in pronunciation training',
  emoji: '🎤'
}
];

const TOUR_STORAGE_KEY = 'learnfun_daily_basics_tour_v1';

const CategoryTrainer = ({ autoSelectCategory = null }) => {
  const dispatch = useDispatch();
  const { levelSystem, progress, userId, mode } = useSelector(state => state.user);
  const textToSpeech = useTextToSpeech();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allPhrases, setAllPhrases] = useState([]);
  const [categoryPhrases, setCategoryPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedInSession, setCompletedInSession] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourSpeakCompleted, setTourSpeakCompleted] = useState(false);
  const tourInitializedRef = useRef(false);

  // Seleciona categoria automaticamente quando indicado (onboarding)
  useEffect(() => {
    if (!autoSelectCategory) return;

    const categoryExists = CATEGORIES.some(cat => cat.id === autoSelectCategory);
    if (!categoryExists) return;

    if (selectedCategory !== autoSelectCategory) {
      setSelectedCategory(autoSelectCategory);
    }
  }, [autoSelectCategory, selectedCategory]);

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
      // Se for "speak_phrases", mostra todas as frases; senão, filtra por categoria
      const filtered = selectedCategory === 'speak_phrases' 
        ? allPhrases 
        : allPhrases.filter(p => p.category === selectedCategory);
      setCategoryPhrases(filtered);
      
      // Para "speak_phrases", usa progresso do chunkTrainer; para outras categorias, usa progresso específico
      let completedPhrasesInCategory;
      let startIndex = 0;
      
      if (selectedCategory === 'speak_phrases') {
        // Para speak_phrases, usa o progresso do chunkTrainer (que era usado antes)
        const chunkProgress = progress?.chunkTrainer;
        const chunkCurrentIndex = chunkProgress?.currentIndex || 0;
        // completedPhrases no chunkTrainer contém índices, não IDs
        const completedIndices = chunkProgress?.completedPhrases || [];
        
        // Usa o currentIndex do chunkTrainer, mas garante que não seja maior que o tamanho
        if (chunkCurrentIndex >= 0 && chunkCurrentIndex < filtered.length) {
          startIndex = chunkCurrentIndex;
        } else if (chunkCurrentIndex >= filtered.length) {
          // Se o índice salvo for maior que o tamanho, volta para o final
          startIndex = Math.max(0, filtered.length - 1);
        } else {
          // Se não houver índice válido, encontra a primeira não completada
          const firstIncompleteIndex = filtered.findIndex(
            (phrase, index) => !completedIndices.includes(index)
          );
          startIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
        }
      } else {
        // Carrega progresso da categoria do Redux (só quando categoria muda)
        const categoryProgress = progress?.categories?.[selectedCategory];
        completedPhrasesInCategory = categoryProgress?.completedPhrases || [];
        const savedLastIndex = categoryProgress?.lastIndex || 0;
        
        // Encontra a primeira frase não completada nesta categoria
        const firstIncompleteIndex = filtered.findIndex(
          phrase => !completedPhrasesInCategory.includes(phrase.id)
        );
        
        // Decide o índice inicial
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
    // IMPORTANTE: Não incluir progress?.categories nem progress?.chunkTrainer?.currentIndex nas dependências
    // para evitar que o índice seja recalculado quando uma frase é completada (causaria avanço automático)
    // O índice é definido apenas quando a categoria muda ou quando as frases são carregadas
  }, [selectedCategory, allPhrases]);

  useEffect(() => {
    if (
      !selectedCategory ||
      selectedCategory !== 'daily_basics' ||
      !categoryPhrases.length ||
      currentIndex >= categoryPhrases.length ||
      mode !== 'guest'
    ) {
      return;
    }

    if (typeof window === 'undefined' || tourInitializedRef.current) {
      return;
    }

    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!stored) {
      tourInitializedRef.current = true;
      setTourStep(0);
      setTourSpeakCompleted(false);
      setShowTour(true);
    } else {
      tourInitializedRef.current = true;
    }
  }, [selectedCategory, categoryPhrases, currentIndex, mode]);

  const tourSteps = useMemo(() => {
    const baseSteps = [
      {
        id: 'intro',
        title: 'Tour guiado Daily Basics',
        description: 'Vamos passar rapidamente por cada parte da prática para você aproveitar ao máximo.',
        targetId: null,
        primaryLabel: 'Começar'
      },
      {
        id: 'phrase',
        title: 'Frase em inglês',
        description: 'Esta é a frase que você vai praticar agora. Leia com atenção para se preparar.',
        targetId: 'tour-phrase-text'
      },
      {
        id: 'translation',
        title: 'Tradução em português',
        description: 'Aqui você vê o significado em português para conectar ideias e contexto.',
        targetId: 'tour-phrase-translation'
      },
      {
        id: 'ipa',
        title: 'Pronúncia com IPA',
        description: 'O IPA detalha cada som da frase. Use-o para ajustar pronúncias que ainda soam estranhas.',
        targetId: 'tour-ipa'
      },
      {
        id: 'speak',
        title: tourSpeakCompleted ? 'Veja o painel de feedback' : 'Hora de praticar',
        description: tourSpeakCompleted
          ? 'Aqui você enxerga o resultado geral da sua prática com tudo que precisa para melhorar.'
          : 'Toque em Speak, repita a frase "Hello" e depois vamos analisar o feedback juntos.',
        targetId: tourSpeakCompleted ? 'tour-feedback-area' : 'tour-speak-button'
      }
    ];

    if (tourSpeakCompleted) {
      baseSteps.push(
        {
          id: 'feedback-you-said',
          title: 'Entenda o "You said"',
          description: 'Mostra exatamente o que o reconhecimento de voz captou da sua fala em inglês. Compare para ver se foi interpretado corretamente.',
          targetId: 'tour-feedback-summary'
        },
        {
          id: 'feedback-accuracy',
          title: 'Precisão com o "Accuracy"',
          description: 'Indica o quão perto você chegou da frase original. Quanto mais próximo de 100%, mais fiel foi a pronúncia.',
          targetId: 'tour-feedback-accuracy'
        },
        {
          id: 'feedback-word',
          title: 'Word-by-Word Analysis',
          description: 'Analisa cada palavra e aponta diferenças de pronúncia entre o que você falou e a frase original para ajustar detalhes.',
          targetId: 'tour-feedback-word'
        },
        {
          id: 'feedback-next',
          title: 'Avance para a próxima frase',
          description: 'Toque em “Next” para seguir para a próxima frase e continuar praticando com o mesmo foco.',
          targetId: 'tour-next-button'
        }
      );
    }

    return baseSteps;
  }, [tourSpeakCompleted]);

  const handleTourFinish = (status = 'completed') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, status);
    }
    setShowTour(false);
    setTourStep(0);
    setTourSpeakCompleted(false);
  };

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
      return;
    }

    if (tourSpeakCompleted) {
      handleTourFinish('completed');
    }
  };

  const handleTourPrev = () => {
    if (tourStep === 0) return;
    setTourStep(prev => Math.max(prev - 1, 0));
  };

  const handleTourSkip = () => {
    handleTourFinish('skipped');
  };

  const handleTourFeedbackVisible = () => {
    if (showTour) {
      setTourSpeakCompleted(true);
    }
  };

  const tourNextDisabled = tourStep === tourSteps.length - 1 && !tourSpeakCompleted;

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

    // Marca como completa no sistema global
    dispatch(markPhraseCompleted({
      phraseId: currentPhrase.id,
      phraseIndex: currentIndex
    }));

    // Para "speak_phrases", atualiza o chunkTrainer; para outras categorias, atualiza o progresso da categoria
    if (selectedCategory === 'speak_phrases') {
      // Atualiza o progresso do chunkTrainer
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
      // Marca como completa no progresso da categoria
      dispatch(markCategoryPhraseCompleted({
        categoryId: selectedCategory,
        phraseId: currentPhrase.id,
        currentIndex: currentIndex
      }));
    }

    dispatch(incrementPhraseCompleted());

    // Adiciona à lista de completadas nesta sessão
    setCompletedInSession([...completedInSession, currentPhrase.id]);

    // Salva progresso no Firebase (aguarda um pouco mais para garantir que o Redux atualizou)
    if (mode === 'authenticated' && userId) {
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
      // Reinicia do começo quando acabar
      newIndex = 0;
    }
    
    setCurrentIndex(newIndex);
    
    // Para "speak_phrases", atualiza o chunkTrainer.currentIndex
    if (selectedCategory === 'speak_phrases') {
      const chunkProgress = progress?.chunkTrainer || {};
      const completedPhrases = chunkProgress.completedPhrases || [];
      
      dispatch(updateChunkProgress({
        currentIndex: newIndex,
        completedPhrases: completedPhrases
      }));
      
      // Salva progresso no Firebase
      if (mode === 'authenticated' && userId) {
        setTimeout(() => {
          dispatch(saveProgress());
        }, 500);
      }
    }
  };

  // Calcula estatísticas da categoria
  const getCategoryStats = (categoryId) => {
    // Se for "speak_phrases", conta todas as frases; senão, filtra por categoria
    const categoryPhrasesCount = categoryId === 'speak_phrases'
      ? allPhrases.length
      : allPhrases.filter(p => p.category === categoryId).length;
    
    let completedCount;
    if (categoryId === 'speak_phrases') {
      // Para speak_phrases, usa o chunkTrainer.completedPhrases (que contém índices)
      const chunkProgress = progress?.chunkTrainer || {};
      const completedIndices = chunkProgress.completedPhrases || [];
      completedCount = completedIndices.length;
    } else {
      // Usa progresso específico da categoria se disponível, senão usa global
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
          <p className="text-gray-600 text-lg">Loading categories...</p>
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
              Practice by Category
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a topic and master essential phrases!
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
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-bold text-gray-800">
                        {stats.completed}/{stats.total} phrases
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
                    Start Practicing
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="mt-12 bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">
              💡 <strong>Tip:</strong> Each category contains real-world phrases you can use immediately.
              Practice daily for best results!
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
          <p className="text-gray-600 text-lg">No phrases available for this category</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <LevelIndicator variant="full" />
        {/* Header com categoria e progresso */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Categories
          </button>

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
                <span>Phrase {currentIndex + 1} of {categoryPhrases.length}</span>
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
                🎉 {completedInSession.length} phrase{completedInSession.length > 1 ? 's' : ''} completed this session!
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
          tourActive={showTour}
          tourStep={tourStep}
          onTourFeedbackVisible={handleTourFeedbackVisible}
        />
      </div>

      {showTour && (
        <GuidedTourOverlay
          visible={showTour}
          steps={tourSteps}
          currentStep={tourStep}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={handleTourSkip}
          onFinish={() => handleTourFinish('completed')}
          isNextDisabled={tourNextDisabled}
        />
      )}
    </div>
  );
};

export default CategoryTrainer;