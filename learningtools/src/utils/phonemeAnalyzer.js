// src/utils/phonemeAnalyzer.js

import { convertWordToIPA, convertTextToIPA } from './ipaConverter';

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
  const clean1 = word1.trim().toLowerCase();
  const clean2 = word2.trim().toLowerCase();

  // Se são iguais, retorna 1.0 imediatamente
  if (clean1 === clean2) {
    console.log(`      💯 "${clean1}" === "${clean2}" → 100%`);
    return 1.0;
  }

  // Separa em palavras se houver espaço
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);

  // Se ambas são palavra única, tenta IPA
  if (words1.length === 1 && words2.length === 1) {
    const ipa1 = convertWordToIPA(clean1);
    const ipa2 = convertWordToIPA(clean2);

    console.log(`      🔬 IPA: "${clean1}" → ${ipa1}`);
    console.log(`      🔬 IPA: "${clean2}" → ${ipa2}`);

    const useIPA = !ipa1.includes('[') && !ipa2.includes('[');

    if (useIPA) {
      const cleanIPA1 = ipa1.replace(/[\/\[\]]/g, '');
      const cleanIPA2 = ipa2.replace(/[\/\[\]]/g, '');

      const maxLen = Math.max(cleanIPA1.length, cleanIPA2.length);
      if (maxLen === 0) return 1.0;

      const distance = phoneticLevenshtein(cleanIPA1, cleanIPA2);
      const similarity = Math.max(0, (maxLen - distance) / maxLen);

      console.log(`      ✨ IPA similarity: ${Math.round(similarity * 100)}%`);
      return similarity;
    } else {
      console.log(`      ⚠️ IPA não disponível, usando fallback`);
    }
  }

  // ✅ Fallback para múltiplas palavras - converte cada palavra individualmente
  console.log(`      🔄 Fallback multi-word: "${clean1}" vs "${clean2}"`);

  const ipa1Parts = words1.map(w => {
    const wordIPA = convertWordToIPA(w);
    return wordIPA.includes('[') ? w : wordIPA.replace(/[\/\[\]]/g, '');
  });
  const ipa2Parts = words2.map(w => {
    const wordIPA = convertWordToIPA(w);
    return wordIPA.includes('[') ? w : wordIPA.replace(/[\/\[\]]/g, '');
  });

  const cleanIPA1 = ipa1Parts.join('');
  const cleanIPA2 = ipa2Parts.join('');

  console.log(`      🔬 IPA parts: "${words1.join(' ')}" → ${cleanIPA1}`);
  console.log(`      🔬 IPA parts: "${words2.join(' ')}" → ${cleanIPA2}`);

  const maxLen = Math.max(cleanIPA1.length, cleanIPA2.length);
  if (maxLen === 0) return 1.0;

  const distance = phoneticLevenshtein(cleanIPA1, cleanIPA2);
  const similarity = Math.max(0, (maxLen - distance) / maxLen);

  console.log(`      ✨ Multi-word IPA similarity: ${Math.round(similarity * 100)}%`);
  return similarity;
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
 * 🆕 Alinha palavras esperadas com palavras faladas
 * Permite que múltiplas palavras faladas correspondam a uma palavra esperada
 */
const alignWords = (expectedWords, spokenWords) => {
  console.log('🎯 STARTING DYNAMIC ALIGNMENT');
  console.log('Expected:', expectedWords);
  console.log('Spoken:', spokenWords);

  const m = expectedWords.length;
  const n = spokenWords.length;

  // Matriz de custos (menor custo = melhor alinhamento)
  const cost = Array(m + 1).fill(null).map(() => Array(n + 1).fill(Infinity));
  const path = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));

  // Caso base
  cost[0][0] = 0;

  // Inicializa bordas (palavras omitidas/extras)
  for (let i = 1; i <= m; i++) {
    cost[i][0] = cost[i - 1][0] + 1; // Palavra esperada omitida
    path[i][0] = { type: 'skip', i: i - 1, j: -1 };
  }

  for (let j = 1; j <= n; j++) {
    cost[0][j] = cost[0][j - 1] + 1; // Palavra falada extra
    path[0][j] = { type: 'extra', i: -1, j: j - 1 };
  }

  // Preenche matriz com alinhamentos possíveis
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const expectedWord = expectedWords[i - 1];
      const spokenWord = spokenWords[j - 1];

      // Opção 1: Match 1:1
      const sim1to1 = calculatePhoneticSimilarity(expectedWord, spokenWord);
      const cost1to1 = cost[i - 1][j - 1] + (1 - sim1to1); // Menor similaridade = maior custo

      // Opção 2: Match 1:2 (se possível)
      let cost1to2 = Infinity;
      if (j >= 2) {
        const spokenPair = `${spokenWords[j - 2]} ${spokenWords[j - 1]}`;
        const sim1to2 = calculatePhoneticSimilarity(expectedWord, spokenPair);
        cost1to2 = cost[i - 1][j - 2] + (1 - sim1to2);
      }

      // Opção 3: Palavra esperada omitida
      const costSkip = cost[i - 1][j] + 1;

      // Opção 4: Palavra falada extra
      const costExtra = cost[i][j - 1] + 1;

      // Escolhe o menor custo
      const minCost = Math.min(cost1to1, cost1to2, costSkip, costExtra);

      cost[i][j] = minCost;

      if (minCost === cost1to2) {
        path[i][j] = { type: '1:2', i: i - 1, j: j - 2, similarity: 1 - (cost1to2 - cost[i - 1][j - 2]) };
      } else if (minCost === cost1to1) {
        path[i][j] = { type: '1:1', i: i - 1, j: j - 1, similarity: sim1to1 };
      } else if (minCost === costSkip) {
        path[i][j] = { type: 'skip', i: i - 1, j };
      } else {
        path[i][j] = { type: 'extra', i, j: j - 1 };
      }
    }
  }

  // Reconstrói alinhamento seguindo o caminho
  const alignments = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    const step = path[i][j];

    if (step.type === '1:1') {
      alignments.unshift({
        expected: expectedWords[step.i],
        spoken: spokenWords[step.j],
        similarity: step.similarity,
        matchType: '1:1'
      });
      i = step.i;
      j = step.j;
    } else if (step.type === '1:2') {
      alignments.unshift({
        expected: expectedWords[step.i],
        spoken: `${spokenWords[step.j]} ${spokenWords[step.j + 1]}`,
        similarity: step.similarity,
        matchType: '1:2'
      });
      i = step.i;
      j = step.j;
    } else if (step.type === 'skip') {
      alignments.unshift({
        expected: expectedWords[step.i],
        spoken: '',
        similarity: 0,
        matchType: 'missing'
      });
      i = step.i;
    } else if (step.type === 'extra') {
      // Palavra extra não corresponde a nenhuma esperada
      // Pode ser ignorada ou marcada
      j = step.j;
    }
  }

  console.log('🏁 DYNAMIC ALIGNMENT COMPLETE');
  console.log('Resultado:', alignments);

  return alignments;
};
export const analyzeWords = (expectedText, spokenText) => {
  const expectedWords = normalizeText(expectedText).split(/\s+/);
  const spokenWords = normalizeText(spokenText).split(/\s+/);

  // 🔄 USA ALINHAMENTO
  const alignments = alignWords(expectedWords, spokenWords);

  const analysis = alignments.map((alignment, index) => {
    const { expected, spoken, similarity: alignedSimilarity } = alignment;

    // ✅ CRUCIAL: Usa a similaridade JÁ CALCULADA no alinhamento
    const finalSimilarity = alignedSimilarity !== undefined
      ? alignedSimilarity
      : calculatePhoneticSimilarity(expected, spoken);

    const isExactMatch = expected.toLowerCase() === spoken.toLowerCase();
    const confidence = Math.round(finalSimilarity * 100);
    const isCorrect = isExactMatch || finalSimilarity >= 0.75;

    const expectedIPA = convertWordToIPA(expected);
    const spokenIPA = spoken ? convertWordToIPA(spoken) : '';

    return {
      expected,
      spoken,
      expectedIPA,
      spokenIPA,
      isCorrect,
      isExactMatch,
      similarity: finalSimilarity,
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
    tip: 'Coloque a língua entre os dentes, sopre o ar suavemente sem voz',
    examples: ['think', 'three', 'math', 'teeth']
  },
  'ð': { // voiced th (this)
    graphemes: ['th'],
    name: 'voiced th',
    commonErrors: ['d', 'z', 'v'],
    tip: 'Coloque a língua entre os dentes, adicione voz',
    examples: ['this', 'that', 'mother', 'breathe']
  },
  'ɹ': { // r sound
    graphemes: ['r'],
    name: 'American R',
    commonErrors: ['l', 'ʁ'],
    tip: 'Curve a língua para trás, não toque o céu da boca',
    examples: ['red', 'car', 'three', 'brown']
  },
  'l': {
    graphemes: ['l'],
    name: 'L sound',
    commonErrors: ['r', 'w'],
    tip: 'Toque a ponta da língua na crista atrás dos dentes superiores',
    examples: ['light', 'ball', 'please', 'cold']
  },
  'v': {
    graphemes: ['v'],
    name: 'v sound',
    commonErrors: ['b', 'f', 'w'],
    tip: 'Dentes superiores tocam o lábio inferior, adicione voz',
    examples: ['very', 'have', 'voice', 'five']
  },
  'w': {
    graphemes: ['w'],
    name: 'w sound',
    commonErrors: ['v', 'u'],
    tip: 'Arredonde os lábios como para assobiar, depois adicione voz',
    examples: ['water', 'away', 'sweet', 'wonder']
  },
  'ʃ': { // sh
    graphemes: ['sh', 'ti', 'ci'],
    name: 'sh sound',
    commonErrors: ['s', 'tʃ'],
    tip: 'Lábios arredondados, língua atrás dos dentes, empurre o ar',
    examples: ['she', 'fish', 'nation', 'special']
  },
  'ʒ': { // zh
    graphemes: ['s', 'si', 'ge'],
    name: 'zh sound',
    commonErrors: ['z', 'dʒ', 'ʃ'],
    tip: 'Como "sh" mas com voz',
    examples: ['measure', 'vision', 'beige', 'usual']
  },
  'tʃ': { // ch
    graphemes: ['ch', 'tch'],
    name: 'ch sound',
    commonErrors: ['ʃ', 't'],
    tip: 'Comece com "t", termine com "sh"',
    examples: ['church', 'watch', 'nature', 'future']
  },
  'dʒ': { // j
    graphemes: ['j', 'g', 'dge'],
    name: 'J sound',
    commonErrors: ['tʃ', 'ʒ'],
    tip: 'Comece com "d", termine com "zh"',
    examples: ['judge', 'magic', 'edge', 'joy']
  },
  // Vogais problemáticas para brasileiros
  'æ': { // cat, bad
    graphemes: ['a'],
    name: 'A sound (cat)',
    commonErrors: ['ɛ', 'a', 'e'],
    tip: 'Abra bem a boca, língua baixa, som entre "a" e "é". Não é "é" nem "a" puro',
    examples: ['cat', 'bad', 'hat', 'man', 'apple']
  },
  'ʌ': { // cup, but
    graphemes: ['u', 'o'],
    name: 'U sound (cup)',
    commonErrors: ['a', 'o', 'u'],
    tip: 'Boca meio aberta, língua no centro. Não é "a" nem "ó". Parece um "a" mais fechado',
    examples: ['cup', 'but', 'love', 'sun', 'come']
  },
  'ə': { // schwa - the, about
    graphemes: ['a', 'e', 'i', 'o', 'u'],
    name: 'Schwa sound',
    commonErrors: ['a', 'e', 'i'],
    tip: 'Som neutro, muito curto e relaxado. Não pronuncie como "e" ou "a". É o som mais comum em inglês',
    examples: ['the', 'about', 'ago', 'sofa', 'banana']
  },
  'ɪ': { // bit, sit
    graphemes: ['i'],
    name: 'I sound (bit)',
    commonErrors: ['i', 'e'],
    tip: 'Mais curto e relaxado que o "i" português. Boca menos aberta. Não é "i" longo',
    examples: ['bit', 'sit', 'ship', 'big', 'fish']
  },
  'i': { // beat, seat
    graphemes: ['ee', 'ea', 'ie'],
    name: 'EE sound (beat)',
    commonErrors: ['ɪ', 'i'],
    tip: 'Som longo e tenso. Estique os lábios como um sorriso. Mais longo que o "i" português',
    examples: ['beat', 'seat', 'see', 'tree', 'meet']
  },
  'ɛ': { // bet, set
    graphemes: ['e'],
    name: 'E sound (bet)',
    commonErrors: ['e', 'ɪ'],
    tip: 'Mais aberto que o "e" português. Boca mais aberta, língua baixa',
    examples: ['bet', 'set', 'red', 'bed', 'head']
  },
  'e': { // bait, say
    graphemes: ['ay', 'ai', 'ea'],
    name: 'AY sound (bait)',
    commonErrors: ['ɛ', 'e'],
    tip: 'Ditongo: comece com "e" e termine com "i" suave. Não é "é" puro',
    examples: ['bait', 'say', 'day', 'way', 'play']
  },
  'ʊ': { // book, look
    graphemes: ['oo', 'u'],
    name: 'U sound (book)',
    commonErrors: ['u', 'o'],
    tip: 'Mais curto e relaxado que o "u" português. Lábios arredondados mas menos tensos',
    examples: ['book', 'look', 'good', 'put', 'foot']
  },
  'u': { // boot, suit
    graphemes: ['oo', 'ue', 'ui'],
    name: 'OO sound (boot)',
    commonErrors: ['ʊ', 'u'],
    tip: 'Som longo e tenso. Lábios bem arredondados e projetados para frente',
    examples: ['boot', 'suit', 'moon', 'food', 'blue']
  },
  'ɔ': { // bought, caught
    graphemes: ['aw', 'au', 'o'],
    name: 'AW sound (bought)',
    commonErrors: ['o', 'a'],
    tip: 'Boca bem aberta, lábios arredondados. Mais aberto que o "ó" português',
    examples: ['bought', 'caught', 'law', 'saw', 'dog']
  },
  'ɑ': { // hot, not
    graphemes: ['o', 'a'],
    name: 'AH sound (hot)',
    commonErrors: ['o', 'a', 'ɔ'],
    tip: 'Boca bem aberta, língua baixa e para trás. Não é "ó" nem "a"',
    examples: ['hot', 'not', 'stop', 'box', 'clock']
  },
  // Consoantes problemáticas
  'h': { // house, help
    graphemes: ['h'],
    name: 'H sound',
    commonErrors: ['r', ''],
    tip: 'Sopro de ar suave, sem vibração. Não é "r" nem deve ser omitido. Como soprar no espelho',
    examples: ['house', 'help', 'hello', 'happy', 'home']
  },
  'z': { // zoo, size
    graphemes: ['z', 's'],
    name: 'Z sound',
    commonErrors: ['s', 'z'],
    tip: 'Como "s" mas com voz (vibração nas cordas vocais). Coloque a mão na garganta e sinta a vibração',
    examples: ['zoo', 'size', 'easy', 'lazy', 'buzz']
  },
  's': { // see, sit
    graphemes: ['s', 'c'],
    name: 'S sound',
    commonErrors: ['z', 'ʃ'],
    tip: 'Ar passando entre os dentes, sem voz. Não vibre as cordas vocais',
    examples: ['see', 'sit', 'sun', 'bus', 'miss']
  },
  'ŋ': { // sing, ring
    graphemes: ['ng'],
    name: 'NG sound',
    commonErrors: ['n', 'g'],
    tip: 'Língua no fundo da boca, ar pelo nariz. Não adicione "g" no final. É um som nasal',
    examples: ['sing', 'ring', 'song', 'long', 'thing']
  },
  'n': { // no, not
    graphemes: ['n'],
    name: 'N sound',
    commonErrors: ['ŋ', 'm'],
    tip: 'Língua toca os dentes superiores, ar pelo nariz. Diferente de "ng"',
    examples: ['no', 'not', 'sun', 'man', 'ten']
  },
  'm': { // me, my
    graphemes: ['m'],
    name: 'M sound',
    commonErrors: ['n', 'b'],
    tip: 'Lábios fechados, ar pelo nariz. Mantenha os lábios fechados',
    examples: ['me', 'my', 'man', 'time', 'come']
  },
  'b': { // be, big
    graphemes: ['b'],
    name: 'B sound',
    commonErrors: ['v', 'p'],
    tip: 'Lábios fechados, depois solte com explosão. Diferente de "v"',
    examples: ['be', 'big', 'boy', 'baby', 'book']
  },
  'p': { // pen, put
    graphemes: ['p'],
    name: 'P sound',
    commonErrors: ['b', 'f'],
    tip: 'Lábios fechados, depois solte com explosão sem voz. Diferente de "b"',
    examples: ['pen', 'put', 'play', 'happy', 'stop']
  },
  'd': { // do, day
    graphemes: ['d'],
    name: 'D sound',
    commonErrors: ['t', 'ð'],
    tip: 'Língua toca os dentes superiores, depois solte com voz. Diferente de "t"',
    examples: ['do', 'day', 'dog', 'bad', 'red']
  },
  't': { // to, time
    graphemes: ['t'],
    name: 'T sound',
    commonErrors: ['d', 'θ'],
    tip: 'Língua toca os dentes superiores, depois solte sem voz. Diferente de "d"',
    examples: ['to', 'time', 'top', 'cat', 'sit']
  },
  'g': { // go, get
    graphemes: ['g'],
    name: 'G sound',
    commonErrors: ['k', 'dʒ'],
    tip: 'Parte de trás da língua toca o céu da boca, depois solte com voz. Diferente de "k"',
    examples: ['go', 'get', 'big', 'dog', 'game']
  },
  'k': { // cat, key
    graphemes: ['k', 'c'],
    name: 'K sound',
    commonErrors: ['g', 't'],
    tip: 'Parte de trás da língua toca o céu da boca, depois solte sem voz. Diferente de "g"',
    examples: ['cat', 'key', 'book', 'cake', 'think']
  },
  'f': { // for, if
    graphemes: ['f', 'ph'],
    name: 'F sound',
    commonErrors: ['v', 'p'],
    tip: 'Dentes superiores tocam o lábio inferior, empurre o ar sem voz',
    examples: ['for', 'if', 'fish', 'off', 'life']
  },
  'j': { // yes, you
    graphemes: ['y'],
    name: 'Y sound',
    commonErrors: ['i', 'dʒ'],
    tip: 'Língua no centro, lábios levemente arredondados. Como começar a dizer "i" mas com som de consoante',
    examples: ['yes', 'you', 'year', 'yellow', 'young']
  }
};

/**
 * Alinha fonemas usando similaridade fonética
 * Retorna array de objetos com fonemas alinhados
 */
const phoneticLevenshteinAlignment = (phones1, phones2) => {
  const len1 = phones1.length;
  const len2 = phones2.length;
  
  // Matriz de programação dinâmica
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill({ cost: Infinity, path: null }));
  
  // Inicializa primeira linha e coluna
  matrix[0][0] = { cost: 0, path: null };
  for (let i = 1; i <= len1; i++) {
    matrix[0][i] = { cost: i, path: { type: 'delete', i: i - 1, j: 0 } };
  }
  for (let j = 1; j <= len2; j++) {
    matrix[j][0] = { cost: j, path: { type: 'insert', i: 0, j: j - 1 } };
  }
  
  // Preenche matriz
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const phone1 = phones1[i - 1];
      const phone2 = phones2[j - 1];
      
      const substitutionCost = getPhoneticDistance(phone1, phone2);
      const matchCost = matrix[j - 1][i - 1].cost + substitutionCost;
      const deleteCost = matrix[j][i - 1].cost + 1;
      const insertCost = matrix[j - 1][i].cost + 1;
      
      const minCost = Math.min(matchCost, deleteCost, insertCost);
      
      let path = null;
      if (minCost === matchCost) {
        path = { type: 'match', i: i - 1, j: j - 1 };
      } else if (minCost === deleteCost) {
        path = { type: 'delete', i: i - 1, j };
      } else {
        path = { type: 'insert', i, j: j - 1 };
      }
      
      matrix[j][i] = { cost: minCost, path };
    }
  }
  
  // Reconstrói alinhamento
  const alignment = [];
  let i = len1, j = len2;
  
  while (i > 0 || j > 0) {
    const { path } = matrix[j][i];
    
    if (!path) break;
    
    if (path.type === 'match') {
      alignment.unshift({
        expectedPhoneme: phones1[path.i],
        spokenPhoneme: phones2[path.j],
        position: path.i
      });
      i = path.i;
      j = path.j;
    } else if (path.type === 'delete') {
      alignment.unshift({
        expectedPhoneme: phones1[path.i],
        spokenPhoneme: null,
        position: path.i
      });
      i = path.i;
    } else if (path.type === 'insert') {
      alignment.unshift({
        expectedPhoneme: null,
        spokenPhoneme: phones2[path.j],
        position: i
      });
      j = path.j;
    }
  }
  
  return alignment;
};

