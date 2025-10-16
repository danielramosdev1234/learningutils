// src/utils/phonemeAnalyzer.js

/**
 * Normaliza texto removendo pontuação e convertendo para minúsculas
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .trim();
};

/**
 * Calcula a distância de Levenshtein entre duas strings
 * Usado para medir similaridade entre palavras
 */
const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

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
 * Calcula a similaridade entre duas strings (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Analisa palavra por palavra e retorna detalhes de cada uma
 * @param {string} expectedText - Texto esperado
 * @param {string} spokenText - Texto falado pelo usuário
 * @returns {Array} - Array de objetos com análise de cada palavra
 */
export const analyzeWords = (expectedText, spokenText) => {
  const expectedWords = normalizeText(expectedText).split(/\s+/);
  const spokenWords = normalizeText(spokenText).split(/\s+/);

  const analysis = expectedWords.map((expectedWord, index) => {
    const spokenWord = spokenWords[index] || '';
    const isCorrect = expectedWord === spokenWord;
    const similarity = calculateSimilarity(expectedWord, spokenWord);

    // Converte similaridade para confiança percentual
    const confidence = Math.round(similarity * 100);

    return {
      expected: expectedWord,
      spoken: spokenWord,
      isCorrect,
      similarity,
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
  const averageConfidence = wordAnalysis.reduce((sum, w) => sum + w.confidence, 0) / totalWords;

  // Identifica palavras problemáticas (< 60%)
  const problematicWords = wordAnalysis
    .filter(w => w.confidence < 60)
    .map(w => w.expected);

  // Identifica palavras boas (60-80%)
  const goodWords = wordAnalysis
    .filter(w => w.confidence >= 60 && w.confidence < 80)
    .map(w => w.expected);

  // Identifica palavras excelentes (>= 80%)
  const excellentWords = wordAnalysis
    .filter(w => w.confidence >= 80)
    .map(w => w.expected);

  return {
    totalWords,
    correctWords,
    accuracy: Math.round((correctWords / totalWords) * 100),
    averageConfidence: Math.round(averageConfidence),
    wordAnalysis,
    problematicWords,
    goodWords,
    excellentWords
  };
};

/**
 * Identifica fonemas problemáticos comuns
 * Baseado em erros típicos de aprendizes de inglês
 */
const COMMON_PHONEME_ISSUES = {
  'th': {
    sounds: ['θ', 'ð'],
    commonErrors: ['t', 'd', 's', 'z'],
    tip: 'Put your tongue between your teeth'
  },
  'r': {
    sounds: ['r', 'ɹ'],
    commonErrors: ['l'],
    tip: 'Curl your tongue back slightly'
  },
  'l': {
    sounds: ['l'],
    commonErrors: ['r', 'w'],
    tip: 'Touch the roof of your mouth with tongue tip'
  },
  'v': {
    sounds: ['v'],
    commonErrors: ['b', 'f'],
    tip: 'Touch upper teeth to lower lip'
  },
  'w': {
    sounds: ['w'],
    commonErrors: ['v', 'u'],
    tip: 'Round your lips'
  },
  'sh': {
    sounds: ['ʃ'],
    commonErrors: ['s', 'ch'],
    tip: 'Position tongue behind teeth, push air'
  },
  'ch': {
    sounds: ['tʃ'],
    commonErrors: ['sh', 's'],
    tip: 'Combine "t" and "sh" sounds'
  },
  'j': {
    sounds: ['dʒ'],
    commonErrors: ['ch', 'y'],
    tip: 'Combine "d" and "zh" sounds'
  }
};

/**
 * Sugere dicas baseadas em palavras problemáticas
 * @param {Array} problematicWords - Lista de palavras com baixa confiança
 * @returns {Array} - Lista de dicas
 */
export const getPronunciationTips = (problematicWords) => {
  const tips = [];
  const tipsGiven = new Set();

  problematicWords.forEach(word => {
    // Verifica se a palavra contém fonemas problemáticos
    Object.keys(COMMON_PHONEME_ISSUES).forEach(phoneme => {
      if (word.includes(phoneme) && !tipsGiven.has(phoneme)) {
        const issue = COMMON_PHONEME_ISSUES[phoneme];
        tips.push({
          phoneme,
          sound: issue.sounds.join(' or '),
          tip: issue.tip,
          example: word
        });
        tipsGiven.add(phoneme);
      }
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