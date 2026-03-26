import { randomUUID } from "crypto";
import { WebSocket, WebSocketServer } from "ws";
import type { Category } from "./types";
import type {
  ClientMessage,
  ServerMessage,
  PublicGameState,
  PublicPlayer,
} from "./wsMessages";
import { getShuffledQuestions } from "./questions";
import type { Question } from "./types";

// ─── Server-side state ────────────────────────────────────────────────────────

interface ServerPlayer {
  id: string;
  name: string;
  score: number;
  ws: WebSocket;
  answeredCurrentQuestion: boolean;
  currentAnswer: Category | null;
}

interface GameState {
  phase: "lobby" | "question" | "reveal" | "finished";
  questions: Question[];
  currentIndex: number;
  players: Map<string, ServerPlayer>;
}

const QUESTIONS_PER_GAME = 10;

const state: GameState = {
  phase: "lobby",
  questions: [],
  currentIndex: 0,
  players: new Map(),
};

// ─── State projection ─────────────────────────────────────────────────────────

function getPublicState(): PublicGameState {
  const currentQ = state.questions[state.currentIndex] ?? null;
  const isReveal = state.phase === "reveal";

  let answerCounts: { dictator: number; techbro: number } | null = null;
  if (isReveal) {
    answerCounts = { dictator: 0, techbro: 0 };
    for (const p of state.players.values()) {
      if (p.currentAnswer) answerCounts[p.currentAnswer]++;
    }
  }

  const players: PublicPlayer[] = Array.from(state.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      answeredCurrent: p.answeredCurrentQuestion,
      correct:
        isReveal && currentQ
          ? p.answeredCurrentQuestion
            ? p.currentAnswer === currentQ.category
            : null
          : null,
      connected: p.ws.readyState === WebSocket.OPEN,
    }));

  return {
    phase: state.phase,
    questionIndex: state.currentIndex,
    totalQuestions: state.questions.length || QUESTIONS_PER_GAME,
    questionId: currentQ?.id ?? null,
    quote: currentQ?.quote ?? null,
    revealedCategory: isReveal ? (currentQ?.category ?? null) : null,
    revealedAttribution: isReveal ? (currentQ?.attribution ?? null) : null,
    revealedHint: isReveal ? (currentQ?.hint ?? null) : null,
    answerCounts,
    players,
  };
}

// ─── Broadcast helpers ────────────────────────────────────────────────────────

function broadcast(wss: WebSocketServer, msg: ServerMessage) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function broadcastState(wss: WebSocketServer) {
  broadcast(wss, { type: "state_sync", state: getPublicState() });
}

// ─── Host actions ─────────────────────────────────────────────────────────────

function handleHostAction(
  action: "start" | "reveal" | "next" | "reset" | "restart",
  wss: WebSocketServer
) {
  switch (action) {
    case "start": {
      if (state.phase !== "lobby") return;
      state.questions = getShuffledQuestions(QUESTIONS_PER_GAME);
      state.currentIndex = 0;
      state.phase = "question";
      for (const p of state.players.values()) {
        p.answeredCurrentQuestion = false;
        p.currentAnswer = null;
      }
      broadcastState(wss);
      break;
    }

    case "reveal": {
      if (state.phase !== "question") return;
      state.phase = "reveal";
      const q = state.questions[state.currentIndex];
      for (const p of state.players.values()) {
        if (p.currentAnswer === q.category) p.score += 1000;
      }
      broadcastState(wss);
      break;
    }

    case "next": {
      if (state.phase !== "reveal") return;
      if (state.currentIndex + 1 >= state.questions.length) {
        state.phase = "finished";
      } else {
        state.currentIndex++;
        state.phase = "question";
        for (const p of state.players.values()) {
          p.answeredCurrentQuestion = false;
          p.currentAnswer = null;
        }
      }
      broadcastState(wss);
      break;
    }

    case "restart": {
      // Keep players, reset scores, go back to lobby
      for (const p of state.players.values()) {
        p.score = 0;
        p.answeredCurrentQuestion = false;
        p.currentAnswer = null;
      }
      state.questions = [];
      state.currentIndex = 0;
      state.phase = "lobby";
      broadcastState(wss);
      break;
    }

    case "reset": {
      // Clear everything — tell clients to drop credentials first
      broadcast(wss, { type: "reset" });
      state.players.clear();
      state.questions = [];
      state.currentIndex = 0;
      state.phase = "lobby";
      broadcastState(wss);
      break;
    }
  }
}

// ─── Player answer ────────────────────────────────────────────────────────────

function handleAnswer(
  playerId: string,
  questionId: number,
  category: Category,
  wss: WebSocketServer
) {
  const player = state.players.get(playerId);
  if (!player || state.phase !== "question") return;
  if (player.answeredCurrentQuestion) return;

  const currentQ = state.questions[state.currentIndex];
  if (!currentQ || currentQ.id !== questionId) return;

  player.answeredCurrentQuestion = true;
  player.currentAnswer = category;

  // Broadcast so host sees "X/Y answered" update
  broadcastState(wss);
}

// ─── Connection handler ───────────────────────────────────────────────────────

export function handleConnection(ws: WebSocket, wss: WebSocketServer) {
  let playerId: string | null = null;

  console.log(`[ws] new connection (total clients: ${wss.clients.size})`);

  // Send current state immediately so new connections get game context
  send(ws, { type: "state_sync", state: getPublicState() });

  ws.on("message", (raw) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      if (msg.type === "join") {
        // Reconnect to existing player OR create new one
        const isReconnect = !!(msg.playerId && state.players.has(msg.playerId));
        const id = isReconnect ? msg.playerId! : randomUUID();

        playerId = id;
        const existing = state.players.get(id);

        state.players.set(id, {
          id,
          name: msg.name || existing?.name || "Anonymous",
          score: existing?.score ?? 0,
          ws,
          answeredCurrentQuestion: existing?.answeredCurrentQuestion ?? false,
          currentAnswer: existing?.currentAnswer ?? null,
        });

        console.log(`[ws] player ${isReconnect ? "reconnected" : "joined"}: "${msg.name}" (id=${id}, total=${state.players.size})`);

        send(ws, { type: "init", playerId: id });
        broadcastState(wss);
        return;
      }

      if (msg.type === "host_action") {
        handleHostAction(msg.action, wss);
        return;
      }

      if (msg.type === "answer" && playerId) {
        handleAnswer(playerId, msg.questionId, msg.category, wss);
        return;
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  ws.on("close", () => {
    console.log(`[ws] connection closed (playerId=${playerId ?? "unknown"}, clients remaining: ${wss.clients.size - 1})`);
    // Don't remove player — just let their connected status reflect in state
    broadcastState(wss);
  });
}
