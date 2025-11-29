import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Volume2, CheckCircle, XCircle, Play, Pause, AlertCircle } from 'lucide-react';

// ========================================
// UTILITIES
// ========================================

/**
 * Verifica se o navegador suporta Web Speech API
 */
const checkSpeechSupport = () => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
};

// ========================================
// CUSTOM HOOK - Estado e Lógica do Listening
// ========================================
const useListeningAssessment = (question, onComplete) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [error, setError] = useState(null);

  // Embaralhar opções para tornar o teste mais justo
  const { shuffledOptions, correctAnswerIndex } = useMemo(() => {
    if (!question?.options) return { shuffledOptions: [], correctAnswerIndex: -1 };

    const originalOptions = [...question.options];
    const originalCorrectIndex = question.correctAnswer;

    // Algoritmo Fisher-Yates para embaralhar
    for (let i = originalOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalOptions[i], originalOptions[j]] = [originalOptions[j], originalOptions[i]];
    }

    // Encontrar o novo índice da resposta correta após embaralhamento
    const newCorrectIndex = originalOptions.findIndex(option => option === question.options[originalCorrectIndex]);

    return {
      shuffledOptions: originalOptions,
      correctAnswerIndex: newCorrectIndex
    };
  }, [question?.options, question?.correctAnswer]);

  // Função para falar a frase usando Web Speech API
  const speakPhrase = useCallback(() => {
    if (!question?.text) {
      setError('Texto da questão não disponível');
      return;
    }

    if (!checkSpeechSupport()) {
      setError('Seu navegador não suporta síntese de voz. Use Chrome ou Edge.');
      return;
    }

    // Cancelar qualquer fala em andamento
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(question.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Velocidade ligeiramente mais lenta para clareza
      utterance.volume = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setPlayCount(prev => prev + 1);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
        setError('Erro ao reproduzir áudio. Tente novamente.');
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error creating speech utterance:', error);
      setError('Erro ao criar áudio. Tente novamente.');
      setIsSpeaking(false);
    }
  }, [question?.text]);

  // Handler para selecionar resposta
  const handleSelectAnswer = useCallback((selectedIndex) => {
    if (feedback) return; // Já respondeu

    const isCorrect = selectedIndex === correctAnswerIndex;
    const selectedOption = shuffledOptions[selectedIndex];
    const correctOption = shuffledOptions[correctAnswerIndex];

    setSelectedAnswer(selectedIndex);
    setFeedback({
      isCorrect,
      correctAnswer: correctOption,
      selectedAnswer: selectedOption,
      correctIndex: correctAnswerIndex,
      selectedIndex
    });

    // Notificar componente pai após delay
    setTimeout(() => {
      onComplete({
        correct: isCorrect,
        selectedAnswer: selectedOption,
        correctAnswer: correctOption,
        selectedIndex,
        correctIndex: correctAnswerIndex,
        playCount
      });
    }, 2500);
  }, [shuffledOptions, correctAnswerIndex, feedback, onComplete, playCount]);

  // Reset quando questão muda
  useEffect(() => {
    setSelectedAnswer(null);
    setFeedback(null);
    setIsSpeaking(false);
    setPlayCount(0);
    setError(null);

    // Parar qualquer fala em andamento
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [question?.id]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    selectedAnswer,
    feedback,
    isSpeaking,
    playCount,
    error,
    options: shuffledOptions,
    speakPhrase,
    handleSelectAnswer
  };
};

// ========================================
// SUBCOMPONENTES
// ========================================

// Header com progresso
const ListeningHeader = React.memo(({ questionIndex, totalQuestions, currentLevel }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 rounded-full">
          <Volume2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Listening Test</h2>
          <p className="text-gray-600">Escute e escolha a opção correta</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Questão {questionIndex + 1}/{totalQuestions}</p>
        <p className="text-lg font-bold text-green-600">Nível {currentLevel}</p>
      </div>
    </div>

    {/* Barra de progresso */}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
      />
    </div>
  </div>
));

ListeningHeader.displayName = 'ListeningHeader';

// Botão de reproduzir áudio
const PlayButton = React.memo(({ onClick, isSpeaking, playCount, disabled }) => {
  const Icon = isSpeaking ? Pause : Play;

  return (
    <div className="text-center mb-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${isSpeaking
            ? 'bg-orange-600 hover:bg-orange-700'
            : 'bg-blue-600 hover:bg-blue-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          text-white px-8 py-4 rounded-full font-semibold
          transition-all duration-200 shadow-lg hover:shadow-xl
          flex items-center gap-3 mx-auto
          focus:outline-none focus:ring-4 focus:ring-blue-300
          transform hover:scale-105
        `}
        aria-label={isSpeaking ? "Pausar áudio" : "Reproduzir áudio"}
      >
        <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
        <span>
          {isSpeaking ? 'Reproduzindo...' : 'Ouvir Frase'}
        </span>
      </button>

      {playCount > 0 && !disabled && (
        <p className="text-sm text-gray-600 mt-3">
          Reproduzido {playCount}x
        </p>
      )}
    </div>
  );
});

PlayButton.displayName = 'PlayButton';

// Opção de resposta individual
const AnswerOption = React.memo(({
  option,
  index,
  isSelected,
  isCorrect,
  isWrong,
  onClick,
  disabled
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D

  const getStyles = () => {
    if (isCorrect) {
      return 'border-green-500 bg-green-50 ring-4 ring-green-200';
    }
    if (isWrong) {
      return 'border-red-500 bg-red-50 ring-4 ring-red-200';
    }
    if (isSelected) {
      return 'border-blue-500 bg-blue-50';
    }
    return 'border-gray-200 hover:border-green-500 hover:bg-green-50';
  };

  return (
    <button
      onClick={() => !disabled && onClick(option)}
      disabled={disabled}
      className={`
        ${getStyles()}
        p-4 border-2 rounded-xl text-left
        transition-all duration-200
        disabled:cursor-not-allowed
        transform hover:scale-[1.02]
        focus:outline-none focus:ring-4 focus:ring-green-300
      `}
      aria-label={`Opção ${letter}: ${option}`}
    >
      <div className="flex items-start gap-3">
        <span className="font-bold text-lg text-gray-800 flex-shrink-0 mt-0.5">
          {letter}.
        </span>
        <span className="text-gray-800 font-medium flex-1">
          {option}
        </span>
        {isCorrect && (
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        )}
        {isWrong && (
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        )}
      </div>
    </button>
  );
});

AnswerOption.displayName = 'AnswerOption';

// Lista de opções
const AnswerOptions = React.memo(({
  options,
  selectedAnswer,
  feedback,
  onSelect
}) => {
  if (!options || options.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
        <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-800 font-semibold">Opções não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option, idx) => {
        const isSelected = idx === selectedAnswer;
        const isCorrect = feedback && idx === feedback.correctIndex;
        const isWrong = feedback && isSelected && !feedback.isCorrect;

        return (
          <AnswerOption
            key={idx}
            option={option}
            index={idx}
            isSelected={isSelected}
            isCorrect={isCorrect}
            isWrong={isWrong}
            onClick={() => onSelect(idx)}
            disabled={!!feedback}
          />
        );
      })}
    </div>
  );
});

AnswerOptions.displayName = 'AnswerOptions';

// Feedback de resposta
const FeedbackCard = React.memo(({ feedback }) => {
  if (!feedback) return null;

  const isCorrect = feedback.isCorrect;
  const Icon = isCorrect ? CheckCircle : XCircle;

  return (
    <div
      className={`
        mt-6 p-5 rounded-xl border-2 animate-fadeIn
        ${isCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        }
      `}
    >
      <div className="flex items-center justify-center mb-3">
        <Icon className={`w-7 h-7 mr-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`font-bold text-xl ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
          {isCorrect ? 'Correto! 🎉' : 'Incorreto'}
        </span>
      </div>

      {!isCorrect && (
        <div className="space-y-2">
          <div className="bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">Sua resposta:</p>
            <p className="text-gray-800">{feedback.selectedAnswer}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-green-700 mb-1">Resposta correta:</p>
            <p className="text-gray-800 font-bold">{feedback.correctAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
});

FeedbackCard.displayName = 'FeedbackCard';

// Mensagem de erro
const ErrorMessage = React.memo(({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 mb-1">Erro</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
const ListeningTest = ({
  question,
  questionIndex,
  totalQuestions = 6,
  currentLevel,
  onComplete
}) => {
  // Custom hook com toda a lógica
  const {
    selectedAnswer,
    feedback,
    isSpeaking,
    playCount,
    error,
    options,
    speakPhrase,
    handleSelectAnswer
  } = useListeningAssessment(question, onComplete);

  // Avanço agora é controlado pelo AssessmentTrainer após feedback

  // Loading state
  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-800 mb-2">Carregando questões...</p>
          <p className="text-sm text-gray-600">Preparando teste de Listening</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com progresso */}
        <ListeningHeader
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          currentLevel={currentLevel}
        />

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Mensagem de erro */}
          <ErrorMessage error={error} />

          {/* Botão de reproduzir */}
          <PlayButton
            onClick={speakPhrase}
            isSpeaking={isSpeaking}
            playCount={playCount}
            disabled={!!feedback}
          />

          {/* Pergunta */}
          {playCount > 0 && question?.question && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pergunta:</h3>
              <p className="text-gray-700 text-base leading-relaxed">{question.question}</p>
            </div>
          )}

          {/* Instruções */}
          {!feedback && playCount === 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-blue-800">
                <strong>👂 Instruções:</strong> Clique no botão acima para ouvir a frase em inglês.
                Leia a pergunta e escolha a opção correta em português.
              </p>
            </div>
          )}

          {/* Opções de resposta */}
          {playCount > 0 && (
            <AnswerOptions
              options={options}
              selectedAnswer={selectedAnswer}
              feedback={feedback}
              onSelect={handleSelectAnswer}
            />
          )}

          {/* Feedback */}
          <FeedbackCard feedback={feedback} />
        </div>

        {/* Dicas de uso */}
        {!feedback && playCount > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mt-6 text-center">
            <p className="text-sm text-green-800">
              <strong>💡 Dica:</strong> Você pode ouvir a frase quantas vezes precisar. Leia atentamente a pergunta e escolha a resposta que melhor se adapta ao que você ouviu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningTest;