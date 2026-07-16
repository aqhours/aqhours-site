import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveCloudFieldOffset,
  resolveHeaderTransition,
  resolveHelloScrollSession,
  resolveProfileRevealVisibility,
} from "../src/components/home/helloScrollSession.ts";

test("starts the full intro only when restored at the top", () => {
  assert.deepEqual(resolveHelloScrollSession(0), {
    startProgress: 0,
    allowAutoSettle: true,
  });
});

test("starts writing at the restored scroll transform without auto settling", () => {
  assert.deepEqual(resolveHelloScrollSession(0.42), {
    startProgress: 0.42,
    allowAutoSettle: false,
  });
});

test("clamps restored progress before resolving the session", () => {
  assert.deepEqual(resolveHelloScrollSession(1.4), {
    startProgress: 1,
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

test("shows and hides the profile at the same scroll threshold", () => {
  assert.equal(resolveProfileRevealVisibility(0.3899), false);
  assert.equal(resolveProfileRevealVisibility(0.39), true);
  assert.equal(resolveProfileRevealVisibility(0.3901), true);
  assert.equal(resolveProfileRevealVisibility(0.3899), false);
});

test("finishes the rise and full flip at 91%, then only scales before handoff", () => {
  assert.deepEqual(resolveHeaderTransition(0), {
    rotation: 0,
    travel: 0,
    scale: 0,
    handoff: 0,
  });

  const halfway = resolveHeaderTransition(0.455);
  assert.ok(Math.abs(halfway.travel - 0.5) < 1e-9);
  assert.ok(Math.abs(halfway.rotation - halfway.travel) < 1e-9);
  assert.ok(halfway.scale < halfway.travel);
  assert.equal(halfway.handoff, 0);

  const turned = resolveHeaderTransition(0.82);
  assert.ok(turned.rotation > 0.5 && turned.rotation < 1);
  assert.ok(turned.travel < 1);
  assert.equal(turned.handoff, 0);

  const frontFacing = resolveHeaderTransition(0.91);
  assert.equal(frontFacing.rotation, 1);
  assert.equal(frontFacing.travel, 1);
  assert.ok(frontFacing.scale < 1);
  assert.equal(frontFacing.handoff, 0);

  const scaleOnly = resolveHeaderTransition(0.935);
  assert.equal(scaleOnly.rotation, 1);
  assert.equal(scaleOnly.travel, 1);
  assert.ok(scaleOnly.scale > frontFacing.scale && scaleOnly.scale < 1);
  assert.equal(scaleOnly.handoff, 0);

  assert.deepEqual(resolveHeaderTransition(0.96), {
    rotation: 1,
    travel: 1,
    scale: 1,
    handoff: 0,
  });
  const handingOff = resolveHeaderTransition(0.97);
  assert.ok(handingOff.handoff > 0);

  const replacing = resolveHeaderTransition(0.98);
  assert.equal(replacing.rotation, 1);
  assert.equal(replacing.travel, 1);
  assert.equal(replacing.scale, 1);
  assert.ok(Math.abs(replacing.handoff - 0.5) < 1e-9);

  assert.deepEqual(resolveHeaderTransition(1), {
    rotation: 1,
    travel: 1,
    scale: 1,
    handoff: 1,
  });
});
