import { useState, useCallback } from 'react';

/**
 * Hook para tradução PT↔EN usando Google Apps Script API
 */
export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [lastTranslation, setLastTranslation] = useState(null);

  // URL da sua API no Google Apps Script
  const API_URL = 'https://script.google.com/macros/s/AKfycbyxsPmYJEooog-hLQe1jq7t8V234LuYAQyUQW4VyWTyg3g3f-chwMTnX09dbKYBUZw/exec';

  /**
   * Traduz texto usando a API do Google Apps Script
   */
  const translate = async (text, sourceLang = 'pt', targetLang = 'en') => {
    try {
      console.log('🔡 Traduzindo com Google Apps Script API...');
      console.log(`📝 Texto: "${text}"`);
      console.log(`🌍 ${sourceLang} → ${targetLang}`);

      // Monta a URL com os parâmetros
      const url = `${API_URL}?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`;

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Verifica se há erro na resposta
      if (data.error) {
        throw new Error(data.message || 'Erro na tradução');
      }

      // Verifica se a tradução foi bem-sucedida
      if (data.success && data.translated) {
        console.log('✅ Tradução realizada com sucesso!');
        console.log(`📤 Resultado: "${data.translated}"`);
        return data.translated;
      }

      throw new Error('Resposta inválida da API');

    } catch (err) {
      console.error('❌ Erro na tradução:', err.message);
      throw err;
    }
  };

  /**
   * Traduz de Português para Inglês
   */
  const translateToEnglish = useCallback(async (portugueseText) => {
    if (!portugueseText || !portugueseText.trim()) {
      setError('Por favor, digite um texto para traduzir');
      return null;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const text = portugueseText.trim();
      const translated = await translate(text, 'pt', 'en');

      const result = {
        original: portugueseText,
        translated: translated,
        success: true,
        timestamp: new Date().toISOString(),
        apiUsed: 'Google Apps Script'
      };

      setLastTranslation(result);
      setIsTranslating(false);

      return result;

    } catch (err) {
      console.error('❌ Erro ao traduzir:', err);
      setError(err.message || 'Erro ao traduzir. Tente novamente.');
      setIsTranslating(false);
      return null;
    }
  }, []);

  /**
   * Traduz de Inglês para Português
   */
  const translateToPortuguese = useCallback(async (englishText) => {
    if (!englishText || !englishText.trim()) {
      setError('Por favor, digite um texto para traduzir');
      return null;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const text = englishText.trim();
      const translated = await translate(text, 'en', 'pt');

      const result = {
        original: englishText,
        translated: translated,
        success: true,
        timestamp: new Date().toISOString(),
        apiUsed: 'Google Apps Script'
      };

      setLastTranslation(result);
      setIsTranslating(false);

      return result;

    } catch (err) {
      console.error('❌ Erro ao traduzir:', err);
      setError(err.message || 'Erro ao traduzir. Tente novamente.');
      setIsTranslating(false);
      return null;
    }
  }, []);

  /**
   * Tradução genérica (pode escolher os idiomas)
   */
  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    if (!text || !text.trim()) {
      setError('Por favor, digite um texto para traduzir');
      return null;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const translated = await translate(text.trim(), sourceLang, targetLang);

      const result = {
        original: text,
        translated: translated,
        success: true,
        timestamp: new Date().toISOString(),
        apiUsed: 'Google Apps Script',
        sourceLang,
        targetLang
      };

      setLastTranslation(result);
      setIsTranslating(false);

      return result;

    } catch (err) {
      console.error('❌ Erro ao traduzir:', err);
      setError(err.message || 'Erro ao traduzir. Tente novamente.');
      setIsTranslating(false);
      return null;
    }
  }, []);

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpa última tradução
   */
  const clearLastTranslation = useCallback(() => {
    setLastTranslation(null);
  }, []);

  return {
    // Funções principais
    translateToEnglish,
    translateToPortuguese,
    translateText,

    // Estados
    isTranslating,
    error,
    lastTranslation,

    // Funções auxiliares
    clearError,
    clearLastTranslation
  };
};