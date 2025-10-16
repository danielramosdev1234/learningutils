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
  const interimTranscriptRef = useRef(''); // ✅ NOVO: Também guarda interim
  const hasStartedRef = useRef(false); // ✅ NOVO: Flag para saber se começou
  const processingTimeoutRef = useRef(null); // ✅ NOVO: Timeout para processing
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setError('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // ✅ CONFIGURAÇÃO OTIMIZADA PARA MOBILE
    recognitionRef.current.continuous = true; // ✅ MUDANÇA CRÍTICA: false para mobile
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('🎙️ Recognition started');
      hasStartedRef.current = true;
      setTranscript('🎤 Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      console.log('📊 onresult triggered, results:', event.results.length);

      let interimText = '';
      let finalText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        console.log(`Result ${i}: "${text}" (final: ${result.isFinal})`);

        if (result.isFinal) {
          if (finalText) {
            finalText += ' ' + text;
          } else {
            finalText = text;
          }
        } else {
          if (interimText) {
            interimText += ' ' + text;
          } else {
            interimText = text;
          }
        }
      }

      // ✅ ATUALIZA REFS
      if (finalText) {
        if (finalTranscriptRef.current) {
          finalTranscriptRef.current += ' ' + finalText;
        } else {
          finalTranscriptRef.current = finalText;
        }
        console.log('✅ Final accumulated:', finalTranscriptRef.current);
      }

      if (interimText) {
        interimTranscriptRef.current = interimText;
      }

      // ✅ ATUALIZA STATE (mostra final ou interim)
      const displayText = finalTranscriptRef.current || interimText;
      if (displayText) {
        setTranscript(displayText);
        console.log('📝 Display text set:', displayText);
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          console.log('🛑 Silêncio detectado, parando...');
          recognitionRef.current.stop();
        }
      }, 2000); // Para após 2 segundos de silêncio
    };

    recognitionRef.current.onend = () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      console.log('🛑 Recognition ended');
      console.log('Final transcript ref:', finalTranscriptRef.current);
      console.log('Interim transcript ref:', interimTranscriptRef.current);

      // ✅ PROCESSAMENTO FINAL COM DELAY
      // Espera um pouco para garantir que onresult terminou
      processingTimeoutRef.current = setTimeout(() => {
        const finalText = finalTranscriptRef.current || interimTranscriptRef.current;

        if (finalText && finalText.trim() && finalText !== '🎤 Listening...') {
          console.log('✅ Setting final transcript:', finalText);
          setTranscript(finalText);
        } else {
          console.warn('⚠️ No transcript captured!');
          setTranscript(''); // Limpa se não há texto
        }

        setIsListening(false);

        // Para a gravação
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('🎬 Stopping MediaRecorder from onend');
          mediaRecorderRef.current.stop();
        }
      }, 300); // ✅ 300ms de delay para garantir processamento
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);

      // Limpa timeout se houver
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      if (event.error === 'no-speech') {
        console.log('No speech detected');
        setError('No speech detected. Please try again.');
        // ✅ Usa transcript interim se houver
        const lastText = interimTranscriptRef.current || finalTranscriptRef.current;
        if (lastText && lastText !== '🎤 Listening...') {
          setTranscript(lastText);
        }
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

      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
    };
  }, []);

  const startListening = useCallback(async () => {
    console.log('▶️ Start listening called');

    if (recognitionRef.current && !isListening) {
      // ✅ RESET COMPLETO
      setTranscript('');
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      hasStartedRef.current = false;

      try {
        // Solicita permissão do microfone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        streamRef.current = stream;

        // ✅ Detecta o melhor MIME type
        let mimeType = 'audio/webm';
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/wav'
        ];

        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }

        console.log('📱 Using MIME type:', mimeType);

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('📼 Chunk:', event.data.size, 'bytes');
          }
        };

        mediaRecorderRef.current.onstop = () => {
          console.log('🎬 Recording stopped');

          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            setAudioBlob(blob);
            console.log('✅ Audio blob:', blob.size, 'bytes');
          } else {
            console.warn('⚠️ No audio chunks recorded!');
          }

          // Para o stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        // ✅ Inicia gravação
        mediaRecorderRef.current.start(100);
        console.log('🔴 Recording started');

        // ✅ Delay antes de iniciar reconhecimento
        await new Promise(resolve => setTimeout(resolve, 200));

        // ✅ Inicia reconhecimento
        console.log('🎤 Starting speech recognition...');
        recognitionRef.current.start();
        setIsListening(true);

        // ✅ FALLBACK: Auto-stop após 10 segundos (segurança)
        setTimeout(() => {
          if (isListening) {
            console.log('⏱️ Auto-stopping after 10s');
            stopListening();
          }
        }, 10000);

      } catch (err) {
        console.error('❌ Error starting:', err);
        setError(err.message || 'Failed to start recording');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Stop listening called');

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Recognition.stop() called');
      } catch (e) {
        console.log('Stop error:', e);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    console.log('🧹 Reset');
    setTranscript('');
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    hasStartedRef.current = false;
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