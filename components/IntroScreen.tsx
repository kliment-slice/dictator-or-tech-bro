"use client";

import Image from "next/image";

interface Props {
  onStart: () => void;
  totalQuestions: number;
}

export default function IntroScreen({ onStart, totalQuestions }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-lg w-full flex flex-col items-center gap-8">
        {/* PostHog logo */}
        <Image
          src="/posthog-logo-stacked.png"
          alt="PostHog"
          width={80}
          height={77}
          priority
        />

        {/* Hedgehog mascot */}
        <div className="relative">
          <Image
            src="/events-irl.png"
            alt="PostHog hedgehogs"
            width={320}
            height={196}
            priority
            className="drop-shadow-sm"
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(21,21,21,0.45)]">
            party edition
          </p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#151515]">
            Dictator<br />or Tech Bro?
          </h1>
          <p className="text-base text-[rgba(21,21,21,0.65)] leading-relaxed max-w-sm mx-auto">
            We show you a real quote. You guess who said it — an authoritarian leader or a Silicon Valley billionaire.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-dashed border-[#D0D1C9]" />

        {/* Category preview */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-lg border-2 border-[#F54E00] bg-[#F54E00]/8">
            <span className="text-xl">☭</span>
            <span className="text-sm font-bold text-[#F54E00] uppercase tracking-wide">Dictator</span>
          </div>
          <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-lg border-2 border-[#1D4AFF] bg-[#1D4AFF]/8">
            <span className="text-xl">🚀</span>
            <span className="text-sm font-bold text-[#1D4AFF] uppercase tracking-wide">Tech Bro</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-lg bg-[#151515] text-[#EEEFE9] font-bold text-base uppercase tracking-wide hover:bg-[#2c2c2c] active:scale-[0.98] transition-all cursor-pointer"
        >
          Start — {totalQuestions} rounds
        </button>

        <p className="text-xs text-[rgba(21,21,21,0.35)] text-center">
          Questions are shuffled each game
        </p>
      </div>
    </div>
  );
}
