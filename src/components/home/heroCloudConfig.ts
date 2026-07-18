/**
 * First-screen cloud tuning.
 *
 * Quick adjustments:
 * - `sizeScale`: changes every cloud bank together.
 * - `position: [x, y]`: negative x is left, positive x is right;
 *   negative y is down, positive y is up.
 * - `depthPhase`: 0 is the far spawn point and 1 is the camera. Larger
 *   values start closer and leave the viewport sooner.
 * - `scale`: changes only that bank's width, height, and depth proportions.
 * - `duration`: lower values make all banks fly toward the camera faster.
 * - `fadeInPortion`: higher values make recycled clouds fade in more slowly.
 */
export const HERO_CLOUD_FIELD = {
  duration: 12.4,
  farZ: -17.5,
  nearZ: 8.45,
  nearFade: 3.2,
  fadeInPortion: 0.12,
  alphaTest: 0.06,
  growth: 0.65,
  sizeScale: 1.75,
  color: "#ffffff",
  spriteLimit: 64,
} as const;

export type HeroCloudBankSpec = {
  seed: number;
  depthPhase: number;
  segments: number;
  position: [number, number];
  drift: [number, number];
  driftSpeed: number;
  bounds: [number, number, number];
  volume: number;
  smallestVolume: number;
  opacity: number;
  speed: number;
  scale: [number, number, number];
};

export const HERO_CLOUD_BANKS: readonly HeroCloudBankSpec[] = [
  // Upper-left, far layer.
  {
    seed: 7,
    depthPhase: 0.05,
    segments: 8,
    position: [-4.8, 3.3],
    drift: [0.42, 0.14],
    driftSpeed: 0.3,
    bounds: [1.6, 0.5, 0.86],
    volume: 2.35,
    smallestVolume: 0.62,
    opacity: 0.24,
    speed: 0.18,
    scale: [1.22, 0.95, 1],
  },
  // Upper-center, far layer.
  {
    seed: 31,
    depthPhase: 0.17,
    segments: 9,
    position: [0.4, 3.5],
    drift: [0.35, 0.16],
    driftSpeed: 0.28,
    bounds: [1.7, 0.52, 0.88],
    volume: 2.4,
    smallestVolume: 0.62,
    opacity: 0.23,
    speed: 0.17,
    scale: [1.25, 0.96, 1],
  },
  // Upper-right, far-to-middle layer.
  {
    seed: 19,
    depthPhase: 0.29,
    segments: 8,
    position: [4.8, 2.4],
    drift: [0.48, 0.15],
    driftSpeed: 0.32,
    bounds: [1.6, 0.5, 0.88],
    volume: 2.4,
    smallestVolume: 0.64,
    opacity: 0.24,
    speed: 0.19,
    scale: [1.24, 0.96, 1],
  },
  // Left edge, middle layer.
  {
    seed: 43,
    depthPhase: 0.4,
    segments: 9,
    position: [-5.6, 0.3],
    drift: [0.58, 0.2],
    driftSpeed: 0.38,
    bounds: [1.55, 0.52, 0.9],
    volume: 2.55,
    smallestVolume: 0.66,
    opacity: 0.27,
    speed: 0.21,
    scale: [1.3, 0.98, 1],
  },
  // Right edge, middle layer.
  {
    seed: 59,
    depthPhase: 0.52,
    segments: 9,
    position: [5.3, -0.2],
    drift: [0.62, 0.2],
    driftSpeed: 0.4,
    bounds: [1.55, 0.52, 0.92],
    volume: 2.6,
    smallestVolume: 0.68,
    opacity: 0.28,
    speed: 0.22,
    scale: [1.32, 1, 1],
  },
  // Lower-left, middle-to-near layer.
  {
    seed: 71,
    depthPhase: 0.63,
    segments: 9,
    position: [-3.2, -2.4],
    drift: [0.58, 0.22],
    driftSpeed: 0.42,
    bounds: [1.55, 0.56, 0.94],
    volume: 2.65,
    smallestVolume: 0.7,
    opacity: 0.3,
    speed: 0.23,
    scale: [1.36, 1.02, 1],
  },
  // Lower-right, near layer. It exits through the edge without crossing center.
  {
    seed: 89,
    depthPhase: 0.74,
    segments: 9,
    position: [2.8, -2.7],
    drift: [0.54, 0.24],
    driftSpeed: 0.44,
    bounds: [1.55, 0.56, 0.96],
    volume: 2.7,
    smallestVolume: 0.72,
    opacity: 0.3,
    speed: 0.24,
    scale: [1.38, 1.04, 1],
  },
];
