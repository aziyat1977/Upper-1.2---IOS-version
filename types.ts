export interface LevelData {
  id: number;
  name: string;
  desc: string;
}

export interface Question {
  text: string;
  ans: string;
  opts: string[];
  mode: 'simple' | 'continuous' | 'mixed';
  explain: string;
  correctIndex: number;
}

export interface LessonSlide {
  title: string;
  content: string; // HTML string allowed for rich text
  examples: Array<{ en: string; ru: string; uz: string }>;
  mode: 'simple' | 'continuous' | 'intro';
}

export interface UserProgress {
  unlockedMax: number;
  bestByLevel: Record<number, {
    bestCorrect: number;
    bestStars: number;
    passed: boolean;
  }>;
}

export type MedalType = 'bronze' | 'silver' | 'gold' | 'master';

export interface GameState {
  status: 'boot' | 'intro' | 'quiz' | 'result';
  levelId: number;
  qIdx: number;
  score: number;
  correctCount: number;
  questions: Question[];
  locked: boolean;
  history: boolean[]; // track correct/incorrect per question
}