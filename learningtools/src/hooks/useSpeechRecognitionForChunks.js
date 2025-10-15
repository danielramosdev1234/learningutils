import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognitionForChunks = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // Novo: armazena o áudio

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setError('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const text = event.results[0][0].transcript;
      console.log('🎤 Recognized:', text);
      setTranscript(text);
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Recognition ended');
      setIsListening(false);

      // Para a gravação quando o reconhecimento terminar
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
      }
      setIsListening(false);

      // Para a gravação em caso de erro
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    recognitionRef.current.onstart = () => {
      console.log('🎙️ Recognition started');
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition cleanup:', e);
        }
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    console.log('▶️ Start listening called');

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setAudioBlob(null); // Limpa o áudio anterior
      audioChunksRef.current = [];

      try {
        // Solicita permissão do microfone e inicia gravação
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('📼 Audio chunk recorded:', event.data.size, 'bytes');
          }
        };

        mediaRecorderRef.current.onstop = () => {
          console.log('🎬 Recording stopped, creating blob...');
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          console.log('✅ Audio blob created:', blob.size, 'bytes');

          // Para o stream do microfone
          stream.getTracks().forEach(track => track.stop());
        };

        // Inicia a gravação
        mediaRecorderRef.current.start();
        console.log('🔴 Recording started');

        // Inicia o reconhecimento de voz
        recognitionRef.current.start();
        setIsListening(true);

      } catch (err) {
        console.error('Error starting recording:', err);
        if (err.message && !err.message.includes('already started')) {
          setError(err.message);
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Stop listening called');
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
  }, []);

  return {
    isListening,
    transcript,
    audioBlob, // Novo: retorna o áudio gravado
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};