"use client";

import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMillisecondsUntilNextTheme,
  getThemeColorScheme,
  isTimeTheme,
  resolveTimeTheme,
  type TimeTheme,
} from "./timeTheme";

type ThemeOption = {
  id: TimeTheme;
  label: string;
  Icon: LucideIcon;
};

type Attraction = {
  height: number;
  offsetY: number;
};

type IndicatorStyle = CSSProperties & {
  "--indicator-height": string;
  "--indicator-y": string;
};

const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "dawn", label: "晨曦", Icon: Sunrise },
  { id: "day", label: "白昼", Icon: Sun },
  { id: "dusk", label: "黄昏", Icon: Sunset },
  { id: "night", label: "夜晚", Icon: Moon },
];

const CONTROL_PADDING = 4;
const OPTION_HEIGHT = 30;
const CONTROL_HEIGHT =
  CONTROL_PADDING * 2 + OPTION_HEIGHT * THEME_OPTIONS.length;
const INDICATOR_SIZE = 32;
const INDICATOR_BASE_TRANSLATE = 3;
const INDICATOR_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SHAPE_DURATION = 600;
const SHAPE_PEAK_OFFSET = 0.5;
const HEIGHT_BY_DISTANCE = [32, 35, 40, 45] as const;
const DOWNWARD_OFFSET_BY_DISTANCE = [3, 6, 8, 10] as const;
const UPWARD_OFFSET_BY_DISTANCE = [3, -8, -20, -32] as const;
const RESTING_ATTRACTION: Attraction = {
  height: INDICATOR_SIZE,
  offsetY: INDICATOR_BASE_TRANSLATE,
};

