"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "aqhours-theme";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme ?? getSystemTheme();
    applyTheme(initialTheme);
    setTheme(initialTheme);

    if (storedTheme) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
      setTheme(systemTheme);
    };
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      return;
    }
  };

  return (
    <button
      type="button"
      className={["theme-toggle", className].filter(Boolean).join(" ")}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
      title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
    >
      <svg className="theme-toggle-icon theme-toggle-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.8V5M12 19v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.8 12H5M19 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" />
      </svg>
      <svg className="theme-toggle-icon theme-toggle-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.3 14.8A7.8 7.8 0 0 1 9.2 3.7A8.9 8.9 0 1 0 20.3 14.8Z" />
      </svg>
    </button>
  );
}
