import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LogIn, LogOut, User } from 'lucide-react';
import { loginWithGoogle, logout } from '../../store/slices/userSlice';
import BackupManager from '../BackupManager';

const AuthButton = () => {
  const dispatch = useDispatch();
  const { mode, profile, loading } = useSelector(state => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleLogin = async () => {
    const result = await dispatch(loginWithGoogle());

    if (loginWithGoogle.fulfilled.match(result)) {
      const { migrationResult } = result.payload;

      if (migrationResult.migrated) {
        alert(`🎉 Bem-vindo! ${migrationResult.phrasesCount} frases foram migradas para sua conta!`);
      } else {
        alert('✅ Login realizado com sucesso!');
      }
    } else {
      alert('❌ Erro ao fazer login. Tente novamente.');
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair? Seu progresso está salvo na nuvem.')) {
      dispatch(logout());
      setShowMenu(false);
    }
  };

  if (mode === 'guest') {
    return (
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all shadow-md border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn size={20} />
        {loading ? 'Entrando...' : 'Entrar com Google'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all shadow-md border-2 border-gray-200"
      >
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {profile.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="font-semibold text-gray-800 hidden sm:inline">
          {profile.displayName}
        </span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100">
              <p className="font-bold text-gray-800">{profile.displayName}</p>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>

            {/* ✅ NOVO: Invite Friends */}
                          <button
                                onClick={() => {
                                  setShowBackupModal(true);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-gray-800 transition-all"
                              >
                                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">

                                </div>
                                <div className="text-left flex-1">
                                  <div className="font-bold text-lg">Gerenciar Backup</div>

                                </div>
                                <div className="text-purple-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>

            {/* Modal Backup */}
                      {showBackupModal && (
                        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                          <BackupManager onBack={() => setShowBackupModal(false)} />
                        </div>
                      )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
            >
              <LogOut size={20} />
              <span className="font-semibold">Sair</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthButton;