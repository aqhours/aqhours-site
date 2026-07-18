export const TIME_THEME_BOUNDARIES = {
  dawn: 5,
  day: 11,
  dusk: 17,
  night: 20,
} as const;

export const TIME_THEMES = ["dawn", "day", "dusk", "night"] as const;

export type TimeTheme = (typeof TIME_THEMES)[number];

export function isTimeTheme(value: string | undefined): value is TimeTheme {
  return TIME_THEMES.some((theme) => theme === value);
}

export function resolveTimeTheme(date = new Date()): TimeTheme {
  const hour = date.getHours();

  if (hour >= TIME_THEME_BOUNDARIES.night || hour < TIME_THEME_BOUNDARIES.dawn) {
    return "night";
  }
  if (hour < TIME_THEME_BOUNDARIES.day) return "dawn";
  if (hour < TIME_THEME_BOUNDARIES.dusk) return "day";
  return "dusk";
}

export function getThemeColorScheme(theme: TimeTheme): "light" | "dark" {
  return theme === "dawn" || theme === "day" ? "light" : "dark";
}

export function getMillisecondsUntilNextTheme(date = new Date()): number {
  const nextBoundary = new Date(date);
  const hour = date.getHours();

  if (hour < TIME_THEME_BOUNDARIES.dawn) {
    nextBoundary.setHours(TIME_THEME_BOUNDARIES.dawn, 0, 0, 0);
  } else if (hour < TIME_THEME_BOUNDARIES.day) {
    nextBoundary.setHours(TIME_THEME_BOUNDARIES.day, 0, 0, 0);
  } else if (hour < TIME_THEME_BOUNDARIES.dusk) {
    nextBoundary.setHours(TIME_THEME_BOUNDARIES.dusk, 0, 0, 0);
  } else if (hour < TIME_THEME_BOUNDARIES.night) {
    nextBoundary.setHours(TIME_THEME_BOUNDARIES.night, 0, 0, 0);
  } else {
    nextBoundary.setDate(nextBoundary.getDate() + 1);
    nextBoundary.setHours(TIME_THEME_BOUNDARIES.dawn, 0, 0, 0);
  }

  return Math.max(1_000, nextBoundary.getTime() - date.getTime() + 100);
}

const { dawn, day, dusk, night } = TIME_THEME_BOUNDARIES;

export const timeThemeInitScript = `
(() => {
  try {
    const hour = new Date().getHours();
    const theme = hour >= ${night} || hour < ${dawn}
      ? "night"
      : hour < ${day}
        ? "dawn"
        : hour < ${dusk}
          ? "day"
          : "dusk";
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === "dawn" || theme === "day" ? "light" : "dark";
  } catch {
    document.documentElement.dataset.theme = "day";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;
