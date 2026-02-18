import { GoogleGenAI, Modality } from "@google/genai";
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
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
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

const decode = (base64: string) => {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 decode error:", e);
    return new Uint8Array(0);
  }
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const playBuffer = (buffer: AudioBuffer) => {
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
};

const tryLoadLocalMp3 = async (char: string): Promise<AudioBuffer | null> => {
  try {
    const ctx = getAudioContext();
    const response = await fetch(`/sounds/${encodeURIComponent(char)}.mp3`);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    return null;
  }
};

const speakGemini = async (char: string, pronunciation: string, apiKey: string) => {
  if (audioCache.has(char)) {
    playBuffer(audioCache.get(char)!);
    return;
  }
  const localBuffer = await tryLoadLocalMp3(char);
  if (localBuffer) {
    audioCache.set(char, localBuffer);
    playBuffer(localBuffer);
    return;
  }
  
  const effectiveKey = apiKey || getEnvKey();
  if (!effectiveKey) {
    console.warn("No API Key available for Gemini TTS");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: pronunciation || char }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;
    const ctx = getAudioContext();
    const decodedBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
    audioCache.set(char, audioBuffer);
    playBuffer(audioBuffer);
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
  }
};

export const speakUkrainian = async (char: string, pronunciation: string) => {
  const settings = getSettings();
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();
  await speakGemini(char, pronunciation, settings.geminiApiKey);
};

export const checkDrawing = async (base64Image: string, targetLetter: string): Promise<boolean> => {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || getEnvKey();
  if (!apiKey) return false;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } },
            { text: `Це малюнок дитини. Чи схоже це на українську літеру "${targetLetter}"? Відповідай TRUE або FALSE.` }
          ]
        }
      ]
    });
    const text = response.text?.trim().toUpperCase();
    return text?.includes("TRUE") || false;
  } catch (e) {
    console.error("AI Check Error:", e);
    return false;
  }
};
