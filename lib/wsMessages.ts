import type { Category } from "./types";

// ─── Public state shapes ──────────────────────────────────────────────────────

export interface PublicPlayer {
  id: string;
  name: string;
  score: number;
  answeredCurrent: boolean;
  /** null = question phase (no spoilers), true/false = reveal phase */
  correct: boolean | null;
  connected: boolean;
}

export type GamePhase = "lobby" | "question" | "reveal" | "finished";

export interface PublicGameState {
  phase: GamePhase;
  questionIndex: number;
  totalQuestions: number;
  questionId: number | null;
  quote: string | null;
  /** Only set during reveal phase */
  revealedCategory: Category | null;
  revealedAttribution: string | null;
  revealedHint: string | null;
  /** Only set during reveal phase */
  answerCounts: { dictator: number; techbro: number } | null;
  players: PublicPlayer[];
}

// ─── WebSocket message protocol ────────────────────────────────────────────────

export type ServerMessage =
  | { type: "init"; playerId: string }
  | { type: "state_sync"; state: PublicGameState }
  | { type: "reset" }; // tells clients to clear stored credentials

export type ClientMessage =
  | { type: "join"; name: string; playerId?: string }
  | { type: "answer"; questionId: number; category: Category }
  | { type: "host_action"; action: "start" | "reveal" | "next" | "reset" | "restart" };
