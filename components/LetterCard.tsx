
import React from 'react';

interface LetterCardProps {
  letter: string;
  size?: 'sm' | 'lg';
  isDifficult?: boolean;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, size = 'lg', isDifficult }) => {
  const sizeClasses = size === 'lg' ? 'text-9xl w-48 h-48' : 'text-5xl w-24 h-24';
  const borderClass = isDifficult ? 'border-orange-400' : 'border-blue-400';
  const bgClass = isDifficult ? 'bg-orange-50' : 'bg-white';

  return (
    <div className={`LetterCard ${sizeClasses} ${bgClass} ${borderClass} border-4 rounded-3xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 select-none`}>
      <span key={letter} className="font-bold text-gray-800 animate-pop-in">
        {letter}
      </span>
    </div>
  );
};
