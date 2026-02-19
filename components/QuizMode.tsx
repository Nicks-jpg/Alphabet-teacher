import React, { useState, useMemo } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { LetterCard } from './LetterCard';
import { getSettings } from '../services/speechService';
import { ExtendedLetter } from '../types';

export const QuizMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const questions = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '').split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    
    // Create pool with higher weight for priority letters
    let pool: ExtendedLetter[] = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    for (let i = 0; i < 3; i++) pool = [...pool, ...priorityItems];
    
    // Shuffle and pick limit
    pool = pool.sort(() => Math.random() - 0.5).slice(0, limit);
    
    return pool.map((target) => {
      const options = [target];
      while (options.length < 3) {
        const random = UKRAINIAN_ALPHABET[Math.floor(Math.random() * UKRAINIAN_ALPHABET.length)];
        if (!options.find(o => o.char === random.char)) {
          options.push(random);
        }
      }
      return {
        target,
        options: options.sort(() => Math.random() - 0.5)
      };
    });
  }, [settings]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].target.char;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      // Play success sound
    } else {
      // Play error sound
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border-4 border-purple-100">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-purple-600 mb-4">Чудова робота!</h2>
          <p className="text-xl text-slate-600 mb-8">
            Ти знаєш {score} з {questions.length} букв!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Повернутися в меню 🏠
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={onBack} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600">Назад</button>
        <div className="text-xl font-bold text-purple-600">Вікторина 🎯</div>
        <div className="text-sm font-bold text-slate-400">{currentQuestion + 1}/{questions.length}</div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-700 mb-4">Знайди букву:</h2>
        <div className="text-6xl font-black text-purple-600 bg-white w-32 h-32 flex items-center justify-center rounded-3xl shadow-xl mx-auto border-4 border-purple-100 transform hover:scale-105 transition-transform">
          {question.target.char}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {question.options.map((option) => (
          <button
            key={option.char}
            onClick={() => handleAnswer(option.char)}
            disabled={selectedAnswer !== null}
            className={`
              p-6 rounded-2xl text-2xl font-bold flex items-center justify-between shadow-md transition-all transform active:scale-95
              ${selectedAnswer === null
                ? 'bg-white hover:bg-purple-50 text-slate-700 border-2 border-slate-100'
                : selectedAnswer === option.char
                  ? isCorrect
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'bg-red-100 border-2 border-red-500 text-red-700'
                  : option.char === question.target.char
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'opacity-50 bg-slate-50'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <img
                src={option.image}
                alt={option.word}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <span className="capitalize">{option.word}</span>
            </div>
            {selectedAnswer === option.char && (
              <span className="text-3xl">{isCorrect ? '✅' : '❌'}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};