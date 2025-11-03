// src/components/PhraseCard.jsx (ATUALIZADO)

import React, { useState, useEffect, useRef, useMemo  } from 'react';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, Loader, AlertCircle, Play, Pause } from 'lucide-react';
import { useSpeechRecognitionForChunks } from '../../hooks/useSpeechRecognitionForChunks';
import { compareTexts } from '../../utils/textComparison';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { IPATranscription } from '../pronunciation/IPATranscription';
import { PhonemeFeedback } from '../pronunciation/PhonemeFeedback';
import { ShareButton } from '../ui/ShareButton';
import { FireworksCelebration } from '../celebrations/FireworksCelebration';
import { markPhraseCompleted } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';

const isAndroidDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua);
};

export const PhraseCard = ({ phrase, onSpeak, onCorrectAnswer, isActive }) => {

 // ✅ Detecta se é Android
 const isAndroid = useMemo(() => true, []);// teste

 // ✅ Hook para Desktop/iOS (com gravação de áudio)
 const chunksHook = useSpeechRecognitionForChunks();

 const dispatch = useDispatch();

 // ✅ Hook para Android (sem gravação)
 const [androidTranscript, setAndroidTranscript] = useState('');
 const [androidError, setAndroidError] = useState('');
 const simpleHook = useSpeechRecognition('en-US', (text, err) => {
   if (err) {
     setAndroidError(err);
   } else {
     setAndroidTranscript(text);
   }
 });

 // ✅ Seleciona o hook apropriado
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
  const [showIPA, setShowIPA] = useState(false); // NOVO: Estado para toggle IPA
  const [showFireworks, setShowFireworks] = useState(false);

  const [totalPracticed, setTotalPracticed] = useState(() => {
    const stored = localStorage.getItem('learnfun_total_practiced');
    return stored ? parseInt(stored) : 0;
  });

  const audioRef = useRef(null);

  // Processa o resultado quando terminar de ouvir
  useEffect(() => {
    if (transcript && !isListening && !hasProcessed && transcript.trim() !== '') {
      console.log('🔊 Processing - Phrase:', phrase.text, '| Said:', transcript);

      const comparison = compareTexts(phrase.text, transcript);
      console.log('📈 Result:', comparison.similarity + '%');

      setResult(comparison);
      setShowFeedback(true);
      setHasProcessed(true);

      if (comparison.similarity >= 80) {
            console.log(`✅ ${comparison.similarity}% - Marking phrase as completed!`);

            // Marca frase como completada no Redux
            dispatch(markPhraseCompleted({
              phraseId: phrase.id,
              phraseIndex: phrase.index
            }));

            if (onCorrectAnswer) {
              console.log(`🎉 Auto advancing!`);
              onCorrectAnswer();
            }
          }

      if (comparison.similarity === 100) {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 5000);
      }

      const newTotal = totalPracticed + 1;
      setTotalPracticed(newTotal);
      localStorage.setItem('learnfun_total_practiced', newTotal);

      if (comparison.similarity > 80 && onCorrectAnswer) {
        console.log(`🎉 ${comparison.similarity}% - Auto advancing!`);
        onCorrectAnswer();
      }

      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [transcript, isListening, hasProcessed, phrase.text, onCorrectAnswer]);

useEffect(() => {
  console.log('🔄 Phrase changed, resetting states');
  setResult(null);
  setShowFeedback(false);
  setHasProcessed(false);
  setIsPlayingUserAudio(false);

  // Limpa estados do Android
  if (isAndroid) {
    setAndroidTranscript('');
    setAndroidError('');
  }
}, [phrase.text, phrase.id, isAndroid]);

  const handleMicClick = () => {
    if (isListening) {
      console.log('🛑 Stopping...');
      stopListening();
    } else {
      console.log('🎤 Starting new recording...');
      setResult(null);
      setShowFeedback(false);
      setHasProcessed(false);
      setIsPlayingUserAudio(false);

      // ✅ ADICIONAR ESTAS LINHAS PARA ANDROID:
      if (isAndroid) {
        setAndroidTranscript('');  // Limpa transcript do Android
        setAndroidError('');       // Limpa erro do Android
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

      {/* Header com frase e controles */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-gray-800">{phrase.text}</h2>
        </div>

        {phrase.translation && (
          <p className="text-gray-500 text-lg italic mb-3">{phrase.translation}</p>
        )}

     {/* NOVO: IPA Transcription */}
          <IPATranscription text={phrase.text} show={showIPA} />

      </div>



      {/* Error Display */}
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

      {/* Botões principais */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => onSpeak(phrase.text)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-semibold"
        >
          <Volume2 size={24} />
          <span>Hear</span>
        </button>

        <button
          onClick={handleMicClick}
          disabled={!!speechError}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md font-semibold ${
            speechError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          <span>{isListening ? 'Stop' : 'Speak'}</span>
        </button>
      </div>

      {/* Botão para ouvir gravação */}
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

  {/* Feedback resumido original (mantido para compatibilidade) */}
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
              <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-semibold">You said:</span> <span className="text-gray-900">"{transcript}"</span>
                </p>
              </div>

              <div className="flex items-center justify-between bg-white bg-opacity-60 p-3 rounded-lg">
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

      {/* NOVO: Phoneme Feedback - Mostra análise detalhada */}
      {transcript && !isListening && (
        <PhonemeFeedback
          expectedText={phrase.text}
          spokenText={transcript}
          userAudioBlob={audioBlob}
        />
      )}



      {/* Indicador de gravação */}
      {isListening && (
        <div className="mt-6 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <Loader className="animate-spin" size={28} />
          <span className="font-bold text-lg">🎙️ Recording & Listening...</span>
        </div>
      )}

  {/* Fogos de artifício para 100% */}
        <FireworksCelebration show={showFireworks} />
    </div>
  );
};