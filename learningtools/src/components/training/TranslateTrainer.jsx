import React, { useState, useEffect } from 'react';
import { Languages, Sparkles, Trash2, History, Volume2, Mic, MicOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PhraseCard } from './PhraseCard';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'; // ✅ IMPORT
import { useSelector, useDispatch } from 'react-redux';
import {
  incrementPhraseCompleted,
  saveProgress,
  markPhraseCompleted
} from '../../store/slices/userSlice';

const TranslateTrainer = () => {
  const dispatch = useDispatch();
  const { progress, levelSystem } = useSelector(state => state.user);

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
    apiUsed,
    clearError
  } = useTranslation();


  // ✅ NOVO: Hook de reconhecimento de voz para português
  const {
    isListening,
    transcript,
    setTranscript,
    toggleListening
  } = useSpeechRecognition('pt-BR', (finalText, error) => {
    if (error) {
      console.error('Speech recognition error:', error);
      // Você pode mostrar o erro na UI se quiser
    } else if (finalText) {
      setPortugueseText(finalText);
      console.log('✅ Texto capturado em português:', finalText);
    }
  });

  // Carrega histórico do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('learnfun_translation_history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        setTranslationHistory(history.slice(0, 10));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // ✅ NOVO: Atualiza textarea quando transcript muda
  useEffect(() => {
    if (transcript && transcript !== '🎤 Listening...') {
      setPortugueseText(transcript);
    }
  }, [transcript]);

  // Salva histórico no localStorage
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

    if (result && result.success) {
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
    }
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

    setTimeout(() => {
      dispatch(saveProgress());
    }, 500);
  };

  const loadFromHistory = (entry) => {
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

  const clearHistory = () => {
    setTranslationHistory([]);
    localStorage.removeItem('learnfun_translation_history');
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Languages className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Translate & Practice
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Digite ou fale uma frase em português, traduza para inglês e pratique a pronúncia!
          </p>
        </div>

        {/* Translation Input Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🇧🇷</span>
              Digite ou Fale em Português
            </h3>
            {translationHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <History size={20} />
                <span className="text-sm font-semibold">Histórico</span>
              </button>
            )}
          </div>

          {/* ✅ NOVO: Botão de Speech-to-Text */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={toggleListening}
              disabled={isTranslating}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={20} />
                  <span>Parar de Gravar</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span>🎤 Falar em Português</span>
                </>
              )}
            </button>

            {isListening && (
              <div className="flex items-center gap-2 text-red-600 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-semibold">Gravando...</span>
              </div>
            )}
          </div>

          {/* Text Input */}
          <textarea
            value={portugueseText}
            onChange={(e) => setPortugueseText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            placeholder="Ex: Olá, como você está hoje?"
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all resize-none"
            rows={3}
            disabled={isTranslating || isListening}
          />

          {/* Error Message */}
          {translationError && (
            <div className="mt-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-700 font-semibold mb-1">Erro na Tradução</p>
                  <p className="text-red-600 text-sm">{translationError}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white rounded border border-red-200">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Possíveis causas:</strong>
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

          {/* Translate Button */}
          <button
            onClick={handleTranslate}
            disabled={!portugueseText.trim() || isTranslating || isListening}
            className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-md ${
              !portugueseText.trim() || isTranslating || isListening
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105'
            }`}
          >
            {isTranslating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Traduzindo...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Traduzir para Inglês</span>
                <span className="text-2xl">🇺🇸</span>
              </>
            )}
          </button>

          {/* Quick Tips */}
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                💡 <strong>Dica:</strong> Pressione <kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> para traduzir rapidamente!
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                🎤 <strong>Novo:</strong> Clique no botão do microfone para falar em português e o texto será escrito automaticamente!
              </p>
            </div>
          </div>
        </div>

        {/* History Modal */}
        {showHistory && translationHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History size={20} />
                Histórico de Traduções
              </h3>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {translationHistory.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        🇧🇷 {entry.original}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        🇺🇸 {entry.translated}
                      </p>
                    </div>
                    <Volume2
                      size={16}
                      className="text-purple-500 flex-shrink-0 mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(entry.translated);
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Practice Card */}
        {currentPhrase && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-1 rounded-xl mb-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-center text-gray-700 font-semibold">
                  ✨ Agora pratique a pronúncia em inglês! ✨
                </p>
              </div>
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
          </div>
        )}

        {/* Instructions (when no phrase active) */}
        {!currentPhrase && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Como Funciona?
            </h3>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">1️⃣</span>
                <p className="text-gray-700">
                  <strong>Digite ou fale</strong> uma frase em português que você quer aprender
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">2️⃣</span>
                <p className="text-gray-700">
                  Clique em <strong>"Traduzir"</strong> para converter para inglês
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">3️⃣</span>
                <p className="text-gray-700">
                  Use os botões <strong>"Hear"</strong> e <strong>"Speak"</strong> para praticar
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">4️⃣</span>
                <p className="text-gray-700">
                  Receba <strong>feedback detalhado</strong> com análise fonética IPA!
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <p className="text-purple-700 font-semibold">
                💪 Pratique frases do seu dia a dia e melhore sua pronúncia!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslateTrainer;