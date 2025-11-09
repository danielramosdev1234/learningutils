import { useCallback, useEffect, useState } from 'react';

export const useTextToSpeech = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);


  useEffect(() => {
    // Verifica se o navegador suporta speech synthesis
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      console.log('✅ Speech Synthesis is supported');
    } else {
      console.error('❌ Speech Synthesis NOT supported');
    }
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filtra apenas inglês
      const englishVoices = availableVoices.filter(v =>
        v.lang.startsWith('en')
      );

      console.log(`🎤 Found ${englishVoices.length} English voices`);
      setVoices(englishVoices);

      // Define voz padrão (primeira en-US)
      if (!selectedVoice && englishVoices.length > 0) {
        const defaultVoice = englishVoices.find(v => v.lang === 'en-US') || englishVoices[0];
        setSelectedVoice(defaultVoice);

        // Tenta carregar do localStorage
        const savedVoiceName = localStorage.getItem('learnfun_preferred_voice');
        if (savedVoiceName) {
          const saved = englishVoices.find(v => v.name === savedVoiceName);
          if (saved) setSelectedVoice(saved);
        }
      }
    };

    loadVoices();

    // Evento para quando as vozes carregarem (Safari/iOS precisa disso)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text, onEnd = null, rate = 0.9) => {
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
        utterance.rate = rate;  // ⭐ USA O PARÂMETRO rate
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log('🎤 Using voice:', selectedVoice.name);
              }

        // Eventos para debug
        utterance.onstart = () => {
          console.log('🔊 Started speaking:', text);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('✅ Finished speaking');
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event);
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        // Inicia a fala
        window.speechSynthesis.speak(utterance);
        console.log('📢 Speak command sent');

      }, 100);

    } catch (error) {
      console.error('Error in speak function:', error);
      alert('Error trying to speak: ' + error.message);
    }
  }, [selectedVoice]);

  return { speak, isSupported, isSpeaking, voices,
                                            selectedVoice,
                                            setSelectedVoice, speak2: speak};
};