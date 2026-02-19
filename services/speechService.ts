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
  priorityLetters: 'Б, В, Ч, Ц, Н, М, Ш, Й',
  confusingPairs: 'Б-В, Ч-Ц, Н-М, Ш-Щ, Й-И',
  showLetterVisualHint: true
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

  if (audioCache.has(char)) {
    console.log(`[TTS] Playing "${char}" from cache`);
    playBuffer(audioCache.get(char)!);
    return;
  }

  const localBuffer = await tryLoadLocalMp3(char);
  if (localBuffer) {
    console.log(`[TTS] Playing "${char}" from MP3 file`);
    audioCache.set(char, localBuffer);
    playBuffer(localBuffer);
    return;
  }

  speakBrowser(pronunciation || char);
};

// Функція перевірки малюнка Gemini Vision API
export const checkDrawing = async (base64Image: string, targetLetter: string): Promise<boolean> => {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || getEnvKey();

  if (!apiKey) {
      console.error("No API Key for Check Drawing!");
      return false;
  }

  try {
    console.log(`[CheckDrawing] Verifying "${targetLetter}" with gemini-flash-lite-latest...`);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } },
            { text: `Ти - вчитель початкових класів. Це малюнок дитини. Чи схоже це на українську літеру "${targetLetter}"? Ігноруй розриви в лініях, тремтіння та випадкові штрихи. Звертай увагу лише на загальну топологію та форму. Якщо це хоч трохи нагадує літеру, відповідай ТІЛЬКИ словом TRUE. Інакше FALSE.` }
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
