import React, { useState } from 'react';
import { AppMode } from './types';
import { RecallMode } from './components/RecallMode';
import { QuizMode } from './components/QuizMode';
import { WriteMode } from './components/WriteMode';
import { SettingsModal } from './components/SettingsModal';
import { unlockAudio } from './services/speechService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MENU);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const startMode = async (newMode: AppMode) => {
    await unlockAudio();
    setMode(newMode);
  };

  const renderMenu = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-sky-50 to-blue-100 relative overflow-hidden min-h-screen">
      {/* Декоративні елементи на фоні */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsSettingsOpen(true);
        }}
        className="fixed top-6 right-6 bg-white p-4 rounded-full shadow-xl hover:rotate-90 transition-transform text-2xl z-20 border-2 border-blue-50 active:scale-90"
        title="Налаштування"
      >
        ⚙️
      </button>

      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl md:text-7xl font-black text-blue-600 mb-4 drop-shadow-sm tracking-tight">
          Азбука-Помічник
        </h1>
        <p className="text-xl md:text-2xl text-blue-400 font-bold bg-white/70 inline-block px-8 py-2 rounded-full shadow-sm">
          Вчимо букви весело та легко! 🎨
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        <button 
          onClick={() => startMode(AppMode.LEARN)}
          className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-b-[12px] border-orange-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">📖</div>
          <h2 className="text-3xl font-black text-orange-600 mb-3">Назви букву</h2>
          <p className="text-gray-500 font-medium text-lg">Бачиш букву — називаєш вголос</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.QUIZ)}
          className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-b-[12px] border-green-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
          <h2 className="text-3xl font-black text-green-600 mb-3">Впізнай букву</h2>
          <p className="text-gray-500 font-medium text-lg">Слухаєш голос — вибираєш правильну</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.WRITE)}
          className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-b-[12px] border-purple-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">✍️</div>
          <h2 className="text-3xl font-black text-purple-600 mb-3">Напиши букву</h2>
          <p className="text-gray-500 font-medium text-lg">Малюєш пальчиком на екрані</p>
        </button>
      </div>

      <div className="mt-16 text-center text-blue-300 font-bold tracking-widest uppercase text-sm">
        Розроблено спеціально для першокласників 🇺🇦
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {mode === AppMode.MENU && renderMenu()}
      {mode === AppMode.LEARN && <RecallMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.QUIZ && <QuizMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.WRITE && <WriteMode onBack={() => setMode(AppMode.MENU)} />}
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;