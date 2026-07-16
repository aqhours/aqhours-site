export const HELLO_TILT_COMPENSATION_RADIANS = (2.05 * Math.PI) / 180;

export function resolveHelloGeometryTransition(rotationProgress: number) {
  const progress = Math.min(1, Math.max(0, rotationProgress));

  return {
    flatten: progress,
    zRotation: HELLO_TILT_COMPENSATION_RADIANS * (1 - progress),
  };
}
