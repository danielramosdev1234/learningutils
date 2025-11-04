// src/components/referral/ReferralButton.jsx
import React, { useState } from 'react';
import { Gift, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { InviteFriendsScreen } from './InviteFriendsScreen';

export const ReferralButton = ({ variant = 'default', onClick }) => {
  const [showModal, setShowModal] = useState(false);
  const { referral, mode } = useSelector(state => state.user);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  // Variante compacta (navbar)
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95"
          title="Convide amigos e ganhe recompensas"
        >
          <Gift size={16} className="text-white" />
          <span className="font-bold text-white text-sm hidden sm:inline">
            Convide
          </span>
          {referral?.totalInvites > 0 && (
            <span className="bg-white text-purple-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {referral.totalInvites}
            </span>
          )}
        </button>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <InviteFriendsScreen onBack={handleClose} />
          </div>
        )}
      </>
    );
  }

  // Variante padrão (botão maior)
  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Gift size={24} />
        <div className="text-left">
          <p className="text-sm opacity-90">Convide Amigos</p>
          <p className="text-xs opacity-75">+5 frases por amigo</p>
        </div>
        {referral?.totalInvites > 0 && (
          <span className="bg-white text-purple-600 text-sm font-bold px-2 py-1 rounded-full">
            {referral.totalInvites}
          </span>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <InviteFriendsScreen onBack={handleClose} />
        </div>
      )}
    </>
  );
};