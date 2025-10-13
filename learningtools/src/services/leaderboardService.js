import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const loadLeaderboard = async (selectedLanguage) => {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('language', '==', selectedLanguage)
    );
    const querySnapshot = await getDocs(q);
    const leaders = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    return leaders;
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    try {
      const allDocs = await getDocs(collection(db, 'leaderboard'));
      const leaders = allDocs.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.language === selectedLanguage)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      return leaders;
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return [];
    }
  }
};

export const saveRecord = async (playerName, score, selectedLanguage) => {
  if (!playerName.trim()) return false;

  try {
    const percentage = Math.round((score.correct / score.total) * 100);
    await addDoc(collection(db, 'leaderboard'), {
      name: playerName.trim().slice(0, 30),
      score: percentage,
      correct: score.correct,
      total: score.total,
      language: selectedLanguage,
      timestamp: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving record:', error);
    return false;
  }
};

export const checkIfNewRecord = (score, leaderboard) => {
  if (score.total < 10) return false;
  const percentage = (score.correct / score.total) * 100;
  if (percentage < 80) return false;

  if (leaderboard.length < 10) return true;
  const lowestScore = leaderboard[leaderboard.length - 1]?.score || 0;
  return percentage > lowestScore;
};