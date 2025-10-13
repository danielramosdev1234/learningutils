export const numberToWordsSimple = (num, languageCode) => {
  const lang = languageCode.split('-')[0];

  // English
  if (lang === 'en') {
    const words = {
      0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
      5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
      10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
      15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
      20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
      60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety'
    };

    if (words[num]) return words[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return words[tens] + (ones ? ' ' + words[ones] : '');
    }
    if (num < 1000) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      return words[hundreds] + ' hundred' + (remainder ? ' ' + numberToWordsSimple(remainder, languageCode) : '');
    }
  }

  // Spanish
  if (lang === 'es') {
    const words = {
      0: 'cero', 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro',
      5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve',
      10: 'diez', 11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce',
      15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve',
      20: 'veinte', 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta',
      60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa'
    };

    if (words[num]) return words[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return words[tens] + (ones ? ' y ' + words[ones] : '');
    }
    if (num < 1000) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      const hundredWord = hundreds === 1 ? 'cien' : words[hundreds] + 'cientos';
      return remainder === 0 ? hundredWord : hundredWord + ' ' + numberToWordsSimple(remainder, languageCode);
    }
  }

  // Portuguese
  if (lang === 'pt') {
    const words = {
      0: 'zero', 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro',
      5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove',
      10: 'dez', 11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze',
      15: 'quinze', 16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove',
      20: 'vinte', 30: 'trinta', 40: 'quarenta', 50: 'cinquenta',
      60: 'sessenta', 70: 'setenta', 80: 'oitenta', 90: 'noventa'
    };

    if (words[num]) return words[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return words[tens] + (ones ? ' e ' + words[ones] : '');
    }
    if (num < 1000) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      const hundredWord = num === 100 ? 'cem' : words[hundreds] + 'centos';
      return remainder === 0 ? hundredWord : hundredWord + ' e ' + numberToWordsSimple(remainder, languageCode);
    }
  }

  return num.toString();
};