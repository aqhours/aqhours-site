export type ScrollMotionSession = {
  startProgress: number;
  allowAutoSettle: boolean;
};

const TOP_PROGRESS_THRESHOLD = 0.01;
const AUTO_SCROLL_INITIAL_VELOCITY = 0.35;
export const AUTO_SCROLL_ROTATION_END_TIME = 0.847;
export const AUTO_SCROLL_HANDOFF_TIME = 0.89;
export const WHEEL_INERTIA_DAMPING = 4.6;
export const WHEEL_MIN_GLIDE_DISTANCE = 14;

type AutoScrollKeyframe = {
  time: number;
  progress: number;
  velocity: number;
};

const AUTO_SCROLL_START: AutoScrollKeyframe = {
  time: 0,
  progress: 0,
  velocity: AUTO_SCROLL_INITIAL_VELOCITY,
};
const AUTO_SCROLL_ROTATION_END: AutoScrollKeyframe = {
  time: AUTO_SCROLL_ROTATION_END_TIME,
  progress: 0.85,
  velocity: 0.45,
};
const AUTO_SCROLL_HANDOFF: AutoScrollKeyframe = {
  time: AUTO_SCROLL_HANDOFF_TIME,
  progress: 0.91,
  velocity: 0.6,
};
const AUTO_SCROLL_END: AutoScrollKeyframe = {
  time: 1,
  progress: 1,
  velocity: 0.6,
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function resolveAutoScrollSegment(
  progress: number,
  start: AutoScrollKeyframe,
  end: AutoScrollKeyframe,
) {
  const duration = end.time - start.time;
  const time = (progress - start.time) / duration;
  const timeSquared = time * time;
  const timeCubed = timeSquared * time;
  const startBasis = 2 * timeCubed - 3 * timeSquared + 1;
  const startVelocityBasis = timeCubed - 2 * timeSquared + time;
  const endBasis = -2 * timeCubed + 3 * timeSquared;
  const endVelocityBasis = timeCubed - timeSquared;

  return (
    startBasis * start.progress +
    startVelocityBasis * start.velocity * duration +
    endBasis * end.progress +
    endVelocityBasis * end.velocity * duration
  );
}

export function resolveAutoScrollProgress(progress: number) {
  const clamped = clamp01(progress);

  if (clamped <= AUTO_SCROLL_ROTATION_END_TIME) {
    return resolveAutoScrollSegment(
      clamped,
      AUTO_SCROLL_START,
      AUTO_SCROLL_ROTATION_END,
    );
  }

  if (clamped <= AUTO_SCROLL_HANDOFF_TIME) {
    return resolveAutoScrollSegment(
      clamped,
      AUTO_SCROLL_ROTATION_END,
      AUTO_SCROLL_HANDOFF,
    );
  }

  return resolveAutoScrollSegment(
    clamped,
    AUTO_SCROLL_HANDOFF,
    AUTO_SCROLL_END,
  );
}

export function resolveInertialScrollTarget(
  current: number,
  target: number,
  wheelDelta: number,
  minimumGlideDistance = 0,
) {
  const pendingDirection = Math.sign(target - current);
  const inputDirection = Math.sign(wheelDelta);
  const isReversing =
    pendingDirection !== 0 &&
    inputDirection !== 0 &&
    pendingDirection !== inputDirection;
  const isStartingDirection = inputDirection !== 0 && pendingDirection === 0;
  const shouldGuaranteeGlide = isStartingDirection || isReversing;
  const resolvedDelta =
    shouldGuaranteeGlide && Math.abs(wheelDelta) < minimumGlideDistance
      ? inputDirection * minimumGlideDistance
      : wheelDelta;

  return (isReversing ? current : target) + resolvedDelta;
}

export function resolveInertialScrollPosition(
  current: number,
  target: number,
  damping: number,
  delta: number,
) {
  return current + (target - current) * (1 - Math.exp(-damping * delta));
}

export function resolveScrollMotionSession(
  restoredProgress: number,
): ScrollMotionSession {
  const startProgress = clamp01(restoredProgress);

  return {
    startProgress,
    allowAutoSettle: startProgress <= TOP_PROGRESS_THRESHOLD,
  };
}
