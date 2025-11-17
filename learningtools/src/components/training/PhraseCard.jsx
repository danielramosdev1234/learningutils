// src/components/PhraseCard.jsx (ATUALIZADO - Referral processado no login)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, Loader, AlertCircle, Play, Pause, ArrowRight, Gift, Settings, BookOpen, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useSpeechRecognitionForChunks } from '../../hooks/useSpeechRecognitionForChunks';
import { compareTexts } from '../../utils/textComparison';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { IPATranscription } from '../pronunciation/IPATranscription';
import { PhonemeFeedback } from '../pronunciation/PhonemeFeedback';
import { ShareButton } from '../ui/ShareButton';
import { FireworksCelebration } from '../celebrations/FireworksCelebration';
import {
  markPhraseCompleted,
  useSkipPhrase,
  giveWelcomeBonus
} from '../../store/slices/userSlice';
import {
  generateReferralShareText,
  trackReferralEvent
} from '../../utils/referralUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useXP } from '../../hooks/useXP';
import { trackExerciseComplete, trackError, trackUserAction } from '../../utils/analytics';
import { countWords } from '../../utils/wordCounter';

const isAndroidDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua);
};

export const PhraseCard = ({
  phrase,
  onSpeak,
  onCorrectAnswer,
  onNextPhrase,
  isActive,
  textToSpeech,
  autoAdvance = true,
  tourActive = false,
  tourStep = 0,
  onTourFeedbackVisible
}) => {
 const isAndroid = useMemo(() => isAndroidDevice(), []);

 const chunksHook = useSpeechRecognitionForChunks();

 const dispatch = useDispatch();
 const { levelSystem, userId, stats } = useSelector(state => state.user);
   const streak = stats?.streak || { current: 0, longest: 0, history: [] };

 const { earnXP } = useXP();

  const { referral, mode } = useSelector((state) => ({
     referral: state.user.referral,
     mode: state.user.mode
   }));

   const canSkipPhrase = referral?.rewards?.skipPhrases > 0;
   const [showSkipConfirm, setShowSkipConfirm] = useState(false);
   const [showGrammarNotes, setShowGrammarNotes] = useState(false);

 const [androidTranscript, setAndroidTranscript] = useState('');
 const [androidError, setAndroidError] = useState('');
 const simpleHook = useSpeechRecognition('en-US', (text, err) => {
   if (err) {
     setAndroidError(err);
   } else {
     setAndroidTranscript(text);
   }
 });

 const {
   isListening,
   transcript,
   audioBlob,
   startListening,
   stopListening,
   error: speechError
 } = isAndroid
   ? {
       isListening: simpleHook.isListening,
       transcript: androidTranscript,
       audioBlob: null,
       startListening: simpleHook.toggleListening,
       stopListening: simpleHook.toggleListening,
       error: androidError
     }
   : {
       isListening: chunksHook.isListening,
       transcript: chunksHook.transcript,
       audioBlob: chunksHook.audioBlob,
       startListening: chunksHook.startListening,
       stopListening: chunksHook.stopListening,
       error: chunksHook.error
     };

 console.log('📱 Using hook for:', isAndroid ? 'Android' : 'Desktop/iOS');

  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [showIPA, setShowIPA] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const { speak, voices, selectedVoice, setSelectedVoice } = textToSpeech || useTextToSpeech();

  const [totalPracticed, setTotalPracticed] = useState(() => {
    const stored = localStorage.getItem('learnfun_total_practiced');
    return stored ? parseInt(stored) : 0;
  });

  const [isDisabled, setIsDisabled] = useState(false);
  const audioRef = useRef(null);
  const shouldShowIPA = showIPA || (tourActive && tourStep >= 3);

  // Processa o resultado quando terminar de ouvir
  useEffect(() => {
    if (transcript && !isListening && !hasProcessed && transcript.trim() !== '') {
      console.log('🔊 Processing - Phrase:', phrase.text, '| Said:', transcript);

      const comparison = compareTexts(phrase.text, transcript);
      console.log('📈 Result:', comparison.similarity + '%');

      setResult(comparison);
      setShowFeedback(true);
      setHasProcessed(true);

      if (tourActive && typeof onTourFeedbackVisible === 'function') {
        onTourFeedbackVisible();
      }

      // Track exercise completion
      const startTime = performance.now();
      trackExerciseComplete('phrase', comparison.similarity, 0, {
        phraseId: phrase.id,
        phraseText: phrase.text
      });

      if (comparison.similarity >= 80) {
        console.log(`✅ ${comparison.similarity}% - Marking phrase as completed!`);

        try {
          // Conta palavras na frase para calcular XP (1 XP por palavra)
          const wordCount = countWords(phrase.text);
          
          // Ganha XP baseado no número de palavras (1 XP por palavra)
          earnXP('phrases', {
            phraseId: phrase.id,
            accuracy: comparison.similarity,
            streak: streak.current,
            amount: wordCount // Passa o número de palavras como amount
          });

          dispatch(markPhraseCompleted({
            phraseId: phrase.id,
            phraseIndex: phrase.index
          }));

          // Chama onCorrectAnswer para marcar como completa
          if (onCorrectAnswer) {
            onCorrectAnswer();
          }

          // Só avança automaticamente se autoAdvance estiver habilitado
          if (autoAdvance && onNextPhrase) {
            console.log(`🎉 Auto advancing!`);
            // Aguarda um pouco antes de avançar para mostrar o feedback
            setTimeout(() => {
              onNextPhrase();
            }, 2000);
          }
        } catch (error) {
          console.error('Erro ao processar frase completa:', error);
          trackError('phrase_completion_error', error.message, { phraseId: phrase.id });
        }
      } else {
        // Feedback para acurácia abaixo de 80%
      }

      if (comparison.similarity === 100) {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 5000);
      }

      setTotalPracticed(prev => {
        const updated = prev + 1;
        localStorage.setItem('learnfun_total_practiced', updated);
        return updated;
      });

      let timer;
      if (!tourActive) {
        timer = setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      }

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [
    transcript,
    isListening,
    hasProcessed,
    phrase.text,
    onCorrectAnswer,
    autoAdvance,
    onNextPhrase,
    tourActive,
    onTourFeedbackVisible
  ]);

useEffect(() => {
  console.log('🔄 Phrase changed, resetting states');
  setResult(null);
  setShowFeedback(false);
  setHasProcessed(false);
  setIsPlayingUserAudio(false);

  if (isAndroid) {
    setAndroidTranscript('');
    setAndroidError('');
  }
}, [phrase.text, phrase.id, isAndroid]);

 // ✅ Dar bônus de boas-vindas na primeira frase (mantido)
  useEffect(() => {
    if (
      referral?.referredBy &&
      !referral.hasReceivedWelcomeBonus &&
      mode === 'authenticated'
    ) {
      console.log('🎁 Dando bônus de boas-vindas ao novo usuário!');
      dispatch(giveWelcomeBonus());
    }
  }, [referral, mode, dispatch]);

const handleSkipPhrase = () => {

    setIsDisabled(true);

    setShowSkipConfirm(true);
    confirmSkipPhrase()
  };

const confirmSkipPhrase = () => {
    console.log('confirmSkipPhrase!');
    if (!canSkipPhrase) return;
console.log('if (!canSkipPhrase) return;!');
    dispatch(useSkipPhrase());

    dispatch(markPhraseCompleted({
      phraseId: phrase.id,
      phraseIndex: phrase.index
    }));

    if (onCorrectAnswer) {
      onCorrectAnswer();
    }
    handleNextSkip();



    setShowSkipConfirm(false);

    trackReferralEvent('phrase_skipped', {
      phraseIndex: phrase.index,
      remaining: referral.rewards.skipPhrases - 1
    });
  };
const handleNextSkip = () => {
        onNextPhrase()
        setIsDisabled(false);
    }

  const handleMicClick = () => {
    try {
      if (isListening) {
        console.log('🛑 Stopping...');
        trackUserAction('recording_stopped', { phraseId: phrase.id });
        stopListening();
      } else {
        console.log('🎤 Starting new recording...');
        trackUserAction('recording_started', { phraseId: phrase.id });
        
        // Para a reprodução do áudio do botão "Hear" se estiver reproduzindo
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          console.log('🔇 Stopped TTS playback');
        }
        
        setResult(null);
        setShowFeedback(false);
        setHasProcessed(false);
        setIsPlayingUserAudio(false);

        if (isAndroid) {
          setAndroidTranscript('');
          setAndroidError('');
        }

        startListening();
      }
    } catch (error) {
      console.error('Erro ao controlar gravação:', error);
      trackError('recording_error', error.message, { phraseId: phrase.id });
    }
  };

  const playUserAudio = () => {
    if (!audioBlob) {
      return;
    }

    try {
      console.log('🔊 Playing recorded audio...');
      trackUserAction('audio_playback_started', { phraseId: phrase.id });

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('▶️ Audio playing');
        setIsPlayingUserAudio(true);
      };

      audio.onended = () => {
        console.log('⏹️ Audio ended');
        setIsPlayingUserAudio(false);
        URL.revokeObjectURL(audioUrl);
        trackUserAction('audio_playback_ended', { phraseId: phrase.id });
      };

      audio.onerror = (e) => {
        console.error('❌ Audio error:', e);
        setIsPlayingUserAudio(false);
        URL.revokeObjectURL(audioUrl);
        trackError('audio_playback_error', 'Erro ao reproduzir áudio', { phraseId: phrase.id });
      };

      audio.play().catch(err => {
        console.error('Play error:', err);
        setIsPlayingUserAudio(false);
        trackError('audio_play_error', err.message, { phraseId: phrase.id });
      });
    } catch (error) {
      console.error('Erro ao configurar reprodução de áudio:', error);
      trackError('audio_setup_error', error.message, { phraseId: phrase.id });
    }
  };

  const stopUserAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingUserAudio(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${isActive ? 'ring-4 ring-blue-400' : ''}`}>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2
            className="text-3xl font-bold text-gray-800"
            data-tour-id="tour-phrase-text"
          >
            {phrase.text}
          </h2>
        </div>

        {phrase.translation && (
          <p
            className="text-gray-500 text-lg italic mb-3"
            data-tour-id="tour-phrase-translation"
          >
            {phrase.translation}
          </p>
        )}

        <div data-tour-id="tour-ipa">
          <IPATranscription text={phrase.text} show={shouldShowIPA} />
        </div>
      </div>

      {/* Grammar Notes Section */}
      {phrase.grammar_notes && (
        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-md overflow-hidden">
          <button
            onClick={() => setShowGrammarNotes(!showGrammarNotes)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowGrammarNotes(!showGrammarNotes);
              }
            }}
            tabIndex={0}
            aria-expanded={showGrammarNotes}
            aria-label={showGrammarNotes ? 'Ocultar dicas de gramática' : 'Mostrar dicas de gramática'}
            className="w-full p-4 flex items-center justify-between hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Lightbulb className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800 text-lg">Grammar Tips</h3>
                <p className="text-sm text-gray-600">Click to see grammar explanations</p>
              </div>
            </div>
            {showGrammarNotes ? (
              <ChevronUp className="w-5 h-5 text-gray-600" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
            )}
          </button>

          {showGrammarNotes && (
            <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {phrase.grammar_notes.estrutura && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-500">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Structure</p>
                  <p className="text-sm text-gray-800 font-mono">{phrase.grammar_notes.estrutura}</p>
                </div>
              )}

              {phrase.grammar_notes.explicacao_pt && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Explanation</p>
                  <p className="text-sm text-gray-700">{phrase.grammar_notes.explicacao_pt}</p>
                </div>
              )}

              {phrase.grammar_notes.porque_assim && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Why?</p>
                  <p className="text-sm text-gray-700">{phrase.grammar_notes.porque_assim}</p>
                </div>
              )}

              {phrase.grammar_notes.palavra_chave && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border-l-4 border-yellow-500">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Key Word</p>
                  <p className="text-sm text-gray-800 font-semibold">{phrase.grammar_notes.palavra_chave}</p>
                </div>
              )}

              {phrase.grammar_notes.dica_pronuncia && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Pronunciation Tip</p>
                  <p className="text-sm text-gray-700 italic">{phrase.grammar_notes.dica_pronuncia}</p>
                </div>
              )}

              {phrase.grammar_notes.erro_comum && (
                <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Common Mistake</p>
                  <p className="text-sm text-red-800">{phrase.grammar_notes.erro_comum}</p>
                </div>
              )}

            {phrase.grammar_notes.forma_negativa  && (
                            <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
                              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">❌ Negative Form</p>
                              <p className="text-sm text-red-800">{phrase.grammar_notes.forma_negativa }</p>
                            </div>
                          )}

            {phrase.grammar_notes.forma_interrogativa   && (
                                        <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500">
                                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">❓ Question Form</p>
                                          <p className="text-sm text-red-800">{phrase.grammar_notes.forma_interrogativa  }</p>
                                        </div>
                                      )}
            {phrase.grammar_notes.time_markers    && (
                                                    <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500">
                                                      <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-2">⏰ Time Markers</p>
                                                      <div className="flex flex-wrap gap-2">
                                                                          {phrase.grammar_notes.time_markers.map((alt, index) => (
                                                                            <span
                                                                              key={index}
                                                                              className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium"
                                                                            >
                                                                              {alt}
                                                                            </span>
                                                                          ))}
                                                                        </div>
                                                    </div>
                                                  )}


              {phrase.grammar_notes.formas_alternativas && phrase.grammar_notes.formas_alternativas.length > 0 && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500">
                  <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-2">Alternative Forms</p>
                  <div className="flex flex-wrap gap-2">
                    {phrase.grammar_notes.formas_alternativas.map((alt, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {speechError && (
        <div 
          className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-2"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <AlertCircle className="text-red-600" size={20} aria-hidden="true" />
          <p className="text-red-700 text-sm">
            {speechError === 'not-allowed'
              ? '🔒 Microphone permission denied. Click the 🔒 icon and allow access.'
              : `Error: ${speechError}`
            }
          </p>
        </div>
      )}

      <div className="flex justify-center gap-2 sm:gap-4 mb-6 flex-wrap" style={{ touchAction: 'manipulation' }}>
          {canSkipPhrase && !isListening && (
                    <button
                      onClick={handleSkipPhrase}
                      className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-md font-semibold text-sm sm:text-base"
                      title={`Você tem ${referral.rewards.skipPhrases} frases para pular`}
                      disabled={isDisabled}
                    >
                      <Gift size={20} className="sm:w-6 sm:h-6" />
                      <span>Skip ({referral.rewards.skipPhrases})</span>
                    </button>
                  )}



        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
              trackUserAction('tts_playback_started', { phraseId: phrase.id });
              onSpeak(phrase.text);
              if (isListening) {
              stopListening();
              }
            } catch (error) {
              trackError('tts_error', error.message, { phraseId: phrase.id });
            }
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          style={{ touchAction: 'manipulation' }}
          className="flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md font-semibold text-sm sm:text-base relative z-10"
          aria-label="Reproduzir áudio da frase"
          title="Clique para ouvir a pronúncia correta."
        >
          <Volume2 size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
          <span>Hear</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleMicClick();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          disabled={!!speechError}
          style={{ touchAction: 'manipulation' }}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-md font-semibold text-sm sm:text-base relative z-10 ${
            speechError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          data-tour-id="tour-speak-button"
          aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação'}
          aria-pressed={isListening}
          title={isListening ? 'Clique para parar a gravação' : 'Clique para começar a falar'}
        >
          {isListening ? (
            <MicOff size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
          ) : (
            <Mic size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
          )}
          <span>{isListening ? 'Stop' : 'Speak'}</span>
        </button>



        {result && result.similarity >= 80 && !isListening && (
          <button
            onClick={onNextPhrase}
            className="flex items-center gap-1 sm:gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-md font-semibold text-sm sm:text-base "
            data-tour-id="tour-next-button"
          >
            <ArrowRight size={20} className="sm:w-6 sm:h-6" />
            <span>Next</span>
          </button>
        )}
      </div>

      {showVoiceSelector && voices.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md border-2 border-blue-300">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Settings size={20} />
            Choose Voice ({voices.length} available in your device)
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak("Hello! This is a test.", null, 0.9);
                                  }}
                                  className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold"
                                >
                                  Select the voice and click here for Test
                                </button>
            {voices.map((voice) => (
              <div
                key={voice.name}
                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                  selectedVoice?.name === voice.name
                    ? 'bg-blue-100 border-blue-500 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedVoice(voice);
                  localStorage.setItem('learnfun_preferred_voice', voice.name);
                  console.log('✅ Voice saved:', voice.name);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{voice.name}</p>
                    <p className="text-xs text-gray-500">{voice.lang}</p>
                  </div>


                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {audioBlob && (
        <div className="flex justify-center mb-6">
          <button
            onClick={isPlayingUserAudio ? stopUserAudio : playUserAudio}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md font-semibold ${
              isPlayingUserAudio
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            aria-label={isPlayingUserAudio ? 'Parar reprodução da gravação' : 'Reproduzir minha gravação'}
            aria-pressed={isPlayingUserAudio}
          >
            {isPlayingUserAudio ? (
              <>
                <Pause size={20} className="animate-pulse" aria-hidden="true" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Play size={20} aria-hidden="true" />
                <span>Hear Your Recording</span>
              </>
            )}
          </button>
        </div>
      )}

      <div data-tour-id="tour-feedback-area" className="space-y-4">
        {showFeedback && result && !isListening && (
          <div 
            className={`mt-6 p-5 rounded-lg transition-all ${
              result.similarity > 80
                ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                : 'bg-orange-50 border-2 border-orange-400 shadow-lg'
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Resultado: ${result.similarity}% de acurácia`}
          >
            <div className="flex items-center gap-3 mb-3">
              {result.similarity > 80 ? (
                <CheckCircle className="text-green-600" size={32} aria-hidden="true" />
              ) : (
                <XCircle className="text-orange-600" size={32} aria-hidden="true" />
              )}
              <h3 className={`font-bold text-xl ${result.similarity > 80 ? 'text-green-700' : 'text-orange-700'}`}>
                {result.similarity > 80 ? 'Perfect! 🎉' : 'Keep Practicing! 💪'}
              </h3>
            </div>

            <div className="space-y-2">
            <div
              className="bg-white bg-opacity-60 p-3 rounded-lg"
              data-tour-id="tour-feedback-summary"
            >
                <p className="text-gray-700">
                  <span className="font-semibold">You said:</span> <span className="text-gray-900">"{transcript}"</span>
                </p>
              </div>

              <div
                className="flex items-center justify-between bg-white bg-opacity-60 p-3 rounded-lg"
                data-tour-id="tour-feedback-accuracy"
              >
                <span className="font-semibold text-gray-700">Accuracy:</span>
                <span className={`text-2xl font-bold ${
                  result.similarity > 80 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {result.similarity}%
                </span>
              </div>

               {transcript && !isListening && (
                        <div className="mt-4" data-tour-id="tour-feedback-word">
                          <PhonemeFeedback
                            expectedText={phrase.text}
                            spokenText={transcript}
                            userAudioBlob={audioBlob}
                          />
                        </div>
                      )}
            </div>
          </div>
        )}


      </div>

      {isListening && (
        <div 
          className="mt-6 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border-2 border-red-200"
          role="status"
          aria-live="polite"
          aria-label="Gravando áudio"
        >
          <Loader className="animate-spin" size={28} aria-hidden="true" />
          <span className="font-bold text-lg">🎙️ Recording & Listening...</span>
        </div>
      )}

      <FireworksCelebration show={showFireworks} />
    </div>
  );
};