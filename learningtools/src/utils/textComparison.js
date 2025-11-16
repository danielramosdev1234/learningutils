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
  'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000',
  // Compostos (com hífen e sem hífen)
  'twenty-one': '21', 'twenty one': '21', 'twentyone': '21',
  'twenty-two': '22', 'twenty two': '22', 'twentytwo': '22',
  'twenty-three': '23', 'twenty three': '23', 'twentythree': '23',
  'twenty-four': '24', 'twenty four': '24', 'twentyfour': '24',
  'twenty-five': '25', 'twenty five': '25', 'twentyfive': '25',
  'twenty-six': '26', 'twenty six': '26', 'twentysix': '26',
  'twenty-seven': '27', 'twenty seven': '27', 'twentyseven': '27',
  'twenty-eight': '28', 'twenty eight': '28', 'twentyeight': '28',
  'twenty-nine': '29', 'twenty nine': '29', 'twentynine': '29',
  'thirty-one': '31', 'thirty one': '31', 'thirtyone': '31',
  'thirty-two': '32', 'thirty two': '32', 'thirtytwo': '32',
  'thirty-three': '33', 'thirty three': '33', 'thirtythree': '33',
  'thirty-four': '34', 'thirty four': '34', 'thirtyfour': '34',
  'thirty-five': '35', 'thirty five': '35', 'thirtyfive': '35',
  'thirty-six': '36', 'thirty six': '36', 'thirtysix': '36',
  'thirty-seven': '37', 'thirty seven': '37', 'thirtyseven': '37',
  'thirty-eight': '38', 'thirty eight': '38', 'thirtyeight': '38',
  'thirty-nine': '39', 'thirty nine': '39', 'thirtynine': '39',
  'forty-one': '41', 'forty one': '41', 'fortyone': '41',
  'forty-two': '42', 'forty two': '42', 'fortytwo': '42',
  'forty-three': '43', 'forty three': '43', 'fortythree': '43',
  'forty-four': '44', 'forty four': '44', 'fortyfour': '44',
  'forty-five': '45', 'forty five': '45', 'fortyfive': '45',
  'fifty-one': '51', 'fifty one': '51', 'fiftyone': '51',
  'fifty-two': '52', 'fifty two': '52', 'fiftytwo': '52',
  'fifty-three': '53', 'fifty three': '53', 'fiftythree': '53',
  'fifty-four': '54', 'fifty four': '54', 'fiftyfour': '54',
  'fifty-five': '55', 'fifty five': '55', 'fiftyfive': '55',
  'sixty-one': '61', 'sixty one': '61', 'sixtyone': '61',
  'seventy-one': '71', 'seventy one': '71', 'seventyone': '71',
  'eighty-one': '81', 'eighty one': '81', 'eightyone': '81',
  'ninety-one': '91', 'ninety one': '91', 'ninetyone': '91'
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

  'every day': 'everyday',
  'everyday': 'every day',
  
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

