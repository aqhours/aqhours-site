export type HelloScrollSession = {
  startProgress: number;
  allowAutoSettle: boolean;
};

const TOP_PROGRESS_THRESHOLD = 0.01;
const CLOUD_SCROLL_EXIT_END = 0.58;
const CLOUD_SCROLL_DISTANCE = 12;
const HEADER_POSE_END = 0.91;
const HEADER_SCALE_END = 0.96;
const HEADER_HANDOFF_START = HEADER_SCALE_END;
const HEADER_HANDOFF_END = 1;
export const PROFILE_REVEAL_THRESHOLD = 0.39;

function smootherStep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

export function resolveCloudFieldOffset(scrollProgress: number) {
  const movementProgress = Math.min(
    1,
    Math.max(0, scrollProgress / CLOUD_SCROLL_EXIT_END),
  );

  return smootherStep(movementProgress) * CLOUD_SCROLL_DISTANCE;
}

function resolvePhaseProgress(progress: number, start: number, end: number) {
  const phaseProgress = Math.min(
    1,
    Math.max(0, (progress - start) / (end - start)),
  );

  return smootherStep(phaseProgress);
}

export type HeaderTransition = {
  rotation: number;
  travel: number;
  scale: number;
  handoff: number;
};

export function resolveHeaderTransition(
  scrollProgress: number,
): HeaderTransition {
  return {
    rotation: resolvePhaseProgress(scrollProgress, 0, HEADER_POSE_END),
    travel: resolvePhaseProgress(scrollProgress, 0, HEADER_POSE_END),
    scale: resolvePhaseProgress(scrollProgress, 0, HEADER_SCALE_END),
    handoff: resolvePhaseProgress(
      scrollProgress,
      HEADER_HANDOFF_START,
      HEADER_HANDOFF_END,
    ),
  };
}

export function resolveHelloScrollSession(
  restoredProgress: number,
): HelloScrollSession {
  const startProgress = Math.min(1, Math.max(0, restoredProgress));

  return {
    startProgress,
    allowAutoSettle: startProgress <= TOP_PROGRESS_THRESHOLD,
  };
}

export function resolveProfileRevealVisibility(scrollProgress: number) {
  return scrollProgress >= PROFILE_REVEAL_THRESHOLD;
}
