import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, Loader, AlertCircle, Play, Pause } from 'lucide-react';
import { useSpeechRecognitionForChunks } from '../hooks/useSpeechRecognitionForChunks';
import { compareTexts } from '../utils/textComparison';

export const PhraseCard = ({ phrase, onSpeak, onCorrectAnswer, isActive }) => {
  const {
    isListening,
    transcript,
    audioBlob, // Novo: recebe o áudio gravado
    startListening,
    stopListening,
    error: speechError
  } = useSpeechRecognitionForChunks();

  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);

  const audioRef = useRef(null); // Ref para o elemento de áudio

  // Processa o resultado quando terminar de ouvir
  useEffect(() => {
    if (transcript && !isListening && !hasProcessed && transcript.trim() !== '') {
      console.log('📊 Processing - Phrase:', phrase.text, '| Said:', transcript);

      const comparison = compareTexts(phrase.text, transcript);
      console.log('📈 Result:', comparison.similarity + '%');

      setResult(comparison);
      setShowFeedback(true);
      setHasProcessed(true);

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
      startListening();
    }
  };

  // Reproduz o áudio gravado do usuário
  const playUserAudio = () => {
    if (!audioBlob) {
      console.log('⚠️ No audio to play');
      return;
    }

    console.log('🔊 Playing recorded audio...');

    // Para qualquer áudio tocando
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Cria URL do blob
    const audioUrl = URL.createObjectURL(audioBlob);

    // Cria elemento de áudio
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
      alert('Error playing audio');
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{phrase.text}</h2>
        {phrase.translation && (
          <p className="text-gray-500 text-lg italic">{phrase.translation}</p>
        )}
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

      {/* Botão para ouvir a GRAVAÇÃO REAL do usuário */}
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

      {showFeedback && result && (
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

            {result.similarity > 80 && (
              <div className="bg-green-100 border border-green-300 p-3 rounded-lg flex items-center gap-2 animate-pulse">
                <span className="text-2xl">➡️</span>
                <p className="text-green-700 font-semibold">
                  Moving to next phrase in 2s...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isListening && (
        <div className="mt-6 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <Loader className="animate-spin" size={28} />
          <span className="font-bold text-lg">🎙️ Recording & Listening...</span>
        </div>
      )}
    </div>
  );
};