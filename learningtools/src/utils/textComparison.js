// ========================================
// NUMBER WORDS TO NUMERIC
// ========================================
const NUMBER_WORDS = {
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
  'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
  'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
  'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
  'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000'
};

// ========================================
// TECH TERMS MAPPING (variações comuns do reconhecimento de voz)
// ========================================
const TECH_TERMS_MAP = {
  // Databases
  'postgresql': 'postgresql',
  'postgres ql': 'postgresql',
  'postgres': 'postgresql',
  'postgres sequel': 'postgresql',
  'postgresql database': 'postgresql',
  
  'mongodb': 'mongodb',
  'mongo db': 'mongodb',
  'mongo': 'mongodb',
  'mongo database': 'mongodb',
  
  'mysql': 'mysql',
  'my sql': 'mysql',
  'my sequel': 'mysql',
  
  'redis': 'redis',
  'reddis': 'redis',
  'red is': 'redis',
  
  // Frameworks & Libraries
  'angular': 'angular',
  'angular js': 'angular',
  'angularjs': 'angular',
  
  'react': 'react',
  'react js': 'react',
  'reactjs': 'react',
  
  'vue': 'vue',
  'vue js': 'vue',
  'vuejs': 'vue',
  
  'node js': 'nodejs',
  'nodejs': 'nodejs',
  'node': 'nodejs',
  'node dot js': 'nodejs',
  'node point js': 'nodejs',
  'node.js': 'nodejs',
  'node dot j s': 'nodejs',
  
  'express': 'express',
  'express js': 'express',
  'expressjs': 'express',
  
  // APIs & Protocols
  'apis': 'apis',
  'api': 'apis',
  'a p i': 'apis',
  'a p i s': 'apis',
  'api s': 'apis',
  
  'rest': 'rest',
  'rest api': 'rest',
  'restful': 'rest',
  
  'graphql': 'graphql',
  'graph ql': 'graphql',
  'graph q l': 'graphql',
  
  // Cloud & DevOps
  'aws': 'aws',
  'a w s': 'aws',
  'amazon web services': 'aws',
  
  'docker': 'docker',
  'docker container': 'docker',
  
  'kubernetes': 'kubernetes',
  'k eight s': 'kubernetes',
  'kube': 'kubernetes',
  
  // Languages
  'javascript': 'javascript',
  'java script': 'javascript',
  'js': 'javascript',
  
  'typescript': 'typescript',
  'type script': 'typescript',
  'ts': 'typescript',
  
  'python': 'python',
  'python three': 'python',
  'python 3': 'python',
  
  'java': 'java',
  'java language': 'java',
  
  // Tools & Others
  'git': 'git',
  'git hub': 'github',
  'github': 'github',
  
  'html': 'html',
  'h t m l': 'html',
  
  'css': 'css',
  'c s s': 'css',
  
  'json': 'json',
  'j s o n': 'json',
  
  'xml': 'xml',
  'x m l': 'xml',
  
  'http': 'http',
  'h t t p': 'http',
  
  'https': 'https',
  'h t t p s': 'https',
  
  'url': 'url',
  'u r l': 'url',
  
  'ui': 'ui',
  'u i': 'ui',
  'user interface': 'ui',
  
  'ux': 'ux',
  'u x': 'ux',
  'user experience': 'ux',
  
  'sql': 'sql',
  's q l': 'sql',
  'sequel': 'sql',
  
  'nosql': 'nosql',
  'no sql': 'nosql',
  'no sequel': 'nosql',
};

