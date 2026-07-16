import assert from "node:assert/strict";
import test from "node:test";

import {
  HELLO_TILT_COMPENSATION_RADIANS,
} from "../src/components/home/helloGeometry.ts";

const CAMERA_Z = 8.6;
const SEGMENT_COUNT = 34;
const BASELINE_POINTS = [
  [54.1166, 190.361, 5],
  [152.122, 191.354, 9],
  [239.208, 192.346, 14],
  [349.936, 191.354, 20],
  [444.416, 191.354, 26],
  [535.362, 192.346, 30],
];

function smootherStep(progress) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function projectedBaselineAngle(compensation = 0) {
  const cosine = Math.cos(compensation);
  const sine = Math.sin(compensation);
  const projected = BASELINE_POINTS.map(([x, y, segmentIndex]) => {
    const progress = segmentIndex / SEGMENT_COUNT;
    const depth = -0.7 + 1.4 * smootherStep(progress);
    const cameraDistance = CAMERA_Z - depth;
    const projectedX = ((x - 319.5) * 0.0146) / cameraDistance;
    const projectedY = ((100 - y) * 0.0146) / cameraDistance;

    return [
      projectedX * cosine - projectedY * sine,
      projectedX * sine + projectedY * cosine,
    ];
  });
  const meanX = projected.reduce((sum, point) => sum + point[0], 0) / projected.length;
  const meanY = projected.reduce((sum, point) => sum + point[1], 0) / projected.length;
  const slope =
    projected.reduce(
      (sum, point) => sum + (point[0] - meanX) * (point[1] - meanY),
      0,
    ) /
    projected.reduce(
      (sum, point) => sum + (point[0] - meanX) ** 2,
      0,
    );

  return (Math.atan(slope) * 180) / Math.PI;
}

test("levels the perspective slope with a small whole-object rotation", () => {
  const uncompensatedAngle = projectedBaselineAngle();
  const compensatedAngle = projectedBaselineAngle(
    HELLO_TILT_COMPENSATION_RADIANS,
  );

  assert.ok(Math.abs(uncompensatedAngle) > 1.5);
  assert.ok(Math.abs(compensatedAngle) < 0.25);
});
