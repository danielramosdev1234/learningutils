import React from 'react';
import { Trophy, Award, Loader } from 'lucide-react';

export const Leaderboard = ({ leaderboard, loading, currentLang }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">
          Top 10 - {currentLang?.localName || 'Ranking'}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>Nenhum recorde ainda. Seja o primeiro! 🎯</p>
          <p className="text-sm mt-2">Consiga 80%+ de acertos com pelo menos 10 tentativas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-gray-600 font-semibold">#</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Nome</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Score</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Acertos</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-gray-500 font-semibold">{index + 1}</span>}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{entry.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                      {entry.score}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {entry.correct}/{entry.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};