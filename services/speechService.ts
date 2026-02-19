import { GoogleGenAI } from "@google/genai";
import { AppSettings, TTSProvider } from "../types";

let sharedAudioContext: AudioContext | null = null;
const audioCache = new Map<string, AudioBuffer>();

// Отримуємо ключ через змінні Vite
const getEnvKey = () => {
  if ((window as any)._env_ && (window as any)._env_.API_KEY) {
    return (window as any)._env_.API_KEY;
  }
  return (import.meta as any).env.VITE_API_KEY || '';
};

const DEFAULT_SETTINGS: AppSettings = {
  ttsProvider: TTSProvider.GEMINI,
  geminiApiKey: getEnvKey(),
  customBaseUrl: 'http://localhost:11434/v1',
  customApiKey: '',
  customModel: 'whisper',
  sessionLimit: 33,
  priorityLetters: 'Б, В, Ч, Ц, Н, М, Ш, Й'
};

export const getSettings = (): AppSettings => {
  const saved = localStorage.getItem('alphabet_settings');
  if (!saved) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed, geminiApiKey: parsed.geminiApiKey || getEnvKey() };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem('alphabet_settings', JSON.stringify(settings));
};

export const getAudioContext = () => {
  if (!sharedAudioContext) {
    // Не задаємо sampleRate при створенні контексту, щоб браузер вибрав найкращий
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
};

export const unlockAudio = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

const playBuffer = (buffer: AudioBuffer) => {
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
};

const speakBrowser = (text: string) => {
  try {
    console.log(`[TTS] Fallback to Browser Speech for "${text}"`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Browser TTS Error:", e);
  }
};

const tryLoadLocalMp3 = async (char: string): Promise<AudioBuffer | null> => {
  try {
    const ctx = getAudioContext();
    // Файли мають бути названі як сама літера (наприклад, "А.mp3", "Б.mp3")
    // encodeURIComponent забезпечує безпеку URL для кириличних символів
    const url = `/sounds/${encodeURIComponent(char)}.mp3`;
    console.log(`[TTS] Trying to load MP3: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
        console.warn(`[TTS] MP3 for "${char}" not found (HTTP ${response.status})`);
        return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error(`[TTS] Failed to load/decode MP3 for "${char}":`, e);
    return null;
  }
};

export const speakUkrainian = async (char: string, pronunciation: string) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  // 1. Спочатку перевіряємо кеш
  if (audioCache.has(char)) {
    console.log(`[TTS] Playing "${char}" from cache`);
    playBuffer(audioCache.get(char)!);
    return;
  }

  // 2. Спроба завантажити MP3 з папки /sounds/
  const localBuffer = await tryLoadLocalMp3(char);
  if (localBuffer) {
    console.log(`[TTS] Playing "${char}" from MP3 file`);
    audioCache.set(char, localBuffer);
    playBuffer(localBuffer);
    return;
  }

  // 3. Фолбек на браузерний синтез (якщо файл не знайдено)
  // Ми більше НЕ використовуємо Gemini API для генерації звуку, як запитано користувачем.
  speakBrowser(pronunciation || char);
};

// Функція перевірки малюнка залишається на Gemini Vision API
export const checkDrawing = async (base64Image: string, targetLetter: string): Promise<boolean> => {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || getEnvKey();

  if (!apiKey) {
      console.error("No API Key for Check Drawing!");
      return false;
  }

  try {
    console.log(`[CheckDrawing] Verifying "${targetLetter}"...`);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Використовуємо мультимодальну модель
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } },
            { text: `Це дитячий малюнок. Чи схоже це на українську літеру "${targetLetter}"? Відповідай TRUE або FALSE.` }
          ]
        }
      ]
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const text = part?.text?.trim().toUpperCase() || '';

    console.log(`[CheckDrawing] Result: ${text}`);
    return text.includes("TRUE");
  } catch (e) {
    console.error("AI Check Error:", e);
    return false;
  }
};
