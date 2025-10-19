import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
   * Busca frases baseado no ambiente
   */
  static async fetchPhrases() {
    try {
      const isLocal = this.isLocalhost();

      console.log(`🌍 Ambiente detectado: ${isLocal ? 'LOCALHOST (Development)' : 'PRODUCTION'}`);

      // Busca TODAS as frases (não podemos filtrar no query do Firestore
      // porque algumas frases antigas não têm o campo 'environment')
      console.log('📖 Carregando frases do banco de dados...');
      const querySnapshot = await getDocs(collection(db, 'phrases'));

      const allPhrases = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtra baseado no ambiente
      let phrases;

      if (isLocal) {
        // Em localhost: mostra TODAS as frases
        phrases = allPhrases;
        console.log('✅ LOCALHOST: Mostrando TODAS as frases');
      } else {
        // Em produção: mostra apenas frases que NÃO são 'development'
        // (inclui frases antigas sem campo 'environment' e frases 'production')
        phrases = allPhrases.filter(phrase =>
          phrase.environment !== 'development'
        );
        console.log('✅ PRODUCTION: Ocultando frases de desenvolvimento');
      }

      console.log(`📊 ${phrases.length} frases carregadas com sucesso`);

      // Log detalhado para debug
      if (isLocal) {
        const devPhrases = phrases.filter(p => p.environment === 'development').length;
        const prodPhrases = phrases.filter(p => p.environment === 'production').length;
        const legacyPhrases = phrases.filter(p => !p.environment).length;
        console.log(`   📊 Development: ${devPhrases} | Production: ${prodPhrases} | Legacy (sem tag): ${legacyPhrases}`);
      }

      return phrases;

    } catch (error) {
      console.error('❌ Error fetching phrases:', error);
      throw error;
    }
  }

  /**
   * Método auxiliar para adicionar frases de produção
   * (útil para criar frases que aparecem em ambos os ambientes)
   */
  static async addProductionPhrase(phraseData) {
    try {
      const docRef = await addDoc(collection(db, 'phrases'), {
        ...phraseData,
        environment: 'production',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Frase de produção adicionada:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('❌ Erro ao adicionar frase de produção:', error);
      throw error;
    }
  }
}