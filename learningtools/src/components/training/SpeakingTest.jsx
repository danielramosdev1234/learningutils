import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Mic, Volume2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { compareTexts } from '../../utils/textComparison';

// ========================================
// CUSTOM HOOK - Estado e Lógica do Speaking
// ========================================
const useSpeakingAssessment = (question, onComplete) => {
  const [attempts, setAttempts] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [similarity, setSimilarity] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const hasSubmitted = useRef(false); // ✅ Track if answer was submitted

  // Callback quando reconhecimento de voz retorna resultado
  const handleSpeechResult = useCallback((text, errorMsg) => {
    if (errorMsg) {
      setError(errorMsg);
      console.error('Speech recognition error:', errorMsg);
      return;
    }

    if (text && text.trim() && question?.text) {
      setSpokenText(text);
      const comparison = compareTexts(question.text, text);
      setSimilarity(comparison.similarity);
      setShowAnalysis(true);
      setAttempts(prev => prev + 1);
      setError(null);
    }
  }, [question?.text]);

  // Hook de reconhecimento de voz
  const speechRecognition = useSpeechRecognition('en-US', handleSpeechResult, false);

  // Handler para botão de falar
  const handleSpeak = useCallback(() => {
    if (attempts >= 2) return;
    setError(null);
    speechRecognition.toggleListening();
  }, [attempts, speechRecognition]);

  // Handler para submeter resposta
  const handleSubmit = useCallback(() => {
    if (!question || hasSubmitted.current) return; // ✅ Prevent duplicate submissions

    const isCorrect = similarity >= 90;
    hasSubmitted.current = true; // ✅ Mark as submitted
    console.log('📤 Submitting answer:', { isCorrect, similarity });

    onComplete({
      correct: isCorrect,
      spokenText,
      similarity,
      attempts
    });
  }, [question, similarity, spokenText, attempts, onComplete]);

  // Reset quando questão muda
  useEffect(() => {
    setAttempts(0);
    setSpokenText('');
    setSimilarity(0);
    setShowAnalysis(false);
    setError(null);
    hasSubmitted.current = false; // ✅ Reset submission flag
  }, [question?.id]);

  return {
    attempts,
    spokenText,
    similarity,
    showAnalysis,
    error,
    isListening: speechRecognition.isListening,
    handleSpeak,
    handleSubmit
  };
};

// ========================================
// SUBCOMPONENTES
// ========================================

// Header com progresso
const SpeakingHeader = React.memo(({ questionIndex, totalQuestions, currentLevel }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <Mic className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Speaking Test</h2>
          <p className="text-gray-600">Fale a frase em inglês</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Questão {questionIndex + 1}/{totalQuestions}</p>
        <p className="text-lg font-bold text-blue-600">Nível {currentLevel}</p>
      </div>
    </div>

    {/* Barra de progresso */}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
      />
    </div>
  </div>
));

SpeakingHeader.displayName = 'SpeakingHeader';

// Card da questão com frase e tradução
const QuestionCard = React.memo(({ question }) => (
  <div className="text-center mb-8">
    <div className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4">
      <p className="text-3xl font-bold text-gray-800 mb-3">
        {question.text}
      </p>
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Volume2 className="w-4 h-4" />
        <p className="text-lg italic">"{question.translation}"</p>
      </div>
    </div>
  </div>
));

QuestionCard.displayName = 'QuestionCard';

