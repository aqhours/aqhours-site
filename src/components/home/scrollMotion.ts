export type ScrollMotionSession = {
  startProgress: number;
  allowAutoSettle: boolean;
};

const TOP_PROGRESS_THRESHOLD = 0.01;
const AUTO_SCROLL_INITIAL_VELOCITY = 0;
const AUTO_SCROLL_ROTATION_END_PROGRESS = 0.85;
const AUTO_SCROLL_HANDOFF_PROGRESS = 0.91;
const AUTO_SCROLL_ROTATION_END_VELOCITY = 1.2;
const AUTO_SCROLL_HANDOFF_VELOCITY = 1.4;
const AUTO_SCROLL_END_VELOCITY = 0;
// A linear-feeling brake averages half its handoff velocity over the tail.
export const AUTO_SCROLL_HANDOFF_TIME =
  1 -
  (2 * (1 - AUTO_SCROLL_HANDOFF_PROGRESS)) /
    AUTO_SCROLL_HANDOFF_VELOCITY;
export const AUTO_SCROLL_ROTATION_END_TIME =
  AUTO_SCROLL_HANDOFF_TIME -
  (AUTO_SCROLL_HANDOFF_PROGRESS - AUTO_SCROLL_ROTATION_END_PROGRESS) /
    ((AUTO_SCROLL_ROTATION_END_VELOCITY + AUTO_SCROLL_HANDOFF_VELOCITY) / 2);
export const WHEEL_SPRING_RESPONSE = 0.4;
export const WHEEL_INPUT_VELOCITY_GAIN = 10;
export const WHEEL_MAX_VELOCITY = 3200;
export const WHEEL_MIN_GLIDE_DISTANCE = 14;
const CRITICAL_DAMPING_95_PERCENT_FACTOR = 4.75;

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
  progress: AUTO_SCROLL_ROTATION_END_PROGRESS,
  velocity: AUTO_SCROLL_ROTATION_END_VELOCITY,
};
const AUTO_SCROLL_HANDOFF: AutoScrollKeyframe = {
  time: AUTO_SCROLL_HANDOFF_TIME,
  progress: AUTO_SCROLL_HANDOFF_PROGRESS,
  velocity: AUTO_SCROLL_HANDOFF_VELOCITY,
};
const AUTO_SCROLL_END: AutoScrollKeyframe = {
  time: 1,
  progress: 1,
  velocity: AUTO_SCROLL_END_VELOCITY,
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

export type SpringScrollState = {
  position: number;
  velocity: number;
};

export function resolveSpringScrollState(
  current: number,
  target: number,
  velocity: number,
  response: number,
  delta: number,
): SpringScrollState {
  const angularFrequency =
    CRITICAL_DAMPING_95_PERCENT_FACTOR / Math.max(response, 0.001);
  const displacement = current - target;
  const elapsed = Math.max(delta, 0);
  const decay = Math.exp(-angularFrequency * elapsed);
  const velocityDisplacement =
    (velocity + angularFrequency * displacement) * elapsed;

  return {
    position: target + (displacement + velocityDisplacement) * decay,
    velocity: (velocity - angularFrequency * velocityDisplacement) * decay,
  };
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
