import { useState, useRef, useEffect, useCallback } from 'react';
import { getTranslation } from '../utils/translations';

export const useSpeechRecognition = (selectedLanguage, onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isInitializedRef = useRef(false);
  const processedTextsRef = useRef(new Set());

  // 🔒 CRÍTICO: Acumular TODOS os resultados finais
  const finalTranscriptRef = useRef('');

  // 🆕 NOVO: Rastrear o último índice processado
  const lastProcessedIndexRef = useRef(0);

  // 🚀 FLAG DE INTENÇÃO: Controla se DEVE enviar ao parar
  const shouldAutoSendRef = useRef(true);

  useEffect(() => {
    // ✅ Evitar inicialização dupla
    if (isInitializedRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition não suportado neste navegador');
      return;
    }

    isInitializedRef.current = true;
    const newRecognition = new SpeechRecognition();

    newRecognition.lang = selectedLanguage;
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.maxAlternatives = 1;

    newRecognition.onstart = () => {
      console.log('✅ Recognition started');
      setIsListening(true);
      setTranscript('🎤 Listening...');
      shouldAutoSendRef.current = true;
      lastProcessedIndexRef.current = 0; // 🆕 Reset do índice
    };

    newRecognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript.trim();

          if (event.results[i].isFinal) {
            // Só adiciona se NUNCA foi processado antes
            if (!processedTextsRef.current.has(text)) {
              console.log('📝 Novo texto final:', text);
              finalTranscriptRef.current += text + ' ';
              processedTextsRef.current.add(text);
            } else {
              console.log('⚠️ Texto duplicado ignorado:', text);
            }
          }
        }

      // ✅ Mostrar: texto acumulado + preview interim
      setTranscript(
        (finalTranscriptRef.current.trim() + ' ' + interimTranscript).trim()
      );
    };

    newRecognition.onerror = (event) => {
      console.error('❌ Speech Recognition Error:', event.error);
      const t = getTranslation(selectedLanguage);
      setIsListening(false);

      if (event.error === 'no-speech') {
        onResult('', t.noSpeech);
      } else if (event.error === 'not-allowed') {
        onResult('', '🔒 Microphone permission denied');
      } else if (event.error !== 'aborted') {
        onResult('', 'Error: ' + event.error);
      }
    };

    newRecognition.onend = () => {
      console.log('🛑 Recognition ended, shouldAutoSend:', shouldAutoSendRef.current);
      setIsListening(false);

      const textToSend = finalTranscriptRef.current.trim();

      // 🔒 CRÍTICO: SÓ ENVIA SE shouldAutoSendRef = true
      if (textToSend && shouldAutoSendRef.current) {
        console.log('📤 Auto-sending:', textToSend);
        setTranscript(textToSend);
        onResult(textToSend, '');
      }

      // Reset para próxima sessão
      finalTranscriptRef.current = '';
      lastProcessedIndexRef.current = 0; // 🆕 Reset do índice
      shouldAutoSendRef.current = true;
    };

    recognitionRef.current = newRecognition;
    console.log('✅ Speech Recognition initialized');

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // ✅ DEPENDÊNCIA VAZIA - inicializa uma vez só

  // ✅ Atualizar idioma sem reinicializar
  useEffect(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage, isListening]);

  const toggleListening = useCallback((action = 'toggle') => {
    console.log('🎤 toggleListening called with action:', action);

    if (!recognitionRef.current) {
      console.error('❌ Recognition not initialized');
      const t = getTranslation(selectedLanguage);
      onResult('', t.notSupported);
      return;
    }

    if (isListening) {
      // 🔒 Se clicou em X (cancelar), não envia
      if (action === 'cancel') {
        console.log('❌ Cancel: shouldAutoSend = false');
        shouldAutoSendRef.current = false;
      }
      // Se clicou em ✅ (enviar manual), envia
      else if (action === 'send') {
        console.log('✅ Send: shouldAutoSend = true');
        shouldAutoSendRef.current = true;
      }

      recognitionRef.current.stop();
      return;
    }

    // ✅ INICIAR GRAVAÇÃO
    finalTranscriptRef.current = '';
    lastProcessedIndexRef.current = 0; // 🆕 Reset do índice
    shouldAutoSendRef.current = true;
    setTranscript('');

    try {
      console.log('🎤 Starting recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
      setIsListening(false);
    }
  }, [isListening, selectedLanguage, onResult]);

  return { isListening, transcript, setTranscript, toggleListening };
};