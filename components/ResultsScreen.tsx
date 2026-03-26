"use client";

import Image from "next/image";
import type { Category, CategoryConfig, Question } from "@/lib/types";

interface Answer {
  question: Question;
  selected: Category;
  correct: boolean;
}

interface Props {
  answers: Answer[];
  categories: Record<Category, CategoryConfig>;
  onRestart: () => void;
}

function getVerdict(score: number, total: number) {
  const pct = score / total;
  if (pct === 1)  return { text: "Perfect score. You can definitely tell the difference.", emoji: "🏆" };
  if (pct >= 0.8) return { text: "You're dangerously good at spotting power-hungry language.", emoji: "🎯" };
  if (pct >= 0.6) return { text: "Not bad — the lines are blurrier than they seem.", emoji: "🤔" };
  if (pct >= 0.4) return { text: "They sound more alike than you'd think.", emoji: "😅" };
  return { text: "Turns out, dictators and tech bros have a lot in common.", emoji: "💀" };
}

const CATEGORY_COLORS: Record<Category, string> = {
  dictator: "#F54E00",
  techbro: "#1D4AFF",
};

export default function ResultsScreen({ answers, categories, onRestart }: Props) {
  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const verdict = getVerdict(score, total);
  const pct = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      <div className="max-w-lg w-full flex flex-col gap-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/posthog-logo-stacked.png" alt="PostHog" width={52} height={50} />
        </div>

        {/* Score hero */}
        <div className="text-center space-y-3">
          <div className="text-5xl">{verdict.emoji}</div>
          <div className="text-7xl font-black tabular-nums leading-none text-[#151515]">
            {score}
            <span className="text-[#BFBFBC]">/{total}</span>
          </div>
          <p className="text-sm font-semibold text-[rgba(21,21,21,0.6)] max-w-xs mx-auto leading-snug">
            {verdict.text}
          </p>
          <p className="text-xs font-mono text-[rgba(21,21,21,0.35)]">{pct}% accuracy</p>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-[#D0D1C9]" />

        {/* Breakdown */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)] mb-3">
            Round breakdown
          </p>
          {answers.map((answer, i) => {
            const correctColor = CATEGORY_COLORS[answer.question.category];
            const correctLabel = categories[answer.question.category].label;
            return (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#D0D1C9] bg-white"
              >
                <span
                  className={`mt-0.5 shrink-0 text-sm font-black ${
                    answer.correct ? "text-[#22c55e]" : "text-[#F54E00]"
                  }`}
                >
                  {answer.correct ? "✓" : "✗"}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm text-[rgba(21,21,21,0.8)] line-clamp-1">
                    &ldquo;{answer.question.quote.slice(0, 72)}
                    {answer.question.quote.length > 72 ? "…" : ""}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: correctColor }}
                    />
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: correctColor }}>
                      {correctLabel}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-lg bg-[#151515] text-[#EEEFE9] font-bold text-sm uppercase tracking-wide hover:bg-[#2c2c2c] active:scale-[0.98] transition-all cursor-pointer"
        >
          Play Again
        </button>

        <p className="text-xs text-center text-[rgba(21,21,21,0.3)]">
          Brought to you by PostHog
        </p>
      </div>
    </div>
  );
}
