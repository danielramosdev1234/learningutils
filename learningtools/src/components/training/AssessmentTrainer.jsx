import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import {
  Star, Volume2, Mic,
  Trophy, Target, Clock, Brain, Zap,
  Award, Download, CheckCircle, XCircle
} from 'lucide-react';
import { compareTexts } from '../../utils/textComparison';
import assessmentData from '../../data/assessment_phrases.json';
import speakingAssessmentData from '../../data/speaking_assessment.json';
import listeningAssessmentData from '../../data/listening_assesment.json';
import SpeakingTest from './SpeakingTest.jsx';
import ListeningTest from './ListeningTest.jsx';
// Assessment utilities will be imported locally
import {
  saveAssessmentResult,
  selectCanTakeAssessment,
  incrementPhraseCompleted
} from '../../store/slices/userSlice';
import { addXP } from '../../store/slices/xpSlice';
import { LevelIndicator } from '../leaderboard/LevelIndicator';
import { generateAndDownloadCertificate } from '../../utils/assessmentUtils';

// ========================================
// ASSESSMENT UTILITIES
// ========================================
const adjustLevel = (currentLevel, isCorrect) => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);

  if (isCorrect) {
    // Sobe 1 nível (máximo C2)
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  } else {
    // Desce 1 nível (mínimo A1)
    return levels[Math.max(currentIndex - 1, 0)];
  }
};

// ========================================
// COMPONENTES DE FASE (FORA DO ASSESSMENTTRAINER)
// ========================================

// 1. IntroPhase Component
const IntroPhase = ({ onStartSpeaking, onStartListening }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
      <div className="mb-6">
        <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="currentColor" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Teste de Nivelamento CEFR
        </h1>
        <p className="text-gray-600">
          Escolha qual teste deseja fazer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
          <Mic className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-purple-800 mb-2">Speaking Test</h3>
          <p className="text-sm text-purple-700 mb-4">
            Teste de pronúncia e fala em inglês
          </p>
          <button
            onClick={onStartSpeaking}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Começar Speaking
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <Volume2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-blue-800 mb-2">Listening Test</h3>
          <p className="text-sm text-blue-700 mb-4">
            Teste de compreensão auditiva
          </p>
          <button
            onClick={onStartListening}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Começar Listening
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-800">+250 XP</span>
        </div>
        <p className="text-sm text-gray-600">por teste completado</p>
      </div>

      <p className="text-xs text-gray-500">
        Cada teste avalia 20 questões do seu nível atual
      </p>
    </div>
  </div>
);





