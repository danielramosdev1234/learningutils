// Traduções específicas para o Color Speech Trainer
export const colorTranslations = {
  'en': {
    title: 'Color Speech Trainer',
    correct: '✓ Correct! Well done! 🎉',
    notQuite: 'Not quite. You said',
    correctAnswer: 'The correct answer is',
    noSpeech: '⚠️ No speech detected. Speak louder and closer to the mic.',
    notSupported: 'Speech recognition is not supported in your browser. Try Chrome or Edge.',
    youSaid: 'You said:',
    score: 'Score:',
    howToUse: 'How to use:',
    step1: 'Select your language above',
    step2: 'Click "Hear It" to listen to the color name',
    step3: 'Click "Speak" and say the color name out loud',
    step4: 'Get instant feedback on your pronunciation',
    step5: 'Click "Next" for a new color',
    whatColorIsThis: 'What color is this?',
    language: 'Language'
  },
  'pt': {
    title: 'Treinador de Fala de Cores',
    correct: '✓ Correto! Muito bem! 🎉',
    notQuite: 'Não está correto. Você disse',
    correctAnswer: 'A resposta correta é',
    noSpeech: '⚠️ Nenhuma fala detectada. Fale mais alto e próximo ao microfone.',
    notSupported: 'Reconhecimento de voz não suportado no seu navegador. Use Chrome ou Edge.',
    youSaid: 'Você disse:',
    score: 'Pontuação:',
    howToUse: 'Como usar:',
    step1: 'Selecione seu idioma acima',
    step2: 'Clique em "Ouvir" para escutar o nome da cor',
    step3: 'Clique em "Falar" e diga o nome da cor em voz alta',
    step4: 'Receba feedback instantâneo sobre sua pronúncia',
    step5: 'Clique em "Próximo" para uma nova cor',
    whatColorIsThis: 'Que cor é esta?',
    language: 'Idioma'
  },
  'es': {
    title: 'Entrenador de Habla de Colores',
    correct: '✓ ¡Correcto! ¡Bien hecho! 🎉',
    notQuite: 'No es correcto. Dijiste',
    correctAnswer: 'La respuesta correcta es',
    noSpeech: '⚠️ No se detectó habla. Habla más alto y cerca del micrófono.',
    notSupported: 'El reconocimiento de voz no es compatible con tu navegador. Prueba Chrome o Edge.',
    youSaid: 'Dijiste:',
    score: 'Puntuación:',
    howToUse: 'Cómo usar:',
    step1: 'Selecciona tu idioma arriba',
    step2: 'Haz clic en "Escuchar" para oír el nombre del color',
    step3: 'Haz clic en "Hablar" y di el nombre del color en voz alta',
    step4: 'Obtén retroalimentación instantánea sobre tu pronunciación',
    step5: 'Haz clic en "Siguiente" para un nuevo color',
    whatColorIsThis: '¿Qué color es este?',
    language: 'Idioma'
  },
  'fr': {
    title: 'Entraîneur de Parole de Couleurs',
    correct: '✓ Correct! Bien joué! 🎉',
    notQuite: 'Pas tout à fait. Vous avez dit',
    correctAnswer: 'La bonne réponse est',
    noSpeech: '⚠️ Aucune parole détectée. Parlez plus fort et plus près du micro.',
    notSupported: 'La reconnaissance vocale n\'est pas prise en charge par votre navigateur. Essayez Chrome ou Edge.',
    youSaid: 'Vous avez dit:',
    score: 'Score:',
    howToUse: 'Comment utiliser:',
    step1: 'Sélectionnez votre langue ci-dessus',
    step2: 'Cliquez sur "Écouter" pour entendre le nom de la couleur',
    step3: 'Cliquez sur "Parler" et dites le nom de la couleur à voix haute',
    step4: 'Obtenez un retour instantané sur votre prononciation',
    step5: 'Cliquez sur "Suivant" pour une nouvelle couleur',
    whatColorIsThis: 'Quelle est cette couleur?',
    language: 'Langue'
  },
  'de': {
    title: 'Farb-Sprachtrainer',
    correct: '✓ Richtig! Gut gemacht! 🎉',
    notQuite: 'Nicht ganz. Sie sagten',
    correctAnswer: 'Die richtige Antwort ist',
    noSpeech: '⚠️ Keine Sprache erkannt. Sprechen Sie lauter und näher am Mikrofon.',
    notSupported: 'Spracherkennung wird von Ihrem Browser nicht unterstützt. Versuchen Sie Chrome oder Edge.',
    youSaid: 'Sie sagten:',
    score: 'Punktzahl:',
    howToUse: 'So verwenden:',
    step1: 'Wählen Sie oben Ihre Sprache',
    step2: 'Klicken Sie auf "Hören", um den Farbnamen zu hören',
    step3: 'Klicken Sie auf "Sprechen" und sagen Sie den Farbnamen laut',
    step4: 'Erhalten Sie sofortiges Feedback zu Ihrer Aussprache',
    step5: 'Klicken Sie auf "Weiter" für eine neue Farbe',
    whatColorIsThis: 'Welche Farbe ist das?',
    language: 'Sprache'
  }
};

export const getColorTranslation = (languageCode) => {
  const baseLang = languageCode.split('-')[0];
  return colorTranslations[baseLang] || colorTranslations['en'];
};