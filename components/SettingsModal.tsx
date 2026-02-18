
import React, { useState } from 'react';
import { AppSettings, TTSProvider } from '../types';
import { getSettings, saveSettings } from '../services/speechService';

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    onClose();
    window.location.reload(); // Refresh to apply new keys/providers
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Налаштування API</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <div className="space-y-6">
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
                  placeholder="http://localhost:11434/v1"
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Model Name</label>
                  <input 
                    type="text"
                    value={settings.customModel}
                    onChange={(e) => setSettings({...settings, customModel: e.target.value})}
                    placeholder="tts-1"
                    className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">API Key (якщо треба)</label>
                  <input 
                    type="password"
                    value={settings.customApiKey}
                    onChange={(e) => setSettings({...settings, customApiKey: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Manual Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Інструкція підключення</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <section className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-400">
                <p className="font-bold text-blue-700 mb-1">Google Gemini (Хмарний варіант):</p>
                <p>1. Отримайте ключ на <a href="https://aistudio.google.com/" target="_blank" className="underline">Google AI Studio</a>.</p>
                <p>2. Вставте ключ у поле Gemini API Key. Це забезпечить найкращу українську вимову.</p>
              </section>

              <section className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-400">
                <p className="font-bold text-orange-700 mb-1">Ollama (Локально):</p>
                <p>1. Встановіть Ollama. Запустіть її з дозволом CORS: <code className="bg-gray-200 px-1">OLLAMA_ORIGINS="*" ollama serve</code>.</p>
                <p>2. Використовуйте URL: <code className="bg-gray-200 px-1">http://localhost:11434/v1</code>.</p>
                <p>3. *Зауважте: Ollama нативно не має TTS, вам знадобиться сумісний проксі або спеціальна модель озвучки.</p>
              </section>

              <section className="bg-gray-50 p-4 rounded-xl border-l-4 border-purple-400">
                <p className="font-bold text-purple-700 mb-1">LM Studio:</p>
                <p>1. У вкладці "Local Server" запустіть сервер.</p>
                <p>2. Увімкніть "CORS" у налаштуваннях LM Studio.</p>
                <p>3. URL: <code className="bg-gray-200 px-1">http://localhost:1234/v1</code>.</p>
              </section>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              Зберегти та оновити
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
