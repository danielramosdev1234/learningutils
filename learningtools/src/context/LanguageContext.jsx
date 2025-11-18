import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Idiomas suportados na UI (não mexe nas frases dos JSON de treino)
export const SUPPORTED_LANGUAGES = {
  'pt-BR': {
    code: 'pt-BR',
    label: 'Português (BR)'
  },
  'en-US': {
    code: 'en-US',
    label: 'English (US)'
  }
};

const DEFAULT_LANGUAGE = 'pt-BR';
const STORAGE_KEY = 'learnfun_ui_language';

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  // Carrega idioma salvo no localStorage ou usa o padrão PT-BR (independente do idioma do navegador)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES[saved]) {
        setLanguageState(saved);
        return;
      }
    } catch (err) {
      console.warn('Não foi possível ler idioma do localStorage:', err);
    }

    // Se não houver preferência salva, mantém PT-BR como padrão
    setLanguageState(DEFAULT_LANGUAGE);
  }, []);

  const setLanguage = (lang) => {
    const normalized = SUPPORTED_LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
    setLanguageState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch (err) {
      console.warn('Não foi possível salvar idioma no localStorage:', err);
    }
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useUILanguage = () => {
  return useContext(LanguageContext);
};
