"use client";

import Image from "next/image";
import type { Category, CategoryConfig, Question } from "@/lib/types";

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  categories: Record<Category, CategoryConfig>;
  onAnswer: (category: Category) => void;
}

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

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  categories,
  onAnswer,
}: Props) {
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

        {/* Progress bar */}
        <div className="h-[3px] bg-[#D0D1C9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#151515] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Quote card */}
        <div className="bg-white border border-[#D0D1C9] rounded-xl p-7 shadow-sm space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(21,21,21,0.4)]">
            Who said this?
          </p>
          <blockquote className="text-xl font-semibold leading-relaxed text-[#151515]">
            &ldquo;{question.quote}&rdquo;
          </blockquote>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-[#D0D1C9]" />

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(categories) as [Category, CategoryConfig][]).map(([key, cat]) => {
            const style = CATEGORY_STYLES[key];
            return (
              <button
                key={key}
                onClick={() => onAnswer(key)}
                className={`
                  py-5 rounded-xl font-bold text-sm uppercase tracking-widest
                  border-2 transition-all active:scale-[0.97] cursor-pointer
                  ${style.border} ${style.bg} ${style.text} ${style.hover}
                `}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
