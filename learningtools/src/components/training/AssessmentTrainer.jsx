import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import {
  Star, Volume2, Mic,
  Trophy, Clock, Award, Download, Zap
} from 'lucide-react';
import speakingAssessmentData from '../../data/speaking_assessment.json';
import listeningAssessmentData from '../../data/listening_assesment.json';
import SpeakingTest from './SpeakingTest.jsx';
import ListeningTest from './ListeningTest.jsx';
import {
  saveAssessmentResult,
  selectCanTakeAssessment,
  incrementPhraseCompleted
} from '../../store/slices/userSlice';
import { addXP } from '../../store/slices/xpSlice';
import { generateAndDownloadCertificate } from '../../utils/assessmentUtils';

// ========================================
// ASSESSMENT UTILITIES
// ========================================
const adjustLevel = (currentLevel, isCorrect) => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);

  if (isCorrect) {
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  } else {
    return levels[Math.max(currentIndex - 1, 0)];
  }
};

// ========================================
// PHASE COMPONENTS
// ========================================

// IntroPhase Component
const IntroPhase = ({ onStartSpeaking, onStartListening }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
      <div className="mb-6">
        <div className="flex justify-center gap-4 mb-4">
          {[...Array(5)].map((_, i) => {
            const belts = ['white', 'blue-500', 'purple-500', 'yellow-500', 'black'];
            const belt = belts[i];
            return (
              <div key={i} className="flex flex-col items-center">
                <Star className="w-8 h-8 text-yellow-500" fill="currentColor" />
                <div className={`w-8 h-2 bg-${belt} rounded mt-1 border-2 border-black`}></div>
              </div>
            );
          })}
        </div>
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
          <span className="font-semibold text-gray-800">+500 XP</span>
        </div>
        <p className="text-sm text-gray-600">por teste completado</p>
      </div>

      <p className="text-xs text-gray-500">
        Cada teste avalia 20 questões do seu nível atual
      </p>
    </div>
  </div>
);

