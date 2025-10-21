import { useState, useCallback, useRef, useEffect } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';

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
export const useSpeechRecognitionForChunks = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const playingAudiosRef = useRef(new Set()); // Track de áudios tocando
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const finalTranscriptRef = useRef(''); // ✅ CRÍTICO: Ref para persistir texto final
  const silenceTimerRef = useRef(null); // ✅ Timer para detectar silêncio

  // ══════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech Recognition não suportado');
      setError('Speech Recognition não é suportado neste navegador');
      setIsSupported(false);
      console.error('Speech recognition not supported');
      setError('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // CONFIGURAÇÃO OTIMIZADA PARA MOBILE
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.lang = 'en-US';
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
      let interimText = '';
      let hasFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim();
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // ✅ Filtro anti-repetição
          const cleanText = removeDuplicateWords(text);

          // ✅ Acumula texto final em ref (persiste entre renders)
          if (finalTranscriptRef.current) {
            finalTranscriptRef.current += ' ' + cleanText;
            finalTranscriptRef.current += ' ' + text;
          } else {
            finalTranscriptRef.current = cleanText;
            finalTranscriptRef.current = text;
          }
          hasFinal = true;
          console.log('✅ Final (limpo):', cleanText);
          console.log('🎤 Final text captured:', finalTranscriptRef.current);
        } else {
          interim = text;
          interimText = text;
          console.log('⏳ Interim:', text);
        }
      }

      // Atualiza state com texto final ou interim
      if (hasFinal) {
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript('');
        // ✅ Reset timer de silêncio quando há fala final
        resetSilenceTimer();
      } else if (interim) {
        setInterimTranscript(interim);
      } else if (interimText) {
        setTranscript(interimText);
        // ✅ Reset timer quando há fala interim
        resetSilenceTimer();
      }
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Recognition terminou');
      console.log('🛑 Recognition ended');
      setIsListening(false);
      setInterimTranscript('');

      if (finalTranscriptRef.current) {
      // Para a gravação quando o reconhecimento terminar
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // ✅ Garante que transcript final está no state
      if (finalTranscriptRef.current && finalTranscriptRef.current.trim()) {
        setTranscript(finalTranscriptRef.current);
        console.log('✅ Final transcript set:', finalTranscriptRef.current);
      }

      // Limpa timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Erro:', event.error);
      console.error('❌ Recognition error:', event.error);

      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente falar mais alto.');
      } else if (event.error === 'not-allowed') {
        setError('🔒 Permissão do microfone negada.');
      } else if (event.error === 'audio-capture') {
        setError('❌ Não foi possível acessar o microfone.');
        // Não é um erro crítico no mobile
        console.log('No speech detected (normal on mobile)');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted (normal)');
      } else if (event.error === 'audio-capture') {
        setError('Microphone not accessible');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied');
      } else {
        setError(`Erro: ${event.error}`);
        setError(event.error);
      }

      setIsListening(false);

      // Para a gravação em caso de erro
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };


    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        } catch (e) {
          console.log('Recognition cleanup:', e);
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
  }, []);

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
  // ✅ NOVO: Função para auto-stop após silêncio (importante para mobile)
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Auto-stop após 2 segundos de silêncio
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔇 Silêncio detectado');
      if (recognitionRef.current && isListening && !isAudioPlaying) {
      console.log('⏱️ Silence detected, auto-stopping...');
      if (recognitionRef.current && isListening) {
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
        } catch (e) {
          console.log('Auto-stop error:', e);
        }
      }
    }, 2000);
  }, [isListening]);

    // ⚠️ NÃO inicia se áudio está tocando
    if (isAudioPlaying || playingAudiosRef.current.size > 0) {
      console.warn('⚠️ Não pode iniciar: áudio tocando');
      setError('Aguarde o áudio terminar antes de falar');
      return;
    }
  const startListening = useCallback(async () => {
    console.log('▶️ Start listening called');

    console.log('▶️ Iniciando escuta...');

    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];
      finalTranscriptRef.current = ''; // ✅ Reset ref

    try {
      recognitionRef.current.start();
      resetSilenceTimer();
    } catch (err) {
      console.error('Erro ao iniciar:', err);
      if (!err.message.includes('already started')) {
        setError(err.message);
      try {
        // Solicita permissão do microfone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true, // ✅ Importante para mobile
            sampleRate: 44100
          }
        });

        streamRef.current = stream;

        // Detecta o tipo MIME suportado
        let mimeType = 'audio/webm';

        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        }

        console.log('📱 Using MIME type:', mimeType);

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: mimeType
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('📼 Audio chunk recorded:', event.data.size, 'bytes');
          }
        };

        mediaRecorderRef.current.onstop = () => {
          console.log('🎬 Recording stopped, creating blob...');
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(blob);
          console.log('✅ Audio blob created:', blob.size, 'bytes');

          // Para o stream do microfone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        // ✅ Inicia gravação com chunks pequenos (melhor para mobile)
        mediaRecorderRef.current.start(100); // 100ms chunks
        console.log('🔴 Recording started');

        // ✅ Delay maior para garantir que MediaRecorder está pronto
        await new Promise(resolve => setTimeout(resolve, 200));

        // Inicia o reconhecimento de voz
        recognitionRef.current.start();
        setIsListening(true);

        // ✅ Inicia timer de silêncio
        resetSilenceTimer();

      } catch (err) {
        console.error('Error starting recording:', err);
        setError(err.message || 'Failed to start recording');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  }, [isListening, isSupported, isAudioPlaying, resetSilenceTimer]);
  }, [isListening, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Parando escuta...');
    console.log('⏸️ Stop listening called');

    // Limpa timer de silêncio
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      } catch (e) {
        console.log('Stop error (ignorable):', e);
      }
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
  const resetTranscript = useCallback(() => {
    console.log('🧹 Resetting transcript and audio');
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = ''; // ✅ Reset ref
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
    audioBlob,
    startListening,
    stopListening,
    toggleListening,
    reset,

    // Proteção de áudio
    pauseListeningForAudio,
    playAudioSafely,

    // Computed
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : '')
    resetTranscript,
    error
  };
};
