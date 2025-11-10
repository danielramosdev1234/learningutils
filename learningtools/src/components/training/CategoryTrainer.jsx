import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Briefcase, ShoppingBag, Plane, Users, Home, ArrowLeft, Play, Trophy, Target, Code } from 'lucide-react';
import { PhraseCard } from './PhraseCard';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseRepository } from '../../services/phraseRepository';
import {
  markPhraseCompleted,
  incrementPhraseCompleted,
  saveProgress
} from '../../store/slices/userSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';

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
  }
];

const CategoryTrainer = () => {
  const dispatch = useDispatch();
  const { levelSystem } = useSelector(state => state.user);
  const textToSpeech = useTextToSpeech();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allPhrases, setAllPhrases] = useState([]);
  const [categoryPhrases, setCategoryPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedInSession, setCompletedInSession] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const filtered = allPhrases.filter(p => p.category === selectedCategory);

      setCategoryPhrases(filtered);
      setCurrentIndex(0);
      setCompletedInSession([]);
    }
  }, [selectedCategory, allPhrases]);

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

    dispatch(incrementPhraseCompleted());

    // Adiciona à lista de completadas nesta sessão
    setCompletedInSession([...completedInSession, currentPhrase.id]);

    // Salva progresso
    setTimeout(() => {
      dispatch(saveProgress());
    }, 500);
  };

  const handleNextPhrase = () => {
    if (currentIndex < categoryPhrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reinicia do começo quando acabar
      setCurrentIndex(0);
    }
  };

  // Calcula estatísticas da categoria
  const getCategoryStats = (categoryId) => {
    const categoryPhrasesCount = allPhrases.filter(p => p.category === categoryId).length;
    const completedCount = allPhrases.filter(p =>
      p.category === categoryId &&
      levelSystem?.globalCompletedPhrases?.includes(p.id)
    ).length;

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
  const progress = Math.round(((currentIndex + 1) / categoryPhrases.length) * 100);

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
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
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
        />
      </div>
    </div>
  );
};

export default CategoryTrainer;