// Botão de falar com estados visuais
const SpeakButton = React.memo(({
  onClick,
  disabled,
  isListening,
  attempts,
  maxAttempts = 2
}) => {
  const buttonState = useMemo(() => {
    if (disabled) return 'disabled';
    if (isListening) return 'listening';
    return 'ready';
  }, [disabled, isListening]);

  const buttonStyles = {
    ready: 'bg-blue-600 hover:bg-blue-700 text-white',
    listening: 'bg-red-600 hover:bg-red-700 text-white animate-pulse',
    disabled: 'bg-gray-400 text-gray-200 cursor-not-allowed'
  };

  const buttonText = {
    ready: `Falar (${attempts}/${maxAttempts})`,
    listening: 'Ouvindo...',
    disabled: ''
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonStyles[buttonState]}
        px-8 py-4 rounded-xl font-semibold
        transition-all duration-200
        flex items-center gap-3 mx-auto
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300
      `}
      aria-label={buttonText[buttonState]}
    >
      <Mic className={`w-6 h-6 ${isListening ? 'animate-bounce' : ''}`} />
      {buttonText[buttonState]}
    </button>
  );
});

SpeakButton.displayName = 'SpeakButton';

// Feedback da análise
const AnalysisFeedback = React.memo(({ spokenText, similarity }) => {
  const feedbackConfig = useMemo(() => {
    if (similarity >= 90) {
      return {
        color: 'green',
        icon: CheckCircle,
        message: 'Excelente! Você falou muito bem.',
        bgClass: 'bg-green-50',
        textClass: 'text-green-800',
        barClass: 'bg-green-500'
      };
    } else if (similarity >= 70) {
      return {
        color: 'yellow',
        icon: AlertCircle,
        message: 'Bom! Quase perfeito.',
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-800',
        barClass: 'bg-yellow-500'
      };
    } else {
      return {
        color: 'red',
        icon: XCircle,
        message: 'Tente novamente para melhorar.',
        bgClass: 'bg-red-50',
        textClass: 'text-red-800',
        barClass: 'bg-red-500'
      };
    }
  }, [similarity]);

  const Icon = feedbackConfig.icon;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Texto falado */}
      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Sua fala:
        </h3>
        <p className="text-gray-700 italic text-lg">"{spokenText}"</p>
      </div>

      {/* Score de similaridade */}
      <div className={`${feedbackConfig.bgClass} rounded-xl p-4 border-2 border-${feedbackConfig.color}-200`}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-800 flex items-center gap-2">
            <Icon className={`w-5 h-5 ${feedbackConfig.textClass}`} />
            Similaridade:
          </span>
          <span className={`font-bold text-2xl ${feedbackConfig.textClass}`}>
            {similarity.toFixed(1)}%
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
          <div
            className={`${feedbackConfig.barClass} h-4 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${similarity}%` }}
          />
        </div>

        <p className={`text-sm ${feedbackConfig.textClass} font-medium flex items-center gap-2`}>
          {feedbackConfig.message}
        </p>
      </div>
    </div>
  );
});

AnalysisFeedback.displayName = 'AnalysisFeedback';

// Botão de próxima questão
const NextButton = React.memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full bg-gradient-to-r from-green-600 to-emerald-600
      text-white px-6 py-4 rounded-xl font-bold text-lg
      hover:from-green-700 hover:to-emerald-700
      transition-all duration-200 shadow-lg hover:shadow-xl
      focus:outline-none focus:ring-4 focus:ring-green-300
      transform hover:scale-[1.02]
    "
  >
    Próxima Questão →
  </button>
));

NextButton.displayName = 'NextButton';

// Mensagem de erro
const ErrorMessage = React.memo(({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 mb-1">Erro no reconhecimento de voz</p>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Certifique-se de que seu microfone está conectado e permitido.
          </p>
        </div>
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
const SpeakingTest = ({
  question,
  questionIndex,
  totalQuestions = 6,
  currentLevel,
  onComplete,
  onNext
}) => {
  // Custom hook com toda a lógica
  const {
    attempts,
    spokenText,
    similarity,
    showAnalysis,
    error,
    isListening,
    handleSpeak,
    handleSubmit
  } = useSpeakingAssessment(question, onComplete);

  // Handler para próxima questão
  const handleNext = useCallback(() => {
    // ✅ Chamar handleSubmit para processar a resposta ANTES de avançar
    handleSubmit();
    // Pequeno delay para garantir que onComplete foi processado
    setTimeout(() => {
      onNext();
    }, 50);
  }, [handleSubmit, onNext]);

  // Loading state
  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-800">Carregando questões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com progresso */}
        <SpeakingHeader
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          currentLevel={currentLevel}
        />

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Questão */}
          <QuestionCard question={question} />

          {/* Mensagem de erro */}
          <ErrorMessage error={error} />

          {/* Botão de falar */}
          <div className="text-center mb-6">
            <SpeakButton
              onClick={handleSpeak}
              disabled={attempts >= 2 || isListening}
              isListening={isListening}
              attempts={attempts}
            />

            {/* Instruções */}
            {attempts < 2 && !showAnalysis && (
              <p className="text-sm text-gray-600 mt-4">
                💡 Clique no botão e fale a frase em inglês claramente
              </p>
            )}
          </div>

          {/* Feedback da análise */}
          {showAnalysis && (
            <div className="mb-6">
              <AnalysisFeedback
                spokenText={spokenText}
                similarity={similarity}
              />
            </div>
          )}

          {/* Botão de próxima questão */}
          {showAnalysis && (
            <NextButton onClick={handleNext} />
          )}
        </div>

        {/* Dicas de uso */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Fale com clareza e em ritmo normal. Você tem 2 tentativas por questão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeakingTest;

// ========================================
// ESTILOS CUSTOMIZADOS (adicionar ao CSS global)
// ========================================
/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
*/