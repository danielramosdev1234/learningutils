import React from 'react';
import { Loader } from 'lucide-react';
import { useUILanguage } from '../../context/LanguageContext.jsx';

export const LoadingSpinner = ({ 
  size = 'md', 
  text,
  fullScreen = false,
  className = ''
}) => {
  const { language } = useUILanguage();
  const t = (pt, en) => (language === 'en-US' ? en : pt);
  const displayText = text ?? t('Carregando...', 'Loading...');
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader 
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        aria-label={t('Carregando', 'Loading')}
        role="status"
      />
      {displayText && (
        <p className="mt-2 text-gray-600 font-medium">{displayText}</p>
      )}
      <span className="sr-only">{t('Carregando conteúdo', 'Loading content')}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

