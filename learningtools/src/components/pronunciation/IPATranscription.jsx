// src/components/pronunciation/IPATranscription.jsx

import React from 'react';
import { Info } from 'lucide-react';
import { useIPAConverter } from '../../hooks/useIPAConverter';

/**
 * Componente que mostra a transcriÃ§Ã£o fonÃ©tica IPA de um texto
 */
export const IPATranscription = ({ text, show }) => {
  const { convertToIPA, getCoverage } = useIPAConverter();

  if (!text) return null;

  const ipaText = convertToIPA(text);
  const coverage = getCoverage(text);

  return (
    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-purple-700 font-semibold text-sm">
            IPA
          </span>
          <Info size={14} className="text-purple-400" />
        </div>

        {/* Coverage indicator */}
        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
          {coverage}%
        </div>
      </div>

      {/* IPA Text */}
      <div className="bg-white p-2.5 rounded border border-purple-150 mb-2">
        <p className="text-2xl font-mono text-purple-800 leading-relaxed">
          /{ipaText}/
        </p>
      </div>

      {/* Explanation */}
            <div className="flex items-start gap-2 text-sm text-purple-700">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <strong>IPA</strong> (International Phonetic Alphabet) shows the exact pronunciation.
                Each symbol represents a specific sound.
              </p>
            </div>

      {/* Low coverage warning */}
      {coverage < 50 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <strong>Nota:</strong> Algumas palavras ainda não têm tradução IPA.
        </div>
      )}
    </div>
  );
};