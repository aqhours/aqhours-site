import type { Metadata } from "next";
import { Caveat, Inter, Manrope } from "next/font/google";
import { timeThemeInitScript } from "@/components/home/timeTheme";
import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: "variable",
});

const caveat = Caveat({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: "700",
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: timeThemeInitScript }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${caveat.variable}`}>
        {children}
      </body>
    </html>
  );
}
