// src/hooks/useIPAConverter.js

import { useState, useCallback, useMemo, useEffect } from 'react';
import { convertTextToIPA, getIPACoverage } from '../utils/ipaConverter';

/**
 * Hook para conversão de texto para IPA (International Phonetic Alphabet)
 * Inclui cache para evitar conversões repetidas
 * Integrado com text-to-ipa library
 */
export const useIPAConverter = () => {
  const [cache, setCache] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Inicializa o conversor IPA na primeira renderização
   */
  useEffect(() => {
    try {
      // A biblioteca text-to-ipa já carrega automaticamente
      // Este useEffect garante que está pronto
      setIsReady(true);
    } catch (err) {
      setError('Erro ao inicializar conversor IPA');
      console.error('Erro IPA:', err);
    }
  }, []);

  /**
   * Converte texto para IPA com cache
   */
  const convertToIPA = useCallback((text) => {
    if (!text || !isReady) return '';

    // Verifica se já está no cache
    if (cache[text]) {
      return cache[text];
    }

    try {
      // Converte e adiciona ao cache
      const ipaText = convertTextToIPA(text);
      setCache(prev => ({ ...prev, [text]: ipaText }));

      return ipaText;
    } catch (err) {
      console.error('Erro ao converter para IPA:', err);
      return text; // Retorna texto original em caso de erro
    }
  }, [cache, isReady]);

  /**
   * Calcula a cobertura do dicionário IPA para um texto
   * Retorna porcentagem de palavras que têm tradução IPA
   */
  const getCoverage = useCallback((text) => {
    if (!text || !isReady) return 0;

    try {
      return getIPACoverage(text);
    } catch (err) {
      console.error('Erro ao calcular cobertura IPA:', err);
      return 0;
    }
  }, [isReady]);

  /**
   * Limpa o cache (útil para economizar memória)
   */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  /**
   * Estatísticas do cache
   */
  const cacheStats = useMemo(() => ({
    size: Object.keys(cache).length,
    hasCache: Object.keys(cache).length > 0
  }), [cache]);

  return {
    convertToIPA,
    getCoverage,
    clearCache,
    cacheStats,
    isReady,
    error
  };
};