import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { PhraseCard } from './PhraseCard';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { LevelIndicator } from './LevelIndicator';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { PhraseRepository } from '../services/phraseRepository';
import { useSelector, useDispatch } from 'react-redux';
import { LevelUpModal } from './LevelUpModal';
import {
  updateChunkProgress,
  incrementPhraseCompleted,
  saveProgress,
  closeLevelUpModal,
  updateLevelSystemIndices
} from '../store/slices/userSlice';


const ChunkTrainer = () => {
    const dispatch = useDispatch();

   const { progress, mode, loading: userLoading, levelSystem } = useSelector(state => state.user);
    const currentIndex = progress.chunkTrainer.currentIndex;

    const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jumpToInput, setJumpToInput] = useState('');
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  const { speak } = useTextToSpeech();

  useEffect(() => {
    loadPhrases();
  }, []);

useEffect(() => {
  if (phrases.length > 0 && levelSystem) {
    const { globalCompletedPhrases = [], globalCompletedIndices = [] } = levelSystem;

    // Se tem IDs mas não tem índices, faz migração
    if (globalCompletedPhrases.length > 0 && globalCompletedIndices.length < globalCompletedPhrases.length) {
      console.log('🔄 Migrando dados antigos...');
      console.log(`  - IDs: ${globalCompletedPhrases.length}`);
      console.log(`  - Índices: ${globalCompletedIndices.length}`);

      const newIndices = [];

      globalCompletedPhrases.forEach(completedId => {
        const foundIndex = phrases.findIndex(p => p.id === completedId);
        if (foundIndex !== -1 && !newIndices.includes(foundIndex)) {
          newIndices.push(foundIndex);
        }
      });

      if (newIndices.length > 0) {
        console.log(`✅ Migrados ${newIndices.length} índices:`, newIndices.map(i => i + 1));
        dispatch(updateLevelSystemIndices({ indices: newIndices }));

        // Salva automaticamente
        setTimeout(() => {
          dispatch(saveProgress());
        }, 1000);
      }
    }
  }
}, [phrases, levelSystem?.globalCompletedPhrases, levelSystem?.globalCompletedIndices, dispatch]);


  const loadPhrases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PhraseRepository.fetchPhrases();

      if (data.length === 0) {
        setError('No phrases found. Please add phrases to Firebase.');
      } else {
        setPhrases(data);
      }
    } catch (err) {
      setError('Failed to load phrases. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (phrases.length > 0 && levelSystem) {
    const { currentLevel, globalCompletedPhrases = [] } = levelSystem;

    // Mostra TODAS as frases do início até o nível atual
    const totalPhrasesToShow = currentLevel * 10; // Nível 1=10, Nível 2=20, Nível 3=30...

    // Filtra frases (índices 0 até totalPhrasesToShow-1)
    const levelPhrases = phrases.slice(0, totalPhrasesToShow).map((phrase, idx) => ({
      ...phrase,
      index: idx,
      isCompleted: globalCompletedPhrases.includes(phrase.id) // Marca se já foi completada
    }));

    setFilteredPhrases(levelPhrases);
    console.log(`📚 Level ${currentLevel}: Showing ${totalPhrasesToShow} phrases (${globalCompletedPhrases.length} completed)`);

    // Reseta índice se fora do range
    if (currentIndex >= levelPhrases.length) {
      console.log(`⚠️ Current index ${currentIndex} out of range, resetting to 0`);
      dispatch(updateChunkProgress({
        currentIndex: 0,
        completedPhrases: progress.chunkTrainer.completedPhrases
      }));
    }
  }
}, [phrases, levelSystem, currentIndex, dispatch, progress.chunkTrainer.completedPhrases]);

useEffect(() => {
  // 🔄 MIGRAÇÃO: Reconstrói globalCompletedIndices baseado nos IDs
  if (phrases.length > 0 && levelSystem) {
    const { globalCompletedPhrases = [], globalCompletedIndices = [] } = levelSystem;

    // Se tem frases completadas mas o array de índices está vazio, faz migração
    if (globalCompletedPhrases.length > 0 && globalCompletedIndices.length === 0) {
      console.log('🔄 Migrating old data: Reconstructing indices from phrase IDs...');

      const newIndices = [];

      // Para cada frase completada, encontra seu índice na lista completa
      globalCompletedPhrases.forEach(completedId => {
        const foundIndex = phrases.findIndex(p => p.id === completedId);
        if (foundIndex !== -1 && !newIndices.includes(foundIndex)) {
          newIndices.push(foundIndex);
        }
      });

      // Atualiza o Redux com os índices reconstruídos
      if (newIndices.length > 0) {
        console.log(`✅ Migrated ${newIndices.length} indices:`, newIndices.map(i => i + 1));

        // Atualiza o levelSystem com os índices migrados
        dispatch({
          type: 'user/updateLevelSystemIndices',
          payload: { indices: newIndices }
        });
      }
    }
  }
}, [phrases, levelSystem, dispatch]);

