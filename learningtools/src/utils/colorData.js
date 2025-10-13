// Cores disponíveis com traduções
export const colors = {
  red: {
    hex: '#FF0000',
    translations: {
      en: 'red',
      pt: 'vermelho',
      es: 'rojo',
      fr: 'rouge',
      de: 'rot'
    }
  },
  blue: {
    hex: '#0000FF',
    translations: {
      en: 'blue',
      pt: 'azul',
      es: 'azul',
      fr: 'bleu',
      de: 'blau'
    }
  },
  green: {
    hex: '#00FF00',
    translations: {
      en: 'green',
      pt: 'verde',
      es: 'verde',
      fr: 'vert',
      de: 'grün'
    }
  },
  yellow: {
    hex: '#FFFF00',
    translations: {
      en: 'yellow',
      pt: 'amarelo',
      es: 'amarillo',
      fr: 'jaune',
      de: 'gelb'
    }
  },
  orange: {
    hex: '#FFA500',
    translations: {
      en: 'orange',
      pt: 'laranja',
      es: 'naranja',
      fr: 'orange',
      de: 'orange'
    }
  },
  purple: {
    hex: '#800080',
    translations: {
      en: 'purple',
      pt: 'roxo',
      es: 'morado',
      fr: 'violet',
      de: 'lila'
    }
  },
  pink: {
    hex: '#FFC0CB',
    translations: {
      en: 'pink',
      pt: 'rosa',
      es: 'rosa',
      fr: 'rose',
      de: 'rosa'
    }
  },
  brown: {
    hex: '#964B00',
    translations: {
      en: 'brown',
      pt: 'marrom',
      es: 'marrón',
      fr: 'marron',
      de: 'braun'
    }
  },
  black: {
    hex: '#000000',
    translations: {
      en: 'black',
      pt: 'preto',
      es: 'negro',
      fr: 'noir',
      de: 'schwarz'
    }
  },
  white: {
    hex: '#FFFFFF',
    translations: {
      en: 'white',
      pt: 'branco',
      es: 'blanco',
      fr: 'blanc',
      de: 'weiß'
    }
  },
  gray: {
    hex: '#808080',
    translations: {
      en: 'gray',
      pt: 'cinza',
      es: 'gris',
      fr: 'gris',
      de: 'grau'
    }
  },
  gold: {
    hex: '#FFD700',
    translations: {
      en: 'gold',
      pt: 'dourado',
      es: 'dorado',
      fr: 'or',
      de: 'gold'
    }
  },
  silver: {
    hex: '#C0C0C0',
    translations: {
      en: 'silver',
      pt: 'prateado',
      es: 'plateado',
      fr: 'argent',
      de: 'silber'
    }
  },
  cyan: {
    hex: '#00FFFF',
    translations: {
      en: 'cyan',
      pt: 'ciano',
      es: 'cian',
      fr: 'cyan',
      de: 'cyan'
    }
  },
  magenta: {
    hex: '#FF00FF',
    translations: {
      en: 'magenta',
      pt: 'magenta',
      es: 'magenta',
      fr: 'magenta',
      de: 'magenta'
    }
  },
  lime: {
    hex: '#00FF00',
    translations: {
      en: 'lime',
      pt: 'lima',
      es: 'lima',
      fr: 'citron vert',
      de: 'limette'
    }
  }
};

// Obter cor aleatória
export const getRandomColor = () => {
  const colorKeys = Object.keys(colors);
  const randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  return {
    key: randomKey,
    ...colors[randomKey]
  };
};

// Obter nome da cor no idioma especificado
export const getColorName = (colorKey, languageCode) => {
  const lang = languageCode.split('-')[0];
  return colors[colorKey]?.translations[lang] || colors[colorKey]?.translations['en'];
};

// Normalizar resposta do usuário
export const normalizeColorAnswer = (answer) => {
  return answer
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z]/g, ''); // Remove caracteres especiais
};