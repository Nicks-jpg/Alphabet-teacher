import React, { useState, useMemo, useEffect } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { speakUkrainian, getSettings } from '../services/speechService';
import { ExtendedLetter } from '../types';
import { CompletionScreen } from './CompletionScreen';

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
    const confusingPairs = (settings.confusingPairs || '').split(',').map(s => s.trim().split('-').map(l => l.toUpperCase().trim()));

    // 1. Create pool with higher weight for priority letters
    let pool: ExtendedLetter[] = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    for (let i = 0; i < 3; i++) pool = [...pool, ...priorityItems];
    
    // 2. Shuffle and pick limit
    pool = pool.sort(() => Math.random() - 0.5).slice(0, limit);

    return pool.map((target) => {
      let options: ExtendedLetter[] = [target];

      // 3. Add confusing pair if exists
      const pair = confusingPairs.find(p => p.includes(target.char));
      if (pair) {
        const otherChar = pair.find(c => c !== target.char);
        const distractor = UKRAINIAN_ALPHABET.find(l => l.char === otherChar);
        if (distractor && !options.find(o => o.char === distractor.char)) {
          options.push(distractor);
        }
      }

      // 4. Fill rest with random letters up to 6
      while (options.length < 6) {
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

  const question = questions[currentQuestion];

  useEffect(() => {
    if (question && !selectedAnswer) {
      // Play sound automatically on new question
      speakUkrainian(question.target.char, question.target.pronunciation);
    }
  }, [currentQuestion, question, selectedAnswer]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === question.target.char;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
      // Success logic (could play a chime)
    } else {
      // Failure logic (could play a buzz)
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

  const playSound = () => {
    speakUkrainian(question.target.char, question.target.pronunciation);
  };

  if (showResult) {
    return <CompletionScreen onBack={onBack} score={score} total={questions.length} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-green-50">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <button onClick={onBack} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600">Назад</button>
        <div className="text-xl font-bold text-green-600">Впізнай букву 🎯</div>
        <div className="text-sm font-bold text-slate-400">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-3 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={playSound}
          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold p-8 rounded-full shadow-lg transition-transform active:scale-95 border-4 border-green-200 animate-pulse"
        >
          <span className="text-6xl">🔊</span>
        </button>
        <p className="mt-4 text-slate-500 font-medium">Натисніть, щоб почути букву ще раз</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.char;
          const isTarget = option.char === question.target.char;

          let btnClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";

          if (selectedAnswer) {
            if (isTarget) {
              btnClass = "bg-green-500 border-green-600 text-white shadow-green-200 transform scale-105";
            } else if (isSelected && !isTarget) {
              btnClass = "bg-red-500 border-red-600 text-white shadow-red-200 opacity-50";
            } else {
              btnClass = "bg-slate-100 text-slate-300 border-transparent";
            }
          }

          return (
            <button
              key={option.char}
              onClick={() => handleAnswer(option.char)}
              disabled={selectedAnswer !== null}
              className={`
                h-32 md:h-40 rounded-3xl text-6xl md:text-7xl font-black border-b-8 shadow-xl transition-all duration-300
                ${btnClass}
              `}
            >
              {option.char}
            </button>
          );
        })}
      </div>
    </div>
  );
};
