// ✅ SUBSTITUIR ReferralFieldInitializer.jsx COMPLETO

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveProgress } from '../../store/slices/userSlice';

export const ReferralFieldInitializer = () => {
  const dispatch = useDispatch();
  const { mode, userId, referral } = useSelector((state) => state.user);

  // ✅ Usa ref para executar apenas UMA vez
  const hasInitialized = useRef(false);

  useEffect(() => {
    // ✅ Se já inicializou, não faz nada
    if (hasInitialized.current) {
      console.log('✅ Campo referral já foi inicializado (skip)');
      return;
    }

    // ✅ Só valida se o usuário está autenticado
    if (mode !== 'authenticated' || !userId) {
      return;
    }

    // ✅ Se referral é null, cria estrutura inicial
    if (referral === null || referral === undefined) {
      console.log('⚠️ Campo referral null detectado! Criando estrutura inicial...');

      // Marca como inicializado ANTES de salvar para evitar loop
      hasInitialized.current = true;

      // Salva com estrutura inicial
      dispatch(saveProgress());

      console.log('✅ Estrutura referral criada e salva');
    } else {
      // Referral já existe, marca como inicializado
      hasInitialized.current = true;
      console.log('✅ Campo referral já existe no Redux');
    }
  }, [mode, userId, referral, dispatch]);

  return null;
};