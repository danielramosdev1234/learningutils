import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognitionForChunks = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false); // ✅ NOVO: Ref para isListening

  // ✅ Sincroniza ref com state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // ✅ CORREÇÃO: Função sem dependências para evitar recriação
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Auto-stop após 2 segundos de silêncio
    silenceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Silence detected, auto-stopping...');
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Auto-stop error:', e);
        }
      }
    }, 2000);
  }, []); // ✅ Sem dependências

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setError('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // CONFIGURAÇÃO OTIMIZADA PARA MOBILE
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event) => {
      let interimText = '';
      let hasFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // ✅ Acumula texto final em ref (persiste entre renders)
          if (finalTranscriptRef.current) {
            finalTranscriptRef.current += ' ' + text;
          } else {
            finalTranscriptRef.current = text;
          }
          hasFinal = true;
          console.log('🎤 Final text captured:', finalTranscriptRef.current);
        } else {
          interimText = text;
          console.log('⏳ Interim:', text);
        }
      }

      // Atualiza state com texto final ou interim
      if (hasFinal) {
        setTranscript(finalTranscriptRef.current);
        // ✅ Reset timer de silêncio quando há fala final
        resetSilenceTimer();
      } else if (interimText) {
        setTranscript(interimText);
        // ✅ Reset timer quando há fala interim
        resetSilenceTimer();
      }
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Recognition ended');
      setIsListening(false);

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
      console.error('❌ Recognition error:', event.error);

      if (event.error === 'no-speech') {
        console.log('No speech detected (normal on mobile)');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted (normal)');
      } else if (event.error === 'audio-capture') {
        setError('Microphone not accessible');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied');
      } else {
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
  }, [resetSilenceTimer]); // ✅ Agora pode incluir resetSilenceTimer

  const startListening = useCallback(async () => {
    console.log('▶️ Start listening called');

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];
      finalTranscriptRef.current = '';

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        streamRef.current = stream;

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

          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        mediaRecorderRef.current.start(100);
        console.log('🔴 Recording started');

        await new Promise(resolve => setTimeout(resolve, 200));

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
  }, [isListening, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Stop listening called');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error (ignorable):', e);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    console.log('🧹 Resetting transcript and audio');
    setTranscript('');
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    audioBlob,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};