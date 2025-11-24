// questionsDatabase.js - Formato com foco em compreensão de significado

const questions = [
  {
    videoId: "VH83SsL_fIQ",
    startTime: 4,
    endTime: 9,
    audioText: "May the Force be with you",
    level: "beginner",
    options: [
      "Que a Força esteja com você",
      "Que a Força fique com você"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Be with you' é uma expressão idiomática que significa 'estar ao seu lado', diferente de 'stay' (permanecer/ficar)."
  },
  {
    videoId: "PGfEDaAiz78",
    startTime: 0,
    endTime: 5,
    audioText: "I'm gonna make him an offer he can't refuse",
    level: "intermediate",
    options: [
      "Vou fazer uma oferta que ele não pode recusar",
      "Vou fazer uma oferta que ele pode recusar"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Can't refuse' = não pode recusar. O 'can't' é crucial para o significado da frase icônica."
  },
  {
    videoId: "mJZZNHekEQw",
    startTime: 80,
    endTime: 95,
    audioText: "You shall not pass",
    level: "beginner",
    options: [
      "Você não passará",
      "Você não deveria passar"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Shall not' é uma proibição forte/ordem, enquanto 'should not' seria apenas um conselho."
  },
  {
    videoId: "l61oBLydkYE",
    startTime: 24,
    endTime: 30,
    audioText: "I'll be back",
    level: "beginner",
    options: [
      "Eu voltarei",
      "Eu estarei de volta"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Ambas traduções são corretas, mas 'Eu voltarei' é mais natural em português brasileiro."
  },
  {
    videoId: "mufCSHFF6nI",
    startTime: 278,
    endTime: 282,
    audioText: "Here's looking at you, kid",
    level: "advanced",
    options: [
      "Estou olhando para você, garota",
      "Estou cuidando de você, garota"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Expressão idiomática que literalmente significa 'olhando para você', não 'cuidando de você'."
  },
  {
    videoId: "0aG9wChNX_k",
    startTime: 4,
    endTime: 11,
    audioText: "To infinity and beyond",
    level: "beginner",
    options: [
      "Ao infinito e além",
      "Para o infinito e mais longe"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Beyond' = além. A tradução oficial consagrada é 'ao infinito e além'."
  },
  {
    videoId: "3akrI54iK90",
    startTime: 219,
    endTime: 222,
    audioText: "Life is like a box of chocolates",
    level: "intermediate",
    options: [
      "A vida é como uma caixa de chocolates",
      "A vida parece uma caixa de chocolates"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Is like' = é como (comparação), diferente de 'seems like' (parece)."
  },
  {
    videoId: "jo6MR2yJ4EM",
    startTime: 224,
    endTime: 226,
    audioText: "Houston, we have a problem",
    level: "intermediate",
    options: [
      "Houston, temos um problema",
      "Houston, tivemos um problema"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Have' (presente) = temos agora. 'Had' (passado) = tivemos antes."
  },
  {
    videoId: "0Hkn-LSh7es",
    startTime: 7,
    endTime: 12,
    audioText: "Just keep swimming",
    level: "beginner",
    options: [
      "Apenas continue nadando",
      "Apenas comece a nadar"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Keep' + verbo -ing = continue fazendo. 'Start' seria 'comece'."
  },
  {
    videoId: "QI30s68J8u0",
    startTime: 9,
    endTime: 12,
    audioText: "Winter is coming",
    level: "beginner",
    options: [
      "O inverno está chegando",
      "O inverno vai chegar"
    ],
    correctIndex: 0,
    category: "Series",
    explanation: "'Is coming' (presente contínuo) = está chegando agora. 'Will come' = vai chegar (futuro)."
  },
  {
    videoId: "uiMOqMEgBfU",
    startTime: 121,
    endTime: 131,
    audioText: "I am Iron Man",
    level: "beginner",
    options: [
      "Eu sou o Homem de Ferro",
      "Eu sou um Homem de Ferro"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Sem artigo em inglês = artigo definido 'o' em português quando falamos de identidade única."
  },
  {
    videoId: "PoyejjJGajk",
    startTime: 76,
    endTime: 81,
    audioText: "Why so serious?",
    level: "beginner",
    options: [
      "Por que tão sério?",
      "Por que está tão sério?"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Forma coloquial sem verbo auxiliar, mais natural traduzir direto sem o 'está'."
  },
  {
    videoId: "moSFlvxnbgk",
    startTime: 60,
    endTime: 63,
    audioText: "Let it go, let it go",
    level: "beginner",
    options: [
      "Deixa pra lá, deixa pra lá",
      "Deixe isso ir, deixe isso ir"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Let it go' é uma expressão idiomática = 'deixa pra lá', não tradução literal."
  },
  {
    videoId: "zpE3zB43xbM",
    startTime: 11,
    endTime: 15,
    audioText: "I love you three thousand",
    level: "beginner",
    options: [
      "Eu te amo três mil",
      "Eu te amo muito"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Frase específica do filme que mantém o número literal 'três mil' como expressão de intensidade."
  },
  {
    videoId: "guuYU74wU70",
    startTime: 70,
    endTime: 75,
    audioText: "With great power comes great responsibility",
    level: "intermediate",
    options: [
      "Com grandes poderes vêm grandes responsabilidades",
      "Com grande poder vem grande responsabilidade"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Power' no plural em português soa mais natural para esta frase icônica."
  },
  {
    videoId: "4Prc1UfuokY",
    startTime: 129,
    endTime: 134,
    audioText: "This is Sparta",
    level: "beginner",
    options: [
      "Isto é Esparta",
      "Aqui é Esparta"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'This is' = isto é (demonstrativo). 'Here' seria 'aqui'."
  },
  {
    videoId: "NFWMBE-mQEc",
    startTime: 28,
    endTime: 34,
    audioText: "There's no place like home",
    level: "intermediate",
    options: [
      "Não há lugar como o lar",
      "Não existe lugar igual ao lar"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Tradução clássica consagrada. 'Like' = como (comparação)."
  },
  {
    videoId: "uwBxrNF-l8A",
    startTime: 51,
    endTime: 56,
    audioText: "You talking to me?",
    level: "beginner",
    options: [
      "Você está falando comigo?",
      "Você falou comigo?"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Talking' (presente contínuo) = está falando agora. 'Talked' = falou (passado)."
  },
  {
    videoId: "bSMxl1V8FSg",
    startTime: 11,
    endTime: 14,
    audioText: "Run, Forrest, run",
    level: "beginner",
    options: [
      "Corra, Forrest, corra",
      "Corre, Forrest, corre"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "Imperativo 'run' = corra (você). A forma 'corre' seria para 'ele/ela'."
  },
  {
    videoId: "7GLcS5gYSU4",
    startTime: 0,
    endTime: 6,
    audioText: "I have a bad feeling about this",
    level: "intermediate",
    options: [
      "Tenho um mau pressentimento sobre isso",
      "Estou me sentindo mal sobre isso"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Have a feeling' = ter um pressentimento, não 'sentir-se mal fisicamente'."
  }
];

// Exportar para uso no componente React
export default questions;