import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Carregando...',
  fullScreen = false,
  className = ''
}) => {
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
        aria-label="Carregando"
        role="status"
      />
      {text && (
        <p className="mt-2 text-gray-600 font-medium">{text}</p>
      )}
      <span className="sr-only">Carregando conteúdo</span>
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

