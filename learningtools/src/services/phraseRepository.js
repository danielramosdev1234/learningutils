import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export class PhraseRepository {
  static async fetchPhrases() {
    try {
      const querySnapshot = await getDocs(collection(db, 'phrases'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching phrases:', error);
      throw error;
    }
  }
}