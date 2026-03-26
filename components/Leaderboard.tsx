"use client";

import type { PublicPlayer } from "@/lib/wsMessages";

interface Props {
  players: PublicPlayer[];
  myPlayerId?: string;
  /** Show answered/result indicators next to names */
  showStatus?: boolean;
  compact?: boolean;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({
  players,
  myPlayerId,
  showStatus = false,
  compact = false,
}: Props) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-[rgba(21,21,21,0.4)] text-center py-4">
        No players yet
      </p>
    );
  }

  return (
    <ol className={compact ? "space-y-1" : "space-y-2"}>
      {players.map((player, i) => {
        const isMe = player.id === myPlayerId;
        const rank = RANK_MEDALS[i] ?? `#${i + 1}`;

        return (
          <li
            key={player.id}
            className={`
              flex items-center gap-3 rounded-lg border transition-all
              ${compact ? "px-3 py-2" : "px-4 py-3"}
              ${isMe
                ? "border-[#1D4AFF] bg-[#1D4AFF]/8"
                : "border-[#D0D1C9] bg-white"}
              ${!player.connected ? "opacity-50" : ""}
            `}
          >
            {/* Rank */}
            <span className={`shrink-0 tabular-nums font-mono ${compact ? "w-6 text-sm" : "w-8 text-base"} text-center`}>
              {rank}
            </span>

            {/* Name */}
            <span
              className={`
                flex-1 font-semibold truncate
                ${compact ? "text-sm" : "text-base"}
                ${isMe ? "text-[#1D4AFF]" : "text-[#151515]"}
              `}
            >
              {player.name}
              {isMe && (
                <span className="text-xs font-normal ml-1 opacity-50">(you)</span>
              )}
            </span>

            {/* Status indicator (answered / correct / wrong) */}
            {showStatus && (
              <span className="shrink-0 w-5 text-center text-sm">
                {player.correct === true ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : player.correct === false ? (
                  <span className="text-[#F54E00] font-bold">✗</span>
                ) : player.answeredCurrent ? (
                  <span className="text-[rgba(21,21,21,0.3)]">●</span>
                ) : null}
              </span>
            )}

            {/* Score */}
            <span
              className={`
                shrink-0 font-mono font-bold tabular-nums
                ${compact ? "text-sm" : "text-base"}
                ${isMe ? "text-[#1D4AFF]" : "text-[#151515]"}
              `}
            >
              {player.score.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
