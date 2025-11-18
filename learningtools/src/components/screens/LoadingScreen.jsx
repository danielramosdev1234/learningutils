import React from 'react';
import { Loader } from 'lucide-react';
import { useUILanguage } from '../../context/LanguageContext.jsx';

export const LoadingScreen = () => {
  const { language } = useUILanguage();
  const t = (pt, en) => (language === 'en-US' ? en : pt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
        <p className="text-xl text-gray-700 font-semibold">{t('Carregando frases...', 'Loading phrases...')}</p>
      </div>
    </div>
  );
};