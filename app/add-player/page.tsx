"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useGameSocket } from "@/lib/useGameSocket";
import Leaderboard from "@/components/Leaderboard";
import type { Category } from "@/lib/types";

const CATEGORY_STYLES: Record<Category, { border: string; bg: string; text: string; hover: string }> = {
  dictator: {
    border: "border-[#F54E00]",
    bg: "bg-[#F54E00]/8",
    text: "text-[#F54E00]",
    hover: "hover:bg-[#F54E00]/15",
  },
  techbro: {
    border: "border-[#1D4AFF]",
    bg: "bg-[#1D4AFF]/8",
    text: "text-[#1D4AFF]",
    hover: "hover:bg-[#1D4AFF]/15",
  },
};

const CATEGORY_LABELS: Record<Category, string> = {
  dictator: "Dictator",
  techbro: "Tech Bro",
};

export default function PlayerPage() {
  const { gameState, playerId, connected, wasReset, joinGame, submitAnswer } =
    useGameSocket();

  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [myAnswer, setMyAnswer] = useState<Category | null>(null);
  const prevQuestionIndex = useRef<number | null>(null);

  // Restore join state from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("dotb_player_name");
    const storedId = localStorage.getItem("dotb_player_id");
    if (storedName && storedId) {
      setName(storedName);
      setHasJoined(true);
    }
  }, []);

  // Handle server-side reset — clear everything
  useEffect(() => {
    if (wasReset) {
      setHasJoined(false);
      setName("");
      setMyAnswer(null);
    }
  }, [wasReset]);

  // Clear my answer when question changes
  useEffect(() => {
    if (
      gameState?.questionIndex !== undefined &&
      gameState.questionIndex !== prevQuestionIndex.current
    ) {
      setMyAnswer(null);
      prevQuestionIndex.current = gameState.questionIndex;
    }
  }, [gameState?.questionIndex]);

  // If we reconnected and are no longer in the player list, show join screen
  useEffect(() => {
    if (!gameState || !playerId) return;
    if (gameState.phase === "lobby" && hasJoined) {
      const stillIn = gameState.players.some((p) => p.id === playerId);
      if (!stillIn) {
        setHasJoined(false);
      }
    }
  }, [gameState, playerId, hasJoined]);

  const handleJoin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      joinGame(name.trim());
      setHasJoined(true);
    },
    [name, joinGame]
  );

  const handleAnswer = useCallback(
    (category: Category) => {
      if (!gameState?.questionId || myAnswer) return;
      setMyAnswer(category);
      submitAnswer(gameState.questionId, category);
    },
    [gameState?.questionId, myAnswer, submitAnswer]
  );

  const myPlayer = gameState?.players.find((p) => p.id === playerId);

  // ─── JOIN SCREEN ──────────────────────────────────────────────────────────
  if (!hasJoined || !playerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-sm w-full space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Image src="/posthog-logo-stacked.png" alt="PostHog" width={64} height={62} />
            <h1 className="text-3xl font-black tracking-tight">
              Dictator or<br />Tech Bro?
            </h1>
            <p className="text-sm text-[rgba(21,21,21,0.55)]">
              Enter your name to join the game
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={24}
              autoFocus
              className="
                w-full px-4 py-4 rounded-lg border-2 border-[#D0D1C9]
                bg-white text-[#151515] text-base font-semibold
                placeholder:text-[rgba(21,21,21,0.3)] placeholder:font-normal
                focus:outline-none focus:border-[#151515] transition-colors
              "
            />
            <button
              type="submit"
              disabled={!name.trim() || !connected}
              className="
                w-full py-4 rounded-lg bg-[#151515] text-[#EEEFE9]
                font-bold text-sm uppercase tracking-wide
                hover:bg-[#2c2c2c] active:scale-[0.98] transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              "
            >
              {connected ? "Join Game" : "Connecting…"}
            </button>
          </form>

          <div className="border-t border-dashed border-[#D0D1C9]" />

          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">☭</span>
              <span className="text-xs font-bold text-[#F54E00] uppercase tracking-wide">Dictator</span>
            </div>
            <div className="text-[rgba(21,21,21,0.3)] font-light text-lg self-center">vs</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">🚀</span>
              <span className="text-xs font-bold text-[#1D4AFF] uppercase tracking-wide">Tech Bro</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LOBBY ────────────────────────────────────────────────────────────────
  if (gameState?.phase === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-sm w-full space-y-6 text-center">
          <Image
            src="/events-irl.png"
            alt="PostHog hedgehogs"
            width={200}
            height={122}
            className="mx-auto drop-shadow-sm"
          />
          <div>
            <p className="text-sm font-semibold text-[rgba(21,21,21,0.4)] uppercase tracking-widest mb-1">
              You&apos;re in!
            </p>
            <h2 className="text-2xl font-black">Hey, {name} 👋</h2>
          </div>
          <div className="py-4 px-6 rounded-xl border border-dashed border-[#D0D1C9] bg-white space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[rgba(21,21,21,0.4)]">
              Waiting for host
            </p>
            <p className="text-sm text-[rgba(21,21,21,0.6)]">
              {gameState.players.length}{" "}
              {gameState.players.length === 1 ? "player" : "players"} in the lobby
            </p>
          </div>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#D0D1C9] animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTION ─────────────────────────────────────────────────────────────
  if (gameState?.phase === "question") {
    if (myAnswer) {
      // Answered, waiting for reveal
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="max-w-sm w-full space-y-6 text-center">
            <div className="py-6 px-6 rounded-xl border-2 border-dashed border-[#D0D1C9] bg-white space-y-3">
              <div className="text-3xl">✓</div>
              <p className="font-black text-lg">Locked in!</p>
              <p className="text-sm text-[rgba(21,21,21,0.5)]">
                You said{" "}
                <span
                  className={`font-bold ${
                    myAnswer === "dictator" ? "text-[#F54E00]" : "text-[#1D4AFF]"
                  }`}
                >
                  {CATEGORY_LABELS[myAnswer]}
                </span>
              </p>
            </div>
            <p className="text-xs text-[rgba(21,21,21,0.4)] uppercase tracking-widest animate-pulse">
              Waiting for reveal…
            </p>
            <p className="text-xs text-[rgba(21,21,21,0.3)]">
              {gameState.players.filter((p) => p.answeredCurrent).length} /{" "}
              {gameState.players.length} answered
            </p>
          </div>
        </div>
      );
    }

    // Show question
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-sm w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Image src="/posthog-logo-stacked.png" alt="PostHog" width={32} height={31} />
            <span className="text-xs font-mono text-[rgba(21,21,21,0.4)] tabular-nums">
              {gameState.questionIndex + 1} / {gameState.totalQuestions}
            </span>
          </div>

          {/* Progress */}
          <div className="h-[3px] bg-[#D0D1C9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#151515] rounded-full transition-all duration-500"
              style={{
                width: `${(gameState.questionIndex / gameState.totalQuestions) * 100}%`,
              }}
            />
          </div>

          {/* Quote */}
          <div className="bg-white border border-[#D0D1C9] rounded-xl p-6 shadow-sm space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
              Who said this?
            </p>
            <blockquote className="text-lg font-semibold leading-relaxed text-[#151515]">
              &ldquo;{gameState.quote}&rdquo;
            </blockquote>
          </div>

          <div className="border-t border-dashed border-[#D0D1C9]" />

          {/* Answer buttons */}
          <div className="grid grid-cols-1 gap-3">
            {(["dictator", "techbro"] as Category[]).map((cat) => {
              const s = CATEGORY_STYLES[cat];
              return (
                <button
                  key={cat}
                  onClick={() => handleAnswer(cat)}
                  className={`
                    py-5 rounded-xl font-bold text-base uppercase tracking-widest
                    border-2 transition-all active:scale-[0.97] cursor-pointer
                    ${s.border} ${s.bg} ${s.text} ${s.hover}
                  `}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── REVEAL ───────────────────────────────────────────────────────────────
  if (gameState?.phase === "reveal") {
    const isCorrect =
      myAnswer !== null && myAnswer === gameState.revealedCategory;
    const didAnswer = myAnswer !== null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-sm w-full space-y-5">
          {/* Result banner */}
          {didAnswer ? (
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 ${
                isCorrect
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-[#F54E00] bg-[#F54E00]/8 text-[#F54E00]"
              }`}
            >
              <span className="text-2xl">{isCorrect ? "✓" : "✗"}</span>
              <div>
                <p className="font-black text-base uppercase tracking-wide">
                  {isCorrect ? "Correct! +1,000 pts" : "Wrong!"}
                </p>
                <p className="text-xs opacity-70">
                  Total: {myPlayer?.score.toLocaleString() ?? 0} pts
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg border-2 border-[#D0D1C9] bg-white text-[rgba(21,21,21,0.5)]">
              <span className="text-2xl">—</span>
              <p className="font-semibold text-sm">You didn&apos;t answer in time</p>
            </div>
          )}

          {/* Revealed answer */}
          <div
            className={`border-2 rounded-xl p-5 space-y-4 ${
              gameState.revealedCategory === "dictator"
                ? "border-[#F54E00] bg-[#F54E00]/8"
                : "border-[#1D4AFF] bg-[#1D4AFF]/8"
            }`}
          >
            <blockquote className="text-base font-semibold leading-relaxed text-[#151515]">
              &ldquo;{gameState.quote}&rdquo;
            </blockquote>
            <div className="border-t border-dashed border-[#D0D1C9] pt-3 space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    gameState.revealedCategory === "dictator"
                      ? "bg-[#F54E00]"
                      : "bg-[#1D4AFF]"
                  }`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-[0.15em] ${
                    gameState.revealedCategory === "dictator"
                      ? "text-[#F54E00]"
                      : "text-[#1D4AFF]"
                  }`}
                >
                  {gameState.revealedCategory === "dictator" ? "Dictator" : "Tech Bro"}
                </span>
              </div>
              <p className="text-sm font-semibold text-[rgba(21,21,21,0.75)]">
                {gameState.revealedAttribution}
              </p>
              {gameState.revealedHint && (
                <p className="text-xs text-[rgba(21,21,21,0.45)]">{gameState.revealedHint}</p>
              )}
            </div>
          </div>

          {/* Mini leaderboard */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)] mb-2">
              Rankings
            </p>
            <Leaderboard
              players={gameState.players}
              myPlayerId={playerId ?? undefined}
              showStatus
              compact
            />
          </div>

          <p className="text-xs text-center text-[rgba(21,21,21,0.35)] uppercase tracking-widest animate-pulse">
            Waiting for next question…
          </p>
        </div>
      </div>
    );
  }

  // ─── FINISHED ─────────────────────────────────────────────────────────────
  if (gameState?.phase === "finished") {
    const myRank =
      gameState.players.findIndex((p) => p.id === playerId) + 1;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center space-y-2">
            <Image src="/posthog-logo-stacked.png" alt="PostHog" width={52} height={50} className="mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-[rgba(21,21,21,0.4)]">
              Game over
            </p>
            <h2 className="text-4xl font-black">
              {myRank === 1 ? "You won! 🏆" : `You placed #${myRank}`}
            </h2>
            <p className="text-base font-semibold text-[rgba(21,21,21,0.55)]">
              {myPlayer?.score.toLocaleString() ?? 0} points
            </p>
          </div>

          <div className="border-t border-dashed border-[#D0D1C9]" />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)] mb-3">
              Final standings
            </p>
            <Leaderboard
              players={gameState.players}
              myPlayerId={playerId ?? undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
