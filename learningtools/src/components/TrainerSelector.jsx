import React, { useState } from 'react';
import { Hash, Palette } from 'lucide-react';
import NumberSpeechTrainer from './NumberSpeechTrainer';
import ColorSpeechTrainer from './ColorSpeechTrainer';
import ChunkTrainer from './ChunkTrainer';
import { Mic } from 'lucide-react';


export default function TrainerSelector() {
  const [activeTrainer, setActiveTrainer] = useState('chunk'); // 'numbers' ou 'chunk'

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center gap-4 py-4">

            <button
              onClick={() => setActiveTrainer('chunk')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTrainer === 'chunk'
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="w-5 h-5" />
              Speak Chunk Trainer
            </button>
             <button
                          onClick={() => setActiveTrainer('numbers')}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeTrainer === 'numbers'
                              ? 'bg-blue-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Hash className="w-5 h-5" />
                          Number Trainer
                        </button>
          </div>
        </div>
      </nav>

      {/* Active Trainer Component */}
      <div className="transition-opacity duration-300">
        {activeTrainer === 'chunk' ? (
          <ChunkTrainer />
        ) : (
          <NumberSpeechTrainer />
        )}
      </div>
    </div>
  );
}