// ========================================
// CLINICAL RESEARCH TERMS MAPPING
// ========================================
const CLINICAL_TERMS_MAP = {
  // Acrônimos e siglas (podem ser ditos letra por letra ou como palavra)
  'sae': 'sae',
  's a e': 'sae',
  'say': 'sae', // Pronúncia comum
  'same': 'sae', // Confusão comum do reconhecimento de voz
  'safe': 'sae', // Confusão quando seguido de palavra começando com 'f' (ex: "SAE form" → "safe form")
  'serious adverse event': 'sae',
  
  'gcp': 'gcp',
  'g c p': 'gcp',
  'good clinical practice': 'gcp',
  
  'irb': 'irb',
  'i r b': 'irb',
  'institutional review board': 'irb',
  
  'crf': 'crf',
  'c r f': 'crf',
  'case report form': 'crf',
  
  'cro': 'cro',
  'c r o': 'cro',
  'contract research organization': 'cro',
  
  // Termos médicos com variações comuns
  'adverse event': 'adverse event',
  'adverse events': 'adverse event',
  'adverse': 'adverse event', // Contexto: quando isolado pode ser "adverse event"
  
  'informed consent': 'informed consent',
  'informed consent form': 'informed consent',
  'consent form': 'informed consent',
  'consent': 'informed consent', // Contexto: quando isolado
  
  'source data verification': 'source data verification',
  'source data': 'source data verification',
  'sdv': 'source data verification',
  's d v': 'source data verification',
  
  'randomization': 'randomization',
  'random ization': 'randomization',
  'randomize': 'randomization',
  'randomised': 'randomization', // British spelling
  'randomized': 'randomization',
  
  'specimens': 'specimens',
  'specimen': 'specimens', // Singular aceito como plural
  'samples': 'specimens',
  'sample': 'specimens',
  
  'anonymized': 'anonymized',
  'anonymous': 'anonymized', // Pronúncia similar
  'anonymised': 'anonymized', // British spelling
  'anonymize': 'anonymized',
  
  'helsinki': 'helsinki',
  'helsingfors': 'helsinki', // Nome alternativo em sueco
  'hel sinki': 'helsinki',
  
  'query': 'query',
  'queries': 'query', // Plural normalizado para singular
  'querie': 'query', // Erro comum
  
  'criteria': 'criteria',
  'criterion': 'criteria', // Singular aceito como plural
  'criterias': 'criteria', // Erro comum
  
  'data': 'data',
  'datum': 'data', // Singular aceito como plural
  'datas': 'data', // Erro comum
  
  'withdrew': 'withdrew',
  'withdraw': 'withdrew', // Presente aceito como passado
  'withdrawn': 'withdrew',
  
  'enrollment': 'enrollment',
  'enrolment': 'enrollment', // British spelling
  'enroll': 'enrollment',
  'enrol': 'enrollment',
  
  'protocol deviation': 'protocol deviation',
  'deviation': 'protocol deviation',
  'protocol': 'protocol deviation', // Contexto: quando isolado
  
  'severity grade': 'severity grade',
  'severity': 'severity grade',
  'grade': 'severity grade',
  
  'visit window': 'visit window',
  'window': 'visit window',
  'visit': 'visit window',
  
  'room temperature': 'room temperature',
  'room temp': 'room temperature',
  'ambient temperature': 'room temperature',
  
  'temperature logs': 'temperature logs',
  'temp logs': 'temperature logs',
  'temperature log': 'temperature logs',
  'temp log': 'temperature logs',
  
  'study drug': 'study drug',
  'study drugs': 'study drug',
  'drug': 'study drug', // Contexto: quando isolado
  
  'case report form': 'case report form',
  'crf': 'case report form',
  'c r f': 'case report form',
  
  'follow-up': 'follow up',
  'follow up': 'follow up',
  'followup': 'follow up',
  
  'corrective action plan': 'corrective action plan',
  'action plan': 'corrective action plan',
  'corrective plan': 'corrective action plan',
  
  'out of range': 'out of range',
  'out of range values': 'out of range',
  'outrange': 'out of range',
  
  'central lab': 'central lab',
  'central laboratory': 'central lab',
  'lab': 'central lab',
  'laboratory': 'central lab',
  
  'progress report': 'progress report',
  'progress': 'progress report',
  'report': 'progress report',
  
  'enrollment target': 'enrollment target',
  'target': 'enrollment target',
  'enrollment goal': 'enrollment target',
  
  'database lock': 'database lock',
  'db lock': 'database lock',
  'data lock': 'database lock',
  'lock': 'database lock',
  
  'close out': 'close out',
  'closeout': 'close out',
  'close out the site': 'close out',
  'site closeout': 'close out',
  
  'training module': 'training module',
  'module': 'training module',
  'training': 'training module',
  
  'delegation log': 'delegation log',
  'delegation': 'delegation log',
  'log': 'delegation log',
  
  'patient confidentiality': 'patient confidentiality',
  'confidentiality': 'patient confidentiality',
  'patient privacy': 'patient confidentiality',
  
  'safety report': 'safety report',
  'safety': 'safety report',
  'safety reporting': 'safety report',
  
  'safety signals': 'safety signals',
  'safety signal': 'safety signals',
  'signals': 'safety signals',
  
  'safety database': 'safety database',
  'safety db': 'safety database',
  'safety data': 'safety database',
  
  'data safety monitoring board': 'data safety monitoring board',
  'dsmb': 'data safety monitoring board',
  'd s m b': 'data safety monitoring board',
  'safety monitoring board': 'data safety monitoring board',
  'monitoring board': 'data safety monitoring board',
  
  'essential documents': 'essential documents',
  'essential document': 'essential documents',
  'documents': 'essential documents',
  
  'investigator site file': 'investigator site file',
  'site file': 'investigator site file',
  'isf': 'investigator site file',
  'i s f': 'investigator site file',
  
  'declaration of helsinki': 'declaration of helsinki',
  'helsinki declaration': 'declaration of helsinki',
  'helsinki': 'declaration of helsinki',
  
  // Singular/plural comum em termos médicos
  'good': 'good',
  'goods': 'good', // Plural incorreto comum do reconhecimento de voz (ex: "Goods clinical practice")
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

// Normaliza termos clínicos/médicos para suas formas padrão
const normalizeClinicalTerms = (text) => {
  let normalized = text.toLowerCase();
  
  // Ordena por tamanho (maior primeiro) para evitar substituições parciais
  const sortedKeys = Object.keys(CLINICAL_TERMS_MAP).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(variant => {
    const standard = CLINICAL_TERMS_MAP[variant];
    // Escapa caracteres especiais do regex
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Substitui espaços por \s* para permitir espaços opcionais
    // Substitui hífens por [-\s]* para permitir hífens ou espaços
    const pattern = escaped.replace(/\s+/g, '\\s*').replace(/-/g, '[-\\s]*');
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
  // Garante que ambas as strings estão em minúsculas antes da comparação
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const getEditDistance = (str1, str2) => {
  // Garante que ambas as strings estão em minúsculas antes da comparação
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const matrix = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  );

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      // Comparação case-insensitive
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[s2.length][s1.length];
};

export const compareTexts = (original, spoken) => {
  const normalize = (text) => {
    // 1. Converte para minúsculas
    let normalized = text.toLowerCase();
    
    // 2. Normaliza termos técnicos PRIMEIRO (antes de remover pontuação)
    // Isso garante que "node.js", "node js", "node dot js" virem todos "nodejs"
    normalized = normalizeTechTerms(normalized);
    
    // 3. Normaliza termos clínicos/médicos (antes de remover pontuação)
    // Isso garante que "SAE", "S A E", "say" virem todos "sae"
    normalized = normalizeClinicalTerms(normalized);
    
    // 4. Normaliza números escritos por extenso
    normalized = normalizeNumbers(normalized);
    
    // 5. Remove pontuação, substituindo por espaço
    // Isso garante que "node.js" vire "node js" após normalização técnica
    normalized = normalized
      .replace(/[^\w\s']/g, ' ') // Substitui pontuação por espaço
      .replace(/\s+/g, ' ') // Normaliza múltiplos espaços em um único espaço
      .trim();

    // 6. Normaliza contrações
    normalized = normalizeContractions(normalized);

    // 7. Remove apóstrofos após normalização
    normalized = normalized.replace(/'/g, '');
    
    // 8. Normaliza espaços finais novamente
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