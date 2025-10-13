export const translations = {
  'en': {
    correct: '✓ Correct! Well done! 🎉',
    notQuite: 'Not quite. You said',
    correctAnswer: 'The correct answer is',
    noSpeech: '⚠️ No speech detected. Speak louder and closer to the mic.',
    notSupported: 'Speech recognition is not supported in your browser. Try Chrome or Edge.',
    youSaid: 'You said:',
    score: 'Score:',
    howToUse: 'How to use:',
    step1: 'Select your language and number range above',
    step2: 'Click "Hear It" to listen to the number pronunciation',
    step3: 'Click "Speak" and say the number out loud',
    step4: 'Get instant feedback on your pronunciation',
    step5: 'Click "Next" for a new number'
  },
  'pt': {
    correct: '✓ Correto! Muito bem! 🎉',
    notQuite: 'Não está correto. Você disse',
    correctAnswer: 'A resposta correta é',
    noSpeech: '⚠️ Nenhuma fala detectada. Fale mais alto e próximo ao microfone.',
    notSupported: 'Reconhecimento de voz não suportado no seu navegador. Use Chrome ou Edge.',
    youSaid: 'Você disse:',
    score: 'Pontuação:',
    howToUse: 'Como usar:',
    step1: 'Selecione seu idioma e intervalo de números acima',
    step2: 'Clique em "Ouvir" para escutar a pronúncia do número',
    step3: 'Clique em "Falar" e diga o número em voz alta',
    step4: 'Receba feedback instantâneo sobre sua pronúncia',
    step5: 'Clique em "Próximo" para um novo número'
  },
  'es': {
    correct: '✓ ¡Correcto! ¡Bien hecho! 🎉',
    notQuite: 'No es correcto. Dijiste',
    correctAnswer: 'La respuesta correcta es',
    noSpeech: '⚠️ No se detectó habla. Habla más alto y cerca del micrófono.',
    notSupported: 'El reconocimiento de voz no es compatible con tu navegador. Prueba Chrome o Edge.',
    youSaid: 'Dijiste:',
    score: 'Puntuación:',
    howToUse: 'Cómo usar:',
    step1: 'Selecciona tu idioma y rango de números arriba',
    step2: 'Haz clic en "Escuchar" para oír la pronunciación del número',
    step3: 'Haz clic en "Hablar" y di el número en voz alta',
    step4: 'Obtén retroalimentación instantánea sobre tu pronunciación',
    step5: 'Haz clic en "Siguiente" para un nuevo número'
  },
  'fr': {
    correct: '✓ Correct! Bien joué! 🎉',
    notQuite: 'Pas tout à fait. Vous avez dit',
    correctAnswer: 'La bonne réponse est',
    noSpeech: '⚠️ Aucune parole détectée. Parlez plus fort et plus près du micro.',
    notSupported: 'La reconnaissance vocale n\'est pas prise en charge par votre navigateur. Essayez Chrome ou Edge.',
    youSaid: 'Vous avez dit:',
    score: 'Score:',
    howToUse: 'Comment utiliser:',
    step1: 'Sélectionnez votre langue et plage de nombres ci-dessus',
    step2: 'Cliquez sur "Écouter" pour entendre la prononciation du nombre',
    step3: 'Cliquez sur "Parler" et dites le nombre à voix haute',
    step4: 'Obtenez un retour instantané sur votre prononciation',
    step5: 'Cliquez sur "Suivant" pour un nouveau nombre'
  },
  'de': {
    correct: '✓ Richtig! Gut gemacht! 🎉',
    notQuite: 'Nicht ganz. Sie sagten',
    correctAnswer: 'Die richtige Antwort ist',
    noSpeech: '⚠️ Keine Sprache erkannt. Sprechen Sie lauter und näher am Mikrofon.',
    notSupported: 'Spracherkennung wird von Ihrem Browser nicht unterstützt. Versuchen Sie Chrome oder Edge.',
    youSaid: 'Sie sagten:',
    score: 'Punktzahl:',
    howToUse: 'So verwenden:',
    step1: 'Wählen Sie oben Ihre Sprache und Zahlenbereich',
    step2: 'Klicken Sie auf "Hören", um die Aussprache zu hören',
    step3: 'Klicken Sie auf "Sprechen" und sagen Sie die Zahl laut',
    step4: 'Erhalten Sie sofortiges Feedback zu Ihrer Aussprache',
    step5: 'Klicken Sie auf "Weiter" für eine neue Zahl'
  }
};

export const languageNames = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'pt-BR': 'Português (BR)',
  'pt-PT': 'Português (PT)',
  'es-ES': 'Español (ES)',
  'es-MX': 'Español (MX)',
  'fr-FR': 'Français (FR)',
  'de-DE': 'Deutsch (DE)',
  'it-IT': 'Italiano (IT)',
  'ja-JP': '日本語 (JP)',
  'ko-KR': '한국어 (KR)',
  'zh-CN': '中文 (CN)',
  'zh-TW': '中文 (TW)',
  'ru-RU': 'Русский (RU)',
  'ar-SA': 'العربية (SA)',
  'hi-IN': 'हिन्दी (IN)',
  'nl-NL': 'Nederlands (NL)',
  'pl-PL': 'Polski (PL)',
  'tr-TR': 'Türkçe (TR)',
  'sv-SE': 'Svenska (SE)',
  'no-NO': 'Norsk (NO)',
  'da-DK': 'Dansk (DK)',
  'fi-FI': 'Suomi (FI)',
  'cs-CZ': 'Čeština (CZ)',
  'el-GR': 'Ελληνικά (GR)',
  'he-IL': 'עברית (IL)',
  'th-TH': 'ไทย (TH)',
  'vi-VN': 'Tiếng Việt (VN)',
  'id-ID': 'Bahasa Indonesia (ID)'
};

export const getTranslation = (languageCode) => {
  const baseLang = languageCode.split('-')[0];
  return translations[baseLang] || translations['en'];
};