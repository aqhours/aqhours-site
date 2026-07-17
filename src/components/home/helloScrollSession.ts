const CLOUD_SCROLL_EXIT_END = 0.58;
const CLOUD_SCROLL_DISTANCE = 12;
const HEADER_ROTATION_END = 0.85;
const HEADER_ARRIVAL_END = 0.9;
const HEADER_HANDOFF_POINT = 1;
export const HELLO_HEADER_ARRIVAL_PROGRESS = 0.91;
export const PROFILE_REVEAL_THRESHOLD = 0.45;
export const PROFILE_HIDE_THRESHOLD = 0.39;
const PROFILE_MOTION_END = 1;
const PROFILE_REVEAL_OFFSET_VH = 50;
const PROFILE_HIDE_OFFSET_VH = 60;
export const PROFILE_OFFSET_AT_HEADER_ARRIVAL_VH = 6;
const PROFILE_SETTLE_RANGE = PROFILE_MOTION_END - PROFILE_REVEAL_THRESHOLD;
const PROFILE_HEADER_ARRIVAL_SETTLE_PROGRESS =
  (HELLO_HEADER_ARRIVAL_PROGRESS - PROFILE_REVEAL_THRESHOLD) /
  PROFILE_SETTLE_RANGE;
const PROFILE_SETTLED_SHARE_AT_HEADER_ARRIVAL =
  1 - PROFILE_OFFSET_AT_HEADER_ARRIVAL_VH / PROFILE_REVEAL_OFFSET_VH;
const PROFILE_SETTLE_CURVE_BIAS =
  (PROFILE_SETTLED_SHARE_AT_HEADER_ARRIVAL -
    PROFILE_HEADER_ARRIVAL_SETTLE_PROGRESS) /
  (PROFILE_HEADER_ARRIVAL_SETTLE_PROGRESS ** 3 -
    PROFILE_HEADER_ARRIVAL_SETTLE_PROGRESS ** 2);

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

export function resolveHelloScrollProgress(stageProgress: number) {
  const clampedProgress = Math.min(1, Math.max(0, stageProgress));

  return clampedProgress >= HELLO_HEADER_ARRIVAL_PROGRESS
    ? 1
    : clampedProgress;
}

export function resolveHeaderTransition(
  stageProgress: number,
): HeaderTransition {
  const scrollProgress = resolveHelloScrollProgress(stageProgress);
  const arrivalProgress = resolvePhaseProgress(
    scrollProgress,
    0,
    HEADER_ARRIVAL_END,
  );

  return {
    rotation: resolvePhaseProgress(scrollProgress, 0, HEADER_ROTATION_END),
    travel: arrivalProgress,
    scale: arrivalProgress,
    handoff: scrollProgress >= HEADER_HANDOFF_POINT ? 1 : 0,
  };
}

export function resolveProfileRevealVisibility(
  scrollProgress: number,
  isVisible = false,
) {
  if (isVisible) return scrollProgress > PROFILE_HIDE_THRESHOLD;

  return scrollProgress >= PROFILE_REVEAL_THRESHOLD;
}

export function resolveProfileTravelOffsetVh(scrollProgress: number) {
  if (scrollProgress <= PROFILE_HIDE_THRESHOLD) {
    return PROFILE_HIDE_OFFSET_VH;
  }

  if (scrollProgress < PROFILE_REVEAL_THRESHOLD) {
    const exitProgress =
      (scrollProgress - PROFILE_HIDE_THRESHOLD) /
      (PROFILE_REVEAL_THRESHOLD - PROFILE_HIDE_THRESHOLD);

    return (
      PROFILE_HIDE_OFFSET_VH +
      (PROFILE_REVEAL_OFFSET_VH - PROFILE_HIDE_OFFSET_VH) *
        smootherStep(exitProgress)
    );
  }

  const linearSettleProgress = Math.min(
    1,
    Math.max(
      0,
      (scrollProgress - PROFILE_REVEAL_THRESHOLD) /
        PROFILE_SETTLE_RANGE,
    ),
  );
  // One monotonic cubic passes through the configured handoff anchor without
  // introducing a second animation or a pause in the shared scroll motion.
  const settleProgress =
    linearSettleProgress +
    PROFILE_SETTLE_CURVE_BIAS *
      (linearSettleProgress ** 3 - linearSettleProgress ** 2);

  return PROFILE_REVEAL_OFFSET_VH * (1 - settleProgress);
}
