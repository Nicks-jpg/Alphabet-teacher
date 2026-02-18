import React from 'react';

interface LetterCardProps {
  letter: string;
  size?: 'sm' | 'lg';
  isDifficult?: boolean;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, size = 'lg', isDifficult }) => {
  const sizeClasses = size === 'lg' ? 'text-[10rem] w-64 h-64' : 'text-6xl w-32 h-32';
  const borderClass = isDifficult ? 'border-orange-400 border-b-8' : 'border-blue-400 border-b-8';
  const bgClass = isDifficult ? 'bg-orange-50' : 'bg-white';
  const textClass = isDifficult ? 'text-orange-600' : 'text-blue-700';

  return (
    <div className={`LetterCard ${sizeClasses} ${bgClass} ${borderClass} border-4 rounded-[3rem] flex items-center justify-center shadow-2xl transform transition-all select-none`}>
      <span key={letter} className={`font-black ${textClass} animate-pop-in drop-shadow-sm`}>
        {letter}
      </span>
    </div>
  );
};