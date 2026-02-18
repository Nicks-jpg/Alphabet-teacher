import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { LetterCard } from './LetterCard';
import { speakUkrainian, unlockAudio, getSettings } from '../services/speechService';

export const RecallMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Генеруємо чергу відповідно до ліміту та пріоритетів
  const letters = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    // Створюємо "кошик" літер
    // Пріоритетні додаємо по 4 рази, інші по одному
    let pool = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    
    // Додаємо додаткові копії пріоритетних букв
    for (let i = 0; i < 3; i++) {
      pool = [...pool, ...priorityItems];
    }

    let result = [];
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="w-full max-w-md flex justify-between items-center px-4">
        <button 
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold transition-colors"
        >
          Назад
        </button>
        <div className="text-xl font-bold text-blue-600">
          Буква {currentIdx + 1} з {letters.length}
        </div>
      </div>

      <div className="relative">
        <LetterCard letter={currentLetter.char} isDifficult={currentLetter.isDifficult} />
        
        {timeLeft > 0 ? (
          <div className="absolute -top-4 -right-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-md animate-pulse">
            {timeLeft}
          </div>
        ) : (
          <button 
            onClick={handleManualSpeak}
            className="absolute -top-4 -right-4 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce hover:scale-110 transition-transform cursor-pointer"
          >
            🔊
          </button>
        )}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-700">Назви букву вголос!</h2>
        <p className="text-gray-500 max-w-xs h-8">
          {timeLeft > 0 
            ? `Підказка з'явиться через ${timeLeft} сек...` 
            : `Це буква "${currentLetter.char}" (${currentLetter.pronunciation})`}
        </p>
      </div>

      <button 
        onClick={handleNext}
        className="bg-green-500 hover:bg-green-600 text-white text-2xl px-12 py-4 rounded-2xl font-bold shadow-lg transform active:scale-95 transition-all"
      >
        {currentIdx < letters.length - 1 ? 'Наступна буква ➔' : 'Завершити 🏁'}
      </button>
    </div>
  );
};