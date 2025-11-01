import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Zap, Volume2, Mic, MicOff, CheckCircle, XCircle, Play, Hash } from 'lucide-react';
import { loadChallengeLeaderboard, saveChallengeRecord, checkIfMakesTop10 } from '../../services/challengeLeaderboardService';
import { useSelector, useDispatch } from 'react-redux';
import { updateChallengeHighScore } from '../../store/slices/userSlice';
import ProtectedLeaderboardSave from '../leaderboard/ProtectedLeaderboardSave';

// Versão integrada para o TrainerSelector
const TrainerSelector = () => {
  const [activeTrainer, setActiveTrainer] = useState('challenge');

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center gap-4 py-4">
            <button
              onClick={() => setActiveTrainer('challenge')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTrainer === 'challenge'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-5 h-5" />
              Challenge Mode
            </button>
          </div>
        </div>
      </nav>

      <div className="transition-opacity duration-300">
        <ChallengeTrainer />
      </div>
    </div>
  );
};

// Mock data expandido com mais expressões idiomáticas
const DEMO_PHRASES = [
  { id: 1, text: "back to square one", translation: "voltar à estaca zero" },
  { id: 2, text: "break a leg", translation: "boa sorte" },
  { id: 3, text: "piece of cake", translation: "moleza" },
  { id: 4, text: "hit the books", translation: "estudar" },
  { id: 5, text: "under the weather", translation: "doente" },
  { id: 6, text: "spill the beans", translation: "contar o segredo" },
  { id: 7, text: "once in a blue moon", translation: "raramente" },
  { id: 8, text: "let the cat out", translation: "revelar o segredo" },
  { id: 9, text: "cost an arm and a leg", translation: "muito caro" },
  { id: 10, text: "on cloud nine", translation: "muito feliz" },

  // Novas expressões
  { id: 11, text: "bite the bullet", translation: "encarar algo difícil" },
  { id: 12, text: "hit the nail on the head", translation: "acertar em cheio" },
  { id: 13, text: "the ball is in your court", translation: "a decisão é sua" },
  { id: 14, text: "burn the midnight oil", translation: "trabalhar até tarde" },
  { id: 15, text: "call it a day", translation: "encerrar o dia" },
  { id: 16, text: "cut to the chase", translation: "ir direto ao ponto" },
  { id: 17, text: "get cold feet", translation: "ficar com medo/desistir" },
  { id: 18, text: "hit the sack", translation: "ir dormir" },
  { id: 19, text: "jump on the bandwagon", translation: "seguir a moda" },
  { id: 20, text: "kill two birds with one stone", translation: "matar dois coelhos com uma cajadada" },
  { id: 21, text: "let sleeping dogs lie", translation: "deixar pra lá" },
  { id: 22, text: "make a long story short", translation: "resumindo" },
  { id: 23, text: "no pain no gain", translation: "sem esforço não há recompensa" },
  { id: 24, text: "pull someone's leg", translation: "fazer brincadeira com alguém" },
  { id: 25, text: "see eye to eye", translation: "concordar plenamente" },
  { id: 26, text: "the best of both worlds", translation: "o melhor dos dois mundos" },
  { id: 27, text: "time flies", translation: "o tempo voa" },
  { id: 28, text: "beat around the bush", translation: "enrolar" },
  { id: 29, text: "blessing in disguise", translation: "bênção disfarçada" },
  { id: 30, text: "cross that bridge when you come to it", translation: "resolver quando chegar a hora" },
  { id: 31, text: "cry over spilled milk", translation: "chorar pelo leite derramado" },
  { id: 32, text: "don't put all your eggs in one basket", translation: "não coloque todos os ovos na mesma cesta" },
  { id: 33, text: "easy does it", translation: "calma, com cuidado" },
  { id: 34, text: "get out of hand", translation: "sair do controle" },
  { id: 35, text: "give it a shot", translation: "tentar" },
  { id: 36, text: "hang in there", translation: "aguente firme" },
  { id: 37, text: "it's not rocket science", translation: "não é tão difícil assim" },
  { id: 38, text: "keep an eye on", translation: "ficar de olho" },
  { id: 39, text: "when pigs fly", translation: "quando as galinhas tiverem dentes" },
  { id: 40, text: "wrap your head around", translation: "conseguir entender algo complexo" }
];