// 4. ReadingPhase Component
const ReadingPhase = ({
  currentQuestion,
  questionIndex,
  currentLevel,
  userSentence,
  showFeedback,
  isCorrect,
  onWordClick,
  onCheckAnswer
}) => {
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <p className="text-xl font-bold text-gray-800 mb-4">
            Carregando questões...
          </p>
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Reading Test</h2>
                <p className="text-gray-600">Reordene as palavras para formar a frase</p>
              </div>
            </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Questão {questionIndex + 1}/6</p>
                <p className="text-lg font-bold text-green-600">Nível {currentLevel}</p>
              </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${((questionIndex) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Portuguese translation */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Traduza para o inglês:</p>
            <p className="text-xl font-bold text-gray-800 mb-2">
              {currentQuestion.portuguese}
            </p>
          </div>

          {/* User sentence */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Sua frase em inglês:</p>
            <div className="min-h-12 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-lg">
                {userSentence.length > 0 ? userSentence.map(w => w.split('_')[0]).join(' ') : 'Clique nas palavras abaixo...'}
              </p>
            </div>
          </div>

          {/* Word bank */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Palavras disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {currentQuestion.scrambled.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => onWordClick(word, idx)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    userSentence.includes(`${word}_${idx}`)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onCheckAnswer}
            disabled={userSentence.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            Verificar Resposta
          </button>
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
              <p className="text-sm mt-1">Resposta correta: {currentQuestion.words.join(' ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. WritingPhase Component - ⭐ ESTE É O MAIS IMPORTANTE
const WritingPhase = ({
  phase,
  currentQuestion,
  questionIndex,
  currentLevel,
  userInput,
  showFeedback,
  isCorrect,
  onInputChange,
  onCheckAnswer
}) => {
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <p className="text-xl font-bold text-gray-800 mb-4">
            Carregando questões...
          </p>
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const isTranslation = phase === 'writing_translate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Writing Test - {isTranslation ? 'Translation' : 'Order'}
                </h2>
                <p className="text-gray-600">
                  {isTranslation ? 'Traduza a frase para o inglês' : 'Reordene as palavras'}
                </p>
              </div>
            </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Questão {questionIndex + 1}/{phase === 'writing_translate' ? 3 : 3}</p>
                <p className="text-lg font-bold text-purple-600">Nível {currentLevel}</p>
              </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((questionIndex) / (phase === 'writing_translate' ? 3 : 3)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              { currentQuestion.portuguese }
            </p>
            {!isTranslation && (
              <p className="text-lg text-gray-600">
                {currentQuestion.scrambled.join(' ')}
              </p>
            )}
          </div>

          {/* ⭐ TEXTAREA AGORA VAI MANTER FOCO */}
          <textarea
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={isTranslation ? "Digite a tradução em inglês..." : "Digite a frase reordenada..."}
            className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-purple-500 focus:outline-none"
            rows={4}
          />

          <button
            onClick={onCheckAnswer}
            disabled={!userInput.trim()}
            className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            Verificar Resposta
          </button>
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
              {isCorrect ? 'Excelente!' : 'Quase lá!'}
            </span>
            {!isCorrect && (
              <p className="text-sm mt-1">Resposta correta: {isTranslation ? currentQuestion.english : currentQuestion.correctOrder.join(' ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 6. ResultsPhase Component
const ResultsPhase = ({
  finalLevels,
  testMode,
  onDownloadCertificate,
  onGoBack
}) => {
  // Calcular nível médio baseado nos níveis finais
  const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
  const numberToLevel = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

  // Determinar quais níveis mostrar baseado no testMode
  let levels = [];
  let skillsToShow = [];

  if (testMode === 'speaking') {
    levels = finalLevels.speaking ? [finalLevels.speaking] : [];
    skillsToShow = ['speaking'];
  } else if (testMode === 'listening') {
    levels = finalLevels.listening ? [finalLevels.listening] : [];
    skillsToShow = ['listening'];
  } else {
    // Teste completo
    levels = [finalLevels.speaking, finalLevels.listening, finalLevels.reading, finalLevels.writing]
      .filter(level => level !== null);
    skillsToShow = ['speaking', 'listening', 'reading', 'writing'];
  }

  const averageNumber = levels.length > 0 ?
    levels.reduce((sum, level) => sum + levelToNumber[level], 0) / levels.length : 3;

  const overallLevel = numberToLevel[Math.round(averageNumber)];

  const data = skillsToShow.map(skill => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    level: finalLevels[skill] ? levelToNumber[finalLevels[skill]] : 3
  }));

  const skillLevels = {
    speaking: { level: finalLevels.speaking, score: 0 },
    listening: { level: finalLevels.listening, score: 0 },
    reading: { level: finalLevels.reading, score: 0 },
    writing: { level: finalLevels.writing, score: 0 }
  };

  const handleDownloadCertificate = () => {
    const certificateData = {
      name: 'Anonymous',
      level: overallLevel,
      skills: skillLevels,
      date: new Date().toISOString()
    };
    generateAndDownloadCertificate(certificateData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com Nível Geral */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center">
          <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {testMode === 'full' ? 'Parabéns! 🎉' : 'Excelente! 🎉'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Você completou o teste de {testMode === 'speaking' ? 'pronúncia' : testMode === 'listening' ? 'compreensão auditiva' : 'nivelamento CEFR'}
          </p>

          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl">
            <p className="text-sm font-semibold mb-1">Seu Nível</p>
            <p className="text-5xl font-bold">{overallLevel}</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Suas Habilidades
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 14 }} />
              <Radar
                name="Level"
                dataKey="level"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes por Habilidade */}
        <div className={`grid gap-4 mb-6 ${skillsToShow.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
          {skillsToShow.map(skill => {
            const skillConfig = {
              speaking: { name: 'Speaking', icon: Mic, color: 'purple' },
              listening: { name: 'Listening', icon: Volume2, color: 'green' },
              reading: { name: 'Reading', icon: Brain, color: 'blue' },
              writing: { name: 'Writing', icon: Target, color: 'pink' }
            }[skill];

            const Icon = skillConfig.icon;
            return (
              <div key={skill} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 bg-${skillConfig.color}-100 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${skillConfig.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{skillConfig.name}</h3>
                    <p className="text-2xl font-bold text-purple-600">{finalLevels[skill]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onDownloadCertificate}
            className="bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6" />
            Baixar Certificado
          </button>
          <button
            onClick={onGoBack}
            className="bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {/* XP Reward */}
        <div className="bg-green-100 border-2 border-green-200 rounded-xl p-4 mt-6 text-center">
          <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-semibold">+{testMode === 'full' ? 500 : 250} XP conquistados!</p>
        </div>
      </div>
    </div>
  );
};

const AssessmentTrainer = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.user);
  const canTake = useSelector(selectCanTakeAssessment);



  // Helper function to prepare questions with missing fields - Otimizado para não modificar objetos
  const prepareQuestion = React.useCallback((question, phase) => {
    // Para listening: não modificar, retornar objeto original para evitar re-renders infinitos
    if (phase === 'listening') {
      return question;
    }

    // Para outras fases: criar cópia apenas quando necessário
    const prepared = { ...question };

    // Add scrambled for reading and writing_order
    if ((phase === 'reading' || phase === 'writing_order') && !prepared.scrambled) {
      const words = prepared.words || prepared.english?.split(' ') || [];
      prepared.scrambled = [...words].sort(() => Math.random() - 0.5);
    }

    // Add correctOrder for writing_order
    if (phase === 'writing_order' && !prepared.correctOrder) {
      prepared.correctOrder = prepared.words || prepared.english?.split(' ') || [];
    }

    return prepared;
  }, []);

  // Estados principais
  const [phase, setPhase] = useState('intro'); // intro, speaking, listening, reading, writing_translate, writing_order, results
  const [currentLevel, setCurrentLevel] = useState('B1');
  const [questionsLevel, setQuestionsLevel] = useState('B1'); // Nível usado para gerar questões (separado para evitar re-randomização)
  const [testMode, setTestMode] = useState('full'); // 'full', 'speaking', 'listening'

  // Níveis finais de cada fase
  const [finalLevels, setFinalLevels] = useState({
    speaking: null,
    listening: null,
    reading: null,
    writing: null
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    speaking: [],
    listening: [],
    reading: [],
    writing_translate: [],
    writing_order: []
  });

  // Estados por fase
  const [userInput, setUserInput] = useState('');
  const [userSentence, setUserSentence] = useState([]);



  // Estados para feedback de reading e writing
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Debug otimizado - apenas em desenvolvimento
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔍 Assessment State:', {
        phase,
        questionIndex,
        currentLevel,
        speakingAnswers: answers.speaking.length,
        listeningAnswers: answers.listening.length,
        readingAnswers: answers.reading.length
      });
    }
  }, [phase, questionIndex, currentLevel, answers.speaking.length, answers.listening.length, answers.reading.length]);

  // Dados das questões baseado no nível atual - Otimizado com memoização e randomização
  const currentQuestions = React.useMemo(() => {
      // Retornar questões baseadas no nível
          const questionsPerPhase = {
            speaking: 20,
            listening: 20,
            reading: 6,
            writing_translate: 3,
            writing_order: 3
          };
          const questionCount = questionsPerPhase[phase] || 3;
    // NÃO REMOVER _translate ou _order - usar phase diretamente ← MUDANÇA AQUI
    const skill = phase;
    // Use dedicated JSON files for speaking and listening phases, assessment_phrases.json for others
    let allQuestions;
    if (phase === 'speaking') {
      allQuestions = speakingAssessmentData.speaking || [];
    } else if (phase === 'listening') {
      allQuestions = listeningAssessmentData.listening || [];
    } else {
      allQuestions = assessmentData[skill] || [];
    }

    // Filtrar questões pelo nível das questões (não pelo currentLevel para evitar re-randomização)
    const filtered = allQuestions.filter(q => q.cefr_level === questionsLevel);

    // Embaralhar as questões filtradas usando Fisher-Yates shuffle
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Selecionar as primeiras questões após embaralhamento
    if (shuffled.length >= questionCount) {
      return shuffled.slice(0, questionCount);
    }

    // Se não tiver questões suficientes, usar todas disponíveis
    return shuffled;
  }, [phase, questionsLevel]);

  const currentQuestion = React.useMemo(() => {
    if (!currentQuestions || !currentQuestions[questionIndex]) return null;
    return prepareQuestion(currentQuestions[questionIndex], phase);
  }, [currentQuestions, questionIndex, phase, prepareQuestion]);



  // Verifica se pode fazer o teste
  if (!canTake) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
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





  const handleWordClick = (word, index) => {
    if (userSentence.includes(`${word}_${index}`)) {
      setUserSentence(prev => prev.filter(w => w !== `${word}_${index}`));
    } else {
      setUserSentence(prev => [...prev, `${word}_${index}`]);
    }
  };

  const checkReadingAnswer = () => {
    // Extrair apenas as palavras (remover sufixo _index) SEM ORDENAR
    const userWords = userSentence.map(w => w.split('_')[0]);
    const correctWords = currentQuestion.words; // Sem .sort()
    const correct = JSON.stringify(userWords) === JSON.stringify(correctWords);

    // Calcular novo nível ANTES
    const newLevel = adjustLevel(currentLevel, correct);
    console.log('🎚️ Level adjustment:', currentLevel, '->', newLevel, `(correct: ${correct})`);

    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        reading: [...prev.reading, {
          correct,
          level: currentLevel,
          userAnswer: userWords,
          correctAnswer: currentQuestion.words
        }]
      };

      // Atualizar currentLevel
      setCurrentLevel(newLevel);

      // Se completou a fase (3 questões), registra nível final
      const currentReadingCount = newAnswers.reading.length;
      if (currentReadingCount % 6 === 0) {
        setFinalLevels(prev => ({ ...prev, reading: newLevel }));
        console.log('🏁 Reading phase completed with level:', newLevel);
      }

      return newAnswers;
    });

    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      handleNextQuestion(newLevel); // 👈 Passa o novo nível
    }, 3000);
  };

  const checkWritingAnswer = () => {
    let targetText, similarity, correct;

    if (phase === 'writing_translate') {
      // Translation: verificar similaridade do texto
      targetText = currentQuestion.english;
      similarity = compareTexts(targetText, userInput).similarity;
      correct = similarity >= 90;
    } else {
      // Writing_order: verificar ordem EXATA das palavras
      const userWords = userInput.trim().split(/\s+/).filter(w => w.length > 0);
      const correctWords = currentQuestion.correctOrder;
      targetText = correctWords.join(' ');

      // Comparar arrays SEM .sort() - ordem importa!
      correct = JSON.stringify(userWords) === JSON.stringify(correctWords);
      similarity = correct ? 100 : 0; // Para manter consistência
    }

    // Calcular novo nível ANTES
    const newLevel = adjustLevel(currentLevel, correct);
    console.log('🎚️ Level adjustment:', currentLevel, '->', newLevel, `(correct: ${correct})`);

    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [phase]: [...prev[phase], {
          correct,
          level: currentLevel,
          userInput,
          correctAnswer: targetText,
          similarity
        }]
      };

      // Atualizar currentLevel
      setCurrentLevel(newLevel);

      // Se completou a fase de writing (6 questões totais), registra nível final
      const totalWritingAnswers = newAnswers.writing_translate.length + newAnswers.writing_order.length;
      if (totalWritingAnswers % 6 === 0) {
        setFinalLevels(prev => ({ ...prev, writing: newLevel }));
        console.log('🏁 Writing phase completed with level:', newLevel);
      }

      return newAnswers;
    });

    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      handleNextQuestion(newLevel); // 👈 Passa o novo nível
    }, 3000);
  };

  const handleDownloadCertificate = () => {
    // Calcular nível médio baseado nos níveis finais
    const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const numberToLevel = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

    const levels = [finalLevels.speaking, finalLevels.listening, finalLevels.reading, finalLevels.writing]
      .filter(level => level !== null);

    const averageNumber = levels.length > 0 ?
      levels.reduce((sum, level) => sum + levelToNumber[level], 0) / levels.length : 3;

    const overallLevel = numberToLevel[Math.round(averageNumber)];

    const skillLevels = {
      speaking: { level: finalLevels.speaking, score: 0 },
      listening: { level: finalLevels.listening, score: 0 },
      reading: { level: finalLevels.reading, score: 0 },
      writing: { level: finalLevels.writing, score: 0 }
    };

    const certificateData = {
      name: profile.displayName || 'Anonymous',
      level: overallLevel,
      skills: skillLevels,
      date: new Date().toISOString()
    };
    generateAndDownloadCertificate(certificateData);
  };

  // Handlers gerais

  const handleNextQuestion = (nextLevel = null) => {

    if (questionIndex < currentQuestions.length - 1) {
      console.log('➡️ Moving to next question');
      // Atualizar questionsLevel com o nível passado ou o currentLevel atual
      setQuestionsLevel(nextLevel || currentLevel);
       setQuestionIndex(prev => prev + 1);
        setUserInput('');
        setUserSentence([]);
        // Reset reading/writing feedback states
        setIsCorrect(false);
        setShowFeedback(false);
     } else {
       console.log('🎬 End of phase, checking test mode');

      // Se for um teste específico (não full), ir direto para results
      if (testMode !== 'full') {
        const finalLevelValue = nextLevel || currentLevel;
        console.log('🏁 Specific test complete:', testMode, 'final level:', finalLevelValue);
        // Passar o nível final diretamente para handleFinishTest
        handleFinishTest({ [testMode]: finalLevelValue });
      } else {
         // Teste completo: próxima fase
         const phaseOrder = ['speaking', 'listening', 'reading', 'writing_translate', 'writing_order'];
         const currentPhaseIndex = phaseOrder.indexOf(phase);

         if (currentPhaseIndex < phaseOrder.length - 1) {
           const nextPhase = phaseOrder[currentPhaseIndex + 1];
           console.log('📋 Next phase:', nextPhase);

           // Reset TODOS os estados antes de mudar de fase
           setCurrentLevel('B1');
           setQuestionsLevel('B1');
           setQuestionIndex(0);
           setPhase(nextPhase);
           setUserInput('');
           setUserSentence([]);
           // Reset reading/writing feedback states
           setIsCorrect(false);
           setShowFeedback(false);
         } else {
           console.log('🏁 Full test complete!');
           handleFinishTest();
         }
       }
     }
  };

  const handleFinishTest = async (specificFinalLevels = null) => {
    // Calcular nível baseado no modo do teste
    const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const numberToLevel = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

    console.log('🏁 handleFinishTest - testMode:', testMode, 'finalLevels:', finalLevels, 'specificFinalLevels:', specificFinalLevels);

    // Usar specificFinalLevels se fornecido (para testes específicos)
    const effectiveFinalLevels = specificFinalLevels ? { ...finalLevels, ...specificFinalLevels } : finalLevels;

    let overallLevel;
    if (testMode === 'speaking') {
      overallLevel = effectiveFinalLevels.speaking || currentLevel || 'B1';
    } else if (testMode === 'listening') {
      overallLevel = effectiveFinalLevels.listening || currentLevel || 'B1';
    } else {
      // Teste completo: calcular média
      const levels = [effectiveFinalLevels.speaking, effectiveFinalLevels.listening, effectiveFinalLevels.reading, effectiveFinalLevels.writing]
        .filter(level => level !== null);

      if (levels.length > 0) {
        const averageNumber = levels.reduce((sum, level) => sum + levelToNumber[level], 0) / levels.length;
        overallLevel = numberToLevel[Math.round(averageNumber)];
      } else {
        overallLevel = 'B1';
      }
    }

    // Calcular scores baseado nas respostas
    const calculateScore = (answers) => {
      if (!answers || answers.length === 0) return 0;
      const correctAnswers = answers.filter(a => a.correct).length;
      return Math.round((correctAnswers / answers.length) * 100);
    };

    // Preparar dados para o certificado
    const skillLevels = {
      speaking: {
        level: effectiveFinalLevels.speaking,
        score: testMode === 'full' || testMode === 'speaking' ? calculateScore(answers.speaking) : 0
      },
      listening: {
        level: effectiveFinalLevels.listening,
        score: testMode === 'full' || testMode === 'listening' ? calculateScore(answers.listening) : 0
      },
      reading: {
        level: effectiveFinalLevels.reading,
        score: testMode === 'full' ? calculateScore(answers.reading) : 0
      },
      writing: {
        level: effectiveFinalLevels.writing,
        score: testMode === 'full' ? calculateScore([...answers.writing_translate, ...answers.writing_order]) : 0
      }
    };

    console.log('📊 Final data before save:');
    console.log('- testMode:', testMode);
    console.log('- overallLevel:', overallLevel);
    console.log('- finalLevels:', finalLevels);
    console.log('- skillLevels:', skillLevels);
    console.log('- answers count:', {
      speaking: answers.speaking.length,
      listening: answers.listening.length,
      reading: answers.reading.length,
      writing: answers.writing_translate.length + answers.writing_order.length
    });

    const result = {
      date: new Date().toISOString(),
      overallLevel,
      skills: skillLevels,
      finalLevels: effectiveFinalLevels, // Usar effectiveFinalLevels
      testMode, // Adicionar modo do teste
      answers: testMode === 'full' ? answers : {
        [testMode]: answers[testMode] // Apenas respostas do teste específico
      },
      certificate: {
        name: profile.displayName || 'Anonymous',
        level: overallLevel,
        skills: skillLevels,
        finalLevels: effectiveFinalLevels, // Usar effectiveFinalLevels
        date: new Date().toISOString()
      }
    };

    console.log('📤 Saving assessment result:', result);

    // Salvar resultado
    await dispatch(saveAssessmentResult(result));

    // Dar XP baseado no modo do teste
    const xpAmount = testMode === 'full' ? 500 : 250;
    dispatch(addXP({ amount: xpAmount, reason: 'assessment_completion' }));

    // Completar frase para streak
    dispatch(incrementPhraseCompleted());

    setPhase('results');
  };



  

  // ========================================
  // RENDER - Agora usando componentes externos
  // ========================================
  switch (phase) {
    case 'intro':
      return (
        <IntroPhase
          onStartSpeaking={() => {
            setTestMode('speaking');
            setPhase('speaking');
          }}
          onStartListening={() => {
            setTestMode('listening');
            setPhase('listening');
          }}
        />
      );

    case 'speaking':
      return (
        <SpeakingTest
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={20}
          currentLevel={currentLevel}
          onComplete={(result) => {
            // result: { correct, spokenText, similarity, attempts }
            const { correct, spokenText, similarity, attempts } = result;

            // Calcular novo nível ANTES
            const newLevel = adjustLevel(currentLevel, correct);
            console.log('🎚️ Level adjustment:', currentLevel, '->', newLevel, `(correct: ${correct})`);

            setAnswers(prev => {
              const newAnswers = {
                ...prev,
                speaking: [...prev.speaking, {
                  correct,
                  level: currentLevel,
                  accuracy: similarity,
                  userSpokenText: spokenText,
                  attempts
                }]
              };

              console.log('📊 Updated answers:', newAnswers.speaking.length);

              // Atualizar currentLevel
              setCurrentLevel(newLevel);

               // Se completou a fase (20 questões), registra nível final
               const currentSpeakingCount = newAnswers.speaking.length;
               if (currentSpeakingCount % 20 === 0) {
                setFinalLevels(prev => ({ ...prev, speaking: newLevel }));
                console.log('🏁 Speaking phase completed with level:', newLevel);
              }

              return newAnswers;
            });

            // Avançar para próxima questão passando o novo nível
            handleNextQuestion(newLevel);
          }}
          onNext={() => {
            // Avançar para próxima questão
            handleNextQuestion();
          }}
        />
      );

    case 'listening':
      if (!currentQuestion) {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
              <div className="text-red-600 font-bold mb-4">Erro: Questão não encontrada</div>
              <div className="text-gray-600 text-sm space-y-1">
                <p>Fase: {phase}</p>
                <p>Nível: {questionsLevel}</p>
                <p>Índice: {questionIndex}</p>
                <p>Questões disponíveis: {currentQuestions?.length || 0}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        );
      }

      return (
        <ListeningTest
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={20}
          currentLevel={currentLevel}
          onComplete={(result) => {
            // result: { correct, selectedAnswer, correctAnswer, playCount }
            const { correct, selectedAnswer, correctAnswer, playCount } = result;

            // Calcular novo nível ANTES
            const newLevel = adjustLevel(currentLevel, correct);
            console.log('🎚️ Level adjustment:', currentLevel, '->', newLevel, `(correct: ${correct})`);

            setAnswers(prev => {
              const newAnswers = {
                ...prev,
                listening: [...prev.listening, {
                  correct,
                  level: currentLevel,
                  selected: selectedAnswer,
                  correctAnswer: correctAnswer,
                  playCount
                }]
              };

              console.log('📊 Updated answers:', newAnswers.listening.length);

              // Atualizar currentLevel
              setCurrentLevel(newLevel);

               // Se completou a fase (20 questões), registra nível final
               const currentListeningCount = newAnswers.listening.length;
               if (currentListeningCount % 20 === 0) {
                setFinalLevels(prev => ({ ...prev, listening: newLevel }));
                console.log('🏁 Listening phase completed with level:', newLevel);
              }

              return newAnswers;
            });

            // Avançar para próxima questão passando o novo nível
            handleNextQuestion(newLevel);
          }}
          onNext={() => {
            // Avançar para próxima questão
            handleNextQuestion();
          }}
        />
      );

    case 'reading':
      return (
        <ReadingPhase
          currentQuestion={currentQuestion}
          questionIndex={questionIndex}
          currentLevel={currentLevel}
          userSentence={userSentence}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          onWordClick={handleWordClick}
          onCheckAnswer={checkReadingAnswer}
        />
      );

    case 'writing_translate':
    case 'writing_order':
      return (
        <WritingPhase
          phase={phase}
          currentQuestion={currentQuestion}
          questionIndex={questionIndex}
          currentLevel={currentLevel}
          userInput={userInput}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          onInputChange={setUserInput} // ⭐ Passar função diretamente
          onCheckAnswer={checkWritingAnswer}
        />
      );

     case 'results':
      return (
        <ResultsPhase
          finalLevels={finalLevels}
          testMode={testMode}
          onDownloadCertificate={handleDownloadCertificate}
          onGoBack={() => window.history.back()}
        />
      );

    default:
      return <IntroPhase onStart={() => setPhase('speaking')} />;
  }
};

export default AssessmentTrainer;