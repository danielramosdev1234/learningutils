import { useState } from 'react';
import { getTranslation } from '../utils/translations';

export const useSpeechRecognition = (selectedLanguage, onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  const toggleListening = () => {
    const t = getTranslation(selectedLanguage);

    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onResult('', t.notSupported);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = selectedLanguage;
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.maxAlternatives = 1;

    let finalTranscript = '';

    newRecognition.onstart = () => {
      setIsListening(true);
      setTranscript('🎤 Listening...');
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
      const t = getTranslation(selectedLanguage);
      setIsListening(false);
      setRecognition(null);

      if (event.error === 'no-speech') {
        onResult('', t.noSpeech);
      } else if (event.error === 'not-allowed') {
        onResult('', '🔒 Microphone permission denied. Click the 🔒 icon next to the URL and allow microphone access. 🔒 Permissão do microfone negada. Clique no ícone 🔒 ao lado da URL e permita o acesso ao microfone.');
      } else if (event.error !== 'aborted') {
        onResult('', 'Error: ' + event.error);
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
      setRecognition(null);

      if (finalTranscript && finalTranscript.trim()) {
        onResult(finalTranscript, '');
      }
    };

    setRecognition(newRecognition);
    newRecognition.start();
  };

  return { isListening, transcript, setTranscript, toggleListening };
};