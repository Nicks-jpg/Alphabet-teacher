
export enum AppMode {
  MENU = 'MENU',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ'
}

export interface Letter {
  char: string;
  isDifficult: boolean;
}

export interface QuizState {
  currentLetter: string;
  options: string[];
  isCorrect: boolean | null;
}
