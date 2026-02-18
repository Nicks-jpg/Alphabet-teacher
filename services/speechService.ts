
import { GoogleGenAI, Modality } from "@google/genai";
import { AppSettings, TTSProvider } from "../types";

let sharedAudioContext: AudioContext | null = null;
// Кеш для зберігання аудіобуферів: ключ - це назва літери, значення - AudioBuffer
const audioCache = new Map<string, AudioBuffer>();

const DEFAULT_SETTINGS: AppSettings = {
  ttsProvider: TTSProvider.GEMINI,
  geminiApiKey: process.env.API_KEY || '',
  customBaseUrl: 'http://localhost:11434/v1',
  customApiKey: '',
  customModel: 'whisper'
};

export const getSettings = (): AppSettings => {
  const saved = localStorage.getItem('alphabet_settings');
  if (!saved) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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

const speakGemini = async (char: string, pronunciation: string, apiKey: string) => {
  // Перевірка кешу
  if (audioCache.has(char)) {
    console.log(`[Cache] Play sound for: ${char}`);
    playBuffer(audioCache.get(char)!);
    return;
  }

  console.log(`[API Request] Fetching sound for: ${char}`);
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ 
      parts: [{ 
        text: `Ти вчителька. Вимови чітко українську літеру "${char}" як "${pronunciation}". Тільки один звук.` 
      }] 
    }],
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
  
  // Зберігаємо в кеш
  audioCache.set(char, audioBuffer);
  playBuffer(audioBuffer);
};

const speakCustom = async (text: string, settings: AppSettings) => {
  try {
    const response = await fetch(`${settings.customBaseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.customApiKey}`
      },
      body: JSON.stringify({
        model: settings.customModel,
        input: text,
        voice: 'alloy'
      })
    });

    if (!response.ok) throw new Error('API error');
    
    const audioBlob = await response.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.error("Custom TTS Error:", e);
  }
};

export const speakUkrainian = async (char: string, pronunciation: string) => {
  const settings = getSettings();
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  if (settings.ttsProvider === TTSProvider.GEMINI) {
    await speakGemini(char, pronunciation, settings.geminiApiKey);
  } else {
    await speakCustom(pronunciation, settings);
  }
};
