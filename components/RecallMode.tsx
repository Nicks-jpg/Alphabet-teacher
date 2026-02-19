import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { LetterCard } from './LetterCard';
import { speakUkrainian, unlockAudio, getSettings } from '../services/speechService';
import { ExtendedLetter } from '../types';

export const RecallMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState<number>(5); // Початкове значення таймера

  // Формування черги запитань
  const queue = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '').split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

    // Створюємо пул з вищим пріоритетом для вибраних літер
    let pool: ExtendedLetter[] = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    // Додаємо пріоритетні літери декілька разів, щоб збільшити ймовірність їх появи
    for (let i = 0; i < 3; i++) pool = [...pool, ...priorityItems];

    // Перемішуємо і беремо ліміт
    return pool.sort(() => Math.random() - 0.5).slice(0, limit);
  }, [settings]);

  const currentItem = queue[currentIndex];

  const playSound = useCallback(async () => {
    await unlockAudio();
    if (currentItem) {
      speakUkrainian(currentItem.char, currentItem.pronunciation);
    }
  }, [currentItem]);

  // Таймер для автоматичного показу відповіді
  useEffect(() => {
    setIsRevealed(false);
    setTimer(5); // Скидаємо таймер при зміні картки

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!isRevealed) {
              setIsRevealed(true);
              playSound();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, playSound]); // Видалено isRevealed з залежностей, щоб уникнути зайвих ререндерів/циклів

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    setTimer(0);
    playSound();
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-yellow-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border-4 border-yellow-200">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-3xl font-bold text-yellow-600 mb-4">Молодець!</h2>
          <p className="text-xl text-slate-600 mb-8">
            Ти повторив {queue.length} букв!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Повернутися в меню 🏠
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={onBack} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600">Назад</button>
        <div className="text-xl font-bold text-yellow-600">Вчимо букви 📚</div>
        <div className="text-sm font-bold text-slate-400">{currentIndex + 1}/{queue.length}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <div className="mb-8 relative">
           <LetterCard
             letter={currentItem.char}
             size="lg"
             isDifficult={currentItem.isDifficult}
           />

           {!isRevealed && timer > 0 && (
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg animate-pulse">
               {timer}
             </div>
           )}
        </div>

        <div className="h-32 flex flex-col items-center justify-center mb-8 text-center">
          {isRevealed ? (
            <div className="animate-fade-in">
              <p className="text-4xl font-bold text-slate-700 mb-2">{currentItem.pronunciation}</p>
              <p className="text-xl text-slate-500">"{currentItem.word}"</p>
            </div>
          ) : (
            <p className="text-xl font-bold text-slate-400 animate-pulse">Назви букву...</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-4">
          {!isRevealed ? (
            <button
              onClick={handleReveal}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg text-xl transition-all active:scale-95"
            >
              Перевірити (Показати) 👀
            </button>
          ) : (
            <div className="flex gap-4 w-full">
              <button
                onClick={playSound}
                className="flex-1 bg-blue-100 text-blue-600 font-bold py-5 rounded-2xl shadow-md text-xl hover:bg-blue-200 active:scale-95"
              >
                🔊 Ще раз
              </button>
              <button
                onClick={handleNext}
                className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-lg text-xl transition-all active:scale-95"
              >
                Наступна ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