const CONTRACTION_MAP = {
  // ========================================
  // NEGATIVE CONTRACTIONS (todas as formas)
  // ========================================

  // CAN
  "can't": "cannot",
  "cant": "cannot",
  "cannot": "cannot",
  "can not": "cannot",

  // WILL
  "won't": "will not",
  "wont": "will not",
  "will not": "will not",
  "willnot": "will not",

  // DO
  "don't": "do not",
  "dont": "do not",
  "do not": "do not",
  "donot": "do not",

  "doesn't": "does not",
  "doesnt": "does not",
  "does not": "does not",
  "doesnot": "does not",

  "didn't": "did not",
  "didnt": "did not",
  "did not": "did not",
  "didnot": "did not",

  // BE
  "isn't": "is not",
  "isnt": "is not",
  "is not": "is not",
  "isnot": "is not",

  "aren't": "are not",
  "arent": "are not",
  "are not": "are not",
  "arenot": "are not",

  "wasn't": "was not",
  "wasnt": "was not",
  "was not": "was not",
  "wasnot": "was not",

  "weren't": "were not",
  "werent": "were not",
  "were not": "were not",
  "werenot": "were not",

  // HAVE
  "haven't": "have not",
  "havent": "have not",
  "have not": "have not",
  "havenot": "have not",

  "hasn't": "has not",
  "hasnt": "has not",
  "has not": "has not",
  "hasnot": "has not",

  "hadn't": "had not",
  "hadnt": "had not",
  "had not": "had not",
  "hadnot": "had not",

  // MODALS
  "wouldn't": "would not",
  "wouldnt": "would not",
  "would not": "would not",
  "wouldnot": "would not",

  "shouldn't": "should not",
  "shouldnt": "should not",
  "should not": "should not",
  "shouldnot": "should not",

  "couldn't": "could not",
  "couldnt": "could not",
  "could not": "could not",
  "couldnot": "could not",

  "mightn't": "might not",
  "mightnt": "might not",
  "might not": "might not",
  "mightnot": "might not",

  "mustn't": "must not",
  "mustnt": "must not",
  "must not": "must not",
  "mustnot": "must not",

  "needn't": "need not",
  "neednt": "need not",
  "need not": "need not",
  "neednot": "need not",

  "shan't": "shall not",
  "shant": "shall not",
  "shall not": "shall not",
  "shallnot": "shall not",

  "oughtn't": "ought not",
  "oughtnt": "ought not",
  "ought not": "ought not",
  "oughtnot": "ought not",

  "mayn't": "may not",
  "maynt": "may not",
  "may not": "may not",
  "maynot": "may not",

  // ========================================
  // POSITIVE CONTRACTIONS
  // ========================================

  // I
  "i'm": "i am",
  "im": "i am",

  "i've": "i have",
  "ive": "i have",

  "i'll": "i will",
  "ill": "i will",

  "i'd": "i would",
  "id": "i would",

  // YOU
  "you're": "you are",
  "youre": "you are",

  "you've": "you have",
  "youve": "you have",

  "you'll": "you will",
  "youll": "you will",

  "you'd": "you would",
  "youd": "you would",

  // HE
  "he's": "he is", // or "he has" - contexto necessário
  "hes": "he is",

  "he'll": "he will",
  "hell": "he will",

  "he'd": "he would", // or "he had"
  "hed": "he would",

  // SHE
  "she's": "she is", // or "she has"
  "shes": "she is",

  "she'll": "she will",
  "shell": "she will",

  "she'd": "she would", // or "she had"
  "shed": "she would",

  // IT
  "it's": "it is", // or "it has"
  "its": "it is", // CUIDADO: "its" (possessive)

  "it'll": "it will",
  "itll": "it will",

  "it'd": "it would", // or "it had"
  "itd": "it would",

  // WE
  "we're": "we are",
  "were": "we are", // ⚠️ CONFLITO com "were" (past)

  "we've": "we have",
  "weve": "we have",

  "we'll": "we will",
  "well": "we will", // ⚠️ CONFLITO com "well" (adverb)

  "we'd": "we would", // or "we had"
  "wed": "we would",

  // THEY
  "they're": "they are",
  "theyre": "they are",

  "they've": "they have",
  "theyve": "they have",

  "they'll": "they will",
  "theyll": "they will",

  "they'd": "they would", // or "they had"
  "theyd": "they would",

  // THAT/THERE/HERE
  "that's": "that is", // or "that has"
  "thats": "that is",

  "that'll": "that will",
  "thatll": "that will",

  "that'd": "that would",
  "thatd": "that would",

  "there's": "there is", // or "there has"
  "theres": "there is",

  "there'll": "there will",
  "therell": "there will",

  "there'd": "there would",
  "thered": "there would",

  "here's": "here is",
  "heres": "here is",

  "here'll": "here will",
  "herell": "here will",

  "here'd": "here would",
  "hered": "here would",

  // WHO/WHAT/WHERE/WHEN/WHY/HOW
  "who's": "who is", // or "who has"
  "whos": "who is",

  "who'll": "who will",
  "wholl": "who will",

  "who'd": "who would", // or "who had"
  "whod": "who would",

  "what's": "what is", // or "what has"
  "whats": "what is",

  "what'll": "what will",
  "whatll": "what will",

  "what'd": "what would",
  "whatd": "what would",

  "where's": "where is", // or "where has"
  "wheres": "where is",

  "where'll": "where will",
  "wherell": "where will",

  "where'd": "where would",
  "whered": "where would",

  "when's": "when is", // or "when has"
  "whens": "when is",

  "when'll": "when will",
  "whenll": "when will",

  "when'd": "when would",
  "whend": "when would",

  "why's": "why is", // or "why has"
  "whys": "why is",

  "why'll": "why will",
  "whyll": "why will",

  "why'd": "why would",
  "whyd": "why would",

  "how's": "how is", // or "how has"
  "hows": "how is",

  "how'll": "how will",
  "howll": "how will",

  "how'd": "how would", // or "how did"
  "howd": "how would",

  // ========================================
  // SPECIAL CASES
  // ========================================

  // LET'S
  "let's": "let us",
  "lets": "let us",

  // Y'ALL (informal)
  "y'all": "you all",
  "yall": "you all",

  // AIN'T (informal - multiple meanings)
  "ain't": "is not", // or "am not", "are not", "has not", "have not"
  "aint": "is not",

  // GONNA/WANNA/GOTTA (informal)
  "gonna": "going to",
  "wanna": "want to",
  "gotta": "got to",
  "hafta": "have to",
  "hasta": "has to",
  "oughta": "ought to",
  "sorta": "sort of",
  "kinda": "kind of",
  "lotsa": "lots of",
  "outta": "out of",
  "shoulda": "should have",
  "woulda": "would have",
  "coulda": "could have",
  "mighta": "might have",
  "musta": "must have",
};

