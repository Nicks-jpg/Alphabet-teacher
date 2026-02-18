import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { speakUkrainian, checkDrawing, unlockAudio, getSettings } from '../services/speechService';
import { LetterCard } from './LetterCard';

export const WriteMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
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
    
    // Малюємо сітку для орієнтиру (як у зошиті)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 50; i < canvas.width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
    for (let i = 50; i < canvas.height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
    ctx.stroke();
    
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (showAnswer || isChecking) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || showAnswer || isChecking) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
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
    setShowAnswer(true); // Показуємо правильну букву після перевірки
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

      <div className="mb-6 flex gap-3">
        <button 
          onClick={playSound}
          disabled={isChecking}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-2xl">🔊</span> Послухати ще раз
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
        
        {/* Оверлей з правильною відповіддю */}
        {showAnswer && (
          <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center animate-pop-in pointer-events-none">
            <div className="scale-125">
               <LetterCard letter={currentLetter.char} size="lg" isDifficult={currentLetter.isDifficult} />
            </div>
            <div className={`mt-4 px-6 py-2 rounded-full font-bold text-white shadow-lg ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
               {feedback === 'correct' ? 'Чудово! 🌟' : 'Спробуй ще! 🔄'}
            </div>
          </div>
        )}
        
        {isChecking && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-blue-600">Перевіряю...</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full max-w-md">
        {!showAnswer ? (
          <>
            <button
              onClick={clearCanvas}
              disabled={isChecking}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Стерти 🧹
            </button>
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              Готово! ✅
            </button>
          </>
        ) : (
          <>
            {feedback === 'incorrect' ? (
              <button
                onClick={handleRetry}
                className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg animate-pulse"
              >
                Спробувати ще 🔄
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg"
              >
                Наступна ➔
              </button>
            )}
          </>
        )}
      </div>

      {!showAnswer && (
        <p className="mt-6 text-slate-400 text-center text-sm">
          Намалюй букву, яку ти почув, пальцем на полі вище
        </p>
      )}
      
      {showAnswer && feedback === 'incorrect' && (
        <p className="mt-4 text-slate-600 text-center text-sm font-medium">
          Подивись, як пишеться буква <span className="font-bold text-blue-600">"{currentLetter.char}"</span> і спробуй ще раз!
        </p>
      )}
    </div>
  );
};