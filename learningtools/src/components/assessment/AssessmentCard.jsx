import React from 'react';
import { Star, Award, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const CEFR_BELTS = {
  'A1': { color: 'from-gray-100 to-gray-300', textColor: 'text-gray-800', name: 'Iniciante' },
  'A2': { color: 'from-blue-400 to-blue-600', textColor: 'text-white', name: 'Básico' },
  'B1': { color: 'from-purple-400 to-purple-600', textColor: 'text-white', name: 'Intermediário' },
  'B2': { color: 'from-amber-700 to-amber-900', textColor: 'text-white', name: 'Intermediário Superior' },
  'C1': { color: 'from-gray-800 to-black', textColor: 'text-white', name: 'Avançado' },
  'C2': { color: 'from-red-600 to-red-800', textColor: 'text-white', name: 'Proficiente' }
};

const AssessmentCard = ({ onNavigate }) => {
  const { assessment } = useSelector(state => state.user);
  const lastTest = assessment?.history?.[0];
  const hasTest = !!lastTest;
  const canTakeToday = !assessment?.lastTestDate ||
    new Date(assessment.lastTestDate).toDateString() !== new Date().toDateString();

  if (hasTest && !canTakeToday) {
    // Já fez o teste hoje - mostrar resultado
    const belt = CEFR_BELTS[lastTest.overallLevel];

    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md overflow-hidden border-2 border-purple-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-gradient-to-br ${belt.color}`}>
                <Award className={`w-6 h-6 ${belt.textColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Seu Nível CEFR</h3>
                <p className="text-sm text-gray-600">Atualizado hoje</p>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-full bg-gradient-to-br ${belt.color}`}>
              <span className={`text-2xl font-bold ${belt.textColor}`}>
                {lastTest.overallLevel}
              </span>
            </div>
          </div>

          {/* Skills breakdown */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(lastTest.skills).map(([skill, data]) => (
              <div key={skill} className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 capitalize">{skill}</p>
                <p className="text-lg font-bold text-purple-600">{data.level}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Próximo teste: Amanhã</span>
            </div>
            <button
              onClick={() => {/* Ver histórico */}}
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              Ver detalhes →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Nunca fez ou pode fazer hoje
  return (
    <div
      onClick={() => onNavigate('assessment')}
      className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
    >
      <div className="p-6 relative">
        {/* Badge "Novo" */}
        {!hasTest && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            NOVO
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Star className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {hasTest ? 'Refazer Teste de Nivelamento' : 'Teste de Nivelamento CEFR'}
            </h3>
            <p className="text-white/90">
              {hasTest ? 'Atualize seu nível hoje' : 'Descubra seu nível real de inglês'}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-white text-xs font-semibold">15-20 min</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-white text-xs font-semibold">Adaptativo</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Award className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-white text-xs font-semibold">+500 XP</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div>
            <p className="text-white font-semibold">
              {hasTest ? 'Seu último resultado' : 'Avalia 5 habilidades'}
            </p>
            <p className="text-white/80 text-sm">
              {hasTest ? `Nível ${lastTest.overallLevel} - ${CEFR_BELTS[lastTest.overallLevel].name}` : 'Speaking, Listening, Reading, Writing'}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </div>

        {hasTest && (
          <p className="text-white/70 text-xs text-center mt-3">
            ✨ Refaça o teste para atualizar seu nível
          </p>
        )}
      </div>
    </div>
  );
};

export default AssessmentCard;