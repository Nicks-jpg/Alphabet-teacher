import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { speakUkrainian, checkDrawing, unlockAudio, getSettings } from '../services/speechService';
import { LetterCard } from './LetterCard';

export const WriteMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Використовуємо ref для синхронного стану малювання
  const isDrawingRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const quizQueue = useMemo(() => {
    const limit = settings.sessionLimit || 33;
    const priorities = (settings.priorityLetters || '').split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    let pool = [...UKRAINIAN_ALPHABET];
    const priorityItems = UKRAINIAN_ALPHABET.filter(l => priorities.includes(l.char));
    for (let i = 0; i < 3; i++) pool = [...pool, ...priorityItems];
    return [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
  }, [settings.sessionLimit, settings.priorityLetters]);

  const currentLetter = quizQueue[currentIndex];

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid removed as per user request to "simply draw on white background"
    // and to prevent the "thick grid" bug.
    
    ctx.beginPath();
    setFeedback('idle');
    setShowAnswer(false);
  };

  const playSound = useCallback(async () => {
    await unlockAudio();
    if (currentLetter) {
      speakUkrainian(currentLetter.char, currentLetter.pronunciation);
    }
  }, [currentLetter]);

  useEffect(() => {
    if (currentLetter) {
      playSound();
      clearCanvas();
    }
  }, [currentIndex, playSound]);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (showAnswer || isChecking) return;
    isDrawingRef.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#334155';

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y); // Draw dot
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || showAnswer || isChecking) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Для плавних ліній не робимо beginPath/moveTo на кожен крок,
    // але якщо це потрібно для сумісності з попереднім кодом:
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || showAnswer) return;
    
    setIsChecking(true);
    const imageData = canvas.toDataURL('image/png');
    const isCorrect = await checkDrawing(imageData, currentLetter.char);
    
    setIsChecking(false);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < quizQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onBack();
    }
  };

  const handleRetry = () => {
    clearCanvas();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button onClick={onBack} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600">Назад</button>
        <div className="text-xl font-bold text-purple-600">Слухай і пиши ✍️</div>
        <div className="text-sm font-bold text-slate-400">{currentIndex + 1}/{quizQueue.length}</div>
      </div>

      <div className="mb-6">
        <button 
          onClick={playSound}
          disabled={isChecking}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <span className="text-3xl">🔊</span> Послухати ще раз
        </button>
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-200">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`touch-none ${showAnswer ? 'cursor-default' : 'cursor-crosshair'}`}
        />
        
        {showAnswer && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center animate-pop-in pointer-events-none">
            <div className="mb-4">
              <LetterCard letter={currentLetter.char} size="lg" isDifficult={currentLetter.isDifficult} />
            </div>
            <div className={`px-8 py-3 rounded-full font-bold text-white shadow-xl text-xl ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
               {feedback === 'correct' ? 'Правильно! 🌟' : 'Спробуй ще! 🔄'}
            </div>
          </div>
        )}
        
        {isChecking && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-blue-600 text-lg">Система перевіряє...</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full max-w-md">
        {!showAnswer ? (
          <>
            <button
              onClick={clearCanvas}
              disabled={isChecking}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-5 rounded-2xl shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Стерти 🧹
            </button>
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="flex-1 bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              Перевірити ✅
            </button>
          </>
        ) : (
          <>
            {feedback === 'incorrect' ? (
              <button
                onClick={handleRetry}
                className="flex-1 bg-orange-500 text-white font-bold py-5 rounded-2xl shadow-lg animate-pulse text-lg"
              >
                Стерти і спробувати ще 🔄
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-green-500 text-white font-bold py-5 rounded-2xl shadow-lg text-lg transform active:scale-95"
              >
                Наступна буква ➔
              </button>
            )}
          </>
        )}
      </div>

      <p className="mt-6 text-slate-400 text-center text-sm font-medium">
        {showAnswer 
          ? `Порівняй свій малюнок з буквою "${currentLetter.char}"`
          : "Намалюй букву, яку ти почув, пальцем на полі"}
      </p>
    </div>
  );
};