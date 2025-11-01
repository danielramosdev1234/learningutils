import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, Loader, Trophy, Palette } from 'lucide-react';
import { useVoices } from '../../hooks/useVoices';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { getColorTranslation } from '../../utils/colorTranslations';
import { getRandomColor, getColorName, normalizeColorAnswer } from '../../utils/colorData';
import { loadLeaderboard, saveRecord as saveRecordService, checkIfNewRecord } from '../../services/leaderboardService';
import { RecordModal } from '../modals/RecordModal';
import { Leaderboard } from '../leaderboard/Leaderboard';

export default function ColorSpeechTrainer() {
  const [currentColor, setCurrentColor] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [canRegisterRecord, setCanRegisterRecord] = useState(false);

  const { availableVoices, loadingVoices } = useVoices();

  const handleSpeechResult = (spokenText, errorMsg) => {
    if (errorMsg) {
      setFeedback(errorMsg);
      return;
    }
    checkAnswer(spokenText);
  };

  const { isListening, transcript, setTranscript, toggleListening } = useSpeechRecognition(
    selectedLanguage,
    handleSpeechResult
  );

  useEffect(() => {
    generateNewColor();
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedLanguage]);

  const loadLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    const leaders = await loadLeaderboard(`color-${selectedLanguage}`);
    setLeaderboard(leaders);
    setLoadingLeaderboard(false);
  };

  const generateNewColor = () => {
    const newColor = getRandomColor();
    setCurrentColor(newColor);
    setTranscript('');
    setFeedback('');
  };

  const speakColor = () => {
    if (!currentColor) return;

    window.speechSynthesis.cancel();

    const languageVoices = availableVoices.find(lang => lang.code === selectedLanguage);
    const voice = languageVoices?.voices[0];

    const colorName = getColorName(currentColor.key, selectedLanguage);
    const utterance = new SpeechSynthesisUtterance(colorName);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.8;

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const checkAnswer = (spokenText) => {
    const t = getColorTranslation(selectedLanguage);
    const trimmed = spokenText ? spokenText.trim() : '';

    if (!trimmed) {
      setFeedback(t.noSpeech);
      return;
    }

    const correctColorName = getColorName(currentColor.key, selectedLanguage);
    const normalizedSpoken = normalizeColorAnswer(trimmed);
    const normalizedCorrect = normalizeColorAnswer(correctColorName);

    const isCorrect = normalizedSpoken === normalizedCorrect ||
                      normalizedSpoken.includes(normalizedCorrect) ||
                      normalizedCorrect.includes(normalizedSpoken);

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      setFeedback(t.correct);
      setTimeout(() => {
        generateNewColor();

        setTimeout(() => {
          const updatedScore = {
            correct: score.correct + 1,
            total: score.total + 1
          };
          if (checkIfNewRecord(updatedScore, leaderboard)) {
            setCanRegisterRecord(true);
          }
        }, 100);
      }, 1500);
    } else {
      setFeedback(`✗ ${t.notQuite} "${trimmed}". ${t.correctAnswer}: ${correctColorName}`);
    }
  };

  const handleSaveRecord = async () => {
    const success = await saveRecordService(playerName, score, `color-${selectedLanguage}`);
    if (success) {
      setShowRecordModal(false);
      setPlayerName('');
      setCanRegisterRecord(false);
      await loadLeaderboardData();
    }
  };

  if (loadingVoices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading voices...</p>
        </div>
      </div>
    );
  }

  const currentLang = availableVoices.find(l => l.code === selectedLanguage);
  const t = getColorTranslation(selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{t.title}</h1>
            </div>
          </div>

          <div className="mb-8 p-3 md:p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.language}</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              {availableVoices.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code} {lang.localName}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-600 mb-4">{t.whatColorIsThis}</p>
          </div>

          <div className="text-center mb-6 md:mb-8">
            <div
              className="inline-block rounded-2xl shadow-2xl w-64 h-64 md:w-80 md:h-80 border-8 border-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: currentColor?.hex || '#FFFFFF' }}
            >
              {/* Quadrado colorido */}
            </div>
          </div>

          {canRegisterRecord && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">🎉 Você alcançou um recorde!</p>
                    <p className="text-sm text-gray-600">Registre seu nome ou continue jogando</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecordModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition shadow-md whitespace-nowrap w-full sm:w-auto"
                >
                  Registrar Recorde
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <button
              onClick={speakColor}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              <Volume2 className="w-5 h-5" />
              Hear It
            </button>
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white px-6 py-3 rounded-lg font-semibold transition shadow-md`}
            >
              {isListening ? '⏹️ Send' : '🎤 Speak'}
            </button>
            <button
              onClick={generateNewColor}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              <RotateCw className="w-5 h-5" />
              Next
            </button>
          </div>

          {transcript && transcript !== '🎤 Listening...' && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.youSaid}</p>
              <p className="text-lg font-semibold text-gray-800">{transcript}</p>
            </div>
          )}

          {feedback && (
            <div className={`p-4 rounded-lg mb-4 ${
              feedback.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">{feedback}</p>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="inline-block bg-gray-100 rounded-lg px-6 py-3">
              <p className="text-gray-600">
                {t.score} <span className="font-bold text-gray-800">{score.correct} / {score.total}</span>
                {score.total > 0 && (
                  <span className="ml-2 text-sm">
                    ({Math.round((score.correct / score.total) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">{t.howToUse}</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. {t.step1}</li>
              <li>2. {t.step2}</li>
              <li>3. {t.step3}</li>
              <li>4. {t.step4}</li>
              <li>5. {t.step5}</li>
            </ol>
          </div>
        </div>

        <div className="mt-8">
          <Leaderboard
            leaderboard={leaderboard}
            loading={loadingLeaderboard}
            currentLang={currentLang}
          />
        </div>

        {showRecordModal && (
          <RecordModal
            score={score}
            playerName={playerName}
            setPlayerName={setPlayerName}
            onSave={handleSaveRecord}
            onClose={() => {
              setShowRecordModal(false);
              setPlayerName('');
            }}
          />
        )}
      </div>
    </div>
  );
}