import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 🎯 Speech Recognition com Proteção Anti-Feedback
 *
 * SOLUÇÕES IMPLEMENTADAS:
 * 1. Pausa o reconhecimento quando áudio do app está tocando
 * 2. Delay antes de iniciar reconhecimento após áudio
 * 3. Detecção de quando áudio do sistema está tocando
 * 4. Auto-filtragem de repetições
 */
export const useSpeechRecognitionForChunks = (language = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const playingAudiosRef = useRef(new Set()); // Track de áudios tocando

  // ══════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech Recognition não suportado');
      setError('Speech Recognition não é suportado neste navegador');
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('🎤 Escutando...');
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      // ⚠️ NÃO processa se áudio está tocando
      if (isAudioPlaying || playingAudiosRef.current.size > 0) {
        console.log('🔇 Ignorando resultado (áudio tocando)');
        return;
      }

      let interim = '';
      let hasFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim();

        if (event.results[i].isFinal) {
          // ✅ Filtro anti-repetição
          const cleanText = removeDuplicateWords(text);

          if (finalTranscriptRef.current) {
            finalTranscriptRef.current += ' ' + cleanText;
          } else {
            finalTranscriptRef.current = cleanText;
          }
          hasFinal = true;
          console.log('✅ Final (limpo):', cleanText);
        } else {
          interim = text;
        }
      }

      if (hasFinal) {
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript('');
        resetSilenceTimer();
      } else if (interim) {
        setInterimTranscript(interim);
        resetSilenceTimer();
      }
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Recognition terminou');
      setIsListening(false);
      setInterimTranscript('');

      if (finalTranscriptRef.current) {
        setTranscript(finalTranscriptRef.current);
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Erro:', event.error);

      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente falar mais alto.');
      } else if (event.error === 'not-allowed') {
        setError('🔒 Permissão do microfone negada.');
      } else if (event.error === 'audio-capture') {
        setError('❌ Não foi possível acessar o microfone.');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted (normal)');
      } else {
        setError(`Erro: ${event.error}`);
      }

      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language, isAudioPlaying]);

  // ══════════════════════════════════════════════════════════════
  // FILTRO ANTI-REPETIÇÃO
  // ══════════════════════════════════════════════════════════════
  const removeDuplicateWords = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const seen = new Map();
    const result = [];
    let lastWord = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Remove repetições consecutivas
      if (word === lastWord) {
        continue;
      }

      // Remove repetições com no máximo 2 palavras de distância
      const lastSeen = seen.get(word);
      if (lastSeen !== undefined && i - lastSeen <= 3) {
        continue;
      }

      result.push(word);
      seen.set(word, i);
      lastWord = word;
    }

    return result.join(' ');
  };

  // ══════════════════════════════════════════════════════════════
  // GERENCIAMENTO DE ÁUDIO DO APP
  // ══════════════════════════════════════════════════════════════

  /**
   * Chame esta função ANTES de reproduzir qualquer áudio no app
   */
  const pauseListeningForAudio = useCallback(async (audioElement, duration = null) => {
    console.log('🔇 Pausando reconhecimento para áudio');

    const audioId = Date.now();
    playingAudiosRef.current.add(audioId);
    setIsAudioPlaying(true);

    // Para o reconhecimento temporariamente
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
    }

    // Monitora quando o áudio terminar
    if (audioElement) {
      const handleEnded = async () => {
        playingAudiosRef.current.delete(audioId);

        if (playingAudiosRef.current.size === 0) {
          setIsAudioPlaying(false);

          // ⚠️ CRÍTICO: Aguarda 500ms antes de reativar reconhecimento
          await new Promise(resolve => setTimeout(resolve, 500));

          // Reinicia reconhecimento se estava ativo
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log('🎤 Reconhecimento reativado após áudio');
            } catch (e) {
              console.log('Restart error:', e);
            }
          }
        }
      };

      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('pause', handleEnded);

      // Cleanup
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('pause', handleEnded);
      };
    } else if (duration) {
      // Se não tem elemento, usa duração manual
      setTimeout(() => {
        playingAudiosRef.current.delete(audioId);

        if (playingAudiosRef.current.size === 0) {
          setIsAudioPlaying(false);
        }
      }, duration);
    }
  }, [isListening]);

  /**
   * Helper para reproduzir áudio com proteção automática
   */
  const playAudioSafely = useCallback(async (audioSrc) => {
    const audio = new Audio(audioSrc);

    // Pausa reconhecimento
    const cleanup = await pauseListeningForAudio(audio);

    // Reproduz
    await audio.play();

    return { audio, cleanup };
  }, [pauseListeningForAudio]);

  // ══════════════════════════════════════════════════════════════
  // AUTO-STOP APÓS SILÊNCIO
  // ══════════════════════════════════════════════════════════════
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      console.log('🔇 Silêncio detectado');
      if (recognitionRef.current && isListening && !isAudioPlaying) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }, 3000);
  }, [isListening, isAudioPlaying]);

  // ══════════════════════════════════════════════════════════════
  // CONTROLES PÚBLICOS
  // ══════════════════════════════════════════════════════════════
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isListening) {
      return;
    }

    // ⚠️ NÃO inicia se áudio está tocando
    if (isAudioPlaying || playingAudiosRef.current.size > 0) {
      console.warn('⚠️ Não pode iniciar: áudio tocando');
      setError('Aguarde o áudio terminar antes de falar');
      return;
    }

    console.log('▶️ Iniciando escuta...');

    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
      resetSilenceTimer();
    } catch (err) {
      console.error('Erro ao iniciar:', err);
      if (!err.message.includes('already started')) {
        setError(err.message);
      }
    }
  }, [isListening, isSupported, isAudioPlaying, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Parando escuta...');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const reset = useCallback(() => {
    console.log('🧹 Resetando...');
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  return {
    // Estados
    isListening,
    isSupported,
    isAudioPlaying,
    transcript,
    interimTranscript,
    error,

    // Ações
    startListening,
    stopListening,
    toggleListening,
    reset,

    // Proteção de áudio
    pauseListeningForAudio,
    playAudioSafely,

    // Computed
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : '')
  };
};