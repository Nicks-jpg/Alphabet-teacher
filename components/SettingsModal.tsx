import React, { useState } from 'react';
import { AppSettings, TTSProvider } from '../types';
import { getSettings, saveSettings } from '../services/speechService';

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    onClose();
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Налаштування</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <div className="space-y-6">
          {/* Priority Letters Setting */}
          <div className="bg-red-50 p-4 rounded-2xl">
            <label className="block text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Пріоритетні букви (складні)</label>
            <input 
              type="text"
              value={settings.priorityLetters}
              onChange={(e) => setSettings({...settings, priorityLetters: e.target.value})}
              placeholder="Наприклад: Б, В, Ч, Ц"
              className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none font-bold text-lg"
            />
            <p className="text-xs text-red-400 mt-2">Вкажіть букви через кому. Вони будуть з'являтися в 4 рази частіше за інші.</p>
          </div>

          {/* Session Length Setting */}
          <div className="bg-orange-50 p-4 rounded-2xl">
            <label className="block text-sm font-bold text-orange-600 mb-2 uppercase tracking-wider">Тривалість заняття</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={settings.sessionLimit}
                onChange={(e) => setSettings({...settings, sessionLimit: parseInt(e.target.value)})}
                className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-2xl font-bold text-orange-600 w-12 text-center">
                {settings.sessionLimit}
              </span>
            </div>
            <p className="text-xs text-orange-400 mt-2">Кількість літер, які дитина має назвати за один сеанс.</p>
          </div>

          {/* Provider Selection */}
          <div className="bg-blue-50 p-4 rounded-2xl">
            <label className="block text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider">Провайдер Озвучки (TTS)</label>
            <select 
              value={settings.ttsProvider}
              onChange={(e) => setSettings({...settings, ttsProvider: e.target.value as TTSProvider})}
              className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none"
            >
              <option value={TTSProvider.GEMINI}>Google Gemini (Рекомендовано)</option>
              <option value={TTSProvider.OPENAI_COMPATIBLE}>Локальний / Кастомний (OpenAI compatible)</option>
            </select>
          </div>

          {settings.ttsProvider === TTSProvider.GEMINI ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Gemini API Key</label>
                <input 
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                  placeholder="Вставте ваш ключ..."
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Base URL</label>
                <input 
                  type="text"
                  value={settings.customBaseUrl}
                  onChange={(e) => setSettings({...settings, customBaseUrl: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              Зберегти
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};