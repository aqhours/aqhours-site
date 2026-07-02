import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  display: "swap",
  preload: false,
  variable: "--font-noto-serif-sc",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "aqhours",
  description: "与你相伴的时光，如此珍贵，如此难忘。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={notoSerifSC.variable}>{children}</body>
    </html>
  );
}
