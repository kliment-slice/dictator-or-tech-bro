import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dictator or Tech Bro?",
  description: "Can you tell the difference? Let's find out.",
  openGraph: {
    title: "Dictator or Tech Bro?",
    description: "Can you tell the difference? Let's find out.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#EEEFE9] text-[#151515] font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
