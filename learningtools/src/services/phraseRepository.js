// src/services/phraseRepository.js

// ✅ Importa todos os arquivos JSON
import dailyBasicsPhrases from '../data/daily_basics_phrases.json';
import professionalEnglishPhrases from '../data/professional_english_phrases.json';
import shoppingMoneyPhrases from '../data/shopping_money_phrases.json';
import socialEnglishPhrases from '../data/social_english_phrases.json';
import travelSurvivalPhrases from '../data/travel_survival_phrases.json';
import phrasesData from '../data/phrases.json';
import techInterviewPhrases from '../data/tech_interview_phrases.json';
import clinicalResearchPhrases from '../data/clinical_research_phrases.json';
import questionsPhrases from '../data/questions_phrases.json';
import verbTensesPhrases from '../data/verb_tenses_new.json';

export class PhraseRepository {
  /**
   * Detecta se está rodando em localhost
   */
  static isLocalhost() {
    if (typeof window === 'undefined') return false;

    const hostname = window.location.hostname;

    return hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname === '[::1]';
  }

  /**
   * ✅ NOVO: Combina todas as frases dos arquivos JSON
   */
  static async fetchPhrases() {
    try {
      const isLocal = this.isLocalhost();

      console.log(`🌎 Ambiente detectado: ${isLocal ? 'LOCALHOST (Development)' : 'PRODUCTION'}`);

      // ✅ Combina todas as frases
      const allPhrases = [
        ...phrasesData,
        ...dailyBasicsPhrases,
        ...professionalEnglishPhrases,
        ...shoppingMoneyPhrases,
        ...socialEnglishPhrases,
        ...travelSurvivalPhrases,
        ...techInterviewPhrases,
        ...clinicalResearchPhrases,
        ...questionsPhrases,
                             ...verbTensesPhrases
      ];

      console.log(`📚 Total de frases carregadas: ${allPhrases.length}`);
      console.log(`   📊 Breakdown:`);
      console.log(`      🏠 Daily Basics: ${dailyBasicsPhrases.length}`);
      console.log(`      💼 Professional: ${professionalEnglishPhrases.length}`);
      console.log(`      🛍️ Shopping: ${shoppingMoneyPhrases.length}`);
      console.log(`      👥 Social: ${socialEnglishPhrases.length}`);
      console.log(`      ✈️ Travel: ${travelSurvivalPhrases.length}`);
      console.log(`      💻 Tech Interview: ${techInterviewPhrases.length}`);
      console.log(`      ❓ Questions: ${questionsPhrases.length}`);
      console.log(`   📚 Verb Tenses: ${verbTensesPhrases.length}`);

      // Adiciona IDs se não existirem (para compatibilidade)
      const phrasesWithIds = allPhrases.map((phrase, index) => ({
        id: phrase.id || `phrase_${index}`,
        ...phrase
      }));

      // Filtra baseado no ambiente
      let phrases;

      if (isLocal) {
        // Em localhost: mostra TODAS as frases
        phrases = phrasesWithIds.filter(phrase =>
          !phrase.environment ||
          phrase.environment === 'development' ||
          phrase.environment === 'production'
        );
        console.log('✅ LOCALHOST: Mostrando todas as frases');
      } else {
        // Em produção: oculta frases de desenvolvimento
        phrases = phrasesWithIds.filter(phrase =>
          !phrase.environment || phrase.environment !== 'development'
        );
        console.log('✅ PRODUCTION: Ocultando frases de desenvolvimento');
      }

      console.log(`📊 ${phrases.length} frases disponíveis após filtro de ambiente`);

      // ✅ Log por categoria para debug
      const categories = {
        daily_basics: phrases.filter(p => p.category === 'daily_basics').length,
        professional_english: phrases.filter(p => p.category === 'professional_english').length,
        shopping_money: phrases.filter(p => p.category === 'shopping_money').length,
        social_english: phrases.filter(p => p.category === 'social_english').length,
        travel_survival: phrases.filter(p => p.category === 'travel_survival').length,
        tech_interview: phrases.filter(p => p.category === 'tech_interview').length,
        essential_survival: phrases.filter(p => p.category === 'essential_survival').length
      };

      console.log('📂 Frases por categoria:', categories);

      return phrases;

    } catch (error) {
      console.error('❌ Erro ao carregar frases do JSON:', error);
      throw error;
    }
  }

  /**
   * ✅ Busca apenas uma frase por ID
   */
  static async getPhraseById(phraseId) {
    const phrases = await this.fetchPhrases();
    return phrases.find(p => p.id === phraseId) || null;
  }

  /**
   * ✅ NOVO: Busca frases por categoria
   */
  static async getPhrasesByCategory(categoryId) {
    const phrases = await this.fetchPhrases();
    return phrases.filter(p => p.category === categoryId);
  }

  /**
   * ✅ NOVO: Busca estatísticas de categorias
   */
  static async getCategoryStats() {
    const phrases = await this.fetchPhrases();

    const categories = [
      'daily_basics',
      'professional_english',
      'shopping_money',
      'social_english',
      'travel_survival',
      'clinical_research',
      'essential_survival',
                              'verb_tenses'
    ];

    return categories.map(categoryId => ({
      id: categoryId,
      total: phrases.filter(p => p.category === categoryId).length
    }));
  }
}

export default PhraseRepository;