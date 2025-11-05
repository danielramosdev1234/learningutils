// src/components/referral/ReferralStats.jsx (ATUALIZADO)
import React, { useState } from 'react';
import { Users, Gift, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { calculateRewards } from '../../utils/referralUtils';
import { getCurrentUser } from '../../services/authService';
import { loadAuthUserData } from '../../services/userService';

export const ReferralStats = ({ referralData }) => {
  const {
    totalInvites = 0,
    successfulInvites = [],
    rewards = { skipPhrases: 0 }
  } = referralData;

  const { nextMilestone, milestoneRewards } = calculateRewards(totalInvites);
  const currentUser = getCurrentUser();
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const handleRefreshStats = async () => {
    setRefreshing(true);

    try {
      const userData = await loadAuthUserData(currentUser.uid);

      if (userData?.referral) {
        dispatch({
          type: 'user/updateReferralData',
          payload: userData.referral
        });
        console.log('✅ Stats refreshed!');
      }
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 gap-4">
        {/* Botão de Refresh */}
        <div className="col-span-2 flex justify-end">
          <button
            onClick={handleRefreshStats}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin text-blue-600' : 'text-blue-600'} />
            <span className="text-sm font-semibold text-blue-700">
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </span>
          </button>
        </div>

        {/* Total Convidados */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-600" size={20} />
            <span className="text-xs font-semibold text-blue-700">CONVIDADOS</span>
          </div>
          <p className="text-3xl font-bold text-blue-800">{totalInvites}</p>
          <p className="text-xs text-blue-600 mt-1">amigos no total</p>
        </div>

        {/* Ativos (agora todos são considerados ativos) */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-xs font-semibold text-green-700">ATIVOS</span>
          </div>
          <p className="text-3xl font-bold text-green-800">{successfulInvites.length}</p>
          <p className="text-xs text-green-600 mt-1">fizeram login</p>
        </div>

        {/* Recompensas */}
        <div className="col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-purple-600" size={24} />
            <span className="text-sm font-semibold text-purple-700">RECOMPENSAS</span>
          </div>
          <p className="text-4xl font-bold text-purple-800">{rewards.skipPhrases}</p>
          <p className="text-sm text-purple-600 mt-1">frases para pular disponíveis</p>
        </div>
      </div>

      {/* Próximo Milestone */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="text-orange-600" size={20} />
              <span className="text-sm font-bold text-orange-700">Próxima Meta</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {nextMilestone} amigos
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white bg-opacity-60 rounded-full h-3 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-full transition-all duration-500"
              style={{ width: `${(totalInvites / nextMilestone) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-600">
              {totalInvites} / {nextMilestone} amigos
            </span>
            <span className="text-orange-600 font-bold">
              +{milestoneRewards[nextMilestone]} frases bônus!
            </span>
          </div>
        </div>
      )}

      {/* Lista de Amigos */}
      {successfulInvites.length > 0 && (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={18} />
            Amigos Convidados
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {successfulInvites.map((friend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700 font-medium">
                  Amigo #{index + 1}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  ✅ Ativo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dica */}
      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <span className="font-semibold">Nova:</span> Agora você recebe as recompensas assim que seu amigo faz login usando seu código! Não precisa esperar ele completar frases.
        </p>
      </div>
    </div>
  );
};