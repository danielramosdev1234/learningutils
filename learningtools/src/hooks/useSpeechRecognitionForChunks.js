import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 🎯 Hook de Speech Recognition PURO - SEM gravação de áudio
 *
 * VANTAGENS:
 * ✅ Zero conflitos de recursos
 * ✅ Funciona perfeitamente no Chrome Mobile
 * ✅ Mais leve e rápido
 * ✅ Menos consumo de bateria
 * ✅ Mais simples de usar
 *
 * QUANDO USAR:
 * - Quando você só precisa do texto transcrito
 * - Não precisa do arquivo de áudio
 * - Quer máxima compatibilidade mobile
 * - Aplicações de comando de voz, ditado, etc.
 */
export const useSpeechRecognitionForChunks = (language = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);

  // ══════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO E CONFIGURAÇÃO
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    // Verifica suporte
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech Recognition não suportado');
      setError('Speech Recognition não é suportado neste navegador');
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // ═══════════════════════════════════════════════════════════
    // CONFIGURAÇÃO OTIMIZADA PARA MOBILE
    // ═══════════════════════════════════════════════════════════
    recognitionRef.current.continuous = true; // Continua escutando
    recognitionRef.current.interimResults = true; // Mostra resultados parciais
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1;

    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════

    recognitionRef.current.onstart = () => {
      console.log('🎤 Escutando...');
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      console.log('📝 Resultado recebido');

      let interim = '';
      let hasFinal = false;

      // Processa todos os resultados
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Texto final confirmado
          if (finalTranscriptRef.current) {
            finalTranscriptRef.current += ' ' + text;
          } else {
            finalTranscriptRef.current = text;
          }
          hasFinal = true;
          console.log('✅ Final:', text);
        } else {
          // Texto temporário (enquanto ainda está falando)
          interim = text;
          console.log('⏳ Interim:', text);
        }
      }

      // Atualiza estados
      if (hasFinal) {
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript('');
        resetSilenceTimer(); // Reset timer quando há fala
      } else if (interim) {
        setInterimTranscript(interim);
        resetSilenceTimer(); // Reset timer mesmo em interim
      }
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Recognition terminou');
      setIsListening(false);
      setInterimTranscript('');

      // Garante que o transcript final está atualizado
      if (finalTranscriptRef.current) {
        setTranscript(finalTranscriptRef.current);
      }

      // Limpa timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Erro:', event.error);

      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente falar mais alto ou verificar o microfone.');
      } else if (event.error === 'not-allowed') {
        setError('🔒 Permissão do microfone negada. Permita o acesso ao microfone nas configurações.');
      } else if (event.error === 'audio-capture') {
        setError('❌ Não foi possível acessar o microfone. Verifique se está conectado.');
      } else if (event.error === 'network') {
        setError('❌ Erro de rede. Verifique sua conexão com a internet.');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted (normal)');
        // Não mostra erro, é normal
      } else {
        setError(`Erro: ${event.error}`);
      }

      setIsListening(false);
    };

    // Cleanup ao desmontar
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language]);

  // ══════════════════════════════════════════════════════════════
  // AUTO-STOP APÓS SILÊNCIO (importante para mobile)
  // ══════════════════════════════════════════════════════════════
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Auto-stop após 3 segundos de silêncio
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔇 Silêncio detectado, parando...');
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Auto-stop error:', e);
        }
      }
    }, 3000); // 3 segundos - ajuste conforme necessário
  }, [isListening]);

  // ══════════════════════════════════════════════════════════════
  // CONTROLES PÚBLICOS
  // ══════════════════════════════════════════════════════════════

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.error('Speech Recognition não suportado');
      return;
    }

    if (!recognitionRef.current || isListening) {
      console.log('Já está escutando ou não disponível');
      return;
    }

    console.log('▶️ Iniciando escuta...');

    // Reset
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
      resetSilenceTimer(); // Inicia timer
    } catch (err) {
      console.error('Erro ao iniciar:', err);

      if (err.message.includes('already started')) {
        console.log('Recognition já estava ativo');
      } else {
        setError(err.message);
      }
    }
  }, [isListening, isSupported, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    console.log('⏸️ Parando escuta...');

    // Limpa timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error (ignorável):', e);
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
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  // ══════════════════════════════════════════════════════════════
  // RETORNO DO HOOK
  // ══════════════════════════════════════════════════════════════
  return {
    // Estados
    isListening,              // Está escutando agora?
    isSupported,              // Speech API é suportado?
    transcript,               // Texto final completo
    interimTranscript,        // Texto temporário (enquanto fala)
    error,                    // Mensagem de erro (se houver)

    // Ações
    startListening,           // Inicia escuta
    stopListening,            // Para escuta
    toggleListening,          // Alterna entre iniciar/parar
    reset,                    // Limpa tudo

    // Computed
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : '') // Texto completo
  };
};