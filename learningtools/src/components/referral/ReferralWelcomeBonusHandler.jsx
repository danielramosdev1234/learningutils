// src/components/referral/ReferralWelcomeBonusHandler.jsx
// ⚠️ SALVAR EM: src/components/referral/ReferralWelcomeBonusHandler.jsx

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { giveWelcomeBonus } from '../../store/slices/userSlice';

/**
 * Componente invisível que monitora e concede bônus de boas-vindas
 * quando usuário é convidado por alguém
 */
export const ReferralWelcomeBonusHandler = () => {
  const dispatch = useDispatch();
  const { referral, mode } = useSelector(state => state.user);

  useEffect(() => {
    // Só processa se:
    // 1. Usuário está autenticado
    // 2. Foi convidado por alguém (tem referredBy)
    // 3. Ainda não recebeu o bônus
    if (
      mode === 'authenticated' &&
      referral?.referredBy &&
      !referral?.hasReceivedWelcomeBonus
    ) {
      console.log('🎁 Novo usuário convidado detectado! Concedendo bônus...');

      // Aguarda 1 segundo para garantir que o estado foi salvo
      setTimeout(() => {
        dispatch(giveWelcomeBonus());
      }, 1000);
    }
  }, [mode, referral?.referredBy, referral?.hasReceivedWelcomeBonus, dispatch]);

  return null; // Componente invisível
};