"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  resolveAutoScrollProgress,
  resolveInertialScrollTarget,
  resolveSpringScrollState,
  resolveScrollMotionSession,
  type ScrollMotionSession,
  WHEEL_INPUT_VELOCITY_GAIN,
  WHEEL_MAX_VELOCITY,
  WHEEL_MIN_GLIDE_DISTANCE,
  WHEEL_SPRING_RESPONSE,
} from "./scrollMotion";

const SCROLL_INTENT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);
const MANUAL_SCROLL_STOP_DISTANCE = 0.35;
const MANUAL_SCROLL_STOP_VELOCITY = 5;
const WHEEL_LINE_HEIGHT = 16;

type ScrollProgressListener = (progress: number) => void;
export type SubscribeScrollProgress = (
  listener: ScrollProgressListener,
) => () => void;

type ScrollMotionControllerOptions = {
  reduceMotion: boolean;
  autoScrollDuration: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function useScrollMotionController({
  reduceMotion,
  autoScrollDuration,
}: ScrollMotionControllerOptions) {
  const scrollStageRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef(0);
  const progressListenersRef = useRef(new Set<ScrollProgressListener>());
  const autoScrollFrameRef = useRef<number | null>(null);
  const autoScrollActiveRef = useRef(false);
  const manualScrollFrameRef = useRef<number | null>(null);
  const manualScrollTargetRef = useRef(0);
  const manualScrollLastTimeRef = useRef<number | null>(null);
  const scrollVelocityRef = useRef(0);
  const autoSettleAllowedRef = useRef(false);
  const userHasTakenControlRef = useRef(false);
  const [scrollSession, setScrollSession] = useState<
    ScrollMotionSession & { ready: boolean }
  >({
    ready: false,
    startProgress: 0,
    allowAutoSettle: false,
  });

  const publishScrollProgress = useCallback((progress: number) => {
    if (scrollProgressRef.current === progress) return progress;

    scrollProgressRef.current = progress;
    progressListenersRef.current.forEach((listener) => listener(progress));
    return progress;
  }, []);

  const subscribeScrollProgress = useCallback<SubscribeScrollProgress>(
    (listener) => {
      progressListenersRef.current.add(listener);
      listener(scrollProgressRef.current);

      return () => progressListenersRef.current.delete(listener);
    },
    [],
  );

  const updateScrollProgress = useCallback(() => {
    if (reduceMotion) return publishScrollProgress(1);

    const stage = scrollStageRef.current;
    if (!stage) return scrollProgressRef.current;

    const stageTop = window.scrollY + stage.getBoundingClientRect().top;
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const rawProgress = clamp(
      (window.scrollY - stageTop) / scrollDistance,
      0,
      1,
    );

    return publishScrollProgress(rawProgress);
  }, [publishScrollProgress, reduceMotion]);

  const cancelAutoScroll = useCallback(() => {
    autoScrollActiveRef.current = false;

    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const cancelManualScroll = useCallback(() => {
    if (manualScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(manualScrollFrameRef.current);
      manualScrollFrameRef.current = null;
    }

    manualScrollTargetRef.current = window.scrollY;
    manualScrollLastTimeRef.current = null;
    scrollVelocityRef.current = 0;
  }, []);

  const queueManualScroll = useCallback(
    (wheelDelta: number) => {
      const maxScrollY = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );

      if (manualScrollFrameRef.current === null) {
        manualScrollTargetRef.current = window.scrollY;
      }

      const current = window.scrollY;
      const previousTarget = manualScrollTargetRef.current;
      const pendingDirection = Math.sign(previousTarget - current);
      const inputDirection = Math.sign(wheelDelta);
      const isReversing =
        pendingDirection !== 0 &&
        inputDirection !== 0 &&
        pendingDirection !== inputDirection;
      const nextTarget = clamp(
        resolveInertialScrollTarget(
          current,
          previousTarget,
          wheelDelta,
          WHEEL_MIN_GLIDE_DISTANCE,
        ),
        0,
        maxScrollY,
      );
      const impulseOrigin = isReversing ? current : previousTarget;
      const inputDistance = nextTarget - impulseOrigin;

      manualScrollTargetRef.current = nextTarget;
      scrollVelocityRef.current = clamp(
        scrollVelocityRef.current +
          inputDistance * WHEEL_INPUT_VELOCITY_GAIN,
        -WHEEL_MAX_VELOCITY,
        WHEEL_MAX_VELOCITY,
      );

      if (manualScrollFrameRef.current !== null) return;

      manualScrollLastTimeRef.current = null;

      const advance = (time: number) => {
        const lastTime = manualScrollLastTimeRef.current;
        const delta =
          lastTime === null
            ? 1 / 60
            : clamp((time - lastTime) / 1000, 1 / 240, 0.05);
        manualScrollLastTimeRef.current = time;

        const currentMaxScrollY = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          0,
        );
        const target = clamp(
          manualScrollTargetRef.current,
          0,
          currentMaxScrollY,
        );
        manualScrollTargetRef.current = target;

        const spring = resolveSpringScrollState(
          window.scrollY,
          target,
          scrollVelocityRef.current,
          WHEEL_SPRING_RESPONSE,
          delta,
        );
        const next = clamp(spring.position, 0, currentMaxScrollY);
        const hitScrollBoundary = next !== spring.position;
        scrollVelocityRef.current = hitScrollBoundary ? 0 : spring.velocity;
        const settled =
          Math.abs(target - next) <= MANUAL_SCROLL_STOP_DISTANCE &&
          Math.abs(scrollVelocityRef.current) <= MANUAL_SCROLL_STOP_VELOCITY;

        window.scrollTo({
          top: settled ? target : next,
          behavior: "auto",
        });
        updateScrollProgress();

        if (settled) {
          manualScrollFrameRef.current = null;
          manualScrollLastTimeRef.current = null;
          scrollVelocityRef.current = 0;
          return;
        }

        manualScrollFrameRef.current = window.requestAnimationFrame(advance);
      };

      manualScrollFrameRef.current = window.requestAnimationFrame(advance);
    },
    [updateScrollProgress],
  );

  const startAutoScroll = useCallback(() => {
    if (
      reduceMotion ||
      !autoSettleAllowedRef.current ||
      userHasTakenControlRef.current
    ) {
      return;
    }

    const stage = scrollStageRef.current;
    if (!stage) return;

    cancelAutoScroll();
    cancelManualScroll();

    const stageTop = window.scrollY + stage.getBoundingClientRect().top;
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const startY = window.scrollY;
    const targetY = stageTop + scrollDistance;
    const startTime = performance.now();
    let lastTime = startTime;
    let lastPosition = startY;

    autoScrollActiveRef.current = true;

    const advance = (time: number) => {
      if (!autoScrollActiveRef.current) return;

      const rawProgress = clamp(
        (time - startTime) / (autoScrollDuration * 1000),
        0,
        1,
      );
      const motionProgress = resolveAutoScrollProgress(rawProgress);
      const nextPosition = startY + (targetY - startY) * motionProgress;
      const delta = clamp((time - lastTime) / 1000, 1 / 240, 0.05);

      scrollVelocityRef.current = (nextPosition - lastPosition) / delta;
      lastTime = time;
      lastPosition = nextPosition;

      window.scrollTo({
        top: nextPosition,
        behavior: "auto",
      });
      updateScrollProgress();

      if (rawProgress < 1) {
        autoScrollFrameRef.current = window.requestAnimationFrame(advance);
      } else {
        autoScrollActiveRef.current = false;
        autoScrollFrameRef.current = null;
        scrollVelocityRef.current = 0;
        publishScrollProgress(1);
      }
    };

    autoScrollFrameRef.current = window.requestAnimationFrame(advance);
  }, [
    autoScrollDuration,
    cancelAutoScroll,
    cancelManualScroll,
    publishScrollProgress,
    reduceMotion,
    updateScrollProgress,
  ]);

  useLayoutEffect(() => {
    if (reduceMotion) {
      publishScrollProgress(1);
      autoSettleAllowedRef.current = false;
      setScrollSession({
        ready: true,
        startProgress: 1,
        allowAutoSettle: false,
      });
      return;
    }

    const restoredProgress = updateScrollProgress();
    const resolvedSession = resolveScrollMotionSession(restoredProgress);
    const allowAutoSettle =
      resolvedSession.allowAutoSettle && !userHasTakenControlRef.current;

    publishScrollProgress(resolvedSession.startProgress);
    autoSettleAllowedRef.current = allowAutoSettle;
    setScrollSession({
      ready: true,
      startProgress: resolvedSession.startProgress,
      allowAutoSettle,
    });
  }, [publishScrollProgress, reduceMotion, updateScrollProgress]);

  useEffect(() => {
    const disableAutoSettle = () => {
      if (!autoSettleAllowedRef.current) return;

      autoSettleAllowedRef.current = false;
      setScrollSession((current) => ({
        ...current,
        allowAutoSettle: false,
      }));
    };

    const handleScroll = () => {
      const progress = updateScrollProgress();

      if (
        !autoScrollActiveRef.current &&
        !resolveScrollMotionSession(progress).allowAutoSettle
      ) {
        disableAutoSettle();
      }
    };

    const claimUserControl = () => {
      userHasTakenControlRef.current = true;
      disableAutoSettle();
      cancelAutoScroll();
    };
    const handleNativeUserIntent = () => {
      claimUserControl();
      cancelManualScroll();
    };
    const handleWheel = (event: WheelEvent) => {
      claimUserControl();

      const eventTarget = event.target;
      const keepNativeWheel =
        event.defaultPrevented ||
        (eventTarget instanceof Element &&
          eventTarget.closest('[data-native-wheel="true"]') !== null);

      if (keepNativeWheel) {
        cancelManualScroll();
        return;
      }

      if (reduceMotion || event.ctrlKey) {
        cancelManualScroll();
        return;
      }

      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        cancelManualScroll();
        return;
      }

      const deltaScale =
        event.deltaMode === 1
          ? WHEEL_LINE_HEIGHT
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      const wheelDelta = event.deltaY * deltaScale;

      if (Math.abs(wheelDelta) < 0.01) return;

      event.preventDefault();
      queueManualScroll(wheelDelta);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_INTENT_KEYS.has(event.key)) handleNativeUserIntent();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) return;

      cancelAutoScroll();
      cancelManualScroll();
    };
    const handlePageShow = () => handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleNativeUserIntent, {
      passive: true,
    });
    window.addEventListener("pointerdown", handleNativeUserIntent, {
      passive: true,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAutoScroll();
      cancelManualScroll();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleNativeUserIntent);
      window.removeEventListener("pointerdown", handleNativeUserIntent);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    cancelAutoScroll,
    cancelManualScroll,
    queueManualScroll,
    reduceMotion,
    updateScrollProgress,
  ]);

  return {
    scrollStageRef,
    scrollProgressRef,
    scrollSession,
    startAutoScroll,
    subscribeScrollProgress,
  };
}
