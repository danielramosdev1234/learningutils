import React from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { useUILanguage } from '../../context/LanguageContext.jsx';

export const ErrorScreen = ({ error, onRetry }) => {
  const { language } = useUILanguage();
  const t = (pt, en) => (language === 'en-US' ? en : pt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <XCircle className="text-red-500 mx-auto mb-4" size={56} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Ops!', 'Oops!')}</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors mx-auto font-semibold"
        >
          <RefreshCw size={20} />
          {t('Tentar novamente', 'Try Again')}
        </button>
      </div>
    </div>
  );
};