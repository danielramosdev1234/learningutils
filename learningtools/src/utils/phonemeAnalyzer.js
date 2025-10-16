// src/utils/phonemeAnalyzer.js

import { convertWordToIPA } from './ipaConverter';

/**
 * Matriz de similaridade fonética
 * Sons similares têm distância menor (0-1)
 * 0 = idêntico, 1 = completamente diferente
 */
const PHONETIC_SIMILARITY = {
  // Plosivas surdas/sonoras (muito similares)
  'p-b': 0.2, 'b-p': 0.2,
  't-d': 0.2, 'd-t': 0.2,
  'k-g': 0.2, 'g-k': 0.2,

  // Fricativas surdas/sonoras
  'f-v': 0.2, 'v-f': 0.2,
  's-z': 0.2, 'z-s': 0.2,
  'θ-ð': 0.2, 'ð-θ': 0.2, // th sounds
  'ʃ-ʒ': 0.2, 'ʒ-ʃ': 0.2, // sh/zh sounds

  // Africadas relacionadas
  'tʃ-dʒ': 0.3, 'dʒ-tʃ': 0.3, // ch/j sounds

  // Nasais (similares entre si)
  'm-n': 0.3, 'n-m': 0.3,
  'n-ŋ': 0.3, 'ŋ-n': 0.3,

  // Líquidas e aproximantes
  'l-r': 0.3, 'r-l': 0.3,
  'ɹ-l': 0.3, 'l-ɹ': 0.3,
  'w-v': 0.4, 'v-w': 0.4,

  // Vogais similares
  'i-ɪ': 0.2, 'ɪ-i': 0.2, // beat/bit
  'u-ʊ': 0.2, 'ʊ-u': 0.2, // boot/book
  'e-ɛ': 0.2, 'ɛ-e': 0.2, // bait/bet
  'o-ɔ': 0.2, 'ɔ-o': 0.2, // boat/bought
  'ə-ʌ': 0.2, 'ʌ-ə': 0.2, // schwa variations

  // Erros comuns de não-nativos
  'θ-t': 0.4, 't-θ': 0.4, // th -> t (comum em espanhol/português)
  'ð-d': 0.4, 'd-ð': 0.4, // th -> d
  'θ-s': 0.5, 's-θ': 0.5, // th -> s
  'ð-z': 0.5, 'z-ð': 0.5, // th -> z
  'v-b': 0.4, 'b-v': 0.4, // v -> b (comum em espanhol)
  'w-v': 0.4, // w -> v (alemão/russo)
  'r-ʁ': 0.5, 'ʁ-r': 0.5, // r gutural vs americano
};

/**
 * Obtém distância entre dois fonemas baseado em similaridade
 */
const getPhoneticDistance = (phone1, phone2) => {
  if (phone1 === phone2) return 0;

  const key = `${phone1}-${phone2}`;
  return PHONETIC_SIMILARITY[key] || 1.0; // Default: completamente diferente
};

/**
 * Normaliza texto removendo pontuação e convertendo para minúsculas
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Distância de Levenshtein PONDERADA para strings IPA
 * Considera similaridade fonética entre sons
 */
const phoneticLevenshtein = (ipa1, ipa2) => {
  // Converte IPA strings em arrays de fonemas
  const phones1 = Array.from(ipa1);
  const phones2 = Array.from(ipa2);

  const len1 = phones1.length;
  const len2 = phones2.length;

  // Matriz de programação dinâmica
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  // Inicializa primeira linha e coluna
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  // Preenche matriz com custos ponderados
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const phone1 = phones1[i - 1];
      const phone2 = phones2[j - 1];

      // Custo de substituição baseado em similaridade fonética
      const substitutionCost = getPhoneticDistance(phone1, phone2);

      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,                    // Inserção
        matrix[j - 1][i] + 1,                    // Deleção
        matrix[j - 1][i - 1] + substitutionCost  // Substituição ponderada
      );
    }
  }

  return matrix[len2][len1];
};

/**
 * Calcula similaridade fonética (0-1) entre duas palavras
 * Usa IPA quando disponível, fallback para texto normal
 */
const calculatePhoneticSimilarity = (word1, word2) => {
  // Tenta converter para IPA
  const ipa1 = convertWordToIPA(word1);
  const ipa2 = convertWordToIPA(word2);

  // Se ambas têm IPA, usa análise fonética
  const useIPA = !ipa1.includes('[') && !ipa2.includes('[');

  if (useIPA) {
    // Remove barras do IPA
    const cleanIPA1 = ipa1.replace(/[\/\[\]]/g, '');
    const cleanIPA2 = ipa2.replace(/[\/\[\]]/g, '');

    const maxLen = Math.max(cleanIPA1.length, cleanIPA2.length);
    if (maxLen === 0) return 1.0;

    const distance = phoneticLevenshtein(cleanIPA1, cleanIPA2);
    return Math.max(0, (maxLen - distance) / maxLen);
  } else {
    // Fallback: Levenshtein normal para palavras sem IPA
    const maxLen = Math.max(word1.length, word2.length);
    if (maxLen === 0) return 1.0;

    const distance = simpleLevenshtein(word1, word2);
    return (maxLen - distance) / maxLen;
  }
};

