import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveCloudFieldOffset,
  resolveHeaderTransition,
  resolveHelloScrollProgress,
  resolveProfileRevealVisibility,
  resolveProfileTravelOffsetVh,
} from "../src/components/home/helloScrollSession.ts";
import {
  AUTO_SCROLL_HANDOFF_TIME,
  AUTO_SCROLL_ROTATION_END_TIME,
  resolveAutoScrollProgress,
  resolveInertialScrollPosition,
  resolveInertialScrollTarget,
  resolveScrollMotionSession,
  WHEEL_INERTIA_DAMPING,
} from "../src/components/home/scrollMotion.ts";

test("uses one velocity-continuous curve through the rotation checkpoint", () => {
  assert.equal(resolveAutoScrollProgress(0), 0);
  assert.equal(
    resolveAutoScrollProgress(AUTO_SCROLL_ROTATION_END_TIME),
    0.85,
  );
  assert.equal(
    resolveAutoScrollProgress(AUTO_SCROLL_HANDOFF_TIME),
    0.91,
  );
  assert.equal(resolveAutoScrollProgress(1), 1);
  assert.ok(resolveAutoScrollProgress(0.5) > 0.4);

  let previousProgress = 0;
  for (let step = 1; step <= 1000; step += 1) {
    const progress = resolveAutoScrollProgress(step / 1000);

    assert.ok(progress > previousProgress);
    previousProgress = progress;
  }

  const delta = 1e-6;
  for (const boundary of [
    AUTO_SCROLL_ROTATION_END_TIME,
    AUTO_SCROLL_HANDOFF_TIME,
  ]) {
    const boundaryProgress = resolveAutoScrollProgress(boundary);
    const velocityBefore =
      (boundaryProgress - resolveAutoScrollProgress(boundary - delta)) /
      delta;
    const velocityAfter =
      (resolveAutoScrollProgress(boundary + delta) - boundaryProgress) /
      delta;

    assert.ok(Math.abs(velocityBefore - velocityAfter) < 1e-3);
  }
});

test("moves manual scrolling toward its target without overshooting", () => {
  const next = resolveInertialScrollPosition(
    100,
    500,
    WHEEL_INERTIA_DAMPING,
    1 / 60,
  );
  const afterOneSecond = resolveInertialScrollPosition(
    100,
    500,
    WHEEL_INERTIA_DAMPING,
    1,
  );

  assert.ok(next > 100);
  assert.ok(next < 140);
  assert.ok(afterOneSecond > 490);
  assert.ok(afterOneSecond < 500);
});

test("reverses inertial scrolling from the current position", () => {
  assert.equal(resolveInertialScrollTarget(300, 500, -80), 220);
  assert.equal(resolveInertialScrollTarget(300, 500, 80), 580);
  assert.equal(resolveInertialScrollTarget(300, 300, -80), 220);
});

test("gives a new micro wheel direction a perceptible glide only once", () => {
  assert.equal(resolveInertialScrollTarget(300, 300, 1, 14), 314);
  assert.equal(resolveInertialScrollTarget(300, 314, 1, 14), 315);
  assert.equal(resolveInertialScrollTarget(300, 500, -1, 14), 286);
});

test("snaps only hello progress from 91% to the exact endpoint", () => {
  assert.equal(resolveHelloScrollProgress(0.9099), 0.9099);
  assert.equal(resolveHelloScrollProgress(0.91), 1);
  assert.equal(resolveHelloScrollProgress(1), 1);
});

test("starts the full intro only when restored at the top", () => {
  assert.deepEqual(resolveScrollMotionSession(0), {
    startProgress: 0,
    allowAutoSettle: true,
  });
});

test("starts writing at the restored scroll transform without auto settling", () => {
  assert.deepEqual(resolveScrollMotionSession(0.42), {
    startProgress: 0.42,
    allowAutoSettle: false,
  });
});

test("clamps restored progress before resolving the session", () => {
  assert.deepEqual(resolveScrollMotionSession(1.4), {
    startProgress: 1,
    allowAutoSettle: false,
  });
});

