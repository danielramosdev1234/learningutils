import React from 'react';
import { Award, Clock, ChevronRight, Mic, Headphones, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

const CEFR_BELTS = {
  'A1': { color: 'bg-gray-200', textColor: 'text-gray-800', name: 'Iniciante', barColor: 'bg-white' },
  'A2': { color: 'bg-blue-500', textColor: 'text-white', name: 'Básico', barColor: 'bg-blue-500' },
  'B1': { color: 'bg-purple-500', textColor: 'text-white', name: 'Intermediário', barColor: 'bg-purple-500' },
  'B2': { color: 'bg-amber-600', textColor: 'text-white', name: 'Intermediário Superior', barColor: 'bg-amber-800' },
  'C1': { color: 'bg-gray-900', textColor: 'text-white', name: 'Avançado', barColor: 'bg-black' },
  'C2': { color: 'bg-red-600', textColor: 'text-white', name: 'Proficiente', barColor: 'bg-red-600' }
};

const SKILL_ICONS = {
  speaking: { icon: Mic, color: 'text-pink-500', bgColor: 'bg-purple-50' },
  listening: { icon: Headphones, color: 'text-blue-500', bgColor: 'bg-blue-50' }
};

const SKILL_TRANSLATIONS = {
  speaking: 'Speaking',
  listening: 'Listening'
};

const AssessmentCard = ({ onNavigate }) => {
  const { assessment } = useSelector(state => state.user);
  const lastTest = assessment?.history?.[0];
  const hasTest = !!lastTest;
  const canTakeToday = !assessment?.lastTestDate ||
    new Date(assessment.lastTestDate).toDateString() !== new Date().toDateString();

  if (hasTest && !canTakeToday) {
    const belt = CEFR_BELTS[lastTest.overallLevel];

    return (
      <div className="bg-white rounded-xl overflow-hidden border-l-4 border-purple-500 shadow-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Nível Atual CEFR</p>
              <h3 className="text-2xl font-bold text-gray-900">{lastTest.overallLevel}</h3>
              <p className="text-sm text-gray-600 mt-1">{belt.name}</p>
            </div>
            <Award className="w-10 h-10 text-purple-500" />
          </div>

          {/* Skills com ícones e barras de progresso */}
          <div className="space-y-3 mb-5">
            {Object.entries(lastTest.skills).filter(([, data]) => data.level && data.percentage).map(([skill, data]) => {
              const skillInfo = SKILL_ICONS[skill];
              const Icon = skillInfo.icon;
              const percentage = data.percentage;
              const improvement = data.improvement;

              return (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`${skillInfo.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-4 h-4 ${skillInfo.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{SKILL_TRANSLATIONS[skill]}</span>
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {data.level}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      {improvement && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs font-medium">+{improvement}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${CEFR_BELTS[data.level]?.barColor || 'bg-gray-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Próximo teste: Amanhã</span>
            </div>
            <button
              onClick={() => onNavigate('assessment-history')}
              className="text-sm text-purple-500 font-medium hover:text-purple-600 transition-colors"
            >
              Ver histórico
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card de convite para fazer o teste
  return (
    <div
      onClick={() => onNavigate('assessment')}
      className="bg-white rounded-xl overflow-hidden border-l-4 border-purple-500 shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
                {hasTest ? 'Atualizar' : 'Novo'}
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                {hasTest ? 'Refazer Teste CEFR' : 'Teste de Nivelamento'}
              </h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          {hasTest
            ? 'Refaça o teste para atualizar seu nível e acompanhar seu progresso'
            : 'Descubra seu verdadeiro nível de inglês com nosso teste adaptativo baseado no padrão CEFR'
          }
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">15-20 min</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Adaptativo</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <Award className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">+300 XP</p>
          </div>
        </div>

        {/* Skills que serão avaliadas */}
        <div className="rounded-lg p-3 border border-purple-100">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            Avalia as habilidades de comunicação
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SKILL_ICONS).map(([skill, info]) => {
              const Icon = info.icon;
              const skillLevel = assessment?.[skill]?.level;
              return (
                <div key={skill} className={`${info.bgColor} rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 duration-200`}>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/80 p-1.5 rounded-full shadow-sm">
                      <Icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{SKILL_TRANSLATIONS[skill]}</span>
                  </div>

                  {skillLevel && (
                    <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md border border-gray-100 w-full justify-center">
                      <img src={`/faixa-${skillLevel}.gif`} alt={`Faixa ${skillLevel}`} className="w-5 h-5 object-contain mix-blend-multiply" />
                      <span className="text-xs font-bold text-purple-600">{skillLevel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Último resultado (se já fez antes) */}
        {hasTest && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Último resultado: <span className="font-bold text-purple-600">{lastTest.overallLevel}</span> - {CEFR_BELTS[lastTest.overallLevel].name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentCard;