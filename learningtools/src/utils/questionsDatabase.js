// questionsDatabase.js

const questions = [
  {
    videoId: "VH83SsL_fIQ",
    startTime: 4,
    endTime: 9,
    audioText: "May the Force be with you",
    level: "beginner",
    options: [
      "May the Force be with you",
      "May the force stay with you",
      "May your force be with you",
      "May the Force be within you"
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
      "I'm gonna make him an offer he can refuse",
      "I'm gonna make him an offer he can't refuse",
      "I'm gonna take him an offer he can't refuse",
      "I'm gonna make him an offer he can't reduce"
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
      "You shall not pass",
      "You shall not past",
      "You should not pass",
      "You shall not passed"
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
      "I'll be back",
      "I'll be bag",
      "I'll be black",
      "I'll be bad"
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
      "Here's looking at you, kid",
      "Here's looking at ya, kid",
      "Here's looking out for you, kid",
      "Here's looking after you, kid"
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
      "To infinity and beyond",
      "To infinity and the end",
      "Through infinity and beyond",
      "To infinity and be on"
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
      "Life is like a box of chocolates",
      "Life is like a box of chocolate",
      "Life is like the box of chocolates",
      "Life is liked a box of chocolates"
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
      "Houston, we have a problem",
      "Houston, we have the problem",
      "Houston, we had a problem",
      "Houston, we have problem"
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
      "Just keep swimming",
      "Just keep on swimming",
      "Just keep swinging",
      "Just keep swimmin"
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
      "Winter is coming",
      "Winter is gonna come",
      "The winter is coming",
      "Winter is comma"
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
      "I am Iron Man",
      "I am the Iron Man",
      "I am an Iron Man",
      "I am Ironing Man"
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
      "Why so serious?",
      "Why so seriously?",
      "Why are so serious?",
      "Why so curious?"
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
      "Let it go, let it go",
      "Let it go, let it gone",
      "Let it grow, let it grow",
      "Let it go, let's it go"
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
      "I love you through thousand",
      "I love you three thousand",
      "I love you three thousands",
      "I love you tree thousand"
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
      "With great power comes great responsibility",
      "With great power come great responsibility",
      "With great power comes a great responsibility",
      "With great power comes great respond ability"
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
      "This is Sparta",
      "This is a Sparta",
      "This is the Sparta",
      "This is Spartan"
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
      "There's no place like home",
      "There's no place liked home",
      "There's no place likes home",
      "There's no place like Rome"
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
      "You talking to me?",
      "You talking with me?",
      "You're talk to me?",
      "You talked to me?"
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
      "Run, Forrest, run",
      "Run, Forest, run",
      "Ran, Forrest, run",
      "Run, Forrest, ran"
    ],
    correctIndex: 0,
    category: "Movies"
  }
];

// Exportar para uso no componente React
export default questions;