function getThemeIndex(theme: TimeTheme): number {
  return THEME_OPTIONS.findIndex((option) => option.id === theme);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function applyTheme(theme: TimeTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = getThemeColorScheme(theme);
}

export function TimeThemeSwitcher() {
  const [theme, setTheme] = useState<TimeTheme | null>(null);
  const [attraction, setAttraction] =
    useState<Attraction>(RESTING_ATTRACTION);
  const manualThemeRef = useRef(false);
  const boundaryTimerRef = useRef<number | null>(null);
  const themeRef = useRef<TimeTheme | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const shapeAnimationRef = useRef<Animation | null>(null);
  const controlTopRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const clearBoundaryTimer = useCallback(() => {
    if (boundaryTimerRef.current === null) return;
    window.clearTimeout(boundaryTimerRef.current);
    boundaryTimerRef.current = null;
  }, []);

  const resetAttraction = useCallback(() => {
    setAttraction(RESTING_ATTRACTION);
  }, []);

  const stopShapeAnimation = useCallback(() => {
    shapeAnimationRef.current?.cancel();
    shapeAnimationRef.current = null;
  }, []);

  const animateIndicatorShape = useCallback(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const currentStyle = window.getComputedStyle(indicator);
    const currentRadius = currentStyle.borderTopLeftRadius;
    const currentOpacity = Number.parseFloat(currentStyle.opacity);

    stopShapeAnimation();
    shapeAnimationRef.current = indicator.animate(
      [
        {
          borderRadius: currentRadius,
          opacity: currentOpacity,
          offset: 0,
          easing: INDICATOR_EASING,
        },
        {
          borderRadius: "20px",
          opacity: 0.8,
          scale:"0.8 1.2",
          offset: 0.5,
          easing: INDICATOR_EASING,
        },
        {
          borderRadius: "8px",
          opacity: 1,
          scale: "1 1",
          offset: 1,
        },
      ],
      { duration: SHAPE_DURATION },
    );
  }, [stopShapeAnimation]);

  const updateAttraction = useCallback(
    (pointerLocalY: number) => {
      const activeTheme = themeRef.current;
      if (reduceMotion || !activeTheme) {
        resetAttraction();
        return;
      }

      const activeIndex = getThemeIndex(activeTheme);
      const clampedPointerY = clamp(
        pointerLocalY,
        CONTROL_PADDING,
        CONTROL_HEIGHT - CONTROL_PADDING - 0.001,
      );
      const hoveredIndex = clamp(
        Math.floor((clampedPointerY - CONTROL_PADDING) / OPTION_HEIGHT),
        0,
        THEME_OPTIONS.length - 1,
      );
      const optionDistance = Math.abs(hoveredIndex - activeIndex);
      const activeCenter =
        CONTROL_PADDING + activeIndex * OPTION_HEIGHT + OPTION_HEIGHT / 2;
      const deltaY = clampedPointerY - activeCenter;
      const direction = Math.sign(deltaY);
      const nextAttraction = {
        height: HEIGHT_BY_DISTANCE[optionDistance],
        offsetY:
          direction < 0
            ? UPWARD_OFFSET_BY_DISTANCE[optionDistance]
            : DOWNWARD_OFFSET_BY_DISTANCE[optionDistance],
      };

      setAttraction((current) =>
        current.height === nextAttraction.height &&
        current.offsetY === nextAttraction.offsetY
          ? current
          : nextAttraction,
      );
    },
    [reduceMotion, resetAttraction],
  );

  const startIndicatorTravel = useCallback(
    () => {
      resetAttraction();

      if (reduceMotion) {
        stopShapeAnimation();
        return;
      }

      animateIndicatorShape();
    },
    [
      animateIndicatorShape,
      reduceMotion,
      resetAttraction,
      stopShapeAnimation,
    ],
  );

  const moveIndicatorToTheme = useCallback(
    (nextTheme: TimeTheme) => {
      const previousTheme = themeRef.current;

      themeRef.current = nextTheme;
      if (previousTheme === nextTheme) return;

      startIndicatorTravel();
      setTheme(nextTheme);
    },
    [startIndicatorTravel],
  );

  useEffect(() => {
    function scheduleNextBoundary() {
      clearBoundaryTimer();
      boundaryTimerRef.current = window.setTimeout(
        syncWithLocalTime,
        getMillisecondsUntilNextTheme(),
      );
    }

    function syncWithLocalTime() {
      if (manualThemeRef.current) return;
      const timeTheme = resolveTimeTheme();
      applyTheme(timeTheme);
      moveIndicatorToTheme(timeTheme);
      scheduleNextBoundary();
    }

    const initialTheme = document.documentElement.dataset.theme;
    if (isTimeTheme(initialTheme)) {
      themeRef.current = initialTheme;
      setTheme(initialTheme);
      scheduleNextBoundary();
    } else {
      syncWithLocalTime();
    }

    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") syncWithLocalTime();
    };

    document.addEventListener("visibilitychange", syncWhenVisible);
    window.addEventListener("focus", syncWithLocalTime);
    window.addEventListener("pageshow", syncWithLocalTime);

    return () => {
      clearBoundaryTimer();
      stopShapeAnimation();
      document.removeEventListener("visibilitychange", syncWhenVisible);
      window.removeEventListener("focus", syncWithLocalTime);
      window.removeEventListener("pageshow", syncWithLocalTime);
    };
  }, [
    clearBoundaryTimer,
    moveIndicatorToTheme,
    stopShapeAnimation,
  ]);

  const selectTheme = (nextTheme: TimeTheme) => {
    manualThemeRef.current = true;
    clearBoundaryTimer();
    applyTheme(nextTheme);
    moveIndicatorToTheme(nextTheme);
  };

  const activeIndex = theme ? getThemeIndex(theme) : 0;
  const indicatorY =
    activeIndex * OPTION_HEIGHT + attraction.offsetY;
  const indicatorStyle: IndicatorStyle = {
    "--indicator-height": `${attraction.height}px`,
    "--indicator-y": `${indicatorY}px`,
  };

  return (
    <div className="fixed top-1/2 right-[clamp(10px,2vw,28px)] z-40 h-32 w-9 -translate-y-1/2 overflow-hidden rounded-[12px] bg-[var(--theme-control-bg)] backdrop-blur-sm">
      <div
        className="relative flex h-32 w-9 flex-col p-1"
        style={indicatorStyle}
        role="group"
        aria-label="一天中的主题；选择后保持到刷新页面"
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          controlTopRef.current = event.currentTarget.getBoundingClientRect().top;
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;

          const controlTop =
            controlTopRef.current ??
            event.currentTarget.getBoundingClientRect().top;
          const pointerLocalY = clamp(
            event.clientY - controlTop,
            0,
            CONTROL_HEIGHT,
          );

          updateAttraction(pointerLocalY);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          controlTopRef.current = null;
          resetAttraction();
        }}
      >
        {theme !== null && (
          <div
            ref={indicatorRef}
            className="theme-time-indicator"
            aria-hidden="true"
          />
        )}

        {THEME_OPTIONS.map(({ id, label, Icon }) => {
          const selected = theme === id;

          return (
            <button
              key={id}
              type="button"
              className="relative z-10 flex w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent px-0 py-2 focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
              onClick={() => selectTheme(id)}
              aria-label={`${label}主题；选择后保持到刷新页面`}
              aria-pressed={selected}
              title={`${label}主题`}
            >
              <Icon
                className={[
                  "theme-time-icon",
                  selected
                    ? "text-[var(--theme-control-active-fg)] opacity-100"
                    : "text-white opacity-50",
                ].join(" ")}
                size={14}
                strokeWidth={1}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
