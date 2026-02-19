import React, { useState, useEffect } from 'react';

interface CompletionScreenProps {
  onBack: () => void;
  score?: number;
  total?: number;
}

const ANIMATIONS = [
  {
    id: 'monkey',
    emoji: '🐵',
    secondary: '🍌',
    bg: 'bg-yellow-100',
    title: 'Ти крутий як ця макака!',
    render: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="text-8xl animate-bounce">🐵</div>
        <div className="absolute text-6xl animate-spin-slow" style={{ animationDuration: '3s', top: '20px', right: '20px' }}>🍌</div>
      </div>
    )
  },
  {
    id: 'horse',
    emoji: '🐎',
    secondary: '💨',
    bg: 'bg-green-100',
    title: 'Скачеш до знань як кінь!',
    render: () => (
      <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden">
        <div className="text-9xl animate-gallop relative left-[-100px]">🐎</div>
        <div className="text-4xl absolute bottom-10 left-10 opacity-50">💨</div>
      </div>
    )
  },
  {
    id: 'whale',
    emoji: '🐋',
    secondary: '🌊',
    bg: 'bg-blue-100',
    title: 'Пливеш у морі букв!',
    render: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="text-9xl animate-swim">🐋</div>
        <div className="absolute bottom-0 text-6xl w-full text-center opacity-50">🌊🌊🌊</div>
      </div>
    )
  },
  {
    id: 'dog',
    emoji: '🐕',
    secondary: '🦴',
    bg: 'bg-orange-100',
    title: 'Ти молодець! Гав-гав!',
    render: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="text-9xl animate-shake">🐕</div>
        <div className="absolute top-0 right-10 text-5xl animate-pulse">🦴</div>
        <div className="absolute top-10 left-0 text-4xl font-bold text-slate-600 animate-ping">ГАВ!</div>
      </div>
    )
  },
  {
    id: 'cat',
    emoji: '🐈',
    secondary: '🧶',
    bg: 'bg-purple-100',
    title: 'Мур-мур, чудова робота!',
    render: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="text-9xl relative z-10">🐈</div>
        <div className="absolute text-4xl top-0 right-0 animate-bounce">🧶</div>
        <div className="absolute bottom-10 left-10 text-6xl opacity-50">💨</div>
      </div>
    )
  }
];

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onBack, score, total }) => {
  const [animation, setAnimation] = useState(ANIMATIONS[0]);

  useEffect(() => {
    const randomAnim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
    setAnimation(randomAnim);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${animation.bg} transition-colors duration-1000`}>
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl text-center max-w-lg w-full border-4 border-white">
        <div className="mb-8 overflow-hidden rounded-2xl bg-white/50 p-8 border-2 border-white/50 shadow-inner">
          {animation.render()}
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-slate-700 mb-4 animate-pop-in">
          {animation.title}
        </h2>

        {(score !== undefined && total !== undefined) && (
          <p className="text-xl md:text-2xl text-slate-500 font-bold mb-8">
            Ти знаєш <span className="text-green-600 text-3xl">{score}</span> з <span className="text-slate-400">{total}</span> букв!
          </p>
        )}

        <button
          onClick={onBack}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black py-5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-xl"
        >
          Повернутися в меню 🏠
        </button>
      </div>

      <style>{`
        @keyframes gallop {
          0% { transform: translateX(-100%) translateY(0) rotate(-5deg); }
          25% { transform: translateX(-50%) translateY(-20px) rotate(5deg); }
          50% { transform: translateX(0) translateY(0) rotate(-5deg); }
          75% { transform: translateX(50%) translateY(-20px) rotate(5deg); }
          100% { transform: translateX(100%) translateY(0) rotate(-5deg); }
        }
        .animate-gallop {
          animation: gallop 2s linear infinite;
        }
        @keyframes swim {
          0%, 100% { transform: rotate(-5deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(10px); }
        }
        .animate-swim {
          animation: swim 3s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
