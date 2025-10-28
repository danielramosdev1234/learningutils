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
      "The power should stay near you",
      "Let the strength accompany you",
      "Force must remain by your side"
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
      "I will present a proposal he must accept",
      "I'm gonna make him an offer he can't refuse",
      "I shall give him a deal impossible to decline",
      "He will receive an irresistible proposition"
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
      "You cannot go through here",
      "You shall not pass",
      "Passing is forbidden for you",
      "You are not allowed to cross"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "l61oBLydkYE",
    startTime: 24,
    endTime: 30,
    audioText: "I'll be back",
    level: "beginner",
    options: [
      "I will return soon",
      "I'm coming back later",
      "I'll be back",
      "I shall return here"
    ],
    correctIndex: 2,
    category: "Movies"
  },
  {
    videoId: "mufCSHFF6nI",
    startTime: 278,
    endTime: 282,
    audioText: "Here's looking at you, kid",
    level: "advanced",
    options: [
      "I am watching you, child",
      "Here's looking at you, kid",
      "I'm observing you, young one",
      "My eyes are on you, kiddo"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "0aG9wChNX_k",
    startTime: 4,
    endTime: 11,
    audioText: "To infinity and beyond",
    level: "beginner",
    options: [
      "Towards endless space and further",
      "To infinity and beyond",
      "Into the unlimited and past it",
      "To boundless space and more"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "3akrI54iK90",
    startTime: 219,
    endTime: 222,
    audioText: "Life is like a box of chocolates",
    level: "intermediate",
    options: [
      "Existence resembles chocolate assortment",
      "Life is like a box of chocolates",
      "Living is similar to candy collection",
      "Life compares to a chocolate container"
    ],
    correctIndex: 1,
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
      "Mission control, there is an issue",
      "Houston, something went wrong",
      "Ground control, we face difficulties"
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
      "Continue to swim forward",
      "Just keep swimming",
      "Don't stop moving in water",
      "Keep going through the water"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "QI30s68J8u0",
    startTime: 9,
    endTime: 12,
    audioText: "Winter is coming",
    level: "beginner",
    options: [
      "The cold season approaches",
      "Winter is coming",
      "Cold weather will arrive soon",
      "Winter season is near"
    ],
    correctIndex: 1,
    category: "Series"
  },
  {
    videoId: "uiMOqMEgBfU",
    startTime: 121,
    endTime: 131,
    audioText: "I am Iron Man",
    level: "beginner",
    options: [
      "My identity is Iron Man",
      "I am Iron Man",
      "Iron Man is who I am",
      "I'm the one called Iron Man"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "PoyejjJGajk",
    startTime: 76,
    endTime: 81,
    audioText: "Why so serious?",
    level: "beginner",
    options: [
      "What makes you so grave?",
      "Why so serious?",
      "Why are you being so solemn?",
      "What causes your seriousness?"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "moSFlvxnbgk",
    startTime: 60,
    endTime: 63,
    audioText: "Let it go, let it go",
    level: "beginner",
    options: [
      "Release it, release it",
      "Let it go, let it go",
      "Allow it to leave, allow it to leave",
      "Set it free, set it free"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "zpE3zB43xbM",
    startTime: 11,
    endTime: 15,
    audioText: "I love you three thousand",
    level: "beginner",
    options: [
      "My love for you is three thousand",
      "I love you three thousand",
      "I adore you three thousand times",
      "You have three thousand of my love"
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
      "Great power brings great responsibility",
      "With great power comes great responsibility",
      "Significant power creates significant duty",
      "Much power requires much responsibility"
    ],
    correctIndex: 1,
    category: "Movies"
  },
  {
    videoId: "4Prc1UfuokY",
    startTime: 129,
    endTime: 134,
    audioText: "This is Sparta",
    level: "beginner",
    options: [
      "We are in Sparta",
      "This is Sparta",
      "This place is Sparta",
      "Here we have Sparta"
    ],
    correctIndex: 1,
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
      "Home is the best place",
      "No location compares to home",
      "Home is unmatched by anywhere"
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
      "Are you speaking to me?",
      "You talking to me?",
      "Is your conversation directed at me?",
      "Are you addressing me?"
    ],
    correctIndex: 1,
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
      "Forrest, you should run",
      "Start running, Forrest",
      "Forrest, run quickly"
    ],
    correctIndex: 0,
    category: "Movies"
  }
];

// Exportar para uso no componente React
export default questions;