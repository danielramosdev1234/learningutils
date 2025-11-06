import React, { useState, useEffect, useRef } from 'react';
import { PhraseCard } from './PhraseCard';
import { LoadingScreen } from '../screens/LoadingScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { PhraseRepository } from '../../services/phraseRepository';
import { useSelector, useDispatch } from 'react-redux';
import { LevelUpModal } from '../modals/LevelUpModal';
import {
  updateChunkProgress,
  incrementPhraseCompleted,
  saveProgress,
  closeLevelUpModal,
  updateLevelSystemIndices,
  markPhraseCompleted
} from '../../store/slices/userSlice';
import { InvitePromptModal } from '../modals/InvitePromptModal';

const ChunkTrainer = ({ onOpenInvite }) => {
  const dispatch = useDispatch();

  const { progress, mode, loading: userLoading, levelSystem } = useSelector(state => state.user);
  const currentIndex = progress.chunkTrainer.currentIndex;

  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  const { speak } = useTextToSpeech();
  const [hasMigrated, setHasMigrated] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [phrasesCompletedSincePrompt, setPhrasesCompletedSincePrompt] = useState(0);

  // ✅ NOVO: Ref para evitar loop infinito ao corrigir index
  const isCorrectingIndex = useRef(false);

  useEffect(() => {
    loadPhrases();
  }, []);

  useEffect(() => {
    if (phrases.length > 0 && levelSystem && !hasMigrated) {
      const { globalCompletedPhrases = [], globalCompletedIndices = [] } = levelSystem;

      // Verifica se precisa migrar
      if (globalCompletedPhrases.length > 0 && globalCompletedIndices.length === 0) {
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

          setHasMigrated(true);
        }
      }
    }
  }, [phrases, levelSystem, hasMigrated, dispatch]);

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
      const totalPhrasesToShow = currentLevel * 10;

      // Filtra frases
      const levelPhrases = phrases.slice(0, totalPhrasesToShow).map((phrase, idx) => ({
        ...phrase,
        index: idx,
        isCompleted: globalCompletedPhrases.includes(phrase.id)
      }));

      setFilteredPhrases(levelPhrases);
      console.log(`📚 Level ${currentLevel}: Showing ${totalPhrasesToShow} phrases (${globalCompletedPhrases.length} completed)`);

      // ✅ CORRIGIDO: Corrige index SOMENTE se necessário e SOMENTE UMA VEZ
      if (currentIndex >= levelPhrases.length && !isCorrectingIndex.current) {
        isCorrectingIndex.current = true;
        console.log(`⚠️ Current index ${currentIndex} out of range, adjusting to ${levelPhrases.length - 1}`);

        setTimeout(() => {
          dispatch(updateChunkProgress({
            currentIndex: Math.max(0, levelPhrases.length - 1),
            completedPhrases: progress.chunkTrainer.completedPhrases
          }));

          // Permite nova correção no futuro
          setTimeout(() => {
            isCorrectingIndex.current = false;
          }, 100);
        }, 0);
      }
    }
  }, [phrases, levelSystem, currentIndex, dispatch, progress.chunkTrainer.completedPhrases]);

  useEffect(() => {
    console.log('🔍 Current Index:', currentIndex);
  }, [currentIndex]);

  // Ao trocar de frase
  const handleNextPhrase = () => {
    // ✅ CORREÇÃO: Avança sem módulo para preservar posição ao subir de nível
    const newIndex = currentIndex + 1;

    dispatch(updateChunkProgress({
      currentIndex: newIndex,
      completedPhrases: progress.chunkTrainer.completedPhrases
    }));
  };

  // Ao acertar uma frase
  const handleCorrectAnswer = () => {
    console.log('✅ Correct answer! Moving to next phrase...');

    const currentPhrase = filteredPhrases[currentIndex];

    // 1️⃣ Marca a frase no levelSystem
    dispatch(markPhraseCompleted({
      phraseId: currentPhrase.id,
      phraseIndex: currentIndex
    }));

    // 2️⃣ Atualiza progresso local do ChunkTrainer
    const completedPhrases = [
      ...progress.chunkTrainer.completedPhrases,
      currentIndex
    ];

    dispatch(updateChunkProgress({
      currentIndex,
      completedPhrases
    }));

    // 3️⃣ Incrementa estatísticas gerais
    dispatch(incrementPhraseCompleted());

    // ✅ Verifica se deve mostrar modal de convite
    const newCount = phrasesCompletedSincePrompt + 1;
    setPhrasesCompletedSincePrompt(newCount);

    // Mostra modal a cada 7 frases completadas
    if (newCount >= 7) {
      setShowInviteModal(true);
      setPhrasesCompletedSincePrompt(0); // Reseta contador

      // Analytics
      if (window.va) {
        window.va('event', {
          name: 'invite_modal_shown',
          data: { phrasesCompleted: newCount }
        });
      }
    }

    // 4️⃣ Salva progresso (auto-sync)
    setTimeout(() => {
      dispatch(saveProgress());
    }, 500);

    console.log(`📊 Frase ${currentIndex + 1} (ID: ${currentPhrase.id}) marcada como completa`);
  };

  const handleCloseLevelUpModal = () => {
    dispatch(closeLevelUpModal());
  };

  const handleOpenInviteScreen = () => {
    setShowInviteModal(false);
    if (onOpenInvite) {
      onOpenInvite();
    }
  };

  if (userLoading) return <LoadingScreen />;
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadPhrases} />;
  if (filteredPhrases.length === 0) {
    return <LoadingScreen />;
  }

  // ✅ MELHORADO: Usa última frase disponível se index inválido
  const safeIndex = Math.min(currentIndex, filteredPhrases.length - 1);
  const currentPhrase = filteredPhrases[safeIndex];

  if (!currentPhrase) {
    console.error(`⚠️ No phrase available, loading...`);
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <LevelUpModal
        isOpen={levelSystem?.showLevelUpModal || false}
        onClose={handleCloseLevelUpModal}
        newLevel={levelSystem?.pendingLevelUp || 1}
      />

      <InvitePromptModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleOpenInviteScreen}
        onOpenInvite={onOpenInvite}
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
          <PhraseCard
            key={`phrase-${safeIndex}-${currentPhrase.id}`}
            phrase={currentPhrase}
            onSpeak={speak}
            onCorrectAnswer={handleCorrectAnswer}
            onNextPhrase={handleNextPhrase}
            isActive={true}
          />
        )}
      </div>
    </div>
  );
};

export default ChunkTrainer;