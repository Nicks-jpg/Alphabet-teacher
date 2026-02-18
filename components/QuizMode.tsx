import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UKRAINIAN_ALPHABET, ExtendedLetter } from '../constants';
import { speakUkrainian, unlockAudio, getSettings } from '../services/speechService';

export const QuizMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  
  // Генеруємо чергу відповідно до ліміту та пріоритетів
  const quizQueue = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    let pool: ExtendedLetter[] = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    
    // Додаємо додаткові копії пріоритетних букв (4x вага)
    for (let i = 0; i < 3; i++) {
      pool = [...pool, ...priorityItems];
    }

    let result: ExtendedLetter[] = [];
    while (result.length < limit) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      result = [...result, ...shuffled];
    }
    return result.slice(0, limit);
  }, [settings.sessionLimit, settings.priorityLetters]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetChar, setTargetChar] = useState<string>('');
  const [targetPron, setTargetPron] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const generateQuiz = useCallback(async (index: number) => {
    if (index >= quizQueue.length) return;
    
    await unlockAudio();
    const letter = quizQueue[index];
    
    const others = UKRAINIAN_ALPHABET
      .filter(l => l.char !== letter.char)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(l => l.char);
    
    setTargetChar(letter.char);
    setTargetPron(letter.pronunciation);
    
    const allOptions = [...others.slice(0, 5), letter.char].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelected(null);
    
    speakUkrainian(letter.char, letter.pronunciation);
  }, [quizQueue]);

  useEffect(() => {
    generateQuiz(currentIndex);
  }, [currentIndex, generateQuiz]);

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === targetChar) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quizQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onBack();
    }
  };

  const repeatSound = async () => {
    await unlockAudio();
    speakUkrainian(targetChar, targetPron);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="w-full max-w-md flex justify-between items-center px-4">
        <button 
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold"
        >
          Назад
        </button>
        <div className="flex flex-col items-end">
          <div className="text-xl font-bold text-purple-600">
            Рахунок: {score}
          </div>
          <div className="text-xs text-gray-400">
            Буква {currentIndex + 1} з {quizQueue.length}
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">Яку букву ти чуєш?</h2>
        <button 
          onClick={repeatSound}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-6 rounded-full transition-colors text-4xl shadow-inner active:scale-95"
        >
          📢 Повторити
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            className={`
              w-24 h-24 rounded-2xl text-4xl font-bold flex items-center justify-center shadow-md transition-all transform
              ${!selected ? 'bg-white hover:scale-105 border-b-4 border-gray-300' : ''}
              ${selected === opt && opt === targetChar ? 'bg-green-500 text-white scale-110' : ''}
              ${selected === opt && opt !== targetChar ? 'bg-red-500 text-white opacity-50' : ''}
              ${selected && opt === targetChar ? 'bg-green-500 text-white ring-4 ring-green-200' : ''}
              ${selected && opt !== targetChar && selected !== opt ? 'bg-white opacity-50' : ''}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={nextQuestion}
          className="mt-8 bg-purple-500 hover:bg-purple-600 text-white text-xl px-12 py-4 rounded-2xl font-bold shadow-lg animate-bounce"
        >
          {currentIndex < quizQueue.length - 1 ? 'Далі ➔' : 'Завершити 🏁'}
        </button>
      )}
    </div>
  );
};