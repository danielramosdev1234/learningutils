// src/hooks/usePhonemeAnalysis.js

import { useCallback } from 'react';
import {
  analyzeWords,
  analyzePronunciation,
  getPronunciationTips,
  generateFeedback
} from '../utils/phonemeAnalyzer';

/**
 * Hook para análise fonética de pronúncia
 * Compara texto esperado vs texto falado
 */
export const usePhonemeAnalysis = () => {

  /**
   * Analisa a pronúncia completa
   * @param {string} expectedText - Texto esperado
   * @param {string} spokenText - Texto falado pelo usuário
   * @returns {Object} - Análise completa com métricas e sugestões
   */
  const analyze = useCallback((expectedText, spokenText) => {
    if (!expectedText || !spokenText) {
      return null;
    }

    // Análise principal
    const analysis = analyzePronunciation(expectedText, spokenText);

    // Gera feedback baseado na acurácia
    const feedback = generateFeedback(analysis.accuracy);

    // Obtém dicas para palavras problemáticas
    const tips = getPronunciationTips(analysis.problematicWords);

    return {
      ...analysis,
      feedback,
      tips
    };
  }, []);

  /**
   * Analisa apenas palavras individuais
   * Útil para feedback granular
   */
  const analyzeByWords = useCallback((expectedText, spokenText) => {
    if (!expectedText || !spokenText) {
      return [];
    }

    return analyzeWords(expectedText, spokenText);
  }, []);

  /**
   * Obtém apenas dicas de pronúncia sem análise completa
   */
  const getTips = useCallback((problematicWords) => {
    return getPronunciationTips(problematicWords);
  }, []);

  /**
   * Gera feedback rápido baseado em porcentagem
   */
  const getFeedback = useCallback((accuracy) => {
    return generateFeedback(accuracy);
  }, []);

  return {
    analyze,
    analyzeByWords,
    getTips,
    getFeedback
  };
};