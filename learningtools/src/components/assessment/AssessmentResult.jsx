import React from 'react';
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Star,
  ArrowLeft,
  Zap,
  Target,
  TrendingUp,
  Volume2,
  Mic
} from 'lucide-react';

const CEFR_DESCRIPTIONS = {
  'A1': 'Iniciante - Compreende expressões básicas',
  'A2': 'Básico - Comunica-se em situações simples',
  'B1': 'Intermediário - Lida com situações cotidianas',
  'B2': 'Intermediário Avançado - Interage com fluência',
  'C1': 'Avançado - Usa a língua de forma flexível',
  'C2': 'Proficiente - Domínio quase nativo'
};

const CEFR_COLORS = {
  'A1': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
  'A2': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
  'B1': { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
  'B2': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
  'C1': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
  'C2': { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' }
};

const AssessmentResult = ({
  finalLevel = 'B1',
  testMode = 'listening',
  answers = [],
  onDownloadCertificate,
  onGoBack
}) => {
  // Calcular estatísticas
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const score = accuracy;

  // Distribuição por nível
  const levelCounts = {};
  answers.forEach(answer => {
    const level = answer.level || 'A1';
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });

  const skillConfig = {
    speaking: { name: 'Speaking', icon: Mic, color: 'purple', emoji: '🗣️' },
    listening: { name: 'Listening', icon: Volume2, color: 'green', emoji: '👂' }
  }[testMode];

  const Icon = skillConfig.icon;
  const colors = CEFR_COLORS[finalLevel] || CEFR_COLORS['B1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header com resultado principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center relative overflow-hidden">
          {/* Barra decorativa top */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>

          {/* Troféu animado */}
          <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="currentColor" />

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Parabéns! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            Você completou o teste de {skillConfig.name} {skillConfig.emoji}
          </p>

          {/* Nível Final - Destaque */}
          <div className={`inline-block ${colors.bg} ${colors.text} px-8 py-6 rounded-2xl shadow-lg mb-6 border-2 ${colors.border}`}>
            <p className="text-sm font-semibold mb-2 opacity-90">Seu Nível de {skillConfig.name}</p>
            <p className="text-6xl font-bold mb-2">{finalLevel}</p>
            <p className="text-sm opacity-90">{CEFR_DESCRIPTIONS[finalLevel]}</p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
              <p className="text-xs text-gray-600">Precisão</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</p>
              <p className="text-xs text-gray-600">Acertos</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{score}</p>
              <p className="text-xs text-gray-600">Pontos</p>
            </div>
          </div>
        </div>

        {/* Detalhamento por Nível */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Desempenho por Nível CEFR
          </h3>

          <div className="space-y-3">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
              const count = levelCounts[level] || 0;
              const percentage = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0;
              const levelColors = CEFR_COLORS[level];

              return (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-16 text-center font-bold py-2 rounded ${levelColors.bg} ${levelColors.text} border ${levelColors.border}`}>
                    {level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{count} questões</span>
                      <span className="text-sm font-semibold text-gray-800">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${levelColors.bg} border ${levelColors.border}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Análise Detalhada */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Análise Detalhada</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Respostas Corretas</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Respostas Incorretas</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
            </div>
          </div>

          {/* Dicas de melhoria */}
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para melhorar:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {accuracy < 60 && (
                <li>• Continue praticando diariamente para fortalecer sua base</li>
              )}
              {accuracy >= 60 && accuracy < 80 && (
                <li>• Você está no caminho certo! Mantenha a consistência</li>
              )}
              {accuracy >= 80 && (
                <li>• Excelente desempenho! Considere desafios de nível superior</li>
              )}
              <li>• Pratique {skillConfig.name.toLowerCase()} 15-30 minutos por dia</li>
              <li>• Revise as questões que errou para identificar padrões</li>
            </ul>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onDownloadCertificate}
            className="bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <Download className="w-6 h-6" />
            Baixar Certificado
          </button>
          <button
            onClick={onGoBack}
            className="bg-gray-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            Voltar ao Dashboard
          </button>
        </div>

        {/* XP Conquistado */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-6 text-center">
          <Zap className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
          <p className="text-2xl font-bold text-yellow-800 mb-1">+500 XP Conquistados!</p>
          <p className="text-sm text-yellow-700">Continue treinando para ganhar mais experiência</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;