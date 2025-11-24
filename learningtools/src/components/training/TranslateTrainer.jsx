import React, { useState, useEffect } from 'react';
import { Languages, Sparkles, Trash2, History, Volume2, Mic, MicOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PhraseCard } from './PhraseCard';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useDispatch, useSelector } from 'react-redux';
import {
  incrementPhraseCompleted,
  saveProgress,
  markPhraseCompleted,
  updateLastActivity  // ✅ ADD THIS
} from '../../store/slices/userSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';

const TranslateTrainer = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector(state => state.user);  // ✅ ADD THIS
  
  // ... rest of the code

  const [portugueseText, setPortugueseText] = useState('');
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const textToSpeech = useTextToSpeech();
  const { speak } = textToSpeech;

  const {
    translateToEnglish,
    isTranslating,
    error: translationError,
    clearError
  } = useTranslation();

  const handleSpeechResult = (finalText, error) => {
    if (error) {
      console.error('Speech recognition error:', error);
      return;
    }
    
    if (finalText) {
      setPortugueseText(finalText);
      console.log('✅ Texto capturado em português:', finalText);
    }
  };

  const {
    isListening,
    transcript,
    setTranscript,
    toggleListening
  } = useSpeechRecognition('pt-BR', handleSpeechResult);

  useEffect(() => {
    const stored = localStorage.getItem('learnfun_translation_history');
    if (!stored) {
      return;
    }

    try {
      const history = JSON.parse(stored);
      setTranslationHistory(history.slice(0, 10));
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  useEffect(() => {
    if (!transcript || transcript === '🎤 Listening...') {
      return;
    }
    
    setPortugueseText(transcript);
  }, [transcript]);

  const saveToHistory = (original, translated) => {
    const newEntry = {
      id: Date.now(),
      original,
      translated,
      timestamp: new Date().toISOString()
    };

    const newHistory = [newEntry, ...translationHistory].slice(0, 10);
    setTranslationHistory(newHistory);
    localStorage.setItem('learnfun_translation_history', JSON.stringify(newHistory));
  };

  const handleTranslate = async () => {
    if (!portugueseText.trim()) {
      return;
    }

    clearError();

    const result = await translateToEnglish(portugueseText);
    if (!result || !result.success) {
      return;
    }

    const newPhrase = {
      id: `translate-${Date.now()}`,
      text: result.translated,
      translation: result.original,
      category: 'user-translation',
      difficulty: 'custom',
      index: 0
    };

    setCurrentPhrase(newPhrase);
    saveToHistory(result.original, result.translated);

    console.log('✨ Phrase ready for training:', newPhrase);
  };

  const handleCorrectAnswer = () => {
    console.log('✅ User completed the translated phrase!');
  
    dispatch(incrementPhraseCompleted());
  
    if (currentPhrase) {
      dispatch(markPhraseCompleted({
        phraseId: currentPhrase.id,
        phraseIndex: 0
      }));
    }
  
    // ✅ ADD THIS: Track last activity for authenticated users
    if (mode === 'authenticated') {
      dispatch(updateLastActivity({
        trainerType: 'translate',
        mode: 'translation',
        phraseId: currentPhrase?.id || '',
        phraseIndex: 0,
        resumeUrl: '/?mode=translate',
        displayText: 'Translation Practice'
      }));
    }
  
    setTimeout(() => {
      dispatch(saveProgress());
    }, 500);
  };

  const handleLoadFromHistory = (entry) => {
    const phrase = {
      id: `history-${entry.id}`,
      text: entry.translated,
      translation: entry.original,
      category: 'history',
      difficulty: 'custom',
      index: 0
    };

    setCurrentPhrase(phrase);
    setPortugueseText(entry.original);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setTranslationHistory([]);
    localStorage.removeItem('learnfun_translation_history');
    setShowHistory(false);
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleTextareaChange = (e) => {
    setPortugueseText(e.target.value);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    handleTranslate();
  };

  const handleHistoryItemClick = (entry) => {
    handleLoadFromHistory(entry);
  };

  const handleHistoryItemKeyDown = (e, entry) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    handleLoadFromHistory(entry);
  };

  const handleHistoryToggleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    handleToggleHistory();
  };

  const handleMicrophoneKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    toggleListening();
  };

  const handleTranslateKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    handleTranslate();
  };

  const handleSpeakHistoryItem = (e, text) => {
    e.stopPropagation();
    speak(text);
  };

  const handleSpeakHistoryItemKeyDown = (e, text) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    speak(text);
  };

  const isTranslateDisabled = !portugueseText.trim() || isTranslating || isListening;
  const microphoneButtonClasses = isListening
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-green-500 hover:bg-green-600 text-white';
  const translateButtonClasses = isTranslateDisabled
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
          <LevelIndicator variant="full" />
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Languages className="w-10 h-10 text-blue-600" aria-hidden="true" />
            <h1 className="text-4xl font-bold text-gray-900">
              Translate & Practice
            </h1>
          </div>
          <p className="text-gray-600 text-base">
            Digite ou fale uma frase em português, traduza para inglês e pratique a pronúncia!
          </p>
        </header>

        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6" aria-labelledby="translation-input-title">
          <div className="flex items-center justify-between mb-4">
            <h2 id="translation-input-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🇧🇷</span>
              Digite ou Fale em Português
            </h2>
            {translationHistory.length > 0 && (
              <button
                onClick={handleToggleHistory}
                onKeyDown={handleHistoryToggleKeyDown}
                tabIndex={0}
                aria-label="Mostrar ou ocultar histórico de traduções"
                aria-expanded={showHistory}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <History size={20} aria-hidden="true" />
                <span className="text-sm font-medium">Histórico</span>
              </button>
            )}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={toggleListening}
              onKeyDown={handleMicrophoneKeyDown}
              disabled={isTranslating}
              tabIndex={0}
              aria-label={isListening ? 'Parar de gravar áudio' : 'Iniciar gravação de áudio em português'}
              aria-pressed={isListening}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${microphoneButtonClasses}`}
            >
              {isListening ? (
                <>
                  <MicOff size={20} aria-hidden="true" />
                  <span>Parar de Gravar</span>
                </>
              ) : (
                <>
                  <Mic size={20} aria-hidden="true" />
                  <span>Falar em Português</span>
                </>
              )}
            </button>

            {isListening && (
              <div className="flex items-center gap-2 text-red-600" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></div>
                <span className="text-sm font-medium">Gravando...</span>
              </div>
            )}
          </div>

          <label htmlFor="portuguese-text-input" className="sr-only">
            Campo de texto para digitar ou falar em português
          </label>
          <textarea
            id="portuguese-text-input"
            value={portugueseText}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ex: Olá, como você está hoje?"
            className="w-full p-4 border border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none bg-white"
            rows={3}
            disabled={isTranslating || isListening}
            aria-label="Digite ou fale uma frase em português"
            aria-describedby="textarea-help"
          />
          <div id="textarea-help" className="sr-only">
            Pressione Enter para traduzir rapidamente
          </div>

          {translationError && (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl" aria-hidden="true">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-1">Erro na Tradução</p>
                  <p className="text-red-700 text-sm">{translationError}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white rounded border border-red-100">
                <p className="text-xs text-gray-700 mb-2 font-medium">
                  Possíveis causas:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>A API do Google Apps Script pode estar temporariamente indisponível</li>
                  <li>Pode haver um limite de requisições atingido</li>
                  <li>Verifique sua conexão com a internet</li>
                  <li>Tente novamente em alguns segundos</li>
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={handleTranslate}
            onKeyDown={handleTranslateKeyDown}
            disabled={isTranslateDisabled}
            tabIndex={0}
            aria-label="Traduzir texto para inglês"
            aria-busy={isTranslating}
            className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-base transition-colors ${translateButtonClasses}`}
          >
            {isTranslating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                <span>Traduzindo...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} aria-hidden="true" />
                <span>Traduzir para Inglês</span>
              </>
            )}
          </button>

          <div className="mt-4 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <span className="font-medium">Dica:</span> Pressione <kbd className="px-2 py-1 bg-white rounded border border-blue-300 text-xs">Enter</kbd> para traduzir rapidamente!
              </p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                🎤 <span className="font-medium">Novo:</span> Clique no botão do microfone para falar em português e o texto será escrito automaticamente!
              </p>
            </div>
          </div>
        </section>

        {showHistory && translationHistory.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6" aria-labelledby="history-title">
            <div className="flex items-center justify-between mb-4">
              <h2 id="history-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History size={20} aria-hidden="true" />
                Histórico de Traduções
              </h2>
              <button
                onClick={handleClearHistory}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClearHistory();
                  }
                }}
                tabIndex={0}
                aria-label="Limpar histórico de traduções"
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} aria-hidden="true" />
                Limpar
              </button>
            </div>

            <ul className="space-y-2 max-h-64 overflow-y-auto" role="list">
              {translationHistory.map((entry) => (
                <li key={entry.id}>
                  <button
                    onClick={() => handleHistoryItemClick(entry)}
                    onKeyDown={(e) => handleHistoryItemKeyDown(e, entry)}
                    tabIndex={0}
                    aria-label={`Carregar tradução: ${entry.original} em português, ${entry.translated} em inglês`}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          <span aria-hidden="true">🇧🇷</span> {entry.original}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          <span aria-hidden="true">🇺🇸</span> {entry.translated}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleSpeakHistoryItem(e, entry.translated)}
                        onKeyDown={(e) => handleSpeakHistoryItemKeyDown(e, entry.translated)}
                        tabIndex={0}
                        aria-label={`Ouvir pronúncia de: ${entry.translated}`}
                        className="text-blue-500 flex-shrink-0 mt-1 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {currentPhrase && (
          <section aria-labelledby="practice-title">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p id="practice-title" className="text-center text-blue-800 font-medium">
                Agora pratique a pronúncia em inglês!
              </p>
            </div>

            <PhraseCard
              key={currentPhrase.id}
              phrase={currentPhrase}
              onSpeak={speak}
              textToSpeech={textToSpeech}
              onCorrectAnswer={handleCorrectAnswer}
              isActive={true}
              autoAdvance={false}
            />
          </section>
        )}

        {!currentPhrase && (
          <section className="bg-white rounded-lg border border-gray-200 p-8 text-center" aria-labelledby="instructions-title">
            <div className="text-5xl mb-4" aria-hidden="true">🎯</div>
            <h2 id="instructions-title" className="text-2xl font-semibold text-gray-900 mb-4">
              Como Funciona?
            </h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">1.</span>
                <p className="text-gray-700">
                  <span className="font-medium">Digite ou fale</span> uma frase em português que você quer aprender
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">2.</span>
                <p className="text-gray-700">
                  Clique em <span className="font-medium">"Traduzir"</span> para converter para inglês
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">3.</span>
                <p className="text-gray-700">
                  Use os botões <span className="font-medium">"Hear"</span> e <span className="font-medium">"Speak"</span> para praticar
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">4.</span>
                <p className="text-gray-700">
                  Receba <span className="font-medium">feedback detalhado</span> com análise fonética IPA!
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-700 font-medium">
                Pratique frases do seu dia a dia e melhore sua pronúncia!
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TranslateTrainer;