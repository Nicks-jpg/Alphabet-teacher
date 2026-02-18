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
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-sky-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsSettingsOpen(true);
        }}
        className="fixed top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:rotate-90 transition-transform text-xl z-20 border-2 border-blue-100 active:scale-90"
        title="Налаштування"
      >
        ⚙️
      </button>

      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl md:text-6xl font-black text-blue-600 mb-2 drop-shadow-sm tracking-tight">
          Азбука-Помічник
        </h1>
        <p className="text-lg md:text-xl text-blue-400 font-bold bg-white/60 inline-block px-5 py-1.5 rounded-full">
          Вчимо букви весело! 🎨
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl z-10 px-2">
        <button 
          onClick={() => startMode(AppMode.LEARN)}
          className="bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all border-b-8 border-orange-400 group transform hover:-translate-y-1 active:translate-y-1 text-center"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📖</div>
          <h2 className="text-2xl font-black text-orange-600 mb-2">Назви букву</h2>
          <p className="text-sm text-gray-500 font-medium">Бачиш букву — називаєш вголос</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.QUIZ)}
          className="bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all border-b-8 border-green-400 group transform hover:-translate-y-1 active:translate-y-1 text-center"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
          <h2 className="text-2xl font-black text-green-600 mb-2">Впізнай букву</h2>
          <p className="text-sm text-gray-500 font-medium">Слухаєш голос — вибираєш правильну</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.WRITE)}
          className="bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all border-b-8 border-purple-400 group transform hover:-translate-y-1 active:translate-y-1 text-center sm:col-span-2 lg:col-span-1"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✍️</div>
          <h2 className="text-2xl font-black text-purple-600 mb-2">Напиши букву</h2>
          <p className="text-sm text-gray-500 font-medium">Малюєш пальчиком на екрані</p>
        </button>
      </div>

      <div className="mt-12 text-center text-blue-300 font-bold tracking-widest uppercase text-[10px]">
        Зроблено спеціально для першокласників 🇺🇦
      </div>
    </div>
  );

  return (
    <>
      {mode === AppMode.MENU && renderMenu()}
      {mode === AppMode.LEARN && <RecallMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.QUIZ && <QuizMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.WRITE && <WriteMode onBack={() => setMode(AppMode.MENU)} />}
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};

export default App;