// ========================================
// FUNÇÃO MELHORADA
// ========================================

// Normaliza números escritos por extenso para numéricos
const normalizeNumbers = (text) => {
  let normalized = text.toLowerCase();
  
  // Ordena por tamanho (maior primeiro) para evitar substituições parciais
  const sortedKeys = Object.keys(NUMBER_WORDS).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(word => {
    const numeric = NUMBER_WORDS[word];
    // Match com word boundaries para evitar falsos positivos
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    normalized = normalized.replace(regex, numeric);
  });
  
  return normalized;
};

// Normaliza termos técnicos para suas formas padrão
const normalizeTechTerms = (text) => {
  let normalized = text.toLowerCase();
  
  // Ordena por tamanho (maior primeiro) para evitar substituições parciais
  const sortedKeys = Object.keys(TECH_TERMS_MAP).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(variant => {
    const standard = TECH_TERMS_MAP[variant];
    // Escapa caracteres especiais do regex
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Substitui espaços por \s* para permitir espaços opcionais
    // Substitui pontos por [.\s]* para permitir pontos ou espaços
    const pattern = escaped.replace(/\s+/g, '\\s*').replace(/\./g, '[.\\s]*');
    // Match com word boundaries
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    normalized = normalized.replace(regex, standard);
  });
  
  return normalized;
};

const normalizeContractions = (text) => {
  let normalized = text.toLowerCase().trim();

  // Ordena por tamanho (maior primeiro) para evitar substituições parciais
  const sortedKeys = Object.keys(CONTRACTION_MAP).sort((a, b) => b.length - a.length);

  sortedKeys.forEach(contraction => {
    const expanded = CONTRACTION_MAP[contraction];

    // Match com word boundaries (\b) para evitar falsos positivos
    const regex = new RegExp(`\\b${contraction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    normalized = normalized.replace(regex, expanded);
  });

  return normalized;
};

const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const getEditDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
};

export const compareTexts = (original, spoken) => {
  const normalize = (text) => {
    // 1. Converte para minúsculas
    let normalized = text.toLowerCase();
    
    // 2. Normaliza termos técnicos PRIMEIRO (antes de remover pontuação)
    // Isso garante que "node.js", "node js", "node dot js" virem todos "nodejs"
    normalized = normalizeTechTerms(normalized);
    
    // 3. Normaliza números escritos por extenso
    normalized = normalizeNumbers(normalized);
    
    // 4. Remove pontuação, substituindo por espaço
    // Isso garante que "node.js" vire "node js" após normalização técnica
    normalized = normalized
      .replace(/[^\w\s']/g, ' ') // Substitui pontuação por espaço
      .replace(/\s+/g, ' ') // Normaliza múltiplos espaços em um único espaço
      .trim();

    // 5. Normaliza contrações
    normalized = normalizeContractions(normalized);

    // 6. Remove apóstrofos após normalização
    normalized = normalized.replace(/'/g, '');
    
    // 7. Normaliza espaços finais novamente
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  };

  const originalNorm = normalize(original);
  const spokenNorm = normalize(spoken);

  const similarity = calculateSimilarity(originalNorm, spokenNorm);
  return {
    isCorrect: similarity > 0.8,
    similarity: Math.round(similarity * 100),
    normalizedOriginal: originalNorm,
    normalizedSpoken: spokenNorm
  };
};