const ChallengeTrainer = () => {

  const dispatch = useDispatch();
  const { mode, profile } = useSelector(state => state.user);

  const [completedPhrases, setCompletedPhrases] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'finished'
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Carregar leaderboard do Firebase
    useEffect(() => {
      loadLeaderboardData();
    }, []);

    const loadLeaderboardData = async () => {
      const leaders = await loadChallengeLeaderboard();
      setLeaderboard(leaders);
    };

  // Cronômetro
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setCurrentPhraseIndex(Math.floor(Math.random() * DEMO_PHRASES.length));
    setCompletedPhrases(0);
    setLastResult(null);
    setTranscript('');
  };

  const endGame = () => {
      setGameState('finished');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);

      // ↓ ADICIONAR: atualiza high score no Redux
      dispatch(updateChallengeHighScore(completedPhrases));

      const wouldMakeTop10 = checkIfMakesTop10(completedPhrases, leaderboard);
      if (wouldMakeTop10) {
        setShowNameInput(true);
      }
    };

  const saveToLeaderboard = async () => {
      // Remove validação de playerName, usa do Redux
      const name = mode === 'authenticated' ? profile.displayName : 'Anonymous';

      const success = await saveChallengeRecord(name, completedPhrases);

      if (success) {
        await loadLeaderboardData();
        setShowNameInput(false);
        setPlayerName('');
        alert('🎉 Score saved successfully!');
      } else {
        alert('❌ Error saving score. Please try again.');
      }
    };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setLastResult(null);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      checkAnswer(spokenText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const checkAnswer = (spokenText) => {
    const currentPhrase = DEMO_PHRASES[currentPhraseIndex];
    const similarity = calculateSimilarity(currentPhrase.text, spokenText);

    setLastResult({ similarity, correct: similarity >= 90 });

    if (similarity >= 90) {
      // Correct! Move to next phrase
      setTimeout(() => {
        setCompletedPhrases(prev => prev + 1);
        setCurrentPhraseIndex(prev => (prev + 1) % DEMO_PHRASES.length);
        setLastResult(null);
        setTranscript('');
      }, 1000);
    }
  };

  const calculateSimilarity = (str1, str2) => {
    const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const s1 = normalize(str1);
    const s2 = normalize(str2);

    if (s1 === s2) return 100;

    // Simple Levenshtein-based similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 100;

    const editDistance = getEditDistance(s1, s2);
    return Math.round(((longer.length - editDistance) / longer.length) * 100);
  };

  const getEditDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

const shareScore = () => {
    // Construir URL com query parameter
    const baseUrl = window.location.origin + window.location.pathname;
    const challengeUrl = `${baseUrl}?mode=challenge`;
    const text = `🏆 I just completed ${completedPhrases} phrases in 60 seconds on Challenge Mode! Can you beat my score? 🎯`;

    if (navigator.share) {
      navigator.share({
        title: 'Challenge Mode Score',
        text: text,
        url: challengeUrl
      }).catch(() => {});
    } else {
      const fullText = `${text}\n${challengeUrl}`;
      navigator.clipboard.writeText(fullText);
      alert('Score and link copied to clipboard! 📋');
    }
  };

  const challengeFriend = () => {
    // Construir URL com query parameter
    const baseUrl = window.location.origin + window.location.pathname;
    const challengeUrl = `${baseUrl}?mode=challenge`;
    const text = `🎮 I challenge you to beat my score of ${completedPhrases} phrases in Challenge Mode! Think you can do better? 💪`;

    if (navigator.share) {
      navigator.share({
        title: 'Challenge Your Friend',
        text: text,
        url: challengeUrl
      }).catch(() => {});
    } else {
      const fullText = `${text}\n${challengeUrl}`;
      navigator.clipboard.writeText(fullText);
      alert('Challenge and link copied to clipboard! Send it to your friends! 📋');
    }
  };

  const currentPhrase = DEMO_PHRASES[currentPhraseIndex];

  // Ready Screen
  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="text-yellow-500" size={48} />
              <h1 className="text-5xl font-bold text-gray-800">Challenge Mode</h1>
              <Zap className="text-yellow-500" size={48} />
            </div>
            <p className="text-gray-600 text-xl">
              How many phrases can you pronounce correctly in 60 seconds?
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Challenge Rules</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Timer className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">60 Second Timer</h3>
                  <p className="text-gray-600">Complete as many phrases as possible before time runs out</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">90% Accuracy Required</h3>
                  <p className="text-gray-600">You must pronounce with 90%+ accuracy to move to the next phrase</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Trophy className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">Leaderboard Glory</h3>
                  <p className="text-gray-600">Top 10 scores are saved to the leaderboard</p>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-2xl font-bold py-6 rounded-xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Play size={32} />
              START CHALLENGE
            </button>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <Trophy className="text-yellow-500" size={36} />
                Top 10 Champions
              </h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400'
                        : 'bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-700 w-8">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className="font-semibold text-gray-800">{entry.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Timer */}
          <div className="mb-6">
            <div className={`bg-white rounded-xl shadow-lg p-6 text-center ${
              timeLeft <= 10 ? 'animate-pulse ring-4 ring-red-400' : ''
            }`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Timer className={timeLeft <= 10 ? 'text-red-600' : 'text-purple-600'} size={32} />
                <span className={`text-5xl font-bold ${
                  timeLeft <= 10 ? 'text-red-600' : 'text-purple-600'
                }`}>
                  {timeLeft}s
                </span>
              </div>
              <p className="text-gray-600 font-semibold">
                Completed: <span className="text-green-600 text-xl font-bold">{completedPhrases}</span> phrases
              </p>
            </div>
          </div>

          {/* Current Phrase */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentPhrase.text}</h2>
              {currentPhrase.translation && (
                <p className="text-gray-500 text-lg italic">{currentPhrase.translation}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => speak(currentPhrase.text)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-semibold"
              >
                <Volume2 size={24} />
                Hear
              </button>

              <button
                onClick={handleMicClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md font-semibold ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                {isListening ? 'Stop' : 'Speak'}
              </button>
            </div>

            {/* Feedback */}
            {lastResult && (
              <div className={`p-5 rounded-lg ${
                lastResult.correct
                  ? 'bg-green-50 border-2 border-green-400'
                  : 'bg-orange-50 border-2 border-orange-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {lastResult.correct ? (
                      <CheckCircle className="text-green-600" size={32} />
                    ) : (
                      <XCircle className="text-orange-600" size={32} />
                    )}
                    <div>
                      <p className="font-bold text-lg">
                        {lastResult.correct ? '✅ Correct!' : '❌ Try Again'}
                      </p>
                      <p className="text-sm text-gray-600">You said: "{transcript}"</p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${
                    lastResult.correct ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {lastResult.similarity}%
                  </span>
                </div>
              </div>
            )}

            {isListening && (
              <div className="mt-4 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <Mic className="animate-pulse" size={24} />
                <span className="font-bold">🎙️ Listening...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Finished Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <Trophy className="text-yellow-500 mx-auto mb-4" size={64} />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Challenge Complete!</h1>
            <p className="text-gray-600 text-lg">Time's up! Here's your result:</p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 mb-8">
            <p className="text-gray-700 text-xl mb-2">You completed</p>
            <p className="text-6xl font-bold text-purple-600 mb-2">{completedPhrases}</p>
            <p className="text-gray-700 text-xl">phrases in 60 seconds!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
                      <button
                        onClick={shareScore}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg"
                      >
                        <Hash size={20} />
                        Share Score
                      </button>

                      <button
                        onClick={challengeFriend}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg"
                      >
                        <Zap size={20} />
                        Challenge Friend
                      </button>
                    </div>

          {showNameInput && (
                      <>
                        {mode === 'authenticated' ? (
                          // Usuário autenticado: salva direto
                          <div className="mb-6">
                            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-4">
                              <p className="text-green-800 font-bold text-lg mb-4">
                                🎉 Você fez {completedPhrases} frases!
                              </p>
                              <button
                                onClick={saveToLeaderboard}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                <Trophy size={24} />
                                Salvar no Leaderboard
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Guest: precisa fazer login
                          <div className="mb-6">
                            <ProtectedLeaderboardSave
                              score={completedPhrases}
                              scoreLabel="Frases"
                              onSave={saveToLeaderboard}
                            >
                              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xl font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <Trophy size={24} />
                                Salvar no Leaderboard (requer login)
                              </button>
                            </ProtectedLeaderboardSave>
                          </div>
                        )}
                      </>
                    )}

                    {/* ↓ Botão Play Again permanece igual */}
                    <button
                      onClick={() => setGameState('ready')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500..."
                    >
                      <Play size={24} />
                      Play Again
                    </button>

          <button
            onClick={() => setGameState('ready')}
            className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-semibold py-3 rounded-lg transition-colors"
          >
            Back to Menu
          </button>

          {showNameInput && mode === 'authenticated' && (
                  <button onClick={saveToLeaderboard}>
                    💾 Save to Leaderboard
                  </button>
                )}

                {showNameInput && mode === 'guest' && (
                  <ProtectedLeaderboardSave
                    score={completedPhrases}
                    scoreLabel="Phrases"
                    onSave={saveToLeaderboard}
                  >
                    <button className="bg-yellow-500...">
                      🏆 Save to Leaderboard
                    </button>
                  </ProtectedLeaderboardSave>
                )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeTrainer;