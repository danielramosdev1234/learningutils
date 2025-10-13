import { useState, useEffect } from 'react';
import { languageNames } from '../utils/translations';

export const useVoices = () => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        const languageMap = {};
        voices.forEach(voice => {
          const langCode = voice.lang;
          if (!languageMap[langCode]) {
            const displayName = languageNames[langCode] || langCode;
            languageMap[langCode] = {
              code: langCode,
              name: voice.name,
              localName: displayName,
              voices: []
            };
          }
          languageMap[langCode].voices.push(voice);
        });

        const languageArray = Object.values(languageMap).sort((a, b) =>
          a.localName.localeCompare(b.localName)
        );

        setAvailableVoices(languageArray);
        setLoadingVoices(false);
      }
    };

    loadVoices();

    const timeout = setTimeout(() => {
      loadVoices();
      setLoadingVoices(false);
    }, 100);

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => clearTimeout(timeout);
  }, []);

  return { availableVoices, loadingVoices };
};