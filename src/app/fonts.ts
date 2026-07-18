import localFont from "next/font/local";

export const sfProCompressed = localFont({
  src: "./fonts/sf-pro-compressed-heavy-latin.woff2",
  display: "swap",
  preload: false,
  weight: "800",
  style: "normal",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
  adjustFontFallback: false,
});
