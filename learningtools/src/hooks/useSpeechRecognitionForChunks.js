import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 🎯 SOLUÇÃO: Transcrição em Tempo Real + Gravação de Backup
 *
 * ESTRATÉGIA:
 * 1. Usa Web Speech API para transcrição em tempo real
 * 2. Simultaneamente grava o áudio como backup
 * 3. MAS: Inicia SpeechRecognition PRIMEIRO (prioridade)
 * 4. Depois inicia MediaRecorder (secundário)
 *
 * DIFERENÇA DO HOOK PROBLEMÁTICO:
 * - Ordem invertida: Speech primeiro, MediaRecorder depois
 * - Speech não é continuous (para quando detecta fim de frase)
 * - MediaRecorder só grava se Speech funcionar
 * - Fallback: Se Speech falhar, você tem o áudio gravado
 */
export const useSpeechRecognitionForChunks = (language = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // ══════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DO SPEECHRECOGNITION
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech Recognition não suportado neste navegador');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // ✅ CONFIGURAÇÃO OTIMIZADA PARA MOBILE
    recognitionRef.current.continuous = false; // ⚠️ FALSE para evitar conflitos
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech Recognition iniciado');
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final = text;
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + text;
          console.log('✅ Final:', text);
        } else {
          interim = text;
        }
      }

      if (final) {
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Speech Recognition terminou');
      setIsListening(false);
      setInterimTranscript('');

      // Para MediaRecorder quando Speech terminar
      stopRecording();

      // Define transcript final
      if (finalTranscriptRef.current) {
        setTranscript(finalTranscriptRef.current);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Speech error:', event.error);

      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente novamente.');
      } else if (event.error === 'not-allowed') {
        setError('🔒 Permissão do microfone negada');
      } else if (event.error === 'aborted') {
        console.log('Speech aborted (normal)');
      } else {
        setError(`Erro: ${event.error}`);
      }

      setIsListening(false);
      stopRecording();
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      cleanup();
    };
  }, [language]);

  // ══════════════════════════════════════════════════════════════
  // INICIA LISTENING (Speech primeiro, depois Recording)
  // ══════════════════════════════════════════════════════════════
  const startListening = useCallback(async () => {
    console.log('▶️ Iniciando captura...');

    if (!recognitionRef.current) {
      setError('Speech Recognition não disponível');
      return;
    }

    // Reset
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = '';

    try {
      // ✅ PASSO 1: Inicia SpeechRecognition PRIMEIRO
      recognitionRef.current.start();
      console.log('✅ SpeechRecognition iniciado');

      // ✅ PASSO 2: Aguarda um pouco antes de iniciar gravação
      await new Promise(resolve => setTimeout(resolve, 300));

      // ✅ PASSO 3: Inicia MediaRecorder (backup)
      await startRecording();

    } catch (err) {
      console.error('Erro ao iniciar:', err);
      setError(err.message);
      setIsListening(false);
    }
  }, []);

  // ══════════════════════════════════════════════════════════════
  // PARA LISTENING
  // ══════════════════════════════════════════════════════════════
  const stopListening = useCallback(() => {
    console.log('⏸️ Parando captura...');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
    }

    stopRecording();
  }, []);

  // ══════════════════════════════════════════════════════════════
  // MEDIARECORDER (gravação de backup)
  // ══════════════════════════════════════════════════════════════
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Detecta MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      console.log('📱 MIME type:', mimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        console.log('✅ Áudio gravado:', blob.size, 'bytes');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start(100);
      console.log('🔴 Gravação de backup iniciada');

    } catch (err) {
      console.warn('⚠️ MediaRecorder falhou (não crítico):', err);
      // Não é erro fatal - Speech ainda pode funcionar
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        console.log('🎬 Gravação parada');
      } catch (e) {
        console.log('Stop recording error:', e);
      }
    }
  };

  // ══════════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════════
  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript, // Texto temporário enquanto fala
    audioBlob, // Áudio gravado como backup
    error,
    startListening,
    stopListening,
    reset
  };
};