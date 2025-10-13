import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, Globe, Loader, Trophy, Award } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAt2pGCDu7UgdRBGvOFb98jwdUNE_vydiI",
  authDomain: "learnfun-2e26f.firebaseapp.com",
  projectId: "learnfun-2e26f",
  storageBucket: "learnfun-2e26f.firebasestorage.app",
  messagingSenderId: "620241304009",
  appId: "1:620241304009:web:0ba10caafa660e99a89018",
  measurementId: "G-KB84MN7XFX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function NumberSpeechTrainer() {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [recognition, setRecognition] = useState(null);
   const [showRecordModal, setShowRecordModal] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [canRegisterRecord, setCanRegisterRecord] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        const languageMap = {};
        voices.forEach(voice => {
          const langCode = voice.lang;
          if (!languageMap[langCode]) {
            let displayName = langCode;

            // Mapeamento manual dos idiomas mais comuns
                        const languageNames = {
                          'en-US': 'English (United States)',
                          'en-GB': 'English (United Kingdom)',
                          'pt-BR': 'Português (Brasil)',
                          'pt-PT': 'Português (Portugal)',
                          'es-ES': 'Español (España)',
                          'es-MX': 'Español (México)',
                          'fr-FR': 'Français (France)',
                          'de-DE': 'Deutsch (Deutschland)',
                          'it-IT': 'Italiano (Italia)',
                          'ja-JP': '日本語 (日本)',
                          'ko-KR': '한국어 (대한민국)',
                          'zh-CN': '中文 (中国)',
                          'zh-TW': '中文 (台灣)',
                          'ru-RU': 'Русский (Россия)',
                          'ar-SA': 'العربية (السعودية)',
                          'hi-IN': 'हिन्दी (भारत)',
                          'nl-NL': 'Nederlands (Nederland)',
                          'pl-PL': 'Polski (Polska)',
                          'tr-TR': 'Türkçe (Türkiye)',
                          'sv-SE': 'Svenska (Sverige)',
                          'no-NO': 'Norsk (Norge)',
                          'da-DK': 'Dansk (Danmark)',
                          'fi-FI': 'Suomi (Suomi)',
                          'cs-CZ': 'Čeština (Česko)',
                          'el-GR': 'Ελληνικά (Ελλάδα)',
                          'he-IL': 'עברית (ישראל)',
                          'th-TH': 'ไทย (ไทย)',
                          'vi-VN': 'Tiếng Việt (Việt Nam)',
                          'id-ID': 'Bahasa Indonesia (Indonesia)'
                        };

                        // Tenta usar o mapeamento manual primeiro
                        if (languageNames[langCode]) {
                          displayName = languageNames[langCode];
                        } else {
                          // Fallback: tenta usar Intl.DisplayNames
                          try {
                            const [baseLang, region] = langCode.split('-');
                            const langName = new Intl.DisplayNames(['en'], { type: 'language' }).of(baseLang);
                            const regionName = region ? new Intl.DisplayNames(['en'], { type: 'region' }).of(region.toUpperCase()) : '';
                            displayName = regionName ? `${langName} (${regionName})` : langName;
                          } catch (e) {
                            displayName = langCode;
                          }
                        }

            languageMap[langCode] = {
              code: langCode,
              name: voice.name,
              localName: displayName,
              voices: []
            };
          }
          languageMap[langCode].voices.push(voice);
        });

        const languageArray = Object.values(languageMap).sort((a, b) =>
          a.localName.localeCompare(b.localName)
        );

        setAvailableVoices(languageArray);
        setLoadingVoices(false);
      }
    };

    loadVoices();

    const timeout = setTimeout(() => {
      loadVoices();
      setLoadingVoices(false);
    }, 100);

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
      generateNewNumber();
    }, [minRange, maxRange]);

    useEffect(() => {
      loadLeaderboard();
    }, [selectedLanguage]);

    const loadLeaderboard = async () => {
          try {
            setLoadingLeaderboard(true);
            // Busca todos os documentos do idioma e ordena no cliente
            const q = query(
              collection(db, 'leaderboard'),
              where('language', '==', selectedLanguage)
            );
            const querySnapshot = await getDocs(q);
            const leaders = querySnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .sort((a, b) => b.score - a.score) // Ordena no cliente
              .slice(0, 10); // Limita a 10
            setLeaderboard(leaders);
          } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Fallback: busca todos e filtra/ordena no cliente
            try {
              const allDocs = await getDocs(collection(db, 'leaderboard'));
              const leaders = allDocs.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => doc.language === selectedLanguage)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
              setLeaderboard(leaders);
            } catch (fallbackError) {
              console.error('Fallback error:', fallbackError);
            }
          } finally {
            setLoadingLeaderboard(false);
          }
        };

    const checkIfNewRecord = () => {
      if (score.total < 10) return false; // Mínimo 10 tentativas
      const percentage = (score.correct / score.total) * 100;
      if (percentage < 80) return false; // Mínimo 80% de acerto

      // Verifica se é melhor que o 10º lugar ou se há menos de 10 no ranking
      if (leaderboard.length < 10) return true;
      const lowestScore = leaderboard[leaderboard.length - 1]?.score || 0;
      return percentage > lowestScore;
    };

    const saveRecord = async () => {
        if (!playerName.trim()) return;

        try {
          const percentage = Math.round((score.correct / score.total) * 100);
          await addDoc(collection(db, 'leaderboard'), {
            name: playerName.trim().slice(0, 30),
            score: percentage,
            correct: score.correct,
            total: score.total,
            language: selectedLanguage,
            timestamp: new Date()
          });

          setShowRecordModal(false);
          setPlayerName('');
          setCanRegisterRecord(false);
          await loadLeaderboard();
        } catch (error) {
          console.error('Error saving record:', error);
        }
      };

  const generateNewNumber = () => {
    const newNum = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    setCurrentNumber(newNum);
    setTranscript('');
    setFeedback('');
  };

  const speakNumber = () => {
    window.speechSynthesis.cancel();

    const languageVoices = availableVoices.find(lang => lang.code === selectedLanguage);
    const voice = languageVoices?.voices[0];

    const utterance = new SpeechSynthesisUtterance(currentNumber.toString());
    utterance.lang = selectedLanguage;
    utterance.rate = 0.8;

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const getLanguageFlag = (langCode) => {
    const flagMap = {
      'en': '🇺🇸', 'pt': '🇧🇷', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪',
      'it': '🇮🇹', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳', 'ru': '🇷🇺',
      'ar': '🇸🇦', 'hi': '🇮🇳', 'nl': '🇳🇱', 'pl': '🇵🇱', 'tr': '🇹🇷',
      'sv': '🇸🇪', 'no': '🇳🇴', 'da': '🇩🇰', 'fi': '🇫🇮', 'cs': '🇨🇿',
      'el': '🇬🇷', 'he': '🇮🇱', 'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩'
    };

    const baseLang = langCode.split('-')[0];
    return flagMap[baseLang] || '🌐';
  };

  const getTranslation = (key) => {
    const translations = {
      'en': {
        correct: '✓ Correct! Well done! 🎉',
        notQuite: 'Not quite. You said',
        correctAnswer: 'The correct answer is',
        noSpeech: '⚠️ No speech detected. Speak louder and closer to the mic.',
        notSupported: 'Speech recognition is not supported in your browser. Try Chrome or Edge.',
        youSaid: 'You said:',
        score: 'Score:',
        howToUse: 'How to use:',
        step1: 'Select your language and number range above',
        step2: 'Click "Hear It" to listen to the number pronunciation',
        step3: 'Click "Speak" and say the number out loud',
        step4: 'Get instant feedback on your pronunciation',
        step5: 'Click "Next" for a new number'
      },
      'pt': {
        correct: '✓ Correto! Muito bem! 🎉',
        notQuite: 'Não está correto. Você disse',
        correctAnswer: 'A resposta correta é',
        noSpeech: '⚠️ Nenhuma fala detectada. Fale mais alto e próximo ao microfone.',
        notSupported: 'Reconhecimento de voz não suportado no seu navegador. Use Chrome ou Edge.',
        youSaid: 'Você disse:',
        score: 'Pontuação:',
        howToUse: 'Como usar:',
        step1: 'Selecione seu idioma e intervalo de números acima',
        step2: 'Clique em "Ouvir" para escutar a pronúncia do número',
        step3: 'Clique em "Falar" e diga o número em voz alta',
        step4: 'Receba feedback instantâneo sobre sua pronúncia',
        step5: 'Clique em "Próximo" para um novo número'
      },
      'es': {
        correct: '✓ ¡Correcto! ¡Bien hecho! 🎉',
        notQuite: 'No es correcto. Dijiste',
        correctAnswer: 'La respuesta correcta es',
        noSpeech: '⚠️ No se detectó habla. Habla más alto y cerca del micrófono.',
        notSupported: 'El reconocimiento de voz no es compatible con tu navegador. Prueba Chrome o Edge.',
        youSaid: 'Dijiste:',
        score: 'Puntuación:',
        howToUse: 'Cómo usar:',
        step1: 'Selecciona tu idioma y rango de números arriba',
        step2: 'Haz clic en "Escuchar" para oír la pronunciación del número',
        step3: 'Haz clic en "Hablar" y di el número en voz alta',
        step4: 'Obtén retroalimentación instantánea sobre tu pronunciación',
        step5: 'Haz clic en "Siguiente" para un nuevo número'
      },
      'fr': {
        correct: '✓ Correct! Bien joué! 🎉',
        notQuite: 'Pas tout à fait. Vous avez dit',
        correctAnswer: 'La bonne réponse est',
        noSpeech: '⚠️ Aucune parole détectée. Parlez plus fort et plus près du micro.',
        notSupported: 'La reconnaissance vocale n\'est pas prise en charge par votre navigateur. Essayez Chrome ou Edge.',
        youSaid: 'Vous avez dit:',
        score: 'Score:',
        howToUse: 'Comment utiliser:',
        step1: 'Sélectionnez votre langue et plage de nombres ci-dessus',
        step2: 'Cliquez sur "Écouter" pour entendre la prononciation du nombre',
        step3: 'Cliquez sur "Parler" et dites le nombre à voix haute',
        step4: 'Obtenez un retour instantané sur votre prononciation',
        step5: 'Cliquez sur "Suivant" pour un nouveau nombre'
      },
      'de': {
        correct: '✓ Richtig! Gut gemacht! 🎉',
        notQuite: 'Nicht ganz. Sie sagten',
        correctAnswer: 'Die richtige Antwort ist',
        noSpeech: '⚠️ Keine Sprache erkannt. Sprechen Sie lauter und näher am Mikrofon.',
        notSupported: 'Spracherkennung wird von Ihrem Browser nicht unterstützt. Versuchen Sie Chrome oder Edge.',
        youSaid: 'Sie sagten:',
        score: 'Punktzahl:',
        howToUse: 'So verwenden:',
        step1: 'Wählen Sie oben Ihre Sprache und Zahlenbereich',
        step2: 'Klicken Sie auf "Hören", um die Aussprache zu hören',
        step3: 'Klicken Sie auf "Sprechen" und sagen Sie die Zahl laut',
        step4: 'Erhalten Sie sofortiges Feedback zu Ihrer Aussprache',
        step5: 'Klicken Sie auf "Weiter" für eine neue Zahl'
      }
    };

    const baseLang = selectedLanguage.split('-')[0];
    return translations[baseLang] || translations['en'];
  };

  const numberToWordsSimple = (num) => {
    const lang = selectedLanguage.split('-')[0];

    // English
    if (lang === 'en') {
      const words = {
        0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
        5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
        10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
        15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
        20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
        60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety'
      };

      if (words[num]) return words[num];
      if (num < 100) {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        return words[tens] + (ones ? ' ' + words[ones] : '');
      }
      if (num < 1000) {
        const hundreds = Math.floor(num / 100);
        const remainder = num % 100;
        return words[hundreds] + ' hundred' + (remainder ? ' ' + numberToWordsSimple(remainder) : '');
      }
    }

    // Spanish
    if (lang === 'es') {
      const words = {
        0: 'cero', 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro',
        5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve',
        10: 'diez', 11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce',
        15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve',
        20: 'veinte', 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta',
        60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa'
      };

      if (words[num]) return words[num];
      if (num < 100) {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        return words[tens] + (ones ? ' y ' + words[ones] : '');
      }
      if (num < 1000) {
        const hundreds = Math.floor(num / 100);
        const remainder = num % 100;
        const hundredWord = hundreds === 1 ? 'cien' : words[hundreds] + 'cientos';
        return remainder === 0 ? hundredWord : hundredWord + ' ' + numberToWordsSimple(remainder);
      }
    }

    // Portuguese
    if (lang === 'pt') {
      const words = {
        0: 'zero', 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro',
        5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove',
        10: 'dez', 11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze',
        15: 'quinze', 16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove',
        20: 'vinte', 30: 'trinta', 40: 'quarenta', 50: 'cinquenta',
        60: 'sessenta', 70: 'setenta', 80: 'oitenta', 90: 'noventa'
      };

      if (words[num]) return words[num];
      if (num < 100) {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        return words[tens] + (ones ? ' e ' + words[ones] : '');
      }
      if (num < 1000) {
        const hundreds = Math.floor(num / 100);
        const remainder = num % 100;
        const hundredWord = num === 100 ? 'cem' : words[hundreds] + 'centos';
        return remainder === 0 ? hundredWord : hundredWord + ' e ' + numberToWordsSimple(remainder);
      }
    }

    return num.toString();
  };

  const checkAnswer = (spokenText) => {
      const t = getTranslation();
      const trimmed = spokenText ? spokenText.trim() : '';

      if (!trimmed) {
        setFeedback(t.noSpeech);
        return;
      }

      const spokenLower = trimmed.toLowerCase();
      const numberStr = currentNumber.toString();
      const numberWords = numberToWordsSimple(currentNumber).toLowerCase();

      // Remove separadores comuns (vírgulas, pontos, espaços) para comparação
      const normalizeNumber = (str) => str.replace(/[,.\s]/g, '');
      const spokenNormalized = normalizeNumber(spokenLower);
      const numberNormalized = normalizeNumber(numberStr);
      const wordsNormalized = normalizeNumber(numberWords);

      const isCorrect = spokenNormalized === numberNormalized ||
                        spokenNormalized === wordsNormalized ||
                        spokenNormalized.includes(numberNormalized) ||
                        spokenNormalized.includes(wordsNormalized) ||
                        spokenLower === numberStr ||
                        spokenLower === numberWords;

      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      if (isCorrect) {
              setFeedback(t.correct);
              setTimeout(() => {
                generateNewNumber();

                // Verifica se atingiu um recorde após atualizar o score
                setTimeout(() => {
                  if (checkIfNewRecord()) {
                    setCanRegisterRecord(true);
                  }
                }, 100);
              }, 1500);
            } else {
        setFeedback(`✗ ${t.notQuite} "${trimmed}". ${t.correctAnswer}: ${currentNumber} (${numberToWordsSimple(currentNumber)})`);
      }
    };

  const toggleListening = () => {
    const t = getTranslation();

    // Se já está ouvindo, para a captura
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    // Se não está ouvindo, inicia a captura
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedback(t.notSupported);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = selectedLanguage;
    newRecognition.continuous = true; // Mudado para true para captura contínua
    newRecognition.interimResults = true;
    newRecognition.maxAlternatives = 1;

    let finalTranscript = '';

    newRecognition.onstart = () => {
      setIsListening(true);
      setTranscript('🎤 Listening...');
      setFeedback('');
    };

    newRecognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript = transcript;
          setTranscript(transcript);
        } else {
          interimTranscript = transcript;
          setTranscript(interimTranscript);
        }
      }
    };

    newRecognition.onerror = (event) => {
      const t = getTranslation();
      setIsListening(false);
      setRecognition(null);

      if (event.error === 'no-speech') {
        setFeedback(t.noSpeech);
      } else if (event.error === 'not-allowed') {
        setFeedback('🔒 Microphone permission denied. Click the 🔒 icon next to the URL and allow microphone access. 🔒 Permissão do microfone negada. Clique no ícone 🔒 ao lado da URL e permita o acesso ao microfone.');
      } else if (event.error !== 'aborted') {
        setFeedback('Error: ' + event.error);
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
      setRecognition(null);

      if (finalTranscript && finalTranscript.trim()) {
        checkAnswer(finalTranscript);
      }
    };

    setRecognition(newRecognition);
    newRecognition.start();
  };

  if (loadingVoices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading voices...</p>
        </div>
      </div>
    );
  }

  const currentLang = availableVoices.find(l => l.code === selectedLanguage);
  const t = getTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Number Speech Trainer</h1>

                    </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {availableVoices.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {getLanguageFlag(lang.code)} {lang.localName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Number</label>
              <input
                type="number"
                value={minRange}
                onChange={(e) => setMinRange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Number</label>
              <input
                type="number"
                value={maxRange}
                onChange={(e) => setMaxRange(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-16 py-12 shadow-lg">
              <p className="text-7xl font-bold">{currentNumber}</p>
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
              onClick={speakNumber}
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
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-6 py-3 rounded-lg font-semibold transition shadow-md`}
            >
              {isListening ? '⏹️ Send' : '🎤 Speak'}
            </button>
            <button
              onClick={generateNewNumber}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              <RotateCw className="w-5 h-5" />
              Next
            </button>
          </div>

          {transcript && transcript !== '🎤 Listening...' && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
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

          <div className="p-4 bg-blue-50 rounded-lg">
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

                  {/* Leaderboard */}

                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-800">Top 10 - {currentLang?.localName || 'Ranking'}</h2>
                      </div>

                      {loadingLeaderboard ? (
                        <div className="text-center py-8">
                          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Award className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                          <p>Nenhum recorde ainda. Seja o primeiro! 🎯</p>
                          <p className="text-sm mt-2">Consiga 80%+ de acertos com pelo menos 10 tentativas</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-2 text-gray-600 font-semibold">#</th>
                                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Nome</th>
                                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Score</th>
                                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Acertos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leaderboard.map((entry, index) => (
                                <tr
                                  key={entry.id}
                                  className={`border-b border-gray-100 ${
                                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''
                                  }`}
                                >
                                  <td className="py-3 px-2">
                                    {index === 0 && <span className="text-2xl">🥇</span>}
                                    {index === 1 && <span className="text-2xl">🥈</span>}
                                    {index === 2 && <span className="text-2xl">🥉</span>}
                                    {index > 2 && <span className="text-gray-500 font-semibold">{index + 1}</span>}
                                  </td>
                                  <td className="py-3 px-4 font-medium text-gray-800">{entry.name}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                      {entry.score}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-600">
                                    {entry.correct}/{entry.total}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>


                  {/* Modal de Novo Recorde */}
                  {showRecordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-bounce-in">
                        <div className="text-center mb-6">
                          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Novo Recorde! 🎉</h2>
                          <p className="text-gray-600">
                            Você conseguiu {Math.round((score.correct / score.total) * 100)}% de acerto!
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {score.correct} corretos de {score.total} tentativas
                          </p>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Digite seu nome para o ranking:
                          </label>
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveRecord()}
                            maxLength={30}
                            placeholder="Seu nome aqui..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowRecordModal(false);
                              setPlayerName('');
                            }}
                            className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={saveRecord}
                            disabled={!playerName.trim()}
                            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  );
}