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
    
    // JS Grid REMOVED - now handled by CSS

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
    ctx.strokeStyle = '#000000'; // Pure black for best AI contrast

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

    // For smoother lines
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Check if canvas has enough content
  const isCanvasEmpty = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );

    // Count non-transparent pixels (since we clear rect, background is transparent 0x00000000)
    // We look for pixels that are not 0.
    let nonTransparentCount = 0;
    for (let i = 0; i < pixelBuffer.length; i += 50) { // Check every 50th pixel for speed
        if (pixelBuffer[i] !== 0) {
            nonTransparentCount++;
        }
    }
    return nonTransparentCount < 10; // If very few pixels drawn
  };

  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || showAnswer) return;
    
    if (isCanvasEmpty(canvas)) {
        alert("Будь ласка, намалюй букву перед перевіркою!");
        return;
    }

    setIsChecking(true);

    // Create temp canvas with pure white background for AI
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Fill white
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Draw original canvas content (without grid lines)
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

  // CSS for Grid Pattern
  const gridStyle = {
    backgroundImage: `
      linear-gradient(#f1f5f9 1px, transparent 1px),
      linear-gradient(90deg, #f1f5f9 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px'
  };

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
          style={gridStyle}
          className="touch-none block w-[320px] h-[320px] md:w-[400px] md:h-[400px] cursor-crosshair"
        />
        
        {showAnswer && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center animate-pop-in z-20">
            <div className="mb-6 transform scale-90">
              <LetterCard letter={currentLetter.char} size="lg" isDifficult={currentLetter.isDifficult} />
            </div>

            {/* New Text-Only Feedback Style */}
            <div className="text-center">
                {feedback === 'correct' ? (
                    <div className="animate-bounce">
                        <div className="text-6xl mb-2">👍</div>
                        <div className="text-4xl font-black text-green-500 uppercase tracking-wide drop-shadow-sm">
                            Молодець!
                        </div>
                    </div>
                ) : (
                    <div className="animate-shake">
                        <div className="text-6xl mb-2">😢</div>
                        <div className="text-3xl font-black text-orange-500 uppercase tracking-wide drop-shadow-sm">
                            Спробуй ще!
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
        
        {isChecking && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-30">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-purple-600 text-xl tracking-wide uppercase">Дивлюсь...</p>
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