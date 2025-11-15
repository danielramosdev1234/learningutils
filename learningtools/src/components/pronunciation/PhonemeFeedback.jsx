// src/components/pronunciation/PhonemeFeedback.jsx

import React, { useState, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, Volume2, User } from 'lucide-react';
import { usePhonemeAnalysis } from '../../hooks/usePhonemeAnalysis';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

/**
 * Componente que mostra feedback detalhado palavra por palavra
 */
export const PhonemeFeedback = ({ expectedText, spokenText, userAudioBlob }) => {
  const { analyze } = usePhonemeAnalysis();
  const { speak } = useTextToSpeech();
  const [playingWord, setPlayingWord] = useState(null);
  const [playingUserAudio, setPlayingUserAudio] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [playingPracticeWord, setPlayingPracticeWord] = useState(null);
  const audioRef = useRef(null);

  if (!expectedText || !spokenText) return null;

  const analysis = analyze(expectedText, spokenText);

  if (!analysis) return null;

  const { wordAnalysis, feedback, tips, accuracy } = analysis;

  /**
   * Toca a pronúncia correta de uma palavra específica
   */
  const playCorrectWord = (word, index) => {
    setPlayingWord(index);
    speak(word, () => {
      setPlayingWord(null);
    }, 0.50);
  };

  /**
   * Toca o som do fonema (ex: "L sound", "J sound")
   */
  const playSound = (soundName, tipIndex) => {
    setPlayingSound(tipIndex);
    // Usa o exemplo da palavra para tocar o som
    const tip = tips[tipIndex];
    if (tip && tip.example) {
      speak(tip.example, () => {
        setPlayingSound(null);
      }, 0.50);
    } else {
      // Fallback: tenta falar o nome do som
      speak(soundName, () => {
        setPlayingSound(null);
      }, 0.50);
    }
  };

  /**
   * Toca uma palavra de prática
   */
  const playPracticeWord = (word, tipIndex, wordIndex) => {
    const key = `${tipIndex}-${wordIndex}`;
    setPlayingPracticeWord(key);
    speak(word, () => {
      setPlayingPracticeWord(null);
    }, 0.50);
  };

  /**
   * Toca a pronúncia do usuário para uma palavra específica
   * Nota: Isso é uma aproximação - idealmente você teria segmentação de áudio por palavra
   */
  const playUserWord = (index) => {
    if (!userAudioBlob) {
      console.log('No user audio available');
      return;
    }

    // Para a reprodução anterior se houver
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingUserAudio(index);

    const audioUrl = URL.createObjectURL(userAudioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingUserAudio(null);
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      setPlayingUserAudio(null);
      URL.revokeObjectURL(audioUrl);
    };

    audio.play().catch(err => {
      console.error('Error playing user audio:', err);
      setPlayingUserAudio(null);
    });
  };

  return (
    <div className="mt-6 space-y-4 animate-fadeIn">

    {/* Pronunciation Tips */}
          {tips.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl shadow-md border-2 border-amber-300">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-600" />
                Pronunciation Tips
              </h4>

              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-70 p-4 rounded-lg border border-amber-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 text-amber-800 font-mono font-bold px-3 py-1 rounded text-lg">
                        {tip.phoneme}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-gray-700">
                            <strong>Sound:</strong> {tip.name || tip.sound}
                          </p>
                          <button
                            onClick={() => playSound(tip.name || tip.sound, index)}
                            disabled={playingSound === index}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                              playingSound === index
                                ? 'bg-blue-600 text-white animate-pulse'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                            title="Hear the sound"
                            aria-label={`Hear ${tip.name || tip.sound}`}
                          >
                            <Volume2 size={14} />
                            {playingSound === index ? 'Playing...' : 'Hear'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Tip:</strong> {tip.tip}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Example in phrase:</strong> "{tip.example}"
                        </p>
                        {tip.examples && tip.examples.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            <strong>Practice with:</strong>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {tip.examples.map((word, wordIndex) => (
                                <span
                                  key={wordIndex}
                                  className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                                >
                                  {word}
                                  <button
                                    onClick={() => playPracticeWord(word, index, wordIndex)}
                                    disabled={playingPracticeWord === `${index}-${wordIndex}`}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold transition-all ${
                                      playingPracticeWord === `${index}-${wordIndex}`
                                        ? 'bg-green-600 text-white animate-pulse'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                    title={`Hear ${word}`}
                                    aria-label={`Hear ${word}`}
                                  >
                                    <Volume2 size={12} />
                                    {playingPracticeWord === `${index}-${wordIndex}` ? '...' : ''}
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      {/* Word-by-Word Analysis */}
      <div className="bg-white p-5 rounded-xl shadow-md border-2 border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-blue-600" />
          Word-by-Word Analysis
        </h4>

        <div className="flex flex-wrap gap-2">
          {wordAnalysis.map((word, index) => {
            let colorClass = '';
            let icon = null;
            const showAudioButtons = word.confidence < 80; // Mostra botões se não for excelente

            if (word.confidence >= 80) {
              colorClass = 'bg-green-100 border-green-400 text-green-800';
              icon = <CheckCircle size={14} className="text-green-600" />;
            } else if (word.confidence >= 60) {
              colorClass = 'bg-yellow-100 border-yellow-400 text-yellow-800';
              icon = <AlertCircle size={14} className="text-yellow-600" />;
            } else {
              colorClass = 'bg-red-100 border-red-400 text-red-800';
              icon = <XCircle size={14} className="text-red-600" />;
            }

            return (
              <div
                key={index}
                className={`px-4 py-3 rounded-lg border-2 ${colorClass} transition-all hover:scale-105`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {icon}
                  <span className="font-bold text-base">{word.expected}</span>
                </div>

                <div className="text-xs mt-1 space-y-0.5">
                  {word.isCorrect ? (
                    <div className="font-semibold">✓ Perfect!</div>
                  ) : (
                    <div>
                      You said: <span className="font-semibold">
                        {word.spoken || '(not detected)'}
                      </span>
                    </div>
                  )}
                  <div className="opacity-75">
                    Confidence: {word.confidence}%
                  </div>

                  {/* IPA Display */}
                  {word.expectedIPA && !word.expectedIPA.includes('[') && (
                    <div className="mt-2 pt-2 border-t border-gray-300 space-y-1">
                      <div className="text-purple-700 font-mono text-xs">
                        Expected: {word.expectedIPA}
                      </div>
                      {word.spokenIPA && !word.spokenIPA.includes('[') && (
                        <div className="text-purple-600 font-mono text-xs">
                          You said: {word.spokenIPA}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Audio Buttons for problematic words */}
                {showAudioButtons && (
                  <div className="mt-3 flex gap-2 pt-2 border-t border-gray-300">
                    {/* Correct pronunciation button */}
                    <button
                      onClick={() => playCorrectWord(word.expected, index)}
                      disabled={playingWord === index}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        playingWord === index
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      title="Hear correct pronunciation"
                    >
                      <Volume2 size={14} />
                      <span>{playingWord === index ? 'Playing...' : 'Correct'}</span>
                    </button>

                    {/* User pronunciation button */}
                    {userAudioBlob && (
                      <button
                        onClick={() => playUserWord(index)}
                        disabled={playingUserAudio === index}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          playingUserAudio === index
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                        title="Hear your pronunciation"
                      >
                        <User size={14} />
                        <span>{playingUserAudio === index ? 'Playing...' : 'Yours'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="font-semibold text-gray-700 mb-2">Legend:</div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></span>
                <span>Excellent (≥80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-600" />
                <span className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></span>
                <span>Good (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-red-600" />
                <span className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></span>
                <span>Needs Practice (&lt;60%)</span>
              </div>
            </div>
            {userAudioBlob && (
              <div className="mt-3 text-gray-500 italic flex items-center gap-2">
                <Volume2 size={12} />
                <span>Click the audio buttons on red/yellow words to compare pronunciations</span>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};