// ResultsPhase Component
const ResultsPhase = ({
  finalLevels,
  testMode,
  onDownloadCertificate,
  onGoBack
}) => {
  const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
  const numberToLevel = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

  let levels = [];
  let skillsToShow = [];

  if (testMode === 'speaking') {
    levels = finalLevels.speaking ? [finalLevels.speaking] : [];
    skillsToShow = ['speaking'];
  } else if (testMode === 'listening') {
    levels = finalLevels.listening ? [finalLevels.listening] : [];
    skillsToShow = ['listening'];
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
    listening: { level: finalLevels.listening, score: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center">
          <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Excelente! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Você completou o teste de {testMode === 'speaking' ? 'pronúncia' : 'compreensão auditiva'}
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

        {/* Skill Details */}
        <div className="grid gap-4 mb-6 grid-cols-1 max-w-md mx-auto">
          {skillsToShow.map(skill => {
            const skillConfig = {
              speaking: { name: 'Speaking', icon: Mic, color: 'purple' },
              listening: { name: 'Listening', icon: Volume2, color: 'green' }
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

        {/* Actions */}
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
          <p className="text-green-800 font-semibold">+500 XP conquistados!</p>
        </div>
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
const AssessmentTrainer = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.user);
  const canTake = useSelector(selectCanTakeAssessment);

  // Main states
  const [phase, setPhase] = useState('intro'); // intro, speaking, listening, results
  const [currentLevel, setCurrentLevel] = useState('B1');
  const [questionsLevel, setQuestionsLevel] = useState('B1');
  const [testMode, setTestMode] = useState('speaking'); // 'speaking' or 'listening'

  // Final levels for each phase
  const [finalLevels, setFinalLevels] = useState({
    speaking: null,
    listening: null
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    speaking: [],
    listening: []
  });

  // Debug log
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔍 Assessment State:', {
        phase,
        questionIndex,
        currentLevel,
        speakingAnswers: answers.speaking.length,
        listeningAnswers: answers.listening.length
      });
    }
  }, [phase, questionIndex, currentLevel, answers.speaking.length, answers.listening.length]);

  // Current questions based on level
  const currentQuestions = React.useMemo(() => {
    const questionCount = 20;

    let allQuestions;
    if (phase === 'speaking') {
      allQuestions = speakingAssessmentData.speaking || [];
    } else if (phase === 'listening') {
      allQuestions = listeningAssessmentData.listening || [];
    } else {
      return [];
    }

    const filtered = allQuestions.filter(q => q.cefr_level === questionsLevel);

    // Fisher-Yates shuffle
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (shuffled.length >= questionCount) {
      return shuffled.slice(0, questionCount);
    }

    return shuffled;
  }, [phase, questionsLevel]);

  const currentQuestion = React.useMemo(() => {
    if (!currentQuestions || !currentQuestions[questionIndex]) return null;
    return currentQuestions[questionIndex];
  }, [currentQuestions, questionIndex]);

  // Check if user can take test
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

  // Handlers
  const handleNextQuestion = (nextLevel = null) => {
    if (questionIndex < currentQuestions.length - 1) {
      console.log('➡️ Moving to next question');
      setQuestionsLevel(nextLevel || currentLevel);
      setQuestionIndex(prev => prev + 1);
    } else {
      console.log('🎬 End of phase');
      const finalLevelValue = nextLevel || currentLevel;
      console.log('🏁 Test complete:', testMode, 'final level:', finalLevelValue);
      handleFinishTest({ [testMode]: finalLevelValue });
    }
  };

  const handleFinishTest = async (specificFinalLevels = null) => {
    const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };

    console.log('🏁 handleFinishTest - testMode:', testMode, 'finalLevels:', finalLevels, 'specificFinalLevels:', specificFinalLevels);

    const effectiveFinalLevels = specificFinalLevels ? { ...finalLevels, ...specificFinalLevels } : finalLevels;

    let overallLevel;
    if (testMode === 'speaking') {
      overallLevel = effectiveFinalLevels.speaking || currentLevel || 'B1';
    } else if (testMode === 'listening') {
      overallLevel = effectiveFinalLevels.listening || currentLevel || 'B1';
    }

    const calculateScore = (answers) => {
      if (!answers || answers.length === 0) return 0;
      const correctAnswers = answers.filter(a => a.correct).length;
      return Math.round((correctAnswers / answers.length) * 100);
    };

    const skillLevels = {
      speaking: {
        level: effectiveFinalLevels.speaking,
        score: testMode === 'speaking' ? calculateScore(answers.speaking) : 0
      },
      listening: {
        level: effectiveFinalLevels.listening,
        score: testMode === 'listening' ? calculateScore(answers.listening) : 0
      }
    };

    console.log('📊 Final data before save:', {
      testMode,
      overallLevel,
      finalLevels,
      skillLevels,
      answersCount: {
        speaking: answers.speaking.length,
        listening: answers.listening.length
      }
    });

    const result = {
      date: new Date().toISOString(),
      overallLevel,
      skills: skillLevels,
      finalLevels: effectiveFinalLevels,
      testMode,
      answers: {
        [testMode]: answers[testMode]
      },
      certificate: {
        name: profile.displayName || 'Anonymous',
        level: overallLevel,
        skills: skillLevels,
        finalLevels: effectiveFinalLevels,
        date: new Date().toISOString()
      }
    };

    console.log('📤 Saving assessment result:', result);

    await dispatch(saveAssessmentResult(result));
    dispatch(addXP({ amount: 500, reason: 'assessment_completion' }));
    dispatch(incrementPhraseCompleted());

    setPhase('results');
  };

  const handleDownloadCertificate = () => {
    const levelToNumber = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const numberToLevel = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };

    const levels = [finalLevels.speaking, finalLevels.listening]
      .filter(level => level !== null);

    const averageNumber = levels.length > 0 ?
      levels.reduce((sum, level) => sum + levelToNumber[level], 0) / levels.length : 3;

    const overallLevel = numberToLevel[Math.round(averageNumber)];

    const skillLevels = {
      speaking: { level: finalLevels.speaking, score: 0 },
      listening: { level: finalLevels.listening, score: 0 }
    };

    const certificateData = {
      name: profile.displayName || 'Anonymous',
      level: overallLevel,
      skills: skillLevels,
      date: new Date().toISOString()
    };
    generateAndDownloadCertificate(certificateData);
  };

  // ========================================
  // RENDER
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
            const { correct, spokenText, similarity, attempts } = result;

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

              setCurrentLevel(newLevel);

              const currentSpeakingCount = newAnswers.speaking.length;
              if (currentSpeakingCount % 20 === 0) {
                setFinalLevels(prev => ({ ...prev, speaking: newLevel }));
                console.log('🏁 Speaking phase completed with level:', newLevel);
              }

              return newAnswers;
            });

            handleNextQuestion(newLevel);
          }}
          onNext={() => {
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
            const { correct, selectedAnswer, correctAnswer, playCount } = result;

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

              setCurrentLevel(newLevel);

              const currentListeningCount = newAnswers.listening.length;
              if (currentListeningCount % 20 === 0) {
                setFinalLevels(prev => ({ ...prev, listening: newLevel }));
                console.log('🏁 Listening phase completed with level:', newLevel);
              }

              return newAnswers;
            });

            handleNextQuestion(newLevel);
          }}
          onNext={() => {
            handleNextQuestion();
          }}
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
  }
};

export default AssessmentTrainer;