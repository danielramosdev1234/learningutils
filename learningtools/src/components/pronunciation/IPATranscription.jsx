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


      {/* IPA Text */}
      <div className="bg-white p-2.5 rounded border border-purple-150 mb-2">
        <p className="text-lg sm:text-xl md:text-2xl font-mono text-purple-800 leading-relaxed">
          /{ipaText}/
        </p>
      </div>

      {/* Explanation */}
            <div className="flex items-start gap-2 text-sm text-purple-700">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <strong>IPA</strong> Shows the exact pronunciation.
              </p>
            </div>


    </div>
  );
};