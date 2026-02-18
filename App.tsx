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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-sky-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsSettingsOpen(true);
        }}
        className="fixed top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:rotate-90 transition-transform text-2xl z-20 border-2 border-blue-100 active:scale-90"
        title="Налаштування"
      >
        ⚙️
      </button>

      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl md:text-6xl font-black text-blue-600 mb-4 drop-shadow-md tracking-tight">
          Азбука-Помічник
        </h1>
        <p className="text-xl md:text-2xl text-blue-400 font-bold bg-white/50 inline-block px-6 py-2 rounded-full">
          Вчимо букви весело! 🎨
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl z-10">
        <button 
          onClick={() => startMode(AppMode.LEARN)}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-b-8 border-orange-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">📖</div>
          <h2 className="text-3xl font-black text-orange-600 mb-3">Назви букву</h2>
          <p className="text-gray-500 font-medium">Дивись, називай та перевіряй себе</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.QUIZ)}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-b-8 border-green-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
          <h2 className="text-3xl font-black text-green-600 mb-3">Впізнай букву</h2>
          <p className="text-gray-500 font-medium">Слухай голос та вибирай правильно</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.WRITE)}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-b-8 border-purple-400 group transform hover:-translate-y-2 active:translate-y-1 text-center"
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">✍️</div>
          <h2 className="text-3xl font-black text-purple-600 mb-3">Напиши букву</h2>
          <p className="text-gray-500 font-medium">Малюй пальчиком на екрані</p>
        </button>
      </div>

      <div className="mt-16 text-center text-blue-300 font-bold tracking-widest uppercase text-sm">
        Зроблено з любов'ю для дітей 🇺🇦
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-sky-50">
      {mode === AppMode.MENU && renderMenu()}
      {mode === AppMode.LEARN && <RecallMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.QUIZ && <QuizMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.WRITE && <WriteMode onBack={() => setMode(AppMode.MENU)} />}
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </main>
  );
};

export default App;