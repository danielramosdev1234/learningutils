import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, Globe, Loader } from 'lucide-react';

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

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        const languageMap = {};
        voices.forEach(voice => {
          const langCode = voice.lang;
          if (!languageMap[langCode]) {
            const baseLang = langCode.split('-')[0];
            let localName = langCode;

            try {
              localName = new Intl.DisplayNames([langCode], { type: 'language' }).of(baseLang) || langCode;
            } catch (e) {
              localName = langCode;
            }

            languageMap[langCode] = {
              code: langCode,
              name: voice.name,
              localName: localName,
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

  const numberToWordsSimple = (num) => {
    const words = {
      0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
      5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
      10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
      15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
      20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
      60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety',
      100: 'hundred', 1000: 'thousand'
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

    return num.toString();
  };

  const checkAnswer = (spokenText) => {
    const trimmed = spokenText ? spokenText.trim() : '';

    if (!trimmed) {
      setFeedback('⚠️ No speech detected. Please try again.');
      return;
    }

    const spokenLower = trimmed.toLowerCase();
    const numberStr = currentNumber.toString();
    const numberWords = numberToWordsSimple(currentNumber).toLowerCase();

    const isCorrect = spokenLower === numberStr ||
                      spokenLower === numberWords ||
                      spokenLower.includes(numberStr) ||
                      spokenLower.includes(numberWords) ||
                      spokenLower.replace(/\s+/g, '') === numberWords.replace(/\s+/g, '');

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      setFeedback('✓ Correct! Well done! 🎉');
      setTimeout(() => {
        generateNewNumber();
      }, 1500);
    } else {
      setFeedback(`✗ Not quite. You said "${trimmed}". The correct answer is: ${currentNumber} (${numberToWordsSimple(currentNumber)})`);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedback('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('🎤 Listening...');
      setFeedback('');
    };

    recognition.onresult = (event) => {
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

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === 'no-speech') {
        setFeedback('⚠️ No speech detected. Speak louder and closer to the mic.');
      } else if (event.error !== 'aborted') {
        setFeedback('Error: ' + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      if (finalTranscript && finalTranscript.trim()) {
        checkAnswer(finalTranscript);
      }
    };

    recognition.start();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Number Speech Trainer</h1>

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

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <button
              onClick={speakNumber}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              <Volume2 className="w-5 h-5" />
              Hear It
            </button>
            <button
              onClick={startListening}
              disabled={isListening}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isListening ? '🎤 Listening...' : '🎤 Speak'}
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
              <p className="text-sm text-gray-600 mb-1">You said:</p>
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
                Score: <span className="font-bold text-gray-800">{score.correct} / {score.total}</span>
                {score.total > 0 && (
                  <span className="ml-2 text-sm">
                    ({Math.round((score.correct / score.total) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">How to use:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Select your language and number range above</li>
              <li>2. Click "Hear It" to listen to the number pronunciation</li>
              <li>3. Click "Speak" and say the number out loud</li>
              <li>4. Get instant feedback on your pronunciation</li>
              <li>5. Click "Next" for a new number</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}