import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveCloudFieldOffset,
  resolveHeaderTransition,
  resolveHelloScrollProgress,
  resolveProfileRevealState,
  resolveProfileRevealVisibility,
  resolveProfileTravelOffsetVh,
} from "../src/components/home/helloScrollSession.ts";
import {
  AUTO_SCROLL_HANDOFF_TIME,
  AUTO_SCROLL_ROTATION_END_TIME,
  resolveAutoScrollProgress,
  resolveInertialScrollTarget,
  resolveSpringScrollState,
  resolveScrollMotionSession,
  WHEEL_SPRING_RESPONSE,
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

  const velocityAt = (time) =>
    (resolveAutoScrollProgress(time + delta) -
      resolveAutoScrollProgress(time - delta)) /
    (2 * delta);
  let previousVelocity = velocityAt(AUTO_SCROLL_ROTATION_END_TIME);

  for (let step = 1; step <= 100; step += 1) {
    const time =
      AUTO_SCROLL_ROTATION_END_TIME +
      (AUTO_SCROLL_HANDOFF_TIME - AUTO_SCROLL_ROTATION_END_TIME) *
        (step / 100);
    const velocity = velocityAt(time);

    assert.ok(velocity >= previousVelocity - 1e-3);
    previousVelocity = velocity;
  }

  const startVelocity =
    (resolveAutoScrollProgress(delta) - resolveAutoScrollProgress(0)) / delta;
  const endVelocity =
    (resolveAutoScrollProgress(1) - resolveAutoScrollProgress(1 - delta)) /
    delta;

  assert.ok(Math.abs(startVelocity) < 1e-3);
  assert.ok(Math.abs(endVelocity) < 1e-3);

  let previousTailVelocity = velocityAt(AUTO_SCROLL_HANDOFF_TIME);
  for (let step = 1; step <= 100; step += 1) {
    const time =
      AUTO_SCROLL_HANDOFF_TIME +
      (1 - AUTO_SCROLL_HANDOFF_TIME) * (step / 100);
    const velocity = velocityAt(time);

    assert.ok(velocity <= previousTailVelocity + 1e-3);
    previousTailVelocity = velocity;
  }
});

test("critically damped scrolling carries velocity and settles on its target", () => {
  const first = resolveSpringScrollState(
    100,
    500,
    800,
    WHEEL_SPRING_RESPONSE,
    1 / 60,
  );

  assert.ok(first.position > 100);
  assert.ok(first.position < 500);
  assert.ok(first.velocity > 0);

  let state = first;
  for (let frame = 0; frame < 240; frame += 1) {
    state = resolveSpringScrollState(
      state.position,
      500,
      state.velocity,
      WHEEL_SPRING_RESPONSE,
      1 / 60,
    );
  }

  assert.ok(Math.abs(state.position - 500) < 1e-6);
  assert.ok(Math.abs(state.velocity) < 1e-5);
});

test("retargets a reversal without discarding presentation velocity", () => {
  const moving = resolveSpringScrollState(
    300,
    500,
    900,
    WHEEL_SPRING_RESPONSE,
    1 / 60,
  );
  const reversing = resolveSpringScrollState(
    moving.position,
    220,
    moving.velocity,
    WHEEL_SPRING_RESPONSE,
    1 / 60,
  );

  assert.ok(reversing.position > moving.position);
  assert.ok(reversing.velocity < moving.velocity);
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

test("keeps revealed profile content mounted across reversible exits", () => {
  const initial = { visible: false, hasEntered: false };
  const entered = resolveProfileRevealState(0.45, initial);
  const reversing = resolveProfileRevealState(0.4, entered);
  const exited = resolveProfileRevealState(0.39, reversing);
  const reentered = resolveProfileRevealState(0.45, exited);

  assert.deepEqual(entered, { visible: true, hasEntered: true });
  assert.deepEqual(reversing, { visible: true, hasEntered: true });
  assert.deepEqual(exited, { visible: false, hasEntered: true });
  assert.deepEqual(reentered, { visible: true, hasEntered: true });
});

test("moves the profile clearly lower before reverse-scroll hiding", () => {
  const revealOffsetVh = resolveProfileTravelOffsetVh(0.45);
  const hideOffsetVh = resolveProfileTravelOffsetVh(0.39);

  assert.equal(revealOffsetVh, 50);
  assert.equal(hideOffsetVh, 60);
  assert.ok(Math.abs(resolveProfileTravelOffsetVh(0.91) - 6) < 1e-9);
  assert.equal(resolveProfileTravelOffsetVh(1), 0);
});

test("keeps the profile moving toward its target through the hello handoff", () => {
  let previousOffset = resolveProfileTravelOffsetVh(0.45);

  for (let step = 46; step <= 100; step += 1) {
    const offset = resolveProfileTravelOffsetVh(step / 100);

    assert.ok(offset < previousOffset);
    previousOffset = offset;
  }

  assert.ok(resolveProfileTravelOffsetVh(0.975) < 6);
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
