import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeltIn — 맞는 로비에 녹아든다",
  description:
    "게임 취향으로 매칭하고, 음성 로비로 자연스럽게 들어가는 파티 파인더.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
