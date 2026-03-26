"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { useGameSocket } from "@/lib/useGameSocket";
import Leaderboard from "@/components/Leaderboard";

export default function HostPage() {
  const { gameState, connected, hostAction } = useGameSocket();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [joinUrl, setJoinUrl] = useState<string>("");
  useEffect(() => {
    const url = `${window.location.origin}/add-player`;
    setJoinUrl(url);
    QRCode.toDataURL(url, {
      width: 180,
      margin: 1,
      color: { dark: "#151515", light: "#EEEFE9" },
    }).then(setQrDataUrl);
  }, []);

  const phase = gameState?.phase ?? "lobby";
  const players = gameState?.players ?? [];
  const answeredCount = players.filter((p) => p.answeredCurrent).length;
  const isLastQuestion =
    gameState && gameState.questionIndex + 1 >= gameState.totalQuestions;

  return (
    <div className="min-h-screen bg-[#EEEFE9] flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#D0D1C9] bg-white">
        <div className="flex items-center gap-4">
          <Image src="/posthog-logo-stacked.png" alt="PostHog" width={40} height={39} />
          <div>
            <h1 className="text-lg font-black leading-none">Dictator or Tech Bro?</h1>
            <p className="text-xs text-[rgba(21,21,21,0.4)] font-mono mt-0.5">party edition</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-[#F54E00]"}`}
            />
            <span className="text-xs text-[rgba(21,21,21,0.5)] font-mono">
              {connected ? "live" : "disconnected"}
            </span>
          </div>

          {/* Phase badge */}
          <span className="px-3 py-1 rounded-full bg-[#E5E7E0] text-xs font-bold uppercase tracking-widest text-[rgba(21,21,21,0.6)]">
            {phase}
          </span>

          {/* Danger: full reset */}
          <button
            onClick={() => {
              if (confirm("Full reset? This removes all players and scores.")) {
                hostAction("reset");
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-[#D0D1C9] text-xs font-semibold text-[rgba(21,21,21,0.5)] hover:border-[#F54E00] hover:text-[#F54E00] transition-colors cursor-pointer"
          >
            Full Reset
          </button>
        </div>
      </header>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-[260px_1fr_300px] gap-0 overflow-hidden">

        {/* ── LEFT: QR + player list ──────────────────────────────────── */}
        <aside className="border-r border-[#D0D1C9] bg-white flex flex-col p-6 gap-6 overflow-y-auto">
          {/* QR Code */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
              Scan to join
            </p>
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-dashed border-[#D0D1C9] bg-[#EEEFE9]">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt="QR code to join"
                  width={160}
                  height={160}
                  className="rounded"
                />
              ) : (
                <div className="w-40 h-40 bg-[#E5E7E0] rounded animate-pulse" />
              )}
              <p className="text-[10px] font-mono text-[rgba(21,21,21,0.5)] text-center break-all">
                {joinUrl}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-[#D0D1C9]" />

          {/* Player list */}
          <div className="space-y-2 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
              Players ({players.length})
            </p>
            {players.length === 0 ? (
              <p className="text-xs text-[rgba(21,21,21,0.35)] italic">
                Waiting for players…
              </p>
            ) : (
              <ul className="space-y-1.5">
                {players.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EEEFE9] border border-[#D0D1C9]"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.connected ? "bg-green-500" : "bg-[#BFBFBC]"
                        }`}
                    />
                    <span className="text-sm font-semibold flex-1 truncate">{p.name}</span>
                    {phase !== "lobby" && (
                      <span className="text-xs font-mono text-[rgba(21,21,21,0.4)]">
                        {p.score.toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* ── CENTER: Game state + controls ──────────────────────────── */}
        <main className="flex flex-col items-center justify-center p-10 gap-8 overflow-y-auto">

          {/* ── LOBBY ── */}
          {phase === "lobby" && (
            <div className="text-center space-y-6 max-w-md w-full">
              <Image
                src="/events-irl.png"
                alt="Hedgehogs"
                width={280}
                height={171}
                className="mx-auto drop-shadow-sm"
              />
              <div className="space-y-2">
                <h2 className="text-4xl font-black">Ready to start?</h2>
                <p className="text-[rgba(21,21,21,0.5)]">
                  {players.length === 0
                    ? "Waiting for players to scan in…"
                    : `${players.length} ${players.length === 1 ? "player" : "players"} in the lobby`}
                </p>
              </div>
              <button
                onClick={() => hostAction("start")}
                disabled={players.length === 0}
                className="
                  w-full py-5 rounded-xl bg-[#151515] text-[#EEEFE9]
                  font-black text-xl uppercase tracking-wide
                  hover:bg-[#2c2c2c] active:scale-[0.98] transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
                "
              >
                Start Game →
              </button>
            </div>
          )}

          {/* ── QUESTION ── */}
          {phase === "question" && (
            <div className="w-full max-w-xl space-y-6">
              <div className="flex justify-between items-center text-sm font-mono text-[rgba(21,21,21,0.45)]">
                <span>
                  Round {gameState!.questionIndex + 1} / {gameState!.totalQuestions}
                </span>
                <span
                  className={`font-semibold ${answeredCount === players.length
                    ? "text-green-600"
                    : "text-[rgba(21,21,21,0.45)]"
                    }`}
                >
                  {answeredCount}/{players.length} answered
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-[3px] bg-[#D0D1C9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#151515] rounded-full transition-all"
                  style={{
                    width: `${(gameState!.questionIndex / gameState!.totalQuestions) * 100
                      }%`,
                  }}
                />
              </div>

              {/* Quote */}
              <div className="bg-white border border-[#D0D1C9] rounded-2xl p-8 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
                  Who said this?
                </p>
                <blockquote className="text-2xl font-semibold leading-relaxed text-[#151515]">
                  &ldquo;{gameState!.quote}&rdquo;
                </blockquote>
              </div>

              {/* Answer progress dots */}
              {players.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      title={p.name}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-all ${p.answeredCurrent
                        ? "bg-[#151515] text-[#EEEFE9]"
                        : "bg-[#E5E7E0] text-[rgba(21,21,21,0.4)]"
                        }`}
                    >
                      {p.name.split(" ")[0]}
                    </div>
                  ))}
                </div>
              )}

              {/* Reveal button */}
              <button
                onClick={() => hostAction("reveal")}
                className="
                  w-full py-4 rounded-xl bg-[#F54E00] text-white
                  font-bold text-base uppercase tracking-wide
                  hover:bg-[#d94400] active:scale-[0.98] transition-all cursor-pointer
                "
              >
                Reveal Answer ⚡
              </button>
            </div>
          )}

          {/* ── REVEAL ── */}
          {phase === "reveal" && (
            <div className="w-full max-w-xl space-y-6">
              <div className="flex justify-between items-center text-sm font-mono text-[rgba(21,21,21,0.45)]">
                <span>
                  Round {gameState!.questionIndex + 1} / {gameState!.totalQuestions}
                </span>
                <span>
                  {gameState!.answerCounts?.dictator ?? 0} Dictator ·{" "}
                  {gameState!.answerCounts?.techbro ?? 0} Tech Bro
                </span>
              </div>

              {/* Answer distribution bar */}
              {gameState!.answerCounts && players.length > 0 && (
                <div className="flex h-3 rounded-full overflow-hidden bg-[#D0D1C9]">
                  <div
                    className="bg-[#F54E00] transition-all duration-700"
                    style={{
                      width: `${((gameState!.answerCounts.dictator) / players.length) * 100
                        }%`,
                    }}
                  />
                  <div
                    className="bg-[#1D4AFF] transition-all duration-700"
                    style={{
                      width: `${((gameState!.answerCounts.techbro) / players.length) * 100
                        }%`,
                    }}
                  />
                </div>
              )}

              {/* Revealed quote */}
              <div
                className={`border-2 rounded-2xl p-8 space-y-5 ${gameState!.revealedCategory === "dictator"
                  ? "border-[#F54E00] bg-[#F54E00]/8"
                  : "border-[#1D4AFF] bg-[#1D4AFF]/8"
                  }`}
              >
                <blockquote className="text-xl font-semibold leading-relaxed text-[#151515]">
                  &ldquo;{gameState!.quote}&rdquo;
                </blockquote>
                <div className="border-t border-dashed border-[#D0D1C9] pt-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${gameState!.revealedCategory === "dictator"
                        ? "bg-[#F54E00]"
                        : "bg-[#1D4AFF]"
                        }`}
                    />
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${gameState!.revealedCategory === "dictator"
                        ? "text-[#F54E00]"
                        : "text-[#1D4AFF]"
                        }`}
                    >
                      {gameState!.revealedCategory === "dictator" ? "Dictator" : "Tech Bro"}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-[rgba(21,21,21,0.75)]">
                    {gameState!.revealedAttribution}
                  </p>
                  {gameState!.revealedHint && (
                    <p className="text-sm text-[rgba(21,21,21,0.45)]">
                      {gameState!.revealedHint}
                    </p>
                  )}
                </div>
              </div>

              {/* Next / Finish */}
              <button
                onClick={() => hostAction("next")}
                className="
                  w-full py-4 rounded-xl bg-[#151515] text-[#EEEFE9]
                  font-bold text-base uppercase tracking-wide
                  hover:bg-[#2c2c2c] active:scale-[0.98] transition-all cursor-pointer
                "
              >
                {isLastQuestion ? "See Final Results →" : "Next Question →"}
              </button>
            </div>
          )}

          {/* ── FINISHED ── */}
          {phase === "finished" && (
            <div className="w-full max-w-md text-center space-y-8">
              <div className="space-y-3">
                <div className="text-5xl">🏆</div>
                <h2 className="text-4xl font-black">Game Over!</h2>
                {players[0] && (
                  <p className="text-xl font-semibold text-[rgba(21,21,21,0.6)]">
                    Winner:{" "}
                    <span className="text-[#151515] font-black">{players[0].name}</span>{" "}
                    — {players[0].score.toLocaleString()} pts
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => hostAction("restart")}
                  className="
                    py-4 rounded-xl bg-[#1D4AFF] text-white
                    font-bold text-sm uppercase tracking-wide
                    hover:bg-[#1639d4] active:scale-[0.98] transition-all cursor-pointer
                  "
                >
                  Play Again
                  <span className="block text-xs font-normal opacity-70 mt-0.5">
                    keep players
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Full reset? This removes all players and scores.")) {
                      hostAction("reset");
                    }
                  }}
                  className="
                    py-4 rounded-xl border-2 border-[#D0D1C9] bg-white
                    font-bold text-sm uppercase tracking-wide text-[rgba(21,21,21,0.6)]
                    hover:border-[#F54E00] hover:text-[#F54E00] active:scale-[0.98] transition-all cursor-pointer
                  "
                >
                  Full Reset
                  <span className="block text-xs font-normal opacity-70 mt-0.5">
                    clear players
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: Live leaderboard ─────────────────────────────────── */}
        <aside className="border-l border-[#D0D1C9] bg-white flex flex-col p-6 gap-4 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
            Live Rankings
          </p>
          <Leaderboard
            players={players}
            showStatus={phase === "reveal" || phase === "question"}
          />
        </aside>
      </div>
    </div>
  );
}