/**
 * Levenshtein simples (fallback)
 */
const simpleLevenshtein = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[len2][len1];
};

/**
 * Analisa palavra por palavra com análise fonética
 * @param {string} expectedText - Texto esperado
 * @param {string} spokenText - Texto falado pelo usuário
 * @returns {Array} - Array de objetos com análise de cada palavra
 */
export const analyzeWords = (expectedText, spokenText) => {
  const expectedWords = normalizeText(expectedText).split(/\s+/);
  const spokenWords = normalizeText(spokenText).split(/\s+/);

  const analysis = expectedWords.map((expectedWord, index) => {
    const spokenWord = spokenWords[index] || '';

    // Comparação exata
    const isExactMatch = expectedWord === spokenWord;

    // Similaridade fonética
    const phoneticSimilarity = calculatePhoneticSimilarity(expectedWord, spokenWord);

    // Converte para porcentagem
    const confidence = Math.round(phoneticSimilarity * 100);

    // Obtém IPA para ambas as palavras
    const expectedIPA = convertWordToIPA(expectedWord);
    const spokenIPA = spokenWord ? convertWordToIPA(spokenWord) : '';

    // Considera correto se similaridade > 85% OU match exato
    const isCorrect = isExactMatch || phoneticSimilarity >= 0.85;

    return {
      expected: expectedWord,
      spoken: spokenWord,
      expectedIPA,
      spokenIPA,
      isCorrect,
      isExactMatch,
      similarity: phoneticSimilarity,
      confidence,
      position: index
    };
  });

  return analysis;
};

/**
 * Calcula métricas gerais da pronúncia
 * @param {string} expectedText - Texto esperado
 * @param {string} spokenText - Texto falado
 * @returns {Object} - Métricas gerais
 */
export const analyzePronunciation = (expectedText, spokenText) => {
  const wordAnalysis = analyzeWords(expectedText, spokenText);

  const totalWords = wordAnalysis.length;
  const correctWords = wordAnalysis.filter(w => w.isCorrect).length;
  const exactMatches = wordAnalysis.filter(w => w.isExactMatch).length;

  // Confidence médio ponderado
  const averageConfidence = wordAnalysis.reduce((sum, w) => sum + w.confidence, 0) / totalWords;

  // Identifica palavras por nível de confiança
  const problematicWords = wordAnalysis
    .filter(w => w.confidence < 60)
    .map(w => ({
      word: w.expected,
      spoken: w.spoken,
      confidence: w.confidence,
      expectedIPA: w.expectedIPA,
      spokenIPA: w.spokenIPA
    }));

  const goodWords = wordAnalysis
    .filter(w => w.confidence >= 60 && w.confidence < 85)
    .map(w => ({
      word: w.expected,
      confidence: w.confidence
    }));

  const excellentWords = wordAnalysis
    .filter(w => w.confidence >= 85)
    .map(w => ({
      word: w.expected,
      confidence: w.confidence
    }));

  return {
    totalWords,
    correctWords,
    exactMatches,
    accuracy: Math.round((correctWords / totalWords) * 100),
    averageConfidence: Math.round(averageConfidence),
    wordAnalysis,
    problematicWords,
    goodWords,
    excellentWords
  };
};

/**
 * Fonemas problemáticos expandidos com IPA
 */