test("preserves restored stage progress after the hello handoff", () => {
  assert.deepEqual(resolveScrollMotionSession(0.96), {
    startProgress: 0.96,
    allowAutoSettle: false,
  });
});

test("moves the cloud field out of the hero through spatial scroll movement", () => {
  assert.equal(resolveCloudFieldOffset(0), 0);
  assert.ok(Math.abs(resolveCloudFieldOffset(0.29) - 6) < 1e-9);
  assert.equal(resolveCloudFieldOffset(0.58), 12);
  assert.equal(resolveCloudFieldOffset(1), 12);
});

test("maps the same scroll position to the same reversible cloud offset", () => {
  const offset = resolveCloudFieldOffset(0.4);

  assert.equal(resolveCloudFieldOffset(0.4), offset);
  assert.ok(offset > 0 && offset < 12);
});

test("keeps the profile visible until it moves below its reveal point", () => {
  assert.equal(resolveProfileRevealVisibility(0.4499), false);
  assert.equal(resolveProfileRevealVisibility(0.45), true);
  assert.equal(resolveProfileRevealVisibility(0.4, true), true);
  assert.equal(resolveProfileRevealVisibility(0.3901, true), true);
  assert.equal(resolveProfileRevealVisibility(0.39, true), false);
});

test("moves the profile clearly lower before reverse-scroll hiding", () => {
  const revealOffsetVh = resolveProfileTravelOffsetVh(0.45);
  const hideOffsetVh = resolveProfileTravelOffsetVh(0.39);

  assert.equal(revealOffsetVh, 40);
  assert.equal(hideOffsetVh, 60);
  assert.ok(Math.abs(resolveProfileTravelOffsetVh(0.91) - 9) < 1e-9);
  assert.equal(resolveProfileTravelOffsetVh(1), 0);
});

test("keeps the profile moving toward its target through the hello handoff", () => {
  let previousOffset = resolveProfileTravelOffsetVh(0.45);

  for (let step = 46; step <= 100; step += 1) {
    const offset = resolveProfileTravelOffsetVh(step / 100);

    assert.ok(offset < previousOffset);
    previousOffset = offset;
  }

  assert.ok(resolveProfileTravelOffsetVh(0.975) < 9);
  assert.ok(resolveProfileTravelOffsetVh(0.975) > 0);
});

test("finishes rotation at 85%, then moves and scales together through 90%", () => {
  assert.deepEqual(resolveHeaderTransition(0), {
    rotation: 0,
    travel: 0,
    scale: 0,
    handoff: 0,
  });

  const halfway = resolveHeaderTransition(0.455);
  assert.ok(halfway.rotation > halfway.travel);
  assert.equal(halfway.scale, halfway.travel);
  assert.equal(halfway.handoff, 0);

  const turned = resolveHeaderTransition(0.82);
  assert.ok(turned.rotation > 0.5 && turned.rotation < 1);
  assert.ok(turned.travel < 1);
  assert.equal(turned.handoff, 0);

  const rotated = resolveHeaderTransition(0.85);
  assert.equal(rotated.rotation, 1);
  assert.ok(rotated.scale < 1);
  assert.ok(rotated.travel < 1);
  assert.equal(rotated.handoff, 0);

  const almostScaled = resolveHeaderTransition(0.8999);
  assert.ok(almostScaled.scale < 1);

  const scaled = resolveHeaderTransition(0.9);
  assert.equal(scaled.scale, 1);
  assert.equal(scaled.travel, 1);
  assert.equal(scaled.rotation, 1);
  assert.equal(scaled.handoff, 0);

  const finalGlassFrame = resolveHeaderTransition(0.9099);
  assert.equal(finalGlassFrame.rotation, 1);
  assert.equal(finalGlassFrame.travel, 1);
  assert.equal(finalGlassFrame.scale, 1);
  assert.equal(finalGlassFrame.handoff, 0);

  assert.deepEqual(resolveHeaderTransition(0.91), {
    rotation: 1,
    travel: 1,
    scale: 1,
    handoff: 1,
  });
});
