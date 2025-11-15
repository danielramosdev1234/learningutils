// src/components/PhraseCard.jsx (ATUALIZADO - Referral processado no login)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, Loader, AlertCircle, Play, Pause, ArrowRight, Gift, Settings  } from 'lucide-react';
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

      if (comparison.similarity >= 80) {
        console.log(`✅ ${comparison.similarity}% - Marking phrase as completed!`);

        // Ganha XP ao acertar frase
        earnXP('phrases', {
          phraseId: phrase.id,
          accuracy: comparison.similarity,
          streak: streak.current
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
    if (isListening) {
      console.log('🛑 Stopping...');
      stopListening();
    } else {
      console.log('🎤 Starting new recording...');
      
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
  };

  const playUserAudio = () => {
    if (!audioBlob) {
      console.log('⚠️ No audio to play');
      return;
    }

    console.log('🔊 Playing recorded audio...');

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
    };

    audio.onerror = (e) => {
      console.error('❌ Audio error:', e);
      setIsPlayingUserAudio(false);
      URL.revokeObjectURL(audioUrl);
    };

    audio.play().catch(err => {
      console.error('Play error:', err);
      setIsPlayingUserAudio(false);
    });
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

      {speechError && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">
            {speechError === 'not-allowed'
              ? '🔒 Microphone permission denied. Click the 🔒 icon and allow access.'
              : `Error: ${speechError}`
            }
          </p>
        </div>
      )}

      <div className="flex justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
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
          onClick={() => onSpeak(phrase.text)}
          className="flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md font-semibold text-sm sm:text-base"
        >
          <Volume2 size={20} className="sm:w-6 sm:h-6" />
          <span>Hear</span>
        </button>

        <button
          onClick={handleMicClick}
          disabled={!!speechError}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-md font-semibold text-sm sm:text-base ${
            speechError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          data-tour-id="tour-speak-button"
        >
          {isListening ? <MicOff size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
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
          >
            {isPlayingUserAudio ? (
              <>
                <Pause size={20} className="animate-pulse" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Hear Your Recording</span>
              </>
            )}
          </button>
        </div>
      )}

      <div data-tour-id="tour-feedback-area" className="space-y-4">
        {showFeedback && result && !isListening && (
          <div className={`mt-6 p-5 rounded-lg transition-all ${
            result.similarity > 80
              ? 'bg-green-50 border-2 border-green-400 shadow-lg'
              : 'bg-orange-50 border-2 border-orange-400 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {result.similarity > 80 ? (
                <CheckCircle className="text-green-600" size={32} />
              ) : (
                <XCircle className="text-orange-600" size={32} />
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

              {result.similarity > 70 && (
                <ShareButton
                  phraseText={phrase.text}
                  accuracy={result.similarity}
                  totalPracticed={totalPracticed}
                  variant={result.similarity >= 80 ? 'celebration' : 'default'}
                />
              )}
            </div>
          </div>
        )}

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

      {isListening && (
        <div className="mt-6 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <Loader className="animate-spin" size={28} />
          <span className="font-bold text-lg">🎙️ Recording & Listening...</span>
        </div>
      )}

      <FireworksCelebration show={showFireworks} />
    </div>
  );
};