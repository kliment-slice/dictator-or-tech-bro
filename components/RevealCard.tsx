"use client";

import Image from "next/image";
import type { Category, CategoryConfig, Question } from "@/lib/types";

interface Props {
  question: Question;
  selected: Category;
  correct: boolean;
  categories: Record<Category, CategoryConfig>;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  onNext: () => void;
  isLast: boolean;
}

const CATEGORY_STYLES: Record<Category, { border: string; bg: string; label: string; dot: string }> = {
  dictator: { border: "border-[#F54E00]", bg: "bg-[#F54E00]/8", label: "text-[#F54E00]", dot: "bg-[#F54E00]" },
  techbro:  { border: "border-[#1D4AFF]", bg: "bg-[#1D4AFF]/8", label: "text-[#1D4AFF]", dot: "bg-[#1D4AFF]" },
};

const CATEGORY_HEX: Record<Category, string> = {
  dictator: "#F54E00",
  techbro: "#1D4AFF",
};

export default function RevealCard({
  question,
  selected,
  correct,
  categories,
  questionNumber,
  totalQuestions,
  score,
  onNext,
  isLast,
}: Props) {
  const correctCat = categories[question.category];
  const correctStyle = CATEGORY_STYLES[question.category];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-lg w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Image src="/posthog-logo-stacked.png" alt="PostHog" width={36} height={35} />
          <span className="text-xs font-semibold text-[rgba(21,21,21,0.45)] font-mono tabular-nums">
            {questionNumber} / {totalQuestions}
          </span>
        </div>

        {/* Progress bar — filled to current */}
        <div className="h-[3px] bg-[#D0D1C9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#151515] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Correct / Wrong banner */}
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 ${
            correct
              ? "border-[#22c55e] bg-[#22c55e]/10 text-[#16a34a]"
              : "border-[#F54E00] bg-[#F54E00]/10 text-[#F54E00]"
          }`}
        >
          <span className="text-xl">{correct ? "✓" : "✗"}</span>
          <div>
            <p className="font-black text-base uppercase tracking-wide">
              {correct ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-xs opacity-70">
              {score} / {questionNumber} so far
            </p>
          </div>
        </div>

        {/* Revealed quote card */}
        <div className={`border-2 rounded-xl p-6 space-y-4 ${correctStyle.border} ${correctStyle.bg}`}>
          <blockquote className="text-lg font-semibold leading-relaxed text-[#151515]">
            &ldquo;{question.quote}&rdquo;
          </blockquote>

          <div className="border-t border-dashed border-[#D0D1C9] pt-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${correctStyle.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-[0.15em] ${correctStyle.label}`}>
                {correctCat.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-[rgba(21,21,21,0.75)]">{question.attribution}</p>
            {question.hint && (
              <p className="text-xs text-[rgba(21,21,21,0.45)]">{question.hint}</p>
            )}
          </div>
        </div>

        {/* What you picked (on wrong answer) */}
        {!correct && (
          <p className="text-center text-sm text-[rgba(21,21,21,0.5)]">
            You picked{" "}
            <span
              className="font-bold"
              style={{ color: CATEGORY_HEX[selected] }}
            >
              {categories[selected].label}
            </span>
          </p>
        )}

        <button
          onClick={onNext}
          className="w-full py-4 rounded-lg bg-[#151515] text-[#EEEFE9] font-bold text-sm uppercase tracking-wide hover:bg-[#2c2c2c] active:scale-[0.98] transition-all cursor-pointer"
        >
          {isLast ? "See Results →" : "Next Quote →"}
        </button>
      </div>
    </div>
  );
}
