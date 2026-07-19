export const HELLO_TILT_COMPENSATION_RADIANS = (2.05 * Math.PI) / 180;

export function resolveHelloGeometryTransition(rotationProgress: number) {
  const progress = Math.min(1, Math.max(0, rotationProgress));

  return {
    flatten: progress,
    zRotation: HELLO_TILT_COMPENSATION_RADIANS * (1 - progress),
  };
}

export function resolveProjectedHorizontalCenterOffset(
  projectedCenterAtX: (worldX: number) => number,
) {
  const probeDistance = 0.01;
  let worldX = 0;

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const projectedCenter = projectedCenterAtX(worldX);
    if (!Number.isFinite(projectedCenter)) return 0;
    if (Math.abs(projectedCenter) < 0.00001) break;

    const projectedProbe = projectedCenterAtX(worldX + probeDistance);
    const derivative =
      (projectedProbe - projectedCenter) / probeDistance;

    if (!Number.isFinite(derivative) || Math.abs(derivative) < 0.00001) {
      return 0;
    }

    worldX -= projectedCenter / derivative;
  }

  return Number.isFinite(worldX) ? worldX : 0;
}
