// src/utils/referralUtils.js

/**
 * Gera código de referral único no formato: NOME-XXXX
 * Ex: DANIEL-XK7P
 */
export const generateReferralCode = (displayName = 'USER', userId) => {
  // Remove caracteres especiais e limita a 8 caracteres
  const cleanName = displayName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  // Gera 4 caracteres aleatórios
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  // Combina: NOME-XXXX
  return `${cleanName || 'USER'}-${randomPart}`;
};

/**
 * Valida formato do código de referral
 */
export const isValidReferralCode = (code) => {
  if (!code || typeof code !== 'string') return false;

  // Formato esperado: TEXTO-XXXX (mínimo 5 chars)
  const regex = /^[A-Z0-9]+-[A-Z0-9]{4}$/;
  return regex.test(code);
};

/**
 * Detecta código de referral na URL (?ref=CODIGO)
 */
export const detectReferralFromURL = () => {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref');

  if (refCode && isValidReferralCode(refCode)) {
    console.log('🎁 Código de referral detectado:', refCode);
    return refCode;
  }

  return null;
};

/**
 * Remove parâmetro ref= da URL (após processar)
 */
export const cleanReferralFromURL = () => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location);
  if (url.searchParams.has('ref')) {
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url);
    console.log('✅ Parâmetro ref removido da URL');
  }
};

/**
 * Gera link de referral completo
 */
export const generateReferralLink = (code) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${code}`;
};

/**
 * Calcula recompensas baseado em milestones
 */
export const calculateRewards = (totalInvites) => {
  const REWARDS = {
    SKIP_PHRASES_PER_FRIEND: 5,
    MILESTONES: {
      5: 10,   // Bônus ao atingir 5 amigos
      10: 25,  // Bônus ao atingir 10 amigos
      25: 100  // Bônus ao atingir 25 amigos
    }
  };

  let totalSkipPhrases = totalInvites * REWARDS.SKIP_PHRASES_PER_FRIEND;

  // Adiciona bônus de milestones
  Object.entries(REWARDS.MILESTONES).forEach(([milestone, bonus]) => {
    if (totalInvites >= parseInt(milestone)) {
      totalSkipPhrases += bonus;
    }
  });

  return {
    skipPhrases: totalSkipPhrases,
    nextMilestone: getNextMilestone(totalInvites),
    milestoneRewards: REWARDS.MILESTONES
  };
};

/**
 * Retorna próximo milestone
 */
const getNextMilestone = (current) => {
  const milestones = [5, 10, 25, 50, 100];
  return milestones.find(m => m > current) || null;
};

/**
 * Formata texto para compartilhamento de referral
 * Mensagens variam baseado no horário do dia (blocos de 6 horas)
 */
export const generateReferralShareText = (code, userName = 'um amigo') => {
  const link = generateReferralLink(code);

  // Variações de mensagens organizadas por período do dia
  const messageVariations = {
    whatsapp: [
      // MANHÃ (6h-11h) - Tom energético e motivacional
      `Bom dia! ☀️

Cara, comecei a usar um app de inglês que tá sendo VICIANTE mesmo... tipo, não consigo parar 😅

É o LearnFun - totalmente grátis e bem diferente desses cursinhos chatos

🎁 Peguei um código pra você ganhar bônus:
→ ${code}

Só cadastrar aqui: ${link}

Você ganha +3 skip frases extras pra testar

Vale MUITO a pena, testa aí! 🚀`,

      // TARDE (12h-17h) - Tom direto e prático
      `Opa! Bora praticar inglês juntos? 🎯

Tô usando o LearnFun e o negócio é BOM demais (e grátis!)

🎁 Te mandei um convite especial:
📌 Código: ${code}
🎯 Ganhe: +3 skip frases bônus
📱 Link: ${link}

Entra lá que você não vai se arrepender! 💪`,

      // NOITE (18h-23h) - Tom com FOMO e urgência
      `Fala! 😃

Descobri um app de inglês que tá fazendo MUITO sucesso... e entendi porquê!

É tipo um jogo, mas você aprende pra valer. Melhor: é DE GRAÇA 🤯

🎁 Peguei um código VIP pra você:
→ ${code} (dá +3 skip frases extras!)

Acessa: ${link}

Mas usa logo, porque esse bônus não vai durar pra sempre 😉

Confia! 🔥`,

      // MADRUGADA (0h-5h) - Tom reflexivo e storytelling
      `E aí! ✌️

Sabe quando você fica pensando em melhorar o inglês mas nunca começa?

Então, achei um app (LearnFun) que finalmente FUNCIONOU! Tô praticando todo dia e já tô vendo progresso 📈

Pensei em você e peguei um convite:

🎁 Código: ${code}
💎 Bônus: +3 skip frases grátis
🔗 ${link}

Bora treinar junto? É grátis e vicia fácil 😂

Me conta depois o que achou! 🚀`
    ],

    telegram: [
      // MANHÃ
      `Bom dia! ☀️

Tô usando o LearnFun pra praticar inglês e é MUITO BOM!

🎁 Código especial pra você:
${code} (+3 skip frases bônus)

Cadastra aqui: ${link}

É grátis e vicia! Bora? 🚀`,

      // TARDE
      `Opa! 👋

Encontrei o app PERFEITO pra praticar inglês (grátis!)

Use meu código: ${code}
Link: ${link}
Ganhe: +3 skip frases extras

Vale muito testar! 💪`,

      // NOITE
      `Fala! 🔥

Descobri um app de inglês INCRÍVEL que tá bombando!

Código: ${code}
Bônus: +3 skip frases grátis
Acesse: ${link}

Usa logo antes que o bônus acabe! 😉`,

      // MADRUGADA
      `E aí! 🌙

Praticando inglês de madrugada aqui no LearnFun 😅

Peguei convite pra você:
${code} (dá +3 skip frases extras)

${link}

Vicia demais! 🚀`
    ],

    generic: [
      // MANHÃ
      `🌅 Pratique inglês grátis comigo!

Código: ${code}
Bônus: +3 skip frases
Link: ${link}

LearnFun - Comece o dia aprendendo! 🚀`,

      // TARDE
      `🎁 Convite LearnFun

Use: ${code}
Ganhe: +3 skip frases grátis
${link}

Vem praticar comigo! 💪`,

      // NOITE
      `🔥 Última chance hoje!

Código: ${code}
Bônus: +3 skip frases extras
${link}

LearnFun - Não perca! 🚀`,

      // MADRUGADA
      `🌙 Pratique inglês a qualquer hora

Código: ${code}
Bônus: +3 skip frases
${link}

LearnFun - 24h disponível! ⚡`
    ]
  };

  /**
   * Seleciona variação baseada no horário do dia
   * Divide o dia em 4 blocos de 6 horas cada
   */
  const getVariationByTimeOfDay = (platform) => {
    const hour = new Date().getHours();

    // Determina o período do dia (0-3)
    let periodIndex;
    if (hour >= 6 && hour < 12) {
      periodIndex = 0; // Manhã (6h-11h)
    } else if (hour >= 12 && hour < 18) {
      periodIndex = 1; // Tarde (12h-17h)
    } else if (hour >= 18 && hour < 24) {
      periodIndex = 2; // Noite (18h-23h)
    } else {
      periodIndex = 3; // Madrugada (0h-5h)
    }

    // Retorna a mensagem correspondente ao período
    return messageVariations[platform][periodIndex];
  };

  return {
    whatsapp: getVariationByTimeOfDay('whatsapp'),
    telegram: getVariationByTimeOfDay('telegram'),
    generic: getVariationByTimeOfDay('generic')
  };
};

/**
 * Salva código de quem convidou (para processar depois)
 */
export const saveReferredBy = (code) => {
  if (!code) return;

  try {
    localStorage.setItem('learnfun_referred_by', code);
    console.log('💾 Código do referrer salvo:', code);
  } catch (error) {
    console.error('Erro ao salvar referrer:', error);
  }
};

/**
 * Recupera código de quem convidou
 */
export const getReferredBy = () => {
  try {
    return localStorage.getItem('learnfun_referred_by');
  } catch (error) {
    return null;
  }
};

/**
 * Remove código do referrer (após processar recompensa)
 */
export const clearReferredBy = () => {
  try {
    localStorage.removeItem('learnfun_referred_by');
    console.log('🗑️ Código do referrer removido');
  } catch (error) {
    console.error('Erro ao limpar referrer:', error);
  }
};

/**
 * Verifica se já processou o referral (evita duplicatas)
 */
export const hasProcessedReferral = () => {
  try {
    return localStorage.getItem('learnfun_referral_processed') === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Marca referral como processado
 */
export const markReferralAsProcessed = () => {
  try {
    localStorage.setItem('learnfun_referral_processed', 'true');
    console.log('✅ Referral marcado como processado');
  } catch (error) {
    console.error('Erro ao marcar referral:', error);
  }
};

/**
 * Analytics tracking
 */
export const trackReferralEvent = (eventName, data = {}) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', {
      name: `referral_${eventName}`,
      data
    });
    console.log('📊 Analytics:', eventName, data);
  }
};