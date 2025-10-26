import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const loadChallengeLeaderboard = async () => {
  try {
    const q = query(
      collection(db, 'challenge_leaderboard'),
      orderBy('score', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const leaders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return leaders;
  } catch (error) {
    console.error('Error loading challenge leaderboard:', error);
    return [];
  }
};

export const saveChallengeRecord = async (playerName, score) => {
  if (!playerName.trim() || score === 0) return false;

  try {
    await addDoc(collection(db, 'challenge_leaderboard'), {
      name: playerName.trim().slice(0, 20),
      score: score,
      timestamp: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving challenge record:', error);
    return false;
  }
};

export const checkIfMakesTop10 = (score, leaderboard) => {
  if (score === 0) return false;
  if (leaderboard.length < 10) return true;
  const lowestScore = leaderboard[leaderboard.length - 1]?.score || 0;
  return score > lowestScore;
};