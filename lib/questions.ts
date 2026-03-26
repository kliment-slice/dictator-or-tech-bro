import data from "../questions.json";
import type { QuestionsData, Question } from "./types";

const questionsData = data as QuestionsData;

export function getCategories() {
  return questionsData.categories;
}

export function getShuffledQuestions(count = 10): Question[] {
  const all = [...questionsData.questions];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, Math.min(count, all.length));
}
