// src/components/referral/InviteFriendsScreen.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Gift, Sparkles } from 'lucide-react';
import { ReferralCard } from './ReferralCard';
import { ReferralStats } from './ReferralStats';
import { generateReferralShareText, trackReferralEvent } from '../../utils/referralUtils';
import { loginWithGoogle } from '../../store/slices/userSlice';

export const InviteFriendsScreen = ({ onBack }) => {
  const dispatch = useDispatch();
  const { mode, referral, profile } = useSelector(state => state.user);

  const handleShare = (platform) => {
    if (!referral?.code) return;

    const texts = generateReferralShareText(referral.code, profile.displayName);
    const link = `${window.location.origin}/?ref=${referral.code}`;

    trackReferralEvent('share_clicked', { platform, code: referral.code });

    if (platform === 'whatsapp') {
      const whatsappText = encodeURIComponent(texts.whatsapp);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    } else if (platform === 'telegram') {
      const telegramText = encodeURIComponent(texts.telegram);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${telegramText}`, '_blank');
    }
  };

  const handleLoginPrompt = async () => {
    await dispatch(loginWithGoogle());
  };

  // Guest não tem código ainda
  if (mode === 'guest') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Convide Amigos</h1>
          </div>

          {/* Login Prompt */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Gift className="text-purple-600" size={48} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Crie sua conta para convidar amigos!
            </h2>

            <p className="text-gray-600 mb-6">
              Ganhe <span className="font-bold text-purple-600">+5 frases</span> para pular a cada amigo que usar seu código!
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="text-purple-600" size={20} />
                <span className="text-sm text-gray-700">Código único personalizado</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Gift className="text-purple-600" size={20} />
                <span className="text-sm text-gray-700">+5 pular frases por amigo</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="text-purple-600" size={20} />
                <span className="text-sm text-gray-700">Bônus extras ao atingir metas</span>
              </div>
            </div>

            <button
              onClick={handleLoginPrompt}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuário autenticado
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Convide Amigos</h1>
            <p className="text-gray-600">Ganhe +5 pular frases por amigo!</p>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            Como Funciona
          </h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-800">Compartilhe seu código</p>
                <p className="text-sm text-gray-600">Envie para amigos no WhatsApp, Telegram ou redes sociais</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-800">Seu amigo ganha bônus</p>
                <p className="text-sm text-gray-600">Ele ganha +3 frases bônus ao usar seu código</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-800">Você ganha recompensas</p>
                <p className="text-sm text-gray-600">Ganhe +5 pular frases quando ele completar a primeira frase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Convite */}
        <ReferralCard
          referralCode={referral?.code}
          onShare={handleShare}
        />

        {/* Estatísticas */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Suas Estatísticas</h2>
          <ReferralStats referralData={referral} />
        </div>

        {/* Milestones */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="text-orange-600" size={24} />
            Bônus por Milestones
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white bg-opacity-60 rounded-lg">
              <span className="font-semibold text-gray-700">5 amigos</span>
              <span className="text-orange-600 font-bold">+10 frases extras</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white bg-opacity-60 rounded-lg">
              <span className="font-semibold text-gray-700">10 amigos</span>
              <span className="text-orange-600 font-bold">+25 frases extras</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white bg-opacity-60 rounded-lg">
              <span className="font-semibold text-gray-700">25 amigos</span>
              <span className="text-orange-600 font-bold">+100 frases extras</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};