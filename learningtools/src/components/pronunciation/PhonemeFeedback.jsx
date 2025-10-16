// src/components/pronunciation/PhonemeFeedback.jsx

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { usePhonemeAnalysis } from '../../hooks/usePhonemeAnalysis';

/**
 * Componente que mostra feedback detalhado palavra por palavra
 */
export const PhonemeFeedback = ({ expectedText, spokenText }) => {
  const { analyze } = usePhonemeAnalysis();

  if (!expectedText || !spokenText) return null;

  const analysis = analyze(expectedText, spokenText);

  if (!analysis) return null;

  const { wordAnalysis, feedback, tips, accuracy } = analysis;

  return (
    <div className="mt-6 space-y-4 animate-fadeIn">
      {/* Overall Feedback Banner */}
      <div className={`p-4 rounded-xl border-2 ${
        feedback.level === 'excellent' || feedback.level === 'great'
          ? 'bg-green-50 border-green-300'
          : feedback.level === 'good' || feedback.level === 'fair'
          ? 'bg-blue-50 border-blue-300'
          : 'bg-orange-50 border-orange-300'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{feedback.emoji}</span>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">
              {feedback.message}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Accuracy: <span className="font-bold">{accuracy}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Word-by-Word Analysis */}
      <div className="bg-white p-5 rounded-xl shadow-md border-2 border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-blue-600" />
          Word-by-Word Analysis
        </h4>

        <div className="flex flex-wrap gap-2">
          {wordAnalysis.map((word, index) => {
            let colorClass = '';
            let icon = null;

            if (word.confidence >= 80) {
              colorClass = 'bg-green-100 border-green-400 text-green-800';
              icon = <CheckCircle size={14} className="text-green-600" />;
            } else if (word.confidence >= 60) {
              colorClass = 'bg-yellow-100 border-yellow-400 text-yellow-800';
              icon = <AlertCircle size={14} className="text-yellow-600" />;
            } else {
              colorClass = 'bg-red-100 border-red-400 text-red-800';
              icon = <XCircle size={14} className="text-red-600" />;
            }

            return (
              <div
                key={index}
                className={`px-4 py-3 rounded-lg border-2 ${colorClass} transition-all hover:scale-105 cursor-default`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {icon}
                  <span className="font-bold text-base">{word.expected}</span>
                </div>

                <div className="text-xs mt-1 space-y-0.5">
                  {word.isCorrect ? (
                    <div className="font-semibold">✓ Perfect!</div>
                  ) : (
                    <div>
                      You said: <span className="font-semibold">
                        {word.spoken || '(not detected)'}
                      </span>
                    </div>
                  )}
                  <div className="opacity-75">
                    Confidence: {word.confidence}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="font-semibold text-gray-700 mb-2">Legend:</div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></span>
                <span>Excellent (≥80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-600" />
                <span className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></span>
                <span>Good (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-red-600" />
                <span className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></span>
                <span>Needs Practice (&lt;60%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pronunciation Tips */}
      {tips.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl shadow-md border-2 border-amber-300">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-600" />
            Pronunciation Tips
          </h4>

          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-70 p-4 rounded-lg border border-amber-200"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 text-amber-800 font-mono font-bold px-3 py-1 rounded text-lg">
                    {tip.phoneme}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Sound:</strong> {tip.sound}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Tip:</strong> {tip.tip}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Example in phrase:</strong> "{tip.example}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};