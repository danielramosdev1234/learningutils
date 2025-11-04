// src/components/referral/ReferralFieldInitializer.jsx
// ⚠️ SALVAR EM: src/components/referral/ReferralFieldInitializer.jsx
// Este componente garante que TODOS os usuários tenham o campo referral

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { saveProgress } from '../../store/slices/userSlice';
import { generateReferralCode, saveMyReferralCode } from '../../utils/referralUtils';

export const ReferralFieldInitializer = () => {
  const dispatch = useDispatch();
  const { userId, mode, referral, profile } = useSelector(state => state.user);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const ensureReferralField = async () => {
      // Só processa para usuários autenticados
      if (mode !== 'authenticated' || !userId) return;

      // Só executa uma vez
      if (isChecking) return;

      // Se já tem código no Redux, está OK
      if (referral?.code) {
        console.log('✅ Campo referral já existe no Redux');
        return;
      }

      setIsChecking(true);

      try {
        console.log('🔍 Verificando campo referral no Firestore...');

        // Busca documento do Firestore
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.log('⚠️ Documento não existe ainda');
          setIsChecking(false);
          return;
        }

        const userData = userDoc.data();

        // Verifica se campo referral existe no Firestore
        if (!userData.referral || !userData.referral.code) {
          console.log('🔧 Campo referral não existe! Criando...');

          // Gera código
          const displayName = profile?.displayName || 'USER';
          const code = generateReferralCode(displayName, userId);

          // Salva no localStorage
          saveMyReferralCode(code);

          // Cria estrutura completa
          const referralData = {
            code,
            referredBy: null,
            totalInvites: 0,
            successfulInvites: [],
            pending: [],
            rewards: {
              skipPhrases: 0,
              totalEarned: 0
            },
            hasReceivedWelcomeBonus: false
          };

          // Salva no Firestore (MERGE para não apagar dados)
          await setDoc(userRef, {
            referral: referralData
          }, { merge: true });

          console.log('✅ Campo referral criado com sucesso!');
          console.log('   Código:', code);

          // Força salvar progresso para atualizar Redux
          await dispatch(saveProgress());

          // Recarrega para atualizar estado
          console.log('🔄 Recarregando página para aplicar mudanças...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);

        } else {
          console.log('✅ Campo referral já existe no Firestore');
          console.log('   Código:', userData.referral.code);

          // Se existe no Firestore mas não no Redux, força save
          if (!referral?.code) {
            console.log('⚠️ Referral existe no Firestore mas não no Redux');
            console.log('   Forçando reload...');

            // Salva código no localStorage
            saveMyReferralCode(userData.referral.code);

            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }

      } catch (error) {
        console.error('❌ Erro ao verificar/criar campo referral:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Aguarda 2 segundos após login para garantir que tudo carregou
    const timer = setTimeout(() => {
      ensureReferralField();
    }, 2000);

    return () => clearTimeout(timer);
  }, [userId, mode, referral?.code, profile?.displayName, isChecking, dispatch]);

  return null; // Componente invisível
};