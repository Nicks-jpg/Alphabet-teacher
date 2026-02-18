import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UKRAINIAN_ALPHABET, ExtendedLetter } from '../constants';
import { LetterCard } from './LetterCard';
import { speakUkrainian, unlockAudio, getSettings } from '../services/speechService';

export const RecallMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const letters = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    let pool: ExtendedLetter[] = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    for (let i = 0; i < 3; i++) pool = [...pool, ...priorityItems];

    let result: ExtendedLetter[] = [];
    while (result.length < limit) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      result = [...result, ...shuffled];
    }
    return result.slice(0, limit);
  }, [settings.sessionLimit, settings.priorityLetters]);

  const currentLetter = letters[currentIdx];

  const handleNext = useCallback(async () => {
    await unlockAudio();
    if (currentIdx < letters.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(7);
      setIsSpeaking(false);
    } else {
      onBack(); 
    }
  }, [currentIdx, letters.length, onBack]);

  const handleManualSpeak = async () => {
    await unlockAudio();
    speakUkrainian(currentLetter.char, currentLetter.pronunciation);
  };

  useEffect(() => {
    let timer: number;
    if (timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSpeaking) {
      setIsSpeaking(true);
      speakUkrainian(currentLetter.char, currentLetter.pronunciation);
    }
    return () => clearInterval(timer);
  }, [timeLeft, currentLetter.char, currentLetter.pronunciation, isSpeaking]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 bg-blue-50">
      <div className="w-full max-w-2xl flex justify-between items-center bg-white/80 p-4 rounded-3xl shadow-sm">
        <button 
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-black transition-all active:scale-95"
        >
          ← Вийти
        </button>
        <div className="text-2xl font-black text-blue-600">
          Буква {currentIdx + 1} з {letters.length}
        </div>
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="relative">
          <LetterCard letter={currentLetter.char} isDifficult={currentLetter.isDifficult} />
          
          {timeLeft > 0 ? (
            <div className="absolute -top-6 -right-6 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-xl animate-pulse">
              {timeLeft}
            </div>
          ) : (
            <button 
              onClick={handleManualSpeak}
              className="absolute -top-6 -right-6 bg-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce hover:scale-110 transition-all cursor-pointer text-3xl"
            >
              🔊
            </button>
          )}
        </div>

        <div className="text-center space-y-4 px-4">
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Назви букву вголос!</h2>
          <div className="h-12 flex items-center justify-center">
            {timeLeft > 0 ? (
              <p className="text-blue-400 font-bold text-lg">Підказка з'явиться за мить...</p>
            ) : (
              <p className="text-green-600 font-black text-2xl animate-pop-in">
                Це буква "{currentLetter.char}"
              </p>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full max-w-md bg-green-500 hover:bg-green-600 text-white text-3xl py-6 rounded-3xl font-black shadow-2xl border-b-8 border-green-700 transform active:translate-y-2 transition-all mb-4"
      >
        {currentIdx < letters.length - 1 ? 'ДАЛІ ➔' : 'ЗАВЕРШИТИ 🏁'}
      </button>
    </div>
  );
};