const PHONEME_CHALLENGES = {
  'θ': { // voiceless th (think)
    graphemes: ['th'],
    name: 'voiceless th',
    commonErrors: ['t', 's', 'f'],
    tip: 'Place tongue between teeth, blow air gently (no voice)',
    examples: ['think', 'three', 'math', 'teeth']
  },
  'ð': { // voiced th (this)
    graphemes: ['th'],
    name: 'voiced th',
    commonErrors: ['d', 'z', 'v'],
    tip: 'Place tongue between teeth, add voice',
    examples: ['this', 'that', 'mother', 'breathe']
  },
  'ɹ': { // r sound
    graphemes: ['r'],
    name: 'American r',
    commonErrors: ['l', 'ʁ'],
    tip: 'Curl tongue back, don\'t touch roof of mouth',
    examples: ['red', 'car', 'three', 'brown']
  },
  'l': {
    graphemes: ['l'],
    name: 'l sound',
    commonErrors: ['r', 'w'],
    tip: 'Touch tip of tongue to ridge behind upper teeth',
    examples: ['light', 'ball', 'please', 'cold']
  },
  'v': {
    graphemes: ['v'],
    name: 'v sound',
    commonErrors: ['b', 'f', 'w'],
    tip: 'Upper teeth touch lower lip, add voice',
    examples: ['very', 'have', 'voice', 'five']
  },
  'w': {
    graphemes: ['w'],
    name: 'w sound',
    commonErrors: ['v', 'u'],
    tip: 'Round lips like whistling, then voice',
    examples: ['water', 'away', 'sweet', 'wonder']
  },
  'ʃ': { // sh
    graphemes: ['sh', 'ti', 'ci'],
    name: 'sh sound',
    commonErrors: ['s', 'tʃ'],
    tip: 'Lips rounded, tongue behind teeth, push air',
    examples: ['she', 'fish', 'nation', 'special']
  },
  'ʒ': { // zh
    graphemes: ['s', 'si', 'ge'],
    name: 'zh sound',
    commonErrors: ['z', 'dʒ', 'ʃ'],
    tip: 'Like "sh" but with voice',
    examples: ['measure', 'vision', 'beige', 'usual']
  },
  'tʃ': { // ch
    graphemes: ['ch', 'tch'],
    name: 'ch sound',
    commonErrors: ['ʃ', 't'],
    tip: 'Start with "t", end with "sh"',
    examples: ['church', 'watch', 'nature', 'future']
  },
  'dʒ': { // j
    graphemes: ['j', 'g', 'dge'],
    name: 'j sound',
    commonErrors: ['tʃ', 'ʒ'],
    tip: 'Start with "d", end with "zh"',
    examples: ['judge', 'magic', 'edge', 'joy']
  }
};

/**
 * Detecta fonemas problemáticos baseado em análise IPA
 * @param {Array} problematicWords - Palavras com baixa confidence
 * @returns {Array} - Dicas específicas
 */
export const getPronunciationTips = (problematicWords) => {
  const tips = [];
  const tipsGiven = new Set();

  problematicWords.forEach(wordData => {
    const { word, expectedIPA, spokenIPA } = wordData;

    // Analisa diferenças no IPA
    if (expectedIPA && !expectedIPA.includes('[')) {
      const cleanExpectedIPA = expectedIPA.replace(/[\/\[\]]/g, '');
      const cleanSpokenIPA = spokenIPA ? spokenIPA.replace(/[\/\[\]]/g, '') : '';

      // Detecta quais fonemas estão faltando ou errados
      const expectedPhonemes = Array.from(cleanExpectedIPA);
      const spokenPhonemes = Array.from(cleanSpokenIPA);

      expectedPhonemes.forEach((phoneme, idx) => {
        const spokenPhoneme = spokenPhonemes[idx];

        // Se o fonema é diferente E está na lista de desafios
        if (phoneme !== spokenPhoneme && PHONEME_CHALLENGES[phoneme]) {
          const key = `${phoneme}-${word}`;

          if (!tipsGiven.has(phoneme)) {
            const challenge = PHONEME_CHALLENGES[phoneme];

            tips.push({
              phoneme,
              name: challenge.name,
              tip: challenge.tip,
              example: word,
              expectedSound: phoneme,
              detectedSound: spokenPhoneme || '(missing)',
              examples: challenge.examples
            });

            tipsGiven.add(phoneme);
          }
        }
      });
    }

    // Fallback: busca por padrões de texto se IPA não disponível
    Object.keys(PHONEME_CHALLENGES).forEach(phoneme => {
      const challenge = PHONEME_CHALLENGES[phoneme];

      challenge.graphemes.forEach(grapheme => {
        if (word.includes(grapheme) && !tipsGiven.has(phoneme)) {
          tips.push({
            phoneme,
            name: challenge.name,
            tip: challenge.tip,
            example: word,
            examples: challenge.examples
          });
          tipsGiven.add(phoneme);
        }
      });
    });
  });

  return tips;
};

/**
 * Gera feedback textual baseado na performance
 * @param {number} accuracy - Porcentagem de acurácia (0-100)
 * @returns {Object} - Feedback com mensagem e emoji
 */
export const generateFeedback = (accuracy) => {
  if (accuracy >= 90) {
    return {
      level: 'excellent',
      message: 'Outstanding! Your pronunciation is excellent!',
      emoji: '🌟',
      color: 'green'
    };
  } else if (accuracy >= 80) {
    return {
      level: 'great',
      message: 'Great job! Keep up the good work!',
      emoji: '🎉',
      color: 'green'
    };
  } else if (accuracy >= 70) {
    return {
      level: 'good',
      message: 'Good effort! A bit more practice will help!',
      emoji: '👍',
      color: 'blue'
    };
  } else if (accuracy >= 60) {
    return {
      level: 'fair',
      message: 'Fair attempt! Focus on the highlighted words.',
      emoji: '💪',
      color: 'yellow'
    };
  } else {
    return {
      level: 'needs-practice',
      message: 'Keep practicing! Focus on listening carefully.',
      emoji: '🎯',
      color: 'orange'
    };
  }
};