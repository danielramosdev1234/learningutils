import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { PhraseCard } from './PhraseCard';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { PhraseRepository } from '../services/phraseRepository';
import { Analytics } from '@vercel/analytics/react';

<Analytics />


const ChunkTrainer = () => {
  const [phrases, setPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('learnfun_current_phrase_index');
    return saved ? parseInt(saved) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jumpToInput, setJumpToInput] = useState('');
  const { speak } = useTextToSpeech();

  useEffect(() => {
    loadPhrases();
  }, []);

// Salva o índice atual sempre que mudar
useEffect(() => {
  localStorage.setItem('learnfun_current_phrase_index', currentIndex);
  console.log('💾 Progress saved: phrase', currentIndex + 1);
}, [currentIndex]);

  const loadPhrases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PhraseRepository.fetchPhrases();

      if (data.length === 0) {
        setError('No phrases found. Please add phrases to Firebase.');
      } else {
        setPhrases(data);
      }
    } catch (err) {
      setError('Failed to load phrases. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPhrase = () => {
    setCurrentIndex((prev) => (prev + 1) % phrases.length);
  };

  const handleCorrectAnswer = () => {
    console.log('✅ Correct answer! Moving to next phrase...');
   // setTimeout(() => {
    //  handleNextPhrase();
    //}, 5000); // 5 segundos para ver o feedback
  };

  const handleJumpToPhrase = (e) => {
    e.preventDefault();
    const targetPhrase = parseInt(jumpToInput);

    if (isNaN(targetPhrase) || targetPhrase < 1 || targetPhrase > phrases.length) {
      alert(`Please enter a number between 1 and ${phrases.length}`);
      return;
    }

    setCurrentIndex(targetPhrase - 1);
    setJumpToInput('');
    console.log(`🎯 Jumped to phrase ${targetPhrase}`);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadPhrases} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            English Pronunciation Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Listen, speak, and improve your English!
          </p>
        </div>

        {phrases.length > 0 && (
          <>
            {/* KEY AQUI! Força recriação do componente */}
            <PhraseCard
              key={`phrase-${currentIndex}-${phrases[currentIndex]?.id || currentIndex}`}
              phrase={phrases[currentIndex]}
              onSpeak={speak}
              onCorrectAnswer={handleCorrectAnswer}
              isActive={true}
            />

            {/* Navigation Section */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

                {/* Jump to Phrase Input */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-gray-700 font-semibold whitespace-nowrap">Phrase</span>

                  <form onSubmit={handleJumpToPhrase} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={phrases.length}
                      value={jumpToInput}
                      onChange={(e) => setJumpToInput(e.target.value)}
                      placeholder={String(currentIndex + 1)}
                      className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-bold text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    />
                    <span className="text-gray-700 font-semibold">of {phrases.length}</span>

                    {jumpToInput && (
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                      >
                        <ArrowRight size={18} />
                        Go
                      </button>
                    )}
                  </form>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPhrase}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-semibold w-full sm:w-auto justify-center"
                >
                  <RefreshCw size={20} />
                  Next Phrase
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
                  />
                </div>
                <p className="text-center text-gray-600 text-sm font-semibold mt-2">
                  {Math.round(((currentIndex + 1) / phrases.length) * 100)}% completed
                  ({currentIndex + 1} / {phrases.length})
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChunkTrainer;