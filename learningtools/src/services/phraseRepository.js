// ✅ NOVO: Importa JSON local em vez do Firestore
import phrasesData from '../data/phrases.json';

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
   * Busca frases do JSON local (SEM Firestore!)
   * ✅ ZERO custo, ZERO quota, carregamento instantâneo
   */
  static async fetchPhrases() {
    try {
      const isLocal = this.isLocalhost();

      console.log(`🌎 Ambiente detectado: ${isLocal ? 'LOCALHOST (Development)' : 'PRODUCTION'}`);

      // ✅ NOVO: Carrega do JSON local (instantâneo!)
      console.log('📖 Carregando frases do arquivo local...');
      const allPhrases = phrasesData;

      // Adiciona IDs se não existirem (para compatibilidade)
      const phrasesWithIds = allPhrases.map((phrase, index) => ({
        id: phrase.id || `phrase_${index}`,
        ...phrase
      }));

      // Filtra baseado no ambiente (se você ainda usa esse campo)
      let phrases;

      if (isLocal) {
        // Em localhost: mostra TODAS as frases OU apenas de development
        // (ajuste conforme sua necessidade)
        phrases = phrasesWithIds.filter(phrase =>
          !phrase.environment || phrase.environment === 'development' || phrase.environment === 'production'
        );
        console.log('✅ LOCALHOST: Mostrando todas as frases');
      } else {
        // Em produção: mostra apenas frases que NÃO são 'development'
        phrases = phrasesWithIds.filter(phrase =>
          !phrase.environment || phrase.environment !== 'development'
        );
        console.log('✅ PRODUCTION: Ocultando frases de desenvolvimento');
      }

      console.log(`📊 ${phrases.length} frases carregadas do JSON local`);

      // Log detalhado para debug
      if (isLocal) {
        const devPhrases = phrases.filter(p => p.environment === 'development').length;
        const prodPhrases = phrases.filter(p => p.environment === 'production').length;
        const legacyPhrases = phrases.filter(p => !p.environment).length;
        console.log(`   📊 Development: ${devPhrases} | Production: ${prodPhrases} | Sem tag: ${legacyPhrases}`);
      }

      return phrases;

    } catch (error) {
      console.error('❌ Erro ao carregar frases do JSON:', error);
      throw error;
    }
  }

  /**
   * ✅ OPCIONAL: Se você quiser buscar apenas uma frase por ID
   */
  static async getPhraseById(phraseId) {
    const phrases = await this.fetchPhrases();
    return phrases.find(p => p.id === phraseId) || null;
  }


}

// ✅ Mantém compatibilidade com código antigo
export default PhraseRepository;