import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Faz login com Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('✅ Login bem-sucedido:', user.displayName);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.error('❌ Erro no login:', error);

    // Erros comuns
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Login cancelado' };
    }
    if (error.code === 'auth/popup-blocked') {
      return { success: false, error: 'Popup bloqueado pelo navegador' };
    }

    return { success: false, error: 'Erro ao fazer login' };
  }
};

/**
 * Faz logout
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ Logout realizado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    return { success: false, error: 'Erro ao fazer logout' };
  }
};

/**
 * Observer do estado de autenticação
 * Retorna função para cancelar subscription
 */
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      });
    } else {
      callback({
        isAuthenticated: false,
        user: null
      });
    }
  });
};

/**
 * Pega usuário atual (síncrono)
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;

  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  return null;
};