useEffect(() => {
  console.log('📍 Current Index:', currentIndex);
}, [currentIndex]);

   // Ao trocar de frase
    const handleNextPhrase = () => {
      const newIndex = (currentIndex + 1) % filteredPhrases.length;

      dispatch(updateChunkProgress({
        currentIndex: newIndex,
        completedPhrases: progress.chunkTrainer.completedPhrases
      }));
    };

  // Ao acertar uma frase
    const handleCorrectAnswer = () => {
        console.log('✅ Correct answer! Moving to next phrase...');

        // Adiciona frase às completadas
        const completedPhrases = [
          ...progress.chunkTrainer.completedPhrases,
          currentIndex
        ];

        dispatch(updateChunkProgress({
          currentIndex,
          completedPhrases
        }));

        // Incrementa contador global
        dispatch(incrementPhraseCompleted());
      };

  const handleJumpToPhrase = (e) => {
      e.preventDefault();
      const targetPhrase = parseInt(jumpToInput);

      if (isNaN(targetPhrase) || targetPhrase < 1 || targetPhrase > filteredPhrases.length) {
        alert(`Please enter a number between 1 and ${filteredPhrases.length}`);
        return;
      }

      // Atualiza Redux
      dispatch(updateChunkProgress({
        currentIndex: targetPhrase - 1,
        completedPhrases: progress.chunkTrainer.completedPhrases
      }));

      setJumpToInput('');
      console.log(`🎯 Jumped to phrase ${targetPhrase}`);
    };

const handleCloseLevelUpModal = () => {
  dispatch(closeLevelUpModal());
};


  if (userLoading) return <LoadingScreen />;
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadPhrases} />;
  if (filteredPhrases.length === 0) {
    return <LoadingScreen />;
  }

const currentPhrase = filteredPhrases[currentIndex];
if (!currentPhrase) {
  console.error(`⚠️ No phrase at index ${currentIndex}, resetting...`);
  dispatch(updateChunkProgress({
    currentIndex: 0,
    completedPhrases: progress.chunkTrainer.completedPhrases
  }));
  return <LoadingScreen />;
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <LevelUpModal
              isOpen={levelSystem?.showLevelUpModal || false}
              onClose={handleCloseLevelUpModal}
              newLevel={levelSystem?.pendingLevelUp || 1}
            />
      <div className="max-w-3xl mx-auto">
          {/* Level Indicator */}
        <LevelIndicator variant="full" />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            English Pronunciation Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Listen, speak, and improve your English!
          </p>
        </div>

        {filteredPhrases.length > 0 && (
          <>
            {/* KEY AQUI! Força recriação do componente */}
            <PhraseCard
              key={`phrase-${currentIndex}-${filteredPhrases[currentIndex]?.id || currentIndex}`}
              phrase={currentPhrase}
              onSpeak={speak}
              onCorrectAnswer={handleCorrectAnswer}
              isActive={true}
            />

            {/* Navigation Section */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

                {/* Jump to Phrase Input */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-gray-700 font-semibold whitespace-nowrap">Phrase</span>

                  <form onSubmit={handleJumpToPhrase} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={filteredPhrases.length}
                      value={jumpToInput}
                      onChange={(e) => setJumpToInput(e.target.value)}
                      placeholder={String(currentIndex + 1)}
                      className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-bold text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    />
                    <span className="text-gray-700 font-semibold">of {filteredPhrases.length}</span>

                    {jumpToInput && (
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                      >
                        <ArrowRight size={18} />
                        Go
                      </button>
                    )}
                  </form>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPhrase}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-semibold w-full sm:w-auto justify-center"
                >
                  <RefreshCw size={20} />
                  Next Phrase
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentIndex + 1) / filteredPhrases.length) * 100}%` }}
                  />
                </div>
                <p className="text-center text-gray-600 text-sm font-semibold mt-2">
                  {Math.round(((currentIndex + 1) / filteredPhrases.length) * 100)}% completed
                  ({currentIndex + 1} / {filteredPhrases.length})
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChunkTrainer;