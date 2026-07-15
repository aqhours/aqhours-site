"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./GlassStrokePrototype.module.css";

type GlassTuning = {
  fresnelPower: number;
  internalRimCenter: number;
  internalRimWidth: number;
  reflectionDrift: number;
  innerDrift: number;
  ior: number;
  aberrationBase: number;
  aberrationEdge: number;
  highlightStart: number;
  highlightEnd: number;
  innerBandStart: number;
  innerBandEnd: number;
  shadowStart: number;
  shadowEnd: number;
  flowWidth: number;
  flowCoreWidth: number;
  capProfileEnd: number;
  capLensStart: number;
  capLensEnd: number;
  capGlintPower: number;
  reflectionColor: number;
  innerColor: number;
  baseDark: number;
  baseLight: number;
  reflectionMix: number;
  innerMix: number;
  edgeLight: number;
  internalRimLight: number;
  highlightLight: number;
  shadowColor: number;
  shadowStrength: number;
  flowBaseLight: number;
  flowFacingLight: number;
  capRefraction: number;
  capGlintLight: number;
  flowCoreLight: number;
  baseAlpha: number;
  edgeAlpha: number;
  internalRimAlpha: number;
  highlightAlpha: number;
  innerBandAlpha: number;
  shadowBandAlpha: number;
  flowAlpha: number;
  capLensAlpha: number;
  capGlintAlpha: number;
  maxAlpha: number;
};

type GlassTuningKey = keyof GlassTuning;

const DEFAULT_GLASS_TUNING: GlassTuning = {
  fresnelPower: 5.8,
  internalRimCenter: 0.34,
  internalRimWidth: 0.075,
  reflectionDrift: 0.035,
  innerDrift: 0.022,
  ior: 1.46,
  aberrationBase: 0.012,
  aberrationEdge: 0.038,
  highlightStart: 0.68,
  highlightEnd: 0.98,
  innerBandStart: 0.58,
  innerBandEnd: 0.92,
  shadowStart: 0.06,
  shadowEnd: 0.32,
  flowWidth: 0.036,
  flowCoreWidth: 0.011,
  capProfileEnd: 0.58,
  capLensStart: 0.18,
  capLensEnd: 0.92,
  capGlintPower: 30,
  reflectionColor: 0.1,
  innerColor: 0.08,
  baseDark: 0.48,
  baseLight: 0.96,
  reflectionMix: 0.22,
  innerMix: 0.08,
  edgeLight: 0.58,
  internalRimLight: 0.34,
  highlightLight: 0.24,
  shadowColor: 0.24,
  shadowStrength: 0.2,
  flowBaseLight: 0.1,
  flowFacingLight: 0.14,
  capRefraction: 0.3,
  capGlintLight: 0.72,
  flowCoreLight: 0.2,
  baseAlpha: 0.004,
  edgeAlpha: 0.25,
  internalRimAlpha: 0.06,
  highlightAlpha: 0.055,
  innerBandAlpha: 0.012,
  shadowBandAlpha: 0.012,
  flowAlpha: 0.03,
  capLensAlpha: 0.05,
  capGlintAlpha: 0.22,
  maxAlpha: 0.32,
};

const GLASS_UNIFORM_NAMES: Record<GlassTuningKey, string> = {
  fresnelPower: "uFresnelPower",
  internalRimCenter: "uInternalRimCenter",
  internalRimWidth: "uInternalRimWidth",
  reflectionDrift: "uReflectionDrift",
  innerDrift: "uInnerDrift",
  ior: "uIor",
  aberrationBase: "uAberrationBase",
  aberrationEdge: "uAberrationEdge",
  highlightStart: "uHighlightStart",
  highlightEnd: "uHighlightEnd",
  innerBandStart: "uInnerBandStart",
  innerBandEnd: "uInnerBandEnd",
  shadowStart: "uShadowStart",
  shadowEnd: "uShadowEnd",
  flowWidth: "uFlowWidth",
  flowCoreWidth: "uFlowCoreWidth",
  capProfileEnd: "uCapProfileEnd",
  capLensStart: "uCapLensStart",
  capLensEnd: "uCapLensEnd",
  capGlintPower: "uCapGlintPower",
  reflectionColor: "uReflectionColor",
  innerColor: "uInnerColor",
  baseDark: "uBaseDark",
  baseLight: "uBaseLight",
  reflectionMix: "uReflectionMix",
  innerMix: "uInnerMix",
  edgeLight: "uEdgeLight",
  internalRimLight: "uInternalRimLight",
  highlightLight: "uHighlightLight",
  shadowColor: "uShadowColor",
  shadowStrength: "uShadowStrength",
  flowBaseLight: "uFlowBaseLight",
  flowFacingLight: "uFlowFacingLight",
  capRefraction: "uCapRefraction",
  capGlintLight: "uCapGlintLight",
  flowCoreLight: "uFlowCoreLight",
  baseAlpha: "uBaseAlpha",
  edgeAlpha: "uEdgeAlpha",
  internalRimAlpha: "uInternalRimAlpha",
  highlightAlpha: "uHighlightAlpha",
  innerBandAlpha: "uInnerBandAlpha",
  shadowBandAlpha: "uShadowBandAlpha",
  flowAlpha: "uFlowAlpha",
  capLensAlpha: "uCapLensAlpha",
  capGlintAlpha: "uCapGlintAlpha",
  maxAlpha: "uMaxAlpha",
};

// PROTOTYPE 06 — clear material and rounded-cap study.
const VERTEX_SHADER = /* glsl */ `
  attribute float aPathProgress;
  attribute float aCapProgress;
  uniform float uPathOffset;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;
  varying float vCapProgress;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vPathProgress = clamp(aPathProgress + uPathOffset, 0.0, 1.0);
    vCapProgress = aCapProgress;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform samplerCube uEnvironment;
  uniform float uTime;
  uniform float uSweep;
  uniform float uSweepStrength;
  uniform float uFresnelPower;
  uniform float uInternalRimCenter;
  uniform float uInternalRimWidth;
  uniform float uReflectionDrift;
  uniform float uInnerDrift;
  uniform float uIor;
  uniform float uAberrationBase;
  uniform float uAberrationEdge;
  uniform float uHighlightStart;
  uniform float uHighlightEnd;
  uniform float uInnerBandStart;
  uniform float uInnerBandEnd;
  uniform float uShadowStart;
  uniform float uShadowEnd;
  uniform float uFlowWidth;
  uniform float uFlowCoreWidth;
  uniform float uCapProfileEnd;
  uniform float uCapLensStart;
  uniform float uCapLensEnd;
  uniform float uCapGlintPower;
  uniform float uReflectionColor;
  uniform float uInnerColor;
  uniform float uBaseDark;
  uniform float uBaseLight;
  uniform float uReflectionMix;
  uniform float uInnerMix;
  uniform float uEdgeLight;
  uniform float uInternalRimLight;
  uniform float uHighlightLight;
  uniform float uShadowColor;
  uniform float uShadowStrength;
  uniform float uFlowBaseLight;
  uniform float uFlowFacingLight;
  uniform float uCapRefraction;
  uniform float uCapGlintLight;
  uniform float uFlowCoreLight;
  uniform float uBaseAlpha;
  uniform float uEdgeAlpha;
  uniform float uInternalRimAlpha;
  uniform float uHighlightAlpha;
  uniform float uInnerBandAlpha;
  uniform float uShadowBandAlpha;
  uniform float uFlowAlpha;
  uniform float uCapLensAlpha;
  uniform float uCapGlintAlpha;
  uniform float uMaxAlpha;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;
  varying float vCapProgress;

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  float glassLuma(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, max(uFresnelPower, 0.001));
    float internalRim = exp(-pow(
      (facing - uInternalRimCenter) / max(uInternalRimWidth, 0.001),
      2.0
    ));

    vec3 reflection = reflect(-viewDirection, normal);
    reflection.xz = rotate2d(uTime * uReflectionDrift) * reflection.xz;

    float aberration = uAberrationBase + fresnel * uAberrationEdge;
    vec3 redSample = textureCube(
      uEnvironment,
      normalize(reflection + vec3(aberration, -aberration * 0.3, 0.0))
    ).rgb;
    vec3 greenSample = textureCube(uEnvironment, reflection).rgb;
    vec3 blueSample = textureCube(
      uEnvironment,
      normalize(reflection - vec3(aberration, -aberration * 0.3, 0.0))
    ).rgb;
    vec3 dispersedReflection = vec3(redSample.r, greenSample.g, blueSample.b);

    vec3 foldedNormal = normalize(normal + vec3(-0.24, 0.14, -0.1));
    vec3 innerReflection = reflect(-viewDirection, foldedNormal);
    innerReflection.xy = rotate2d(-uTime * uInnerDrift + 0.4) * innerReflection.xy;
    vec3 innerLayer = textureCube(uEnvironment, innerReflection).rgb;
    vec3 refractionDirection = refract(-viewDirection, normal, 1.0 / max(uIor, 1.001));
    vec3 refractedLayer = textureCube(uEnvironment, normalize(refractionDirection)).rgb;

    float reflectedLight = glassLuma(dispersedReflection);
    float innerLight = glassLuma(innerLayer);
    float highlight = smoothstep(
      uHighlightStart,
      max(uHighlightEnd, uHighlightStart + 0.001),
      reflectedLight
    );
    float innerBand = smoothstep(
      uInnerBandStart,
      max(uInnerBandEnd, uInnerBandStart + 0.001),
      innerLight
    );
    float shadowBand = 1.0 - smoothstep(
      uShadowStart,
      max(uShadowEnd, uShadowStart + 0.001),
      innerLight
    );
    float sweepDistance = abs(vPathProgress - uSweep);
    float travelingHighlight = exp(-pow(
      sweepDistance / max(uFlowWidth, 0.001),
      2.0
    )) * uSweepStrength;
    float travelingCore = exp(-pow(
      sweepDistance / max(uFlowCoreWidth, 0.001),
      2.0
    )) * uSweepStrength;
    float capProfile = smoothstep(0.0, max(uCapProfileEnd, 0.001), vCapProgress);
    float capLens = capProfile * smoothstep(
      uCapLensStart,
      max(uCapLensEnd, uCapLensStart + 0.001),
      facing
    );
    float capGlint = capProfile * pow(
      max(dot(normal, normalize(vec3(-0.38, 0.54, 0.75))), 0.0),
      max(uCapGlintPower, 0.001)
    );

    vec3 neutralReflection = mix(
      vec3(reflectedLight),
      dispersedReflection,
      uReflectionColor
    );
    vec3 neutralInner = mix(vec3(innerLight), innerLayer, uInnerColor);
    vec3 glassColor = mix(vec3(uBaseDark), vec3(uBaseLight), reflectedLight);
    glassColor = mix(glassColor, neutralReflection, uReflectionMix);
    glassColor = mix(glassColor, neutralInner, innerBand * uInnerMix);
    glassColor = mix(
      glassColor,
      vec3(1.0),
      fresnel * uEdgeLight +
        internalRim * uInternalRimLight +
        highlight * uHighlightLight
    );
    glassColor = mix(
      glassColor,
      vec3(uShadowColor),
      shadowBand * (1.0 - facing) * uShadowStrength
    );
    glassColor = mix(
      glassColor,
      vec3(1.0),
      travelingHighlight * (uFlowBaseLight + facing * uFlowFacingLight)
    );
    glassColor = mix(glassColor, refractedLayer, capLens * uCapRefraction);
    glassColor = mix(glassColor, vec3(1.0), capGlint * uCapGlintLight);
    glassColor += vec3(uFlowCoreLight) * travelingCore * fresnel;

    float alpha =
      uBaseAlpha + fresnel * uEdgeAlpha + internalRim * uInternalRimAlpha +
      highlight * uHighlightAlpha + innerBand * uInnerBandAlpha +
      shadowBand * uShadowBandAlpha + travelingHighlight * uFlowAlpha +
      capLens * uCapLensAlpha + capGlint * uCapGlintAlpha;
    alpha = clamp(alpha, uBaseAlpha, max(uMaxAlpha, uBaseAlpha));

    gl_FragColor = vec4(glassColor, alpha);
  }
`;

type SkeletonPoint = readonly [number, number];
type SkeletonSegment = readonly [SkeletonPoint, SkeletonPoint, SkeletonPoint];

const STEM_TUBULAR_SEGMENTS = 260;
const WORD_TUBULAR_SEGMENTS = 820;
const RADIAL_SEGMENTS = 36;
const CAP_SEGMENTS = 10;
const TUBE_BASE_RADIUS = 0.145;
const WRITE_DELAY = 0.24;
const WRITE_DURATION = 3.35;
const FLOW_PAUSE = 0.55;
const FLOW_DURATION = 5.4;

// POST-WRITE MOTION — edit these values to tune the transition checkpoint.
const HELLO_SETTLE_MOTION = {
  hold: 0.25,
  duration: 2.2,
  scale: 0.25,
  lift: 0.52,
  startRotation: [-0.025, -0.045, 0] as const,
  // One complete Y-axis flip, ending slightly turned so the glass keeps its depth.
  endRotation: [-0.06, -Math.PI * 2 - 0.15, 0] as const,
};

function easeHelloSettle(progress: number) {
  // cubic-bezier(0.77, 0, 0.175, 1), solved by bisection.
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const sample = (time: number, first: number, second: number) => {
    const inverse = 1 - time;
    return (
      3 * inverse * inverse * time * first +
      3 * inverse * time * time * second +
      time * time * time
    );
  };

  let lower = 0;
  let upper = 1;
  let time = progress;

  for (let iteration = 0; iteration < 8; iteration += 1) {
    if (sample(time, 0.77, 0.175) < progress) {
      lower = time;
    } else {
      upper = time;
    }
    time = (lower + upper) * 0.5;
  }

  return sample(time, 0, 1);
}

function tubeRadiusAt(progress: number, baseRadius = TUBE_BASE_RADIUS) {
  return (
    baseRadius *
    (0.95 + Math.sin(progress * Math.PI) * 0.08 + Math.sin(progress * Math.PI * 5) * 0.025)
  );
}

// Centerline rebuilt from the user-provided 638 × 200 SVG.
const HELLO_STEM_START: SkeletonPoint = [8.69214, 166.558];
const HELLO_STEM_SEGMENTS: SkeletonSegment[] = [
  [[36.2393, 151.245], [61.3409, 131.553], [89.8191, 98.0349]],
  [[109.203, 75.1542], [119.625, 49.0282], [120.122, 31.008]],
  [[120.37, 17.609], [113.836, 7.4442], [101.759, 7.4442]],
  [[88.3598, 7.4442], [79.9231, 17.609], [74.7122, 40.9417]],
  [[69.005, 66.5846], [64.7866, 96.009], [54.1166, 190.361]],
];

// Snap the second path to the first path's hidden endpoint so the overlapping round caps coincide.
const HELLO_WORD_START: SkeletonPoint = [54.1166, 190.361];
const HELLO_WORD_SEGMENTS: SkeletonSegment[] = [
  [[60.6251, 133.12], [81.4118, 98.0536], [107.963, 98.0536]],
  [[123.844, 98.0536], [133.937, 110.709], [131.071, 128.823]],
  [[129.457, 139.493], [127.587, 150.411], [125.408, 163.066]],
  [[122.869, 178.947], [130.128, 191.354], [152.122, 191.354]],
  [[184.197, 191.354], [219.189, 173.529], [237.097, 145.921]],
  [[243.198, 136.515], [245.68, 128.078], [245.928, 119.89]],
  [[246.176, 105.001], [237.739, 93.8352], [222.851, 93.8352]],
  [[203.992, 93.8352], [189.6, 115.175], [189.6, 142.47]],
  [[189.6, 171.751], [205.481, 192.346], [239.208, 192.346]],
  [[285.066, 192.346], [335.86, 137.297], [359.199, 75.8642]],
  [[365.788, 58.5186], [368.26, 42.4121], [368.26, 31.1568]],
  [[368.26, 17.8113], [364.042, 7.56384], [352.131, 7.56384]],
  [[340.469, 7.56384], [332.777, 16.6197], [325.829, 30.9185]],
  [[317.688, 47.5023], [311.667, 71.4218], [309.203, 98.4605]],
  [[303, 166.307], [316.896, 191.354], [349.936, 191.354]],
  [[390, 191.354], [434.542, 135.54], [457.286, 75.6742]],
  [[463.803, 58.5186], [466.275, 42.4121], [466.275, 31.1568]],
  [[466.275, 17.8113], [462.057, 7.56384], [450.146, 7.56384]],
  [[438.484, 7.56384], [430.792, 16.6197], [423.844, 30.9185]],
  [[415.703, 47.5023], [409.682, 71.4218], [407.218, 98.4605]],
  [[401.015, 166.307], [414.911, 191.354], [444.416, 191.354]],
  [[473.874, 191.354], [489.877, 165.675], [499.471, 138.408]],
  [[508.955, 111.453], [520.618, 94.8278], [544.935, 94.8278]],
  [[565.035, 94.8278], [580.916, 109.716], [580.916, 137.756]],
  [[580.916, 168.773], [560.792, 192.098], [535.362, 192.346]],
  [[512.984, 192.594], [498.285, 174.48], [499.774, 147.185]],
  [[501.511, 116.912], [519.873, 94.8278], [543.943, 94.8278]],
  [[557.839, 94.8278], [569.51, 101.005], [578.682, 107.731]],
  [[603.549, 125.872], [622.709, 114.661], [630.047, 96.7242]],
];

function makeHelloCurve(
  startPoint: SkeletonPoint,
  segments: SkeletonSegment[],
  samples: number,
  depthOffset = 0,
) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const scale = 0.0146;
  const originX = 319.5;
  const centerY = 100;
  const depthAt = (index: number) => {
    const position = index + depthOffset;
    return Math.sin(position * 0.82) * 0.045 + Math.sin(position * 0.23) * 0.025;
  };
  const toWorld = ([x, y]: SkeletonPoint, depth: number) => {
    const worldY = (centerY - y) * scale;
    return new THREE.Vector3((x - originX) * scale, worldY, depth);
  };

  let start = toWorld(startPoint, depthAt(0));

  segments.forEach(([controlA, controlB, endpoint], index) => {
    const startDepth = depthAt(index);
    const endDepth = depthAt(index + 1);
    const end = toWorld(endpoint, endDepth);

    path.add(
      new THREE.CubicBezierCurve3(
        start,
        toWorld(controlA, THREE.MathUtils.lerp(startDepth, endDepth, 0.34)),
        toWorld(controlB, THREE.MathUtils.lerp(startDepth, endDepth, 0.68)),
        end,
      ),
    );
    start = end;
  });

  return new THREE.CatmullRomCurve3(path.getSpacedPoints(samples), false, "centripetal");
}

function makeVariableTubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  baseRadius: number,
  progressStart = 0,
  progressEnd = 1,
  capStart = true,
  capEnd = true,
) {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const pathProgresses: number[] = [];
  const capProgresses: number[] = [];
  const tubeIndices: number[] = [];
  const point = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const radiusAt = (progress: number) => tubeRadiusAt(progress, baseRadius);

  for (let segment = 0; segment <= tubularSegments; segment += 1) {
    const progress = segment / tubularSegments;
    curve.getPointAt(progress, point);

    const radius = radiusAt(progress);
    const normal = frames.normals[segment];
    const binormal = frames.binormals[segment];

    for (let side = 0; side < radialSegments; side += 1) {
      const angle = (side / radialSegments) * Math.PI * 2;
      offset
        .copy(normal)
        .multiplyScalar(Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius);

      positions.push(point.x + offset.x, point.y + offset.y, point.z + offset.z);
      offset.normalize();
      normals.push(offset.x, offset.y, offset.z);
      pathProgresses.push(THREE.MathUtils.lerp(progressStart, progressEnd, progress));
      capProgresses.push(0);
    }
  }

  for (let segment = 0; segment < tubularSegments; segment += 1) {
    const ring = segment * radialSegments;
    const nextRing = (segment + 1) * radialSegments;

    for (let side = 0; side < radialSegments; side += 1) {
      const nextSide = (side + 1) % radialSegments;
      const a = ring + side;
      const b = nextRing + side;
      const c = nextRing + nextSide;
      const d = ring + nextSide;
      tubeIndices.push(a, b, d, b, c, d);
    }
  }

  const addRoundedCap = (atStart: boolean) => {
    const capIndices: number[] = [];
    const progress = atStart ? 0 : 1;
    const frameIndex = atStart ? 0 : tubularSegments;
    const endpointRing = frameIndex * radialSegments;
    const endpoint = curve.getPointAt(progress);
    const outward = curve
      .getTangentAt(progress)
      .normalize()
      .multiplyScalar(atStart ? -1 : 1);
    const frameNormal = frames.normals[frameIndex];
    const frameBinormal = frames.binormals[frameIndex];
    const radius = radiusAt(progress);
    const pathProgress = atStart ? progressStart : progressEnd;
    const radial = new THREE.Vector3();
    const capPoint = new THREE.Vector3();
    const capNormal = new THREE.Vector3();
    let previousRing = endpointRing;

    for (let step = 1; step < CAP_SEGMENTS; step += 1) {
      const arc = (step / CAP_SEGMENTS) * (Math.PI / 2);
      const ringStart = positions.length / 3;

      for (let side = 0; side < radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2;
        radial
          .copy(frameNormal)
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(frameBinormal, Math.sin(angle));
        capPoint
          .copy(endpoint)
          .addScaledVector(outward, Math.sin(arc) * radius)
          .addScaledVector(radial, Math.cos(arc) * radius);
        capNormal
          .copy(radial)
          .multiplyScalar(Math.cos(arc))
          .addScaledVector(outward, Math.sin(arc))
          .normalize();

        positions.push(capPoint.x, capPoint.y, capPoint.z);
        normals.push(capNormal.x, capNormal.y, capNormal.z);
        pathProgresses.push(pathProgress);
        capProgresses.push(step / CAP_SEGMENTS);
      }

      for (let side = 0; side < radialSegments; side += 1) {
        const nextSide = (side + 1) % radialSegments;
        const a = previousRing + side;
        const b = ringStart + side;
        const c = ringStart + nextSide;
        const d = previousRing + nextSide;

        if (atStart) capIndices.push(a, d, b, b, d, c);
        else capIndices.push(a, b, d, b, c, d);
      }

      previousRing = ringStart;
    }

    const pole = endpoint.clone().addScaledVector(outward, radius);
    const poleIndex = positions.length / 3;
    positions.push(pole.x, pole.y, pole.z);
    normals.push(outward.x, outward.y, outward.z);
    pathProgresses.push(pathProgress);
    capProgresses.push(1);

    for (let side = 0; side < radialSegments; side += 1) {
      const nextSide = (side + 1) % radialSegments;
      const a = previousRing + side;
      const d = previousRing + nextSide;
      if (atStart) capIndices.push(a, d, poleIndex);
      else capIndices.push(a, poleIndex, d);
    }

    return capIndices;
  };

  const startCapIndices = capStart ? addRoundedCap(true) : [];
  const endCapIndices = capEnd ? addRoundedCap(false) : [];
  const staticIndices = [...startCapIndices, ...tubeIndices, ...endCapIndices];
  const dynamicCapVertexStart = positions.length / 3;
  const dynamicCapIndices: number[] = [];

  for (let step = 1; step < CAP_SEGMENTS; step += 1) {
    for (let side = 0; side < radialSegments; side += 1) {
      positions.push(0, 0, 0);
      normals.push(0, 0, 1);
      pathProgresses.push(progressStart);
      capProgresses.push(step / CAP_SEGMENTS);
    }
  }

  const dynamicPoleIndex = positions.length / 3;
  positions.push(0, 0, 0);
  normals.push(0, 0, 1);
  pathProgresses.push(progressStart);
  capProgresses.push(1);

  let previousRing = 0;
  for (let step = 1; step < CAP_SEGMENTS; step += 1) {
    const ringStart = dynamicCapVertexStart + (step - 1) * radialSegments;

    for (let side = 0; side < radialSegments; side += 1) {
      const nextSide = (side + 1) % radialSegments;
      const a = previousRing + side;
      const b = ringStart + side;
      const c = ringStart + nextSide;
      const d = previousRing + nextSide;
      dynamicCapIndices.push(a, b, d, b, c, d);
    }

    previousRing = ringStart;
  }

  for (let side = 0; side < radialSegments; side += 1) {
    const nextSide = (side + 1) % radialSegments;
    dynamicCapIndices.push(previousRing + side, dynamicPoleIndex, previousRing + nextSide);
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
  const normalAttribute = new THREE.Float32BufferAttribute(normals, 3);
  const pathProgressAttribute = new THREE.Float32BufferAttribute(pathProgresses, 1);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("normal", normalAttribute);
  geometry.setAttribute("aPathProgress", pathProgressAttribute);
  geometry.setAttribute("aCapProgress", new THREE.Float32BufferAttribute(capProgresses, 1));
  geometry.setIndex([...staticIndices, ...dynamicCapIndices]);
  geometry.clearGroups();
  geometry.addGroup(0, 0, 0);
  geometry.addGroup(staticIndices.length, 0, 1);
  geometry.computeBoundingSphere();

  const capPoint = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const capNormal = new THREE.Vector3();
  let leadCapSegment = -1;
  const updateLeadCap = (segment: number) => {
    const clampedSegment = THREE.MathUtils.clamp(segment, 0, tubularSegments);
    const progress = clampedSegment / tubularSegments;
    const endpoint = curve.getPointAt(progress);
    const outward = frames.tangents[clampedSegment];
    const frameNormal = frames.normals[clampedSegment];
    const frameBinormal = frames.binormals[clampedSegment];
    const radius = radiusAt(progress);
    const pathProgress = THREE.MathUtils.lerp(progressStart, progressEnd, progress);
    let vertexIndex = dynamicCapVertexStart;

    for (let step = 1; step < CAP_SEGMENTS; step += 1) {
      const arc = (step / CAP_SEGMENTS) * (Math.PI / 2);

      for (let side = 0; side < radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2;
        radial
          .copy(frameNormal)
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(frameBinormal, Math.sin(angle));
        capPoint
          .copy(endpoint)
          .addScaledVector(outward, Math.sin(arc) * radius)
          .addScaledVector(radial, Math.cos(arc) * radius);
        capNormal
          .copy(radial)
          .multiplyScalar(Math.cos(arc))
          .addScaledVector(outward, Math.sin(arc))
          .normalize();

        positionAttribute.setXYZ(vertexIndex, capPoint.x, capPoint.y, capPoint.z);
        normalAttribute.setXYZ(vertexIndex, capNormal.x, capNormal.y, capNormal.z);
        pathProgressAttribute.setX(vertexIndex, pathProgress);
        vertexIndex += 1;
      }
    }

    capPoint.copy(endpoint).addScaledVector(outward, radius);
    positionAttribute.setXYZ(dynamicPoleIndex, capPoint.x, capPoint.y, capPoint.z);
    normalAttribute.setXYZ(dynamicPoleIndex, outward.x, outward.y, outward.z);
    pathProgressAttribute.setX(dynamicPoleIndex, pathProgress);

    const indexAttribute = geometry.getIndex();
    if (indexAttribute) {
      const endpointRing = clampedSegment * radialSegments;
      const firstBandOffset = staticIndices.length;

      for (let side = 0; side < radialSegments; side += 1) {
        const nextSide = (side + 1) % radialSegments;
        const offset = firstBandOffset + side * 6;
        const a = endpointRing + side;
        const b = dynamicCapVertexStart + side;
        const c = dynamicCapVertexStart + nextSide;
        const d = endpointRing + nextSide;
        indexAttribute.setX(offset, a);
        indexAttribute.setX(offset + 1, b);
        indexAttribute.setX(offset + 2, d);
        indexAttribute.setX(offset + 3, b);
        indexAttribute.setX(offset + 4, c);
        indexAttribute.setX(offset + 5, d);
      }

      indexAttribute.needsUpdate = true;
    }

    positionAttribute.needsUpdate = true;
    normalAttribute.needsUpdate = true;
    pathProgressAttribute.needsUpdate = true;
  };

  const setReveal = (progress: number, showLeadCap: boolean) => {
    const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const revealedSegments = Math.ceil(clampedProgress * tubularSegments);
    const tubeIndexCount = revealedSegments * radialSegments * 6;
    const showStaticEndCap = clampedProgress >= 0.999;
    const mainGroup = geometry.groups[0];
    const capGroup = geometry.groups[1];

    mainGroup.count =
      (clampedProgress > 0 ? startCapIndices.length : 0) +
      tubeIndexCount +
      (showStaticEndCap ? endCapIndices.length : 0);
    capGroup.count = showLeadCap && !showStaticEndCap ? dynamicCapIndices.length : 0;

    if (capGroup.count > 0 && revealedSegments !== leadCapSegment) {
      updateLeadCap(revealedSegments);
      leadCapSegment = revealedSegments;
    }
  };

  return {
    geometry,
    setReveal,
  };
}

function paintEnvironmentFace(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas 2D is unavailable");

  const palettes = [
    ["#0266cf", "#6bc8ff"],
    ["#06376f", "#1597e9"],
    ["#d9f4ff", "#4da9f0"],
    ["#063c83", "#042756"],
    ["#0a7bea", "#8bd7ff"],
    ["#052c64", "#149fe9"],
  ] as const;
  const [top, bottom] = palettes[index];
  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, top);
  background.addColorStop(1, bottom);
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const glow = context.createRadialGradient(150, 120, 0, 150, 120, 300);
  glow.addColorStop(0, "rgba(255,255,255,.92)");
  glow.addColorStop(0.18, "rgba(255,255,255,.48)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.translate(330, 256);
  context.rotate((index % 2 === 0 ? -1 : 1) * 0.34);
  const strip = context.createLinearGradient(-42, 0, 42, 0);
  strip.addColorStop(0, "rgba(255,255,255,0)");
  strip.addColorStop(0.45, "rgba(255,255,255,.96)");
  strip.addColorStop(0.55, "rgba(255,255,255,.96)");
  strip.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = strip;
  context.fillRect(-54, -420, 108, 840);
  context.restore();

  return canvas;
}

function useStudioEnvironment() {
  const [environment, setEnvironment] = useState<THREE.CubeTexture | null>(null);

  useEffect(() => {
    const texture = new THREE.CubeTexture(
      Array.from({ length: 6 }, (_, index) => paintEnvironmentFace(index)),
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    setEnvironment(texture);

    return () => texture.dispose();
  }, []);

  return environment;
}

function useReducedMotionPreference() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reduceMotion;
}

function makeGlassTuningUniforms(tuning: GlassTuning) {
  const uniforms: Record<string, { value: number }> = {};

  (Object.keys(GLASS_UNIFORM_NAMES) as GlassTuningKey[]).forEach((key) => {
    uniforms[GLASS_UNIFORM_NAMES[key]] = { value: tuning[key] };
  });

  return uniforms;
}

function makeGlassMaterial(pathOffset: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uEnvironment: { value: null },
      uTime: { value: 0 },
      uPathOffset: { value: pathOffset },
      uSweep: { value: -1 },
      uSweepStrength: { value: 0 },
      ...makeGlassTuningUniforms(DEFAULT_GLASS_TUNING),
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

type GlassStrokeProps = {
  reduceMotion: boolean;
  runId: number;
  tuning: GlassTuning;
};

function GlassStroke({ reduceMotion, runId, tuning }: GlassStrokeProps) {
  const environment = useStudioEnvironment();
  const animationStartRef = useRef<number | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate, viewport } = useThree();

  const curves = useMemo(
    () => ({
      stem: makeHelloCurve(HELLO_STEM_START, HELLO_STEM_SEGMENTS, 180),
      word: makeHelloCurve(
        HELLO_WORD_START,
        HELLO_WORD_SEGMENTS,
        520,
        HELLO_STEM_SEGMENTS.length,
      ),
    }),
    [],
  );
  const stemShare = useMemo(() => {
    const stemLength = curves.stem.getLength();
    return stemLength / (stemLength + curves.word.getLength());
  }, [curves]);
  const geometries = useMemo(
    () => ({
      stem: makeVariableTubeGeometry(
        curves.stem,
        STEM_TUBULAR_SEGMENTS,
        RADIAL_SEGMENTS,
        TUBE_BASE_RADIUS,
        0,
        stemShare,
      ),
      word: makeVariableTubeGeometry(
        curves.word,
        WORD_TUBULAR_SEGMENTS,
        RADIAL_SEGMENTS,
        TUBE_BASE_RADIUS,
        stemShare,
        1,
        false,
        true,
      ),
    }),
    [curves, stemShare],
  );
  const materials = useMemo(
    () => ({
      tube: makeGlassMaterial(0),
    }),
    [],
  );
  const groupedMaterial = useMemo(
    () => [materials.tube, materials.tube],
    [materials],
  );

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      material.uniforms.uEnvironment.value = environment;
      material.needsUpdate = true;
    });
    invalidate();
  }, [environment, invalidate, materials]);

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      (Object.keys(GLASS_UNIFORM_NAMES) as GlassTuningKey[]).forEach((key) => {
        material.uniforms[GLASS_UNIFORM_NAMES[key]].value = tuning[key];
      });
    });
    invalidate();
  }, [invalidate, materials, tuning]);

  useEffect(() => {
    animationStartRef.current = null;
    geometries.stem.setReveal(reduceMotion ? 1 : 0, false);
    geometries.word.setReveal(reduceMotion ? 1 : 0, false);
  }, [geometries, reduceMotion, runId]);

  useEffect(
    () => () => {
      geometries.stem.geometry.dispose();
      geometries.word.geometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
    [geometries, materials],
  );

  useFrame((state) => {
    if (animationStartRef.current === null) {
      animationStartRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - animationStartRef.current;
    const rawProgress = reduceMotion
      ? 1
      : THREE.MathUtils.clamp((elapsed - WRITE_DELAY) / WRITE_DURATION, 0, 1);
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const stemProgress = THREE.MathUtils.clamp(progress / stemShare, 0, 1);
    const wordProgress = THREE.MathUtils.clamp(
      (progress - stemShare) / (1 - stemShare),
      0,
      1,
    );
    const capVisible = progress > 0.001 && rawProgress < 0.999;
    const stemActive = progress <= stemShare;
    geometries.stem.setReveal(stemProgress, capVisible && stemActive);
    geometries.word.setReveal(wordProgress, capVisible && !stemActive);

    const afterWrite = elapsed - WRITE_DELAY - WRITE_DURATION;
    let sweep = -1;
    let sweepStrength = 0;

    if (!reduceMotion && rawProgress > 0 && rawProgress < 1) {
      sweep = progress;
      sweepStrength = Math.min(1, rawProgress * 5);
    } else if (!reduceMotion && afterWrite >= 0 && afterWrite < FLOW_PAUSE) {
      sweep = 1;
      sweepStrength = 1 - afterWrite / FLOW_PAUSE;
    } else if (!reduceMotion && afterWrite >= FLOW_PAUSE) {
      const flowElapsed = afterWrite - FLOW_PAUSE;
      sweep = (flowElapsed % FLOW_DURATION) / FLOW_DURATION;
      sweepStrength = Math.min(1, flowElapsed * 2.5);
    }

    Object.values(materials).forEach((material) => {
      material.uniforms.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
      material.uniforms.uSweep.value = sweep;
      material.uniforms.uSweepStrength.value = sweepStrength;
    });

    const settleRawProgress = reduceMotion
      ? 1
      : THREE.MathUtils.clamp(
          (afterWrite - HELLO_SETTLE_MOTION.hold) /
            HELLO_SETTLE_MOTION.duration,
          0,
          1,
        );
    const settleProgress = easeHelloSettle(settleRawProgress);
    const group = groupRef.current;

    if (group) {
      const responsiveScale = Math.min(1.05, viewport.width / 9.05);
      const startRotation = HELLO_SETTLE_MOTION.startRotation;
      const endRotation = HELLO_SETTLE_MOTION.endRotation;

      group.scale.setScalar(
        responsiveScale *
          THREE.MathUtils.lerp(1, HELLO_SETTLE_MOTION.scale, settleProgress),
      );
      group.position.y = THREE.MathUtils.lerp(
        0,
        HELLO_SETTLE_MOTION.lift,
        settleProgress,
      );
      group.rotation.set(
        THREE.MathUtils.lerp(startRotation[0], endRotation[0], settleProgress),
        THREE.MathUtils.lerp(startRotation[1], endRotation[1], settleProgress),
        THREE.MathUtils.lerp(startRotation[2], endRotation[2], settleProgress),
      );
    }
  });

  if (!environment) return null;

  const responsiveScale = Math.min(1.05, viewport.width / 9.05);
  const initialProgress = reduceMotion ? 1 : 0;
  const initialRotation = reduceMotion
    ? HELLO_SETTLE_MOTION.endRotation
    : HELLO_SETTLE_MOTION.startRotation;

  return (
    <group
      ref={groupRef}
      position={[0, HELLO_SETTLE_MOTION.lift * initialProgress, 0]}
      rotation={initialRotation}
      scale={
        responsiveScale *
        THREE.MathUtils.lerp(1, HELLO_SETTLE_MOTION.scale, initialProgress)
      }
    >
      <mesh geometry={geometries.stem.geometry} material={groupedMaterial} />
      <mesh geometry={geometries.word.geometry} material={groupedMaterial} />
    </group>
  );
}

export function GlassStrokePrototype() {
  const reduceMotion = useReducedMotionPreference();
  const [runId, setRunId] = useState(0);

  return (
    <main className={styles.prototype}>
      <h1 className={styles.srOnly}>hello 连写玻璃字形实验</h1>

      <div className={styles.stage} aria-hidden="true">
        <Canvas
          camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 8.6] }}
          dpr={[1, 1.75]}
          frameloop={reduceMotion ? "demand" : "always"}
          gl={{ alpha: true, antialias: true, stencil: false }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <GlassStroke
            reduceMotion={reduceMotion}
            runId={runId}
            tuning={DEFAULT_GLASS_TUNING}
          />
        </Canvas>
      </div>

      <aside className={styles.prototypeNote} aria-label="原型状态">
        <span>PROTOTYPE 06 · ROUNDED CAPS</span>
        <strong>透明 hello 的圆润端点</strong>
        <small>当前保留玻璃字形、圆润端点与书写动画</small>
        {!reduceMotion && (
          <button
            className={styles.replayButton}
            type="button"
            onClick={() => setRunId((current) => current + 1)}
          >
            重播书写
          </button>
        )}
      </aside>
    </main>
  );
}
