// src/components/referral/ReferralCard.jsx
import React, { useState } from 'react';
import { Copy, Check, Share2, Gift } from 'lucide-react';
import { generateReferralLink, trackReferralEvent } from '../../utils/referralUtils';

export const ReferralCard = ({ referralCode, onShare }) => {
  const [copied, setCopied] = useState(false);

  // Garante que referralCode seja uma string
  const safeReferralCode = typeof referralCode === 'string' ? referralCode : String(referralCode || '');

  const referralLink = generateReferralLink(safeReferralCode);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(safeReferralCode);
      setCopied(true);
      trackReferralEvent('code_copied', { code: safeReferralCode });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      trackReferralEvent('link_copied', { code: safeReferralCode });
      alert('✅ Link copiado! Cole no WhatsApp, Telegram ou onde quiser!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
          <Gift className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Seu Código de Convite</h3>
          <p className="text-sm text-gray-600">Compartilhe e ganhe recompensas!</p>
        </div>
      </div>

      {/* Código */}
      <div className="bg-white rounded-xl p-4 mb-4 border-2 border-purple-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">SEU CÓDIGO</p>
             <p className="text-3xl font-bold text-purple-600 tracking-wider">
               {safeReferralCode}
             </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-all shadow-md"
          >
            {copied ? <Check size={24} /> : <Copy size={24} />}
          </button>
        </div>
      </div>

      {/* Link */}
      <div className="bg-white rounded-xl p-4 mb-4 border-2 border-purple-200">
        <p className="text-xs text-gray-500 font-semibold mb-2">LINK DE CONVITE</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-gray-200"
          />
          <button
            onClick={handleCopyLink}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-all"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      {/* Botões de Compartilhamento */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onShare('whatsapp')}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <span className="text-xl">💬</span>
          <span>WhatsApp</span>
        </button>

        <button
          onClick={() => onShare('telegram')}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <span className="text-xl">✈️</span>
          <span>Telegram</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-purple-100 bg-opacity-50 rounded-lg border border-purple-200">
        <p className="text-xs text-purple-700 text-center">
          💡 <span className="font-semibold">Cada amigo que usar seu código ganha +3 frases bônus!</span>
        </p>
      </div>
    </div>
  );
};