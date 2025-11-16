/**
 * Conta o número de palavras em uma frase
 * Remove pontuação e espaços extras antes de contar
 * @param {string} text - Texto da frase
 * @returns {number} - Número de palavras
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Remove pontuação e normaliza espaços
  const cleaned = text
    .trim()
    .replace(/[.,!?;:()\[\]{}'"]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim();
  
  // Se ficou vazio, retorna 0
  if (!cleaned) {
    return 0;
  }
  
  // Divide por espaços e conta
  const words = cleaned.split(' ').filter(word => word.length > 0);
  return words.length;
};

