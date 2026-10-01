import { Syne, Figtree } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const sans = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GameMatch — 취향 맞는 파티를 찾다",
  description:
    "게임 취향으로 매칭하고, 맞으면 바로 음성으로 붙는 파티 파인더.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
