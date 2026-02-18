export enum AppMode {
  MENU = 'MENU',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ',
  RECALL = 'RECALL',
  WRITE = 'WRITE'
}

export interface Letter {
  char: string;
  isDifficult: boolean;
}

export interface ExtendedLetter extends Letter {
  word: string;
  pronunciation: string;
  image: string;
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
  sessionLimit: number;
  priorityLetters: string;
}

export interface QuizState {
  currentLetter: string;
  options: string[];
  isCorrect: boolean | null;
}
