import type { Metadata } from "next";
import { Caveat, Inter, Manrope, Roboto_Condensed } from "next/font/google";
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

const robotoCondensed = Roboto_Condensed({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: "variable",
});

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("aqhours-theme");
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${caveat.variable} ${robotoCondensed.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
