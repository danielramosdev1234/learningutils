// src/components/modals/InvitePromptModal.jsx


import { useSelector, useDispatch } from 'react-redux';
import { X, Gift, Users, Sparkles } from 'lucide-react';
import { generateReferralShareText, trackReferralEvent } from '../../utils/referralUtils';
import { loginWithGoogle } from '../../store/slices/userSlice';
import React, { useState, useEffect } from 'react';

/**
 * Modal que aparece após completar 3 frases
 * Incentiva o usuário a convidar amigos
 */
export const InvitePromptModal = ({ isOpen, onClose, onInvite, onOpenInvite }) => {
  const dispatch = useDispatch();
  const { mode, referral, stats } = useSelector(state => state.user);

  if (!isOpen) return null;

  const handleShare = (platform) => {
    if (mode === 'guest') {
      // Pede para fazer login
      handleLogin();
      return;
    }

    if (!referral?.code) return;

    const texts = generateReferralShareText(referral.code);
    const link = `${window.location.origin}/?ref=${referral.code}`;

    trackReferralEvent('invite_from_modal', { platform });

    if (platform === 'whatsapp') {
      const whatsappText = encodeURIComponent(texts.whatsapp);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    } else if (platform === 'telegram') {
      const telegramText = encodeURIComponent(texts.telegram);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${telegramText}`, '_blank');
    }

    onClose();
  };

  const handleLogin = async () => {
    await dispatch(loginWithGoogle());
  };

  // Guest: Modal simplificado pedindo login
  if (mode === 'guest') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
              <p className="text-lg">Você já praticou {stats.totalPhrases} frases! 🎉</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Quer ganhar frases grátis?
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Gift className="text-purple-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">+5 pular frases</p>
                  <p className="text-sm text-gray-600">por cada amigo que convidar</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Users className="text-purple-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">Código único</p>
                  <p className="text-sm text-gray-600">personalizado para você</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="text-purple-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">Bônus extras</p>
                  <p className="text-sm text-gray-600">ao atingir 5, 10 e 25 amigos</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg mb-3"
            >
              Criar Conta e Convidar Amigos
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Modal completo
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4  bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className=" bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Está gostando?</h2>
            <p className="text-lg">Convide amigos e ganhe recompensas!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Código de Convite */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 mb-6 border-2 border-purple-200">
            <p className="text-xs text-gray-600 font-semibold mb-2 text-center">SEU CÓDIGO</p>
            <p className="text-3xl font-bold text-purple-600 text-center tracking-wider mb-3">
              {referral.code}
            </p>
            <p className="text-sm text-gray-600 text-center">
              Ganhe <span className="font-bold text-purple-600">+5 skip frases</span> por amigo!
            </p>
          </div>

          {/* Estatísticas */}
          {referral.totalInvites > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Convidados</p>
                <p className="text-2xl font-bold text-blue-600">{referral.totalInvites}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">Recompensas</p>
                <p className="text-2xl font-bold text-purple-600">{referral.rewards.skipPhrases}</p>
              </div>
            </div>
          )}

          {/* Botões de Compartilhamento */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
            >
              <span className="text-2xl">💬</span>
              <span>Compartilhar no WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('telegram')}
              className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
            >
              <span className="text-2xl">✈️</span>
              <span>Compartilhar no Telegram</span>
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};