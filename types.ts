
export enum AppMode {
  MENU = 'MENU',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ'
}

export interface Letter {
  char: string;
  isDifficult: boolean;
}

export enum TTSProvider {
  GEMINI = 'GEMINI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE'
}

export interface AppSettings {
  ttsProvider: TTSProvider;
  geminiApiKey: string;
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
}

export interface QuizState {
  currentLetter: string;
  options: string[];
  isCorrect: boolean | null;
}
