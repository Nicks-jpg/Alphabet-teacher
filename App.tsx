
import React, { useState } from 'react';
import { AppMode } from './types';
import { RecallMode } from './components/RecallMode';
import { QuizMode } from './components/QuizMode';
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-blue-50 relative">
      {/* Settings Button */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 bg-white p-4 rounded-full shadow-lg hover:rotate-90 transition-transform text-2xl"
        title="Налаштування API"
      >
        ⚙️
      </button>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600 mb-4 drop-shadow-sm">Азбука-Помічник</h1>
        <p className="text-xl text-gray-600">Вчимо букви весело та легко! 🎨</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button 
          onClick={() => startMode(AppMode.LEARN)}
          className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-4 border-orange-400 group transform hover:-translate-y-2 text-left"
        >
          <div className="text-7xl mb-4 group-hover:animate-bounce">📖</div>
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Назви букву</h2>
          <p className="text-gray-500">Бачиш букву — називаєш вголос — перевіряєш себе.</p>
        </button>

        <button 
          onClick={() => startMode(AppMode.QUIZ)}
          className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-4 border-green-400 group transform hover:-translate-y-2 text-left"
        >
          <div className="text-7xl mb-4 group-hover:animate-bounce">🎯</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Впізнай букву</h2>
          <p className="text-gray-500">Слухаєш голос — вибираєш правильну букву з варіантів.</p>
        </button>
      </div>

      <div className="mt-16 text-center text-gray-400 text-sm">
        Розроблено спеціально для першокласників 🇺🇦
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-sky-50 overflow-x-hidden">
      {mode === AppMode.MENU && renderMenu()}
      {mode === AppMode.LEARN && <RecallMode onBack={() => setMode(AppMode.MENU)} />}
      {mode === AppMode.QUIZ && <QuizMode onBack={() => setMode(AppMode.MENU)} />}
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </main>
  );
};

export default App;
