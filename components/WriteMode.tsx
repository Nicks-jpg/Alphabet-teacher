import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UKRAINIAN_ALPHABET } from '../constants';
import { speakUkrainian, checkDrawing, unlockAudio, getSettings } from '../services/speechService';
import { LetterCard } from './LetterCard';
import { CompletionScreen } from './CompletionScreen';

export const WriteMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useMemo(() => getSettings(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Використовуємо ref для синхронного стану малювання
  const isDrawingRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

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
    
    // Малюємо ледь помітну сітку (#f1f5f9)
    ctx.beginPath();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    // Вертикальні лінії
    for (let x = 50; x < canvas.width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    // Горизонтальні лінії
    for (let y = 50; y < canvas.height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
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
      // Невелика затримка, щоб DOM встиг оновитися перед малюванням сітки
      setTimeout(clearCanvas, 10);
    }
  }, [currentIndex, playSound]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (showAnswer || isChecking) return;
    isDrawingRef.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b'; // Темно-синій колір для контрасту

    const { x, y } = getCoordinates(e);
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

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Для згладжування ліній
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || showAnswer) return;
    
    setIsChecking(true);

    // Створюємо тимчасовий канвас з білим фоном для ШІ
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Заливаємо білим
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Малюємо поверх зображення з основного канвасу
      tempCtx.drawImage(canvas, 0, 0);
    }

    const imageData = tempCanvas.toDataURL('image/png');
    const isCorrect = await checkDrawing(imageData, currentLetter.char);
    
    setIsChecking(false);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore(s => s + 1);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < quizQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    clearCanvas();
  };

  if (showResult) {
    return <CompletionScreen onBack={onBack} score={score} total={quizQueue.length} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-50">
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button onClick={onBack} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600">Назад</button>
        <div className="text-xl font-bold text-purple-600">Слухай і пиши ✍️</div>
        <div className="text-sm font-bold text-slate-400">{currentIndex + 1}/{quizQueue.length}</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-3 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex) / quizQueue.length) * 100}%` }}
        ></div>
      </div>

      <div className="text-center mb-4 min-h-[80px] flex flex-col justify-center">
        {settings.showLetterVisualHint && (
          <div className="text-7xl font-black text-purple-600 animate-pop-in drop-shadow-md">
            {currentLetter.char}
          </div>
        )}
        <div className="mt-2">
            <button
            onClick={playSound}
            disabled={isChecking}
            className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-6 py-2 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm mx-auto"
            >
            <span className="text-2xl">🔊</span>
            </button>
        </div>
      </div>

      <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white ring-4 ring-slate-100">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none block w-[320px] h-[320px] md:w-[400px] md:h-[400px] cursor-crosshair"
        />
        
        {showAnswer && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center animate-pop-in z-20">
            <div className="mb-4 transform scale-90">
              <LetterCard letter={currentLetter.char} size="lg" isDifficult={currentLetter.isDifficult} />
            </div>
            <div className={`px-10 py-4 rounded-full font-black text-white shadow-xl text-2xl ${feedback === 'correct' ? 'bg-green-500' : 'bg-orange-500'}`}>
               {feedback === 'correct' ? 'ВІРНО! 🌟' : 'Спробуй ще! ✍️'}
            </div>
          </div>
        )}
        
        {isChecking && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-30">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-purple-600 text-xl tracking-wide uppercase">Перевірка...</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3 w-full max-w-md">
        {!showAnswer ? (
          <>
            <button
              onClick={clearCanvas}
              disabled={isChecking}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              Стерти 🧹
            </button>
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg text-xl active:scale-95 transition-all"
            >
              ПЕРЕВІРИТИ ✅
            </button>
          </>
        ) : (
          <div className="flex gap-3 w-full">
             {feedback === 'incorrect' && (
                <button
                    onClick={handleRetry}
                    className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                    Стерти 🧹
                </button>
             )}
            <button
                onClick={handleNext}
                className="flex-[2] bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg text-xl animate-pulse active:scale-95 transition-all"
            >
                ДАЛІ ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};