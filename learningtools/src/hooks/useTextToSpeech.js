import { useCallback, useEffect, useState } from 'react';

export const useTextToSpeech = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Verifica se o navegador suporta speech synthesis
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      console.log('✅ Speech Synthesis is supported');
    } else {
      console.error('❌ Speech Synthesis NOT supported');
    }
  }, []);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      alert('Your browser does not support text-to-speech');
      return;
    }

    try {
      // Cancela qualquer fala em andamento
      window.speechSynthesis.cancel();

      // Aguarda um pouco para garantir que cancelou
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Configurações
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Eventos para debug
        utterance.onstart = () => {
          console.log('🔊 Started speaking:', text);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('✅ Finished speaking');
          setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event);
          setIsSpeaking(false);
        };

        // Inicia a fala
        window.speechSynthesis.speak(utterance);
        console.log('📢 Speak command sent');

      }, 100);

    } catch (error) {
      console.error('Error in speak function:', error);
      alert('Error trying to speak: ' + error.message);
    }
  }, []);

  return { speak, isSupported, isSpeaking };
};