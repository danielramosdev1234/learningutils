import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star, Volume2, Mic, CheckCircle, XCircle,
  ArrowRight, Trophy, Target, Clock, Brain, Zap,
  TrendingUp, Award, Download, ChevronRight, RotateCcw
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { compareTexts } from '../../utils/textComparison';
import assessmentData from '../../data/assessment_phrases.json';
import {
  saveAssessmentResult,
  selectCanTakeAssessment,
  incrementPhraseCompleted,
  saveProgress
} from '../../store/slices/userSlice';
import { addXP } from '../../store/slices/xpSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import {
  CEFR_LEVELS,
  CEFR_BELTS,
  getNextLevel,
  calculateSkillLevels,
  calculateOverallLevel,
  generateAndDownloadCertificate
} from '../../utils/assessmentUtils';

const AssessmentTrainer = () => {
  const dispatch = useDispatch();
  const { mode, userId, profile } = useSelector(state => state.user);
  const canTake = useSelector(selectCanTakeAssessment);
  const textToSpeech = useTextToSpeech();

  // Estados principais
  const [phase, setPhase] = useState('intro'); // intro, speaking, listening, reading, writing_translate, writing_order, results
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    speaking: [],
    listening: [],
    reading: [],
    writing_translate: [],
    writing_order: []
  });
  const [startTime] = useState(Date.now());

  // Estados por fase
  const [userInput, setUserInput] = useState('');
  const [userSentence, setUserSentence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState(0);

  // Speech recognition para speaking
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Verifica se pode fazer o teste
  if (!canTake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Teste Já Realizado Hoje
          </h2>
          <p className="text-gray-600 mb-6">
            Você pode refazer o teste de nivelamento apenas uma vez por dia.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Dados das questões baseado no nível atual
  const getCurrentQuestions = () => {
    const skill = phase.replace('_translate', '').replace('_order', '');
    return assessmentData[skill]?.[currentLevel] || [];
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[questionIndex];

  // Handlers gerais
  const handleNextQuestion = () => {
    if (questionIndex < currentQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setUserInput('');
      setUserSentence([]);
      setShowFeedback(false);
      resetTranscript();
    } else {
      // Próxima fase
      const phaseOrder = ['speaking', 'listening', 'reading', 'writing_translate', 'writing_order'];
      const currentPhaseIndex = phaseOrder.indexOf(phase.replace('_translate', '').replace('_order', ''));

      if (currentPhaseIndex < phaseOrder.length - 1) {
        const nextPhase = phaseOrder[currentPhaseIndex + 1];
        setPhase(nextPhase === 'writing_translate' ? 'writing_translate' : nextPhase === 'writing_order' ? 'writing_order' : nextPhase);
        setQuestionIndex(0);
        setCurrentLevel('A1'); // Reset para algoritmo adaptativo
        setUserInput('');
        setUserSentence([]);
        setShowFeedback(false);
        resetTranscript();
      } else {
        // Fim do teste
        handleFinishTest();
      }
    }
  };

  const handleFinishTest = async () => {
    const skillLevels = calculateSkillLevels(answers);
    const overallLevel = calculateOverallLevel(skillLevels);

    const result = {
      date: new Date().toISOString(),
      overallLevel,
      skills: skillLevels,
      certificate: {
        name: profile.displayName || 'Anonymous',
        level: overallLevel,
        skills: skillLevels,
        date: new Date().toISOString()
      }
    };

    // Salvar resultado
    await dispatch(saveAssessmentResult(result));

    // Dar XP
    dispatch(addXP({ amount: 500, reason: 'assessment_completion' }));

    // Completar frase para streak
    dispatch(incrementPhraseCompleted());

    setPhase('results');
  };

  // Componentes por fase
  const IntroPhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
        <div className="mb-6">
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teste de Nivelamento CEFR
          </h1>
          <p className="text-gray-600">
            Descubra seu nível real de inglês em 15-20 minutos
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 rounded-xl p-4">
            <Mic className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-purple-800">Speaking</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <Volume2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-800">Listening</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-800">Reading</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-800">+500 XP</span>
          </div>
          <p className="text-sm text-gray-600">ao completar o teste</p>
        </div>

        <button
          onClick={() => setPhase('speaking')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
        >
          Começar Teste
        </button>
      </div>
    </div>
  );

  const SpeakingPhase = () => {
    if (!currentQuestion) return <div>Carregando...</div>;

    const handleSpeakingComplete = () => {
      const accuracy = compareTexts(currentQuestion.text, transcript).similarity;
      const correct = accuracy >= 80;

      setAnswers(prev => ({
        ...prev,
        speaking: [...prev.speaking, {
          correct,
          level: currentLevel,
          accuracy
        }]
      }));

      setIsCorrect(correct);
      setShowFeedback(true);

      // Algoritmo adaptativo após 5 questões
      if ((questionIndex + 1) % 5 === 0) {
        const recentAnswers = answers.speaking.slice(-5);
        const correctCount = recentAnswers.filter(a => a.correct).length;
        const newLevel = getNextLevel(currentLevel, correctCount, 5);
        setCurrentLevel(newLevel);
      }

      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
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
                <p className="text-sm text-gray-600">Questão {questionIndex + 1}/25</p>
                <p className="text-lg font-bold text-blue-600">Nível {currentLevel}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((questionIndex) / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {currentQuestion.text}
              </p>
              <p className="text-gray-600">
                {currentQuestion.translation}
              </p>
            </div>

            {/* Recording */}
            <div className="text-center">
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 transition-colors"
                >
                  <Mic className="w-6 h-6 inline mr-2" />
                  Começar a Falar
                </button>
              ) : (
                <button
                  onClick={() => {
                    stopListening();
                    setTimeout(handleSpeakingComplete, 500);
                  }}
                  className="bg-gray-500 text-white px-8 py-4 rounded-full font-semibold"
                >
                  <CheckCircle className="w-6 h-6 inline mr-2" />
                  Finalizar
                </button>
              )}

              {transcript && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Você disse:</p>
                  <p className="text-lg">{transcript}</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 inline mr-2" />
              ) : (
                <XCircle className="w-8 h-8 inline mr-2" />
              )}
              <span className="font-semibold">
                {isCorrect ? 'Excelente!' : 'Tente novamente na próxima'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ListeningPhase = () => {
    if (!currentQuestion) return <div>Carregando...</div>;

    const speakPhrase = () => {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    const handleAnswer = (selectedOption) => {
      const correct = selectedOption === currentQuestion.text;
      setAnswers(prev => ({
        ...prev,
        listening: [...prev.listening, {
          correct,
          level: currentLevel,
          selected: selectedOption,
          correctAnswer: currentQuestion.text
        }]
      }));

      setIsCorrect(correct);
      setShowFeedback(true);

      // Algoritmo adaptativo
      if ((questionIndex + 1) % 5 === 0) {
        const recentAnswers = answers.listening.slice(-5);
        const correctCount = recentAnswers.filter(a => a.correct).length;
        const newLevel = getNextLevel(currentLevel, correctCount, 5);
        setCurrentLevel(newLevel);
      }

      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
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
                <p className="text-sm text-gray-600">Questão {questionIndex + 1}/25</p>
                <p className="text-lg font-bold text-green-600">Nível {currentLevel}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${((questionIndex + 25) / 50) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <button
                onClick={speakPhrase}
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors mb-4"
              >
                <Volume2 className="w-5 h-5 inline mr-2" />
                Ouvir Frase
              </button>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{String.fromCharCode(65 + idx)}.</span> {option}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 inline mr-2" />
              ) : (
                <XCircle className="w-8 h-8 inline mr-2" />
              )}
              <span className="font-semibold">
                {isCorrect ? 'Correto!' : 'Incorreto'}
              </span>
              {!isCorrect && (
                <p className="text-sm mt-1">Resposta correta: {currentQuestion.text}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render baseado na fase
  switch (phase) {
    case 'intro':
      return <IntroPhase />;
    case 'speaking':
      return <SpeakingPhase />;
    case 'listening':
      return <ListeningPhase />;
    default:
      return <IntroPhase />;
  }
};

export default AssessmentTrainer;