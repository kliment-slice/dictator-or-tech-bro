export type Category = "dictator" | "techbro";

export interface CategoryConfig {
  label: string;
  color: string;
  description: string;
}

export interface Question {
  id: number;
  quote: string;
  category: Category;
  attribution: string;
  hint?: string;
}

export interface QuestionsData {
  categories: Record<Category, CategoryConfig>;
  questions: Question[];
}

export type GamePhase = "intro" | "playing" | "reveal" | "results";

export interface GameState {
  phase: GamePhase;
  currentIndex: number;
  questions: Question[];
  answers: Array<{ question: Question; selected: Category; correct: boolean }>;
}
