import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LogIn, LogOut, Bell } from 'lucide-react';
import { loginWithGoogle, logout } from '../../store/slices/userSlice';
import BackupManager from '../BackupManager';
import NotificationSettings from '../settings/NotificationSettings';
import { useUILanguage } from '../../context/LanguageContext.jsx';
import { translateUI } from '../../i18n/uiTranslations.js';

const AuthButton = () => {
  const dispatch = useDispatch();
  const { mode, profile, loading } = useSelector(state => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { language, setLanguage } = useUILanguage();

  // Escuta evento para abrir configurações de notificações
  useEffect(() => {
    const handleOpenNotificationSettings = () => {
      setShowNotificationSettings(true);
    };

    window.addEventListener('openNotificationSettings', handleOpenNotificationSettings);
    
    return () => {
      window.removeEventListener('openNotificationSettings', handleOpenNotificationSettings);
    };
  }, []);

  const handleLogin = async () => {
    const result = await dispatch(loginWithGoogle());

    if (loginWithGoogle.fulfilled.match(result)) {
      const { migrationResult } = result.payload;

      if (migrationResult.migrated) {
        alert(
          translateUI(language, 'auth.loginMigrated', {
            count: migrationResult.phrasesCount,
          })
        );
      } else {
        alert(translateUI(language, 'auth.loginSuccess'));
      }
    } else {
      alert(translateUI(language, 'auth.loginError'));
    }
  };

  const handleLogout = () => {
    if (confirm(translateUI(language, 'auth.logoutConfirm'))) {
      dispatch(logout());
      setShowMenu(false);
    }
  };

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleKeyDownToggleMenu = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleMenu();
    } else if (e.key === 'Escape' && showMenu) {
      setShowMenu(false);
    }
  };

  const handleKeyDownLogin = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogin();
    }
  };

  const handleKeyDownLogout = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogout();
    }
  };

  const handleKeyDownNotificationSettings = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowNotificationSettings(true);
      setShowMenu(false);
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleKeyDownBackdrop = (e) => {
    if (e.key === 'Escape') {
      handleCloseMenu();
    }
  };

  if (mode === 'guest') {
    return (
      <button
        onClick={handleLogin}
        onKeyDown={handleKeyDownLogin}
        tabIndex={0}
        aria-label={translateUI(language, 'auth.loginWithGoogle')}
        disabled={loading}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all shadow-md border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn size={20} aria-hidden="true" />
        {loading
          ? translateUI(language, 'auth.loggingIn')
          : translateUI(language, 'auth.loginWithGoogle')}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleMenu}
        onKeyDown={handleKeyDownToggleMenu}
        tabIndex={0}
        aria-label={translateUI(language, 'auth.userMenuAria', { name: profile.displayName || '' })}
        aria-expanded={showMenu}
        aria-haspopup="true"
        className="flex items-center gap-3 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all shadow-md border-2 border-gray-200"
      >
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt={translateUI(language, 'auth.profilePictureAlt', { name: profile.displayName || '' })}
            className="w-8 h-8 rounded-full"
            aria-hidden="false"
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold"
            aria-hidden="true"
          >
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
            onClick={handleCloseMenu}
            onKeyDown={handleKeyDownBackdrop}
            tabIndex={0}
            aria-label={translateUI(language, 'auth.closeMenuAria')}
            role="button"
          />

          {/* Menu */}
          <div 
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 overflow-hidden"
            role="menu"
            aria-label={translateUI(language, 'auth.userMenuLabel')}
          >
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100">
              <p className="font-bold text-gray-800">{profile.displayName}</p>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>

            {/* Notification Settings */}
            <button
              onClick={() => {
                setShowNotificationSettings(true);
                setShowMenu(false);
              }}
              onKeyDown={handleKeyDownNotificationSettings}
              tabIndex={0}
              aria-label={translateUI(language, 'auth.openNotificationSettingsAria')}
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left text-gray-700 border-b border-gray-200"
            >
              <Bell size={20} className="text-purple-600" aria-hidden="true" />
              <span className="font-semibold">{translateUI(language, 'auth.notifications')}</span>
            </button>

            {/* Interface language selector */}
            <div
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-left text-gray-700 border-b border-gray-200"
              role="menuitem"
            >
              <span className="text-sm font-semibold text-gray-800">
                {translateUI(language, 'auth.language')}
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ml-auto border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={translateUI(language, 'auth.language')}
              >
                <option value="pt-BR">{translateUI(language, 'auth.portugueseBR')}</option>
                <option value="en-US">{translateUI(language, 'auth.englishUS')}</option>
              </select>
            </div>

            <button
              onClick={handleLogout}
              onKeyDown={handleKeyDownLogout}
              tabIndex={0}
              aria-label={translateUI(language, 'auth.logout')}
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
            >
              <LogOut size={20} aria-hidden="true" />
              <span className="font-semibold">{translateUI(language, 'auth.logout')}</span>
            </button>
          </div>
        </>
      )}

      {/* Modal Backup */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <BackupManager onBack={() => setShowBackupModal(false)} />
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <NotificationSettings onBack={() => setShowNotificationSettings(false)} />
        </div>
      )}
    </div>
  );
};

export default AuthButton;