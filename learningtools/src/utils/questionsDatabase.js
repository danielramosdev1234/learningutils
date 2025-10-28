// questionsDatabase.js

const questions = [
  {
    videoId: "VH83SsL_fIQ",
    startTime: 4,
    endTime: 9,
    audioText: "May the Force be with you",
    level: "beginner",
    options: [
      "May the Force be with you (Que a Força esteja com você)",
      "May the force stay with you (Que a força fique com você)",
      "May your force be with you (Que sua força esteja com você)",
      "May the Force be within you (Que a Força esteja dentro de você)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "PGfEDaAiz78",
    startTime: 0,
    endTime: 5,
    audioText: "I'm gonna make him an offer he can't refuse",
    level: "intermediate",
    options: [
      "I'm gonna make him an offer he can refuse (Vou fazer-lhe uma oferta que ele pode recusar)",
      "I'm gonna make him an offer he can't refuse (Vou fazer-lhe uma oferta que ele não pode recusar)",
      "I'm gonna take him an offer he can't refuse (Vou levar-lhe uma oferta que ele não pode recusar)",
      "I'm gonna make him an offer he can't reduce (Vou fazer-lhe uma oferta que ele não pode reduzir)"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "mJZZNHekEQw",
    startTime: 80,
    endTime: 95,
    audioText: "You shall not pass",
    level: "beginner",
    options: [
      "You shall not pass (Você não passará)",
      "You shall not past (Você não passado)",
      "You should not pass (Você não deveria passar)",
      "You shall not passed (Você não passou)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "l61oBLydkYE",
    startTime: 24,
    endTime: 30,
    audioText: "I'll be back",
    level: "beginner",
    options: [
      "I'll be back (Eu voltarei)",
      "I'll be bag (Eu serei bolsa)",
      "I'll be black (Eu serei preto)",
      "I'll be bad (Eu serei mau)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "mufCSHFF6nI",
    startTime: 278,
    endTime: 282,
    audioText: "Here's looking at you, kid",
    level: "advanced",
    options: [
      "Here's looking at you, kid (Eis que olho para você, garota)",
      "Here's looking at ya, kid (Eis que olho pra você, garota)",
      "Here's looking out for you, kid (Eis que cuido de você, garota)",
      "Here's looking after you, kid (Eis que tomo conta de você, garota)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "0aG9wChNX_k",
    startTime: 4,
    endTime: 11,
    audioText: "To infinity and beyond",
    level: "beginner",
    options: [
      "To infinity and beyond (Ao infinito e além)",
      "To infinity and the end (Ao infinito e o fim)",
      "Through infinity and beyond (Através do infinito e além)",
      "To infinity and be on (Ao infinito e estar ligado)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "3akrI54iK90",
    startTime: 219,
    endTime: 222,
    audioText: "Life is like a box of chocolates",
    level: "intermediate",
    options: [
      "Life is like a box of chocolates (A vida é como uma caixa de chocolates)",
      "Life is like a box of chocolate (A vida é como uma caixa de chocolate)",
      "Life is like the box of chocolates (A vida é como a caixa de chocolates)",
      "Life is liked a box of chocolates (A vida é gostada uma caixa de chocolates)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "jo6MR2yJ4EM",
    startTime: 224,
    endTime: 226,
    audioText: "Houston, we have a problem",
    level: "intermediate",
    options: [
      "Houston, we have a problem (Houston, temos um problema)",
      "Houston, we have the problem (Houston, temos o problema)",
      "Houston, we had a problem (Houston, tivemos um problema)",
      "Houston, we have problem (Houston, temos problema)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "0Hkn-LSh7es",
    startTime: 7,
    endTime: 12,
    audioText: "Just keep swimming",
    level: "beginner",
    options: [
      "Just keep swimming (Apenas continue nadando)",
      "Just keep on swimming (Apenas continue em natação)",
      "Just keep swinging (Apenas continue balançando)",
      "Just keep swimmin (Apenas continue nadando - informal)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "QI30s68J8u0",
    startTime: 9,
    endTime: 12,
    audioText: "Winter is coming",
    level: "beginner",
    options: [
      "Winter is coming (O inverno está chegando)",
      "Winter is gonna come (O inverno vai vir)",
      "The winter is coming (O inverno está chegando)",
      "Winter is comma (Inverno é vírgula)"
    ],
    correctIndex: 0,
    category: "Series"
  },
  {
    videoId: "uiMOqMEgBfU",
    startTime: 121,
    endTime: 131,
    audioText: "I am Iron Man",
    level: "beginner",
    options: [
      "I am Iron Man (Eu sou o Homem de Ferro)",
      "I am the Iron Man (Eu sou o Homem de Ferro)",
      "I am an Iron Man (Eu sou um Homem de Ferro)",
      "I am Ironing Man (Eu sou o Homem Passando)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "PoyejjJGajk",
    startTime: 76,
    endTime: 81,
    audioText: "Why so serious?",
    level: "beginner",
    options: [
      "Why so serious? (Por que tão sério?)",
      "Why so seriously? (Por que tão seriamente?)",
      "Why are so serious? (Por que está tão sério? - gramática errada)",
      "Why so curious? (Por que tão curioso?)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "moSFlvxnbgk",
    startTime: 60,
    endTime: 63,
    audioText: "Let it go, let it go",
    level: "beginner",
    options: [
      "Let it go, let it go (Deixa pra lá, deixa pra lá)",
      "Let it go, let it gone (Deixa pra lá, deixa pra ido)",
      "Let it grow, let it grow (Deixa crescer, deixa crescer)",
      "Let it go, let's it go (Deixa pra lá, vamos pra lá)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "zpE3zB43xbM",
    startTime: 11,
    endTime: 15,
    audioText: "I love you three thousand",
    level: "beginner",
    options: [
      "I love you through thousand (Eu te amo através de mil)",
      "I love you three thousand (Eu te amo três mil)",
      "I love you three thousands (Eu te amo três milhares)",
      "I love you tree thousand (Eu te amo árvore mil)"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "guuYU74wU70",
    startTime: 70,
    endTime: 75,
    audioText: "With great power comes great responsibility",
    level: "intermediate",
    options: [
      "With great power comes great responsibility (Com grandes poderes vêm grandes responsabilidades)",
      "With great power come great responsibility (Com grande poder vem grande responsabilidade - plural incorreto)",
      "With great power comes a great responsibility (Com grande poder vem uma grande responsabilidade)",
      "With great power comes great respond ability (Com grande poder vem grande capacidade de responder)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "4Prc1UfuokY",
    startTime: 129,
    endTime: 134,
    audioText: "This is Sparta",
    level: "beginner",
    options: [
      "This is Sparta (Isto é Esparta)",
      "This is a Sparta (Isto é uma Esparta)",
      "This is the Sparta (Isto é a Esparta)",
      "This is Spartan (Isto é espartano)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "NFWMBE-mQEc",
    startTime: 28,
    endTime: 34,
    audioText: "There's no place like home",
    level: "intermediate",
    options: [
      "There's no place like home (Não há lugar como o lar)",
      "There's no place liked home (Não há lugar gostado lar)",
      "There's no place likes home (Não há lugar gosta lar)",
      "There's no place like Rome (Não há lugar como Roma)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "uwBxrNF-l8A",
    startTime: 51,
    endTime: 56,
    audioText: "You talking to me?",
    level: "beginner",
    options: [
      "You talking to me? (Você está falando comigo?)",
      "You talking with me? (Você está falando com eu?)",
      "You're talk to me? (Você está fala comigo? - gramática errada)",
      "You talked to me? (Você falou comigo?)"
    ],
    correctIndex: 0,
    category: "Movies"
  },
  {
    videoId: "bSMxl1V8FSg",
    startTime: 11,
    endTime: 14,
    audioText: "Run, Forrest, run",
    level: "beginner",
    options: [
      "Run, Forrest, run (Corra, Forrest, corra)",
      "Run, Forest, run (Corra, Floresta, corra)",
      "Ran, Forrest, run (Correu, Forrest, corra)",
      "Run, Forrest, ran (Corra, Forrest, correu)"
    ],
    correctIndex: 0,
    category: "Movies"
  }
];

// Exportar para uso no componente React
export default questions;