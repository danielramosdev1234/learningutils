import React from 'react';
import { Trophy } from 'lucide-react';

export const RecordModal = ({ score, playerName, setPlayerName, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Novo Recorde! 🎉</h2>
          <p className="text-gray-600">
            Você conseguiu {Math.round((score.correct / score.total) * 100)}% de acerto!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {score.correct} corretos de {score.total} tentativas
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Digite seu nome para o ranking:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSave()}
            maxLength={30}
            placeholder="Seu nome aqui..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!playerName.trim()}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};