/**
 * Detecta fonemas problemáticos baseado em análise IPA da frase completa
 * @param {Array} problematicWords - Palavras com baixa confidence
 * @param {string} expectedText - Texto esperado completo (opcional, para análise de frase)
 * @param {string} spokenText - Texto falado completo (opcional, para análise de frase)
 * @returns {Array} - Dicas específicas
 */
export const getPronunciationTips = (problematicWords, expectedText = null, spokenText = null) => {
  const tips = [];
  const tipsGiven = new Set();

  // Se temos a frase completa, usa o IPA da frase completa para análise mais precisa
  if (expectedText && spokenText) {
    const expectedFullIPA = convertTextToIPA(expectedText);
    const spokenFullIPA = convertTextToIPA(spokenText);

    // Remove espaços e formatação do IPA
    const cleanExpectedIPA = expectedFullIPA.replace(/[\/\[\]\s]/g, '');
    const cleanSpokenIPA = spokenFullIPA.replace(/[\/\[\]\s]/g, '');

    // Verifica se ambos os IPAs são válidos (não contêm palavras não encontradas)
    if (!cleanExpectedIPA.includes('[') && !cleanSpokenIPA.includes('[')) {
      // Analisa fonema por fonema na frase completa usando alinhamento fonético
      const expectedPhonemes = Array.from(cleanExpectedIPA);
      const spokenPhonemes = Array.from(cleanSpokenIPA);

      // Usa alinhamento fonético ponderado para comparar fonemas correspondentes
      const alignment = phoneticLevenshteinAlignment(expectedPhonemes, spokenPhonemes);
      
      // Analisa os fonemas alinhados
      alignment.forEach(({ expectedPhoneme, spokenPhoneme, position }) => {
        // Se o fonema esperado é diferente do falado E está na lista de desafios
        if (expectedPhoneme && expectedPhoneme !== spokenPhoneme && PHONEME_CHALLENGES[expectedPhoneme]) {
          if (!tipsGiven.has(expectedPhoneme)) {
            const challenge = PHONEME_CHALLENGES[expectedPhoneme];
            
            // Encontra a palavra que contém este fonema para usar como exemplo
            const exampleWord = problematicWords.find(w => {
              const wordIPA = w.expectedIPA?.replace(/[\/\[\]]/g, '') || '';
              return wordIPA && wordIPA.includes(expectedPhoneme);
            })?.word || problematicWords[0]?.word || '';

            tips.push({
              phoneme: expectedPhoneme,
              name: challenge.name,
              tip: challenge.tip,
              example: exampleWord,
              expectedSound: expectedPhoneme,
              detectedSound: spokenPhoneme || '(missing)',
              examples: challenge.examples
            });

            tipsGiven.add(expectedPhoneme);
          }
        }
      });
    }
  }

  // Fallback: análise palavra por palavra (mantido para compatibilidade)
  if (tips.length === 0) {
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
    });
  }

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