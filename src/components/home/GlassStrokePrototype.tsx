"use client";

import { Cloud, Clouds } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import * as THREE from "three";

import {
  resolveCloudFieldOffset,
  resolveHeaderTransition,
  resolveProfileRevealVisibility,
  resolveProfileTravelOffsetVh,
} from "./helloScrollSession";
import {
  HELLO_TILT_COMPENSATION_RADIANS,
  resolveHelloGeometryTransition,
} from "./helloGeometry";
import {
  useScrollMotionController,
  type SubscribeScrollProgress,
} from "./useScrollMotionController";
import { LocationCard, LocationPin } from "./LocationCard";
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
  internalRimLight: 0.42,
  highlightLight: 0.32,
  shadowColor: 0.24,
  shadowStrength: 0.2,
  flowBaseLight: 0.1,
  flowFacingLight: 0.14,
  capRefraction: 0.3,
  capGlintLight: 0.72,
  flowCoreLight: 0.2,
  baseAlpha: 0.004,
  edgeAlpha: 0.34,
  internalRimAlpha: 0.085,
  highlightAlpha: 0.08,
  innerBandAlpha: 0.012,
  shadowBandAlpha: 0.012,
  flowAlpha: 0.03,
  capLensAlpha: 0.05,
  capGlintAlpha: 0.28,
  maxAlpha: 0.4,
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

// Transparent glass tube material.
const VERTEX_SHADER = /* glsl */ `
  attribute float aPathProgress;
  attribute float aCapProgress;
  attribute vec3 aFlatPosition;
  attribute vec3 aFlatNormal;
  uniform float uPathOffset;
  uniform float uFlatten;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;
  varying float vCapProgress;

  void main() {
    vec3 localPosition = mix(position, aFlatPosition, uFlatten);
    vec3 localNormal = normalize(mix(normal, aFlatNormal, uFlatten));
    vec4 worldPosition = modelMatrix * vec4(localPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * localNormal);
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
const TUBE_BASE_RADIUS = 0.17;
const WRITE_DELAY = 0.24;
const WRITE_DURATION = 3.35;
const FLOW_PAUSE = 0.55;
const FLOW_DURATION = 5.4;
const FLOW_EDGE_PADDING = 0.08;
const FLOW_FADE_PORTION = 0.16;

const HELLO_DEPTH_RANGE = {
  start: -0.7,
  end: 0.7,
} as const;

const CLOUD_STREAM_MOTION = {
  duration: 13.4,
  startZ: -28,
  // Move straight toward the camera, then recycle just before reaching it.
  endZ: 7.4,
} as const;

const CLOUD_FIELD_SCALE = 1.22;
const CLOUD_OPACITY_SCALE = 1.55;
const CLOUD_NEAR_FADE = 3.2;
const CLOUD_ALPHA_TEST = 0.055;
const CLOUD_FIELD_REVEAL_DURATION = 2.4;
const CLOUD_CAMERA_Z = 8.6;

type CloudStreamSpec = {
  seed: number;
  phase: number;
  segments: number;
  x: number;
  y: number;
  bounds: [number, number, number];
  volume: number;
  smallestVolume: number;
  color: string;
  opacity: number;
  speed: number;
  scale: [number, number, number];
};

const CLOUD_STREAMS: readonly CloudStreamSpec[] = [
  {
    seed: 7,
    phase: 0,
    segments: 18,
    x: -4.45,
    y: 2.05,
    bounds: [1.9, 0.52, 0.9],
    volume: 2,
    smallestVolume: 0.54,
    color: "#f7fbff",
    opacity: 0.36,
    speed: 0.035,
    scale: [1.15, 0.9, 1],
  },
  {
    seed: 19,
    phase: 0.14,
    segments: 16,
    x: 4.35,
    y: 1.45,
    bounds: [1.65, 0.42, 0.8],
    volume: 1.5,
    smallestVolume: 0.22,
    color: "#eef8ff",
    opacity: 0.32,
    speed: 0.03,
    scale: [1.05, 0.82, 1],
  },
  {
    seed: 31,
    phase: 0.29,
    segments: 14,
    x: 0.35,
    y: 3.6,
    bounds: [1.45, 0.36, 0.7],
    volume: 1.25,
    smallestVolume: 0.2,
    color: "#f4faff",
    opacity: 0.24,
    speed: 0.025,
    scale: [0.9, 0.72, 1],
  },
  {
    seed: 43,
    phase: 0.43,
    segments: 14,
    x: -4.6,
    y: -1.75,
    bounds: [1.7, 0.44, 0.78],
    volume: 1.45,
    smallestVolume: 0.2,
    color: "#edf8ff",
    opacity: 0.23,
    speed: 0.028,
    scale: [1.05, 0.78, 1],
  },
  {
    seed: 59,
    phase: 0.58,
    segments: 14,
    x: 4.55,
    y: -1.95,
    bounds: [1.55, 0.4, 0.76],
    volume: 1.35,
    smallestVolume: 0.2,
    color: "#f5fbff",
    opacity: 0.22,
    speed: 0.024,
    scale: [1, 0.76, 1],
  },
  {
    seed: 71,
    phase: 0.72,
    segments: 12,
    x: -2.6,
    y: -3.4,
    bounds: [1.35, 0.34, 0.68],
    volume: 1.15,
    smallestVolume: 0.18,
    color: "#eef9ff",
    opacity: 0.17,
    speed: 0.02,
    scale: [0.86, 0.66, 1],
  },
  {
    seed: 89,
    phase: 0.86,
    segments: 12,
    x: 2.75,
    y: 2.75,
    bounds: [1.3, 0.32, 0.64],
    volume: 1.1,
    smallestVolume: 0.18,
    color: "#f7fcff",
    opacity: 0.16,
    speed: 0.018,
    scale: [0.82, 0.64, 1],
  },
  {
    seed: 101,
    phase: 0.07,
    segments: 12,
    x: -5.25,
    y: 0.15,
    bounds: [1.65, 0.42, 0.76],
    volume: 1.5,
    smallestVolume: 0.22,
    color: "#f4faff",
    opacity: 0.22,
    speed: 0.024,
    scale: [1.02, 0.76, 1],
  },
  {
    seed: 113,
    phase: 0.21,
    segments: 12,
    x: 5.2,
    y: 0.35,
    bounds: [1.6, 0.4, 0.74],
    volume: 1.45,
    smallestVolume: 0.21,
    color: "#eef8ff",
    opacity: 0.21,
    speed: 0.022,
    scale: [1, 0.74, 1],
  },
  {
    seed: 127,
    phase: 0.36,
    segments: 12,
    x: -3.35,
    y: 3.35,
    bounds: [1.5, 0.38, 0.72],
    volume: 1.35,
    smallestVolume: 0.2,
    color: "#f7fcff",
    opacity: 0.19,
    speed: 0.02,
    scale: [0.94, 0.7, 1],
  },
  {
    seed: 139,
    phase: 0.51,
    segments: 12,
    x: 3.55,
    y: -3.25,
    bounds: [1.55, 0.4, 0.74],
    volume: 1.4,
    smallestVolume: 0.21,
    color: "#f3faff",
    opacity: 0.2,
    speed: 0.023,
    scale: [0.98, 0.72, 1],
  },
  {
    seed: 151,
    phase: 0.79,
    segments: 12,
    x: -0.55,
    y: -3.95,
    bounds: [1.45, 0.36, 0.7],
    volume: 1.3,
    smallestVolume: 0.19,
    color: "#edf8ff",
    opacity: 0.18,
    speed: 0.019,
    scale: [0.9, 0.68, 1],
  },
  {
    seed: 163,
    phase: 0.93,
    segments: 12,
    x: 1.25,
    y: 4.05,
    bounds: [1.4, 0.35, 0.68],
    volume: 1.25,
    smallestVolume: 0.19,
    color: "#f6fbff",
    opacity: 0.17,
    speed: 0.018,
    scale: [0.88, 0.66, 1],
  },
];

// POST-WRITE MOTION — edit these values to tune the transition checkpoint.
const HELLO_SETTLE_MOTION = {
  hold: 0.1,
  autoScrollDuration: 1.5,
  startScale: 0.86,
  scale: 0.25,
  startY: -0.52,
  headerFallbackYRatio: 0.42,
  scrollViewports: 1,
  startRotation: [0, 0, HELLO_TILT_COMPENSATION_RADIANS] as const,
  // The spatial curve flattens during the flip, so the final pose matches the SVG.
  endRotation: [0, Math.PI * 2, 0] as const,
};

function smootherStep(progress: number) {
  const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);

  return (
    clampedProgress *
    clampedProgress *
    clampedProgress *
    (clampedProgress * (clampedProgress * 6 - 15) + 10)
  );
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

function makeSkeletonSvgPath(
  startPoint: SkeletonPoint,
  segments: SkeletonSegment[],
) {
  return [
    `M ${startPoint[0]} ${startPoint[1]}`,
    ...segments.map(
      ([controlA, controlB, endpoint]) =>
        `C ${controlA[0]} ${controlA[1]} ${controlB[0]} ${controlB[1]} ${endpoint[0]} ${endpoint[1]}`,
    ),
  ].join(" ");
}

const HELLO_STEM_SVG_PATH = makeSkeletonSvgPath(
  HELLO_STEM_START,
  HELLO_STEM_SEGMENTS,
);
const HELLO_WORD_SVG_PATH = makeSkeletonSvgPath(
  HELLO_WORD_START,
  HELLO_WORD_SEGMENTS,
);

const HELLO_SEGMENT_COUNT =
  HELLO_STEM_SEGMENTS.length + HELLO_WORD_SEGMENTS.length;

function makeHelloCurve(
  startPoint: SkeletonPoint,
  segments: SkeletonSegment[],
  samples: number,
  depthOffset = 0,
  depthScale = 1,
) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const scale = 0.0146;
  const originX = 319.5;
  const centerY = 100;
  const depthAt = (index: number) => {
    const progress = THREE.MathUtils.clamp(
      (index + depthOffset) / HELLO_SEGMENT_COUNT,
      0,
      1,
    );
    const easedProgress = smootherStep(progress);

    return (
      depthScale *
      THREE.MathUtils.lerp(
        HELLO_DEPTH_RANGE.start,
        HELLO_DEPTH_RANGE.end,
        easedProgress,
      )
    );
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

  return new THREE.CatmullRomCurve3(
    path.getSpacedPoints(samples),
    false,
    "centripetal",
  );
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

function makeMorphableVariableTubeGeometry(
  spatialCurve: THREE.Curve<THREE.Vector3>,
  flatCurve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  baseRadius: number,
  progressStart = 0,
  progressEnd = 1,
  capStart = true,
  capEnd = true,
) {
  const spatial = makeVariableTubeGeometry(
    spatialCurve,
    tubularSegments,
    radialSegments,
    baseRadius,
    progressStart,
    progressEnd,
    capStart,
    capEnd,
  );
  const flat = makeVariableTubeGeometry(
    flatCurve,
    tubularSegments,
    radialSegments,
    baseRadius,
    progressStart,
    progressEnd,
    capStart,
    capEnd,
  );
  const spatialPosition = spatial.geometry.getAttribute("position");
  const flatPosition = flat.geometry.getAttribute("position");
  const flatNormal = flat.geometry.getAttribute("normal");

  if (spatialPosition.count !== flatPosition.count) {
    spatial.geometry.dispose();
    flat.geometry.dispose();
    throw new Error("Hello spatial and flat geometries must share a topology");
  }

  spatial.geometry.setAttribute("aFlatPosition", flatPosition.clone());
  spatial.geometry.setAttribute("aFlatNormal", flatNormal.clone());
  flat.geometry.dispose();

  return spatial;
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
      uFlatten: { value: 0 },
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

type ThreeCloudBackdropProps = {
  reduceMotion: boolean;
  initialScrollProgress: number;
  scrollProgressRef: MutableRefObject<number>;
};

function ThreeCloudBackdrop({
  reduceMotion,
  initialScrollProgress,
  scrollProgressRef,
}: ThreeCloudBackdropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudFieldRef = useRef<THREE.Group>(null);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudMaterialsRef = useRef<THREE.Material[]>([]);
  const cloudRevealStartRef = useRef<number | null>(null);
  const cloudStreamElapsedRef = useRef(0);

  useFrame((state, delta) => {
    const progress = reduceMotion
      ? initialScrollProgress
      : scrollProgressRef.current;

    if (cloudMaterialsRef.current.length === 0 && cloudFieldRef.current) {
      const materials = new Set<THREE.Material>();

      cloudFieldRef.current.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        const childMaterials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        childMaterials.forEach((material) => materials.add(material));
      });

      cloudMaterialsRef.current = [...materials];
      cloudRevealStartRef.current = state.clock.elapsedTime;
      cloudMaterialsRef.current.forEach((material) => {
        material.transparent = true;
        material.alphaTest = CLOUD_ALPHA_TEST;
        material.opacity = reduceMotion ? 1 : 0;
        material.needsUpdate = true;
      });
    }

    if (cloudMaterialsRef.current.length > 0) {
      const revealElapsed =
        state.clock.elapsedTime -
        (cloudRevealStartRef.current ?? state.clock.elapsedTime);
      const revealProgress = reduceMotion
        ? 1
        : THREE.MathUtils.clamp(
            revealElapsed / CLOUD_FIELD_REVEAL_DURATION,
            0,
            1,
          );
      const revealOpacity = smootherStep(revealProgress);

      cloudMaterialsRef.current.forEach((material) => {
        material.opacity = revealOpacity;
      });
    }

    if (groupRef.current) {
      groupRef.current.position.y = resolveCloudFieldOffset(progress);
    }

    if (!reduceMotion) cloudStreamElapsedRef.current += delta;

    const streamProgress =
      cloudStreamElapsedRef.current / CLOUD_STREAM_MOTION.duration;

    const placeCloud = (
      cloud: THREE.Group | null,
      cloudSpec: CloudStreamSpec,
    ) => {
      if (!cloud) return;

      const phase = (streamProgress + cloudSpec.phase) % 1;
      const z = THREE.MathUtils.lerp(
        CLOUD_STREAM_MOTION.startZ,
        CLOUD_STREAM_MOTION.endZ,
        phase,
      );
      cloud.position.set(cloudSpec.x, cloudSpec.y, z);
      cloud.scale.set(
        cloudSpec.scale[0] * CLOUD_FIELD_SCALE,
        cloudSpec.scale[1] * CLOUD_FIELD_SCALE,
        cloudSpec.scale[2] * CLOUD_FIELD_SCALE,
      );
    };

    CLOUD_STREAMS.forEach((cloud, index) => {
      placeCloud(cloudRefs.current[index], cloud);
    });
  });

  return (
    <>
      <fog attach="fog" args={["#72b9e5", 10, 34]} />
      <ambientLight color="#dff2ff" intensity={1.7} />
      <directionalLight
        color="#fff3dd"
        intensity={2.6}
        position={[-4, 6, 5]}
      />
      <group
        ref={groupRef}
        position={[0, resolveCloudFieldOffset(initialScrollProgress), 0]}
      >
        <Clouds
          ref={cloudFieldRef}
          texture="/textures/cloud.png"
          material={THREE.MeshLambertMaterial}
          limit={176}
          frustumCulled={false}
          renderOrder={-2}
        >
          {CLOUD_STREAMS.map((cloud, index) => (
            <Cloud
              key={cloud.seed}
              ref={(instance) => {
                cloudRefs.current[index] = instance;
              }}
              seed={cloud.seed}
              segments={cloud.segments}
              bounds={cloud.bounds}
              volume={cloud.volume}
              smallestVolume={cloud.smallestVolume}
              color={cloud.color}
              opacity={Math.min(
                cloud.opacity * CLOUD_OPACITY_SCALE,
                0.62,
              )}
              fade={CLOUD_NEAR_FADE}
              speed={reduceMotion ? 0 : cloud.speed}
              position={[
                cloud.x,
                cloud.y,
                THREE.MathUtils.lerp(
                  CLOUD_STREAM_MOTION.startZ,
                  CLOUD_STREAM_MOTION.endZ,
                  cloud.phase,
                ),
              ]}
              scale={cloud.scale.map(
                (axis) => axis * CLOUD_FIELD_SCALE,
              ) as [number, number, number]}
            />
          ))}
        </Clouds>
      </group>
    </>
  );
}

type GlassStrokeProps = {
  reduceMotion: boolean;
  tuning: GlassTuning;
  initialScrollProgress: number;
  scrollProgressRef: MutableRefObject<number>;
  headerBackdropRef: RefObject<HTMLDivElement | null>;
  headerTargetRef: RefObject<HTMLDivElement | null>;
  headerLogoRef: RefObject<SVGSVGElement | null>;
  headerLayerRef: RefObject<HTMLDivElement | null>;
  onSettleStart: () => void;
};

function GlassStroke({
  reduceMotion,
  tuning,
  initialScrollProgress,
  scrollProgressRef,
  headerBackdropRef,
  headerTargetRef,
  headerLogoRef,
  headerLayerRef,
  onSettleStart,
}: GlassStrokeProps) {
  const environment = useStudioEnvironment();
  const animationStartRef = useRef<number | null>(null);
  const settleStartedRef = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate, size, viewport } = useThree();

  const curves = useMemo(
    () => ({
      stem: makeHelloCurve(HELLO_STEM_START, HELLO_STEM_SEGMENTS, 180),
      word: makeHelloCurve(
        HELLO_WORD_START,
        HELLO_WORD_SEGMENTS,
        520,
        HELLO_STEM_SEGMENTS.length,
      ),
      flatStem: makeHelloCurve(
        HELLO_STEM_START,
        HELLO_STEM_SEGMENTS,
        180,
        0,
        0,
      ),
      flatWord: makeHelloCurve(
        HELLO_WORD_START,
        HELLO_WORD_SEGMENTS,
        520,
        HELLO_STEM_SEGMENTS.length,
        0,
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
      stem: makeMorphableVariableTubeGeometry(
        curves.stem,
        curves.flatStem,
        STEM_TUBULAR_SEGMENTS,
        RADIAL_SEGMENTS,
        TUBE_BASE_RADIUS,
        0,
        stemShare,
      ),
      word: makeMorphableVariableTubeGeometry(
        curves.word,
        curves.flatWord,
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
  const helloWidth = useMemo(() => {
    const bounds = new THREE.Box3();

    [geometries.stem.geometry, geometries.word.geometry].forEach((geometry) => {
      const flatPosition = geometry.getAttribute(
        "aFlatPosition",
      ) as THREE.BufferAttribute;
      bounds.union(new THREE.Box3().setFromBufferAttribute(flatPosition));
    });

    return Math.max(bounds.max.x - bounds.min.x, 0.001);
  }, [geometries]);
  const headerTransformRef = useRef({
    x: 0,
    y: viewport.height * HELLO_SETTLE_MOTION.headerFallbackYRatio,
    scale:
      Math.min(1.05, viewport.width / 9.05) * HELLO_SETTLE_MOTION.scale,
  });
  const updateHeaderTransform = useCallback(() => {
    const target = headerTargetRef.current;
    const responsiveScale = Math.min(1.05, viewport.width / 9.05);

    if (!target || size.width <= 0 || size.height <= 0) {
      headerTransformRef.current = {
        x: 0,
        y: viewport.height * HELLO_SETTLE_MOTION.headerFallbackYRatio,
        scale: responsiveScale * HELLO_SETTLE_MOTION.scale,
      };
      return;
    }

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const targetWorldWidth = (rect.width / size.width) * viewport.width;

    headerTransformRef.current = {
      x: (centerX / size.width - 0.5) * viewport.width,
      y: (0.5 - centerY / size.height) * viewport.height,
      scale: targetWorldWidth / helloWidth,
    };
  }, [headerTargetRef, helloWidth, size.height, size.width, viewport.height, viewport.width]);

  useLayoutEffect(() => {
    updateHeaderTransform();
    invalidate();
  }, [invalidate, updateHeaderTransform]);
  const materials = useMemo(
    () => ({
      tube: makeGlassMaterial(0),
    }),
    [],
  );
  const applyHeaderHandoff = useCallback(
    (handoff: number) => {
      const visibleHandoff = environment ? handoff : 0;
      const showFlatLogo = visibleHandoff >= 1;

      if (headerLogoRef.current) {
        headerLogoRef.current.style.visibility = showFlatLogo
          ? "visible"
          : "hidden";
      }

      if (headerLayerRef.current) {
        headerLayerRef.current.style.zIndex = showFlatLogo ? "31" : "0";
      }

      if (headerBackdropRef.current) {
        headerBackdropRef.current.dataset.visible =
          showFlatLogo ? "true" : "false";
      }
    },
    [environment, headerBackdropRef, headerLayerRef, headerLogoRef],
  );
  useLayoutEffect(() => {
    const transition = resolveHeaderTransition(initialScrollProgress);
    const geometryTransition = resolveHelloGeometryTransition(
      transition.rotation,
    );
    materials.tube.uniforms.uFlatten.value = geometryTransition.flatten;
    applyHeaderHandoff(transition.handoff);
  }, [applyHeaderHandoff, initialScrollProgress, materials]);
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
    settleStartedRef.current = false;
    geometries.stem.setReveal(reduceMotion ? 1 : 0, false);
    geometries.word.setReveal(reduceMotion ? 1 : 0, false);
  }, [geometries, initialScrollProgress, reduceMotion]);

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
      const flowProgress = (flowElapsed % FLOW_DURATION) / FLOW_DURATION;
      const easedFlowProgress = smootherStep(flowProgress);
      const fadeIn = THREE.MathUtils.smoothstep(
        flowProgress,
        0,
        FLOW_FADE_PORTION,
      );
      const fadeOut =
        1 -
        THREE.MathUtils.smoothstep(
          flowProgress,
          1 - FLOW_FADE_PORTION,
          1,
        );

      sweep = THREE.MathUtils.lerp(
        -FLOW_EDGE_PADDING,
        1 + FLOW_EDGE_PADDING,
        easedFlowProgress,
      );
      sweepStrength = fadeIn * fadeOut;
    }

    Object.values(materials).forEach((material) => {
      material.uniforms.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
      material.uniforms.uSweep.value = sweep;
      material.uniforms.uSweepStrength.value = sweepStrength;
    });

    const settleReady = afterWrite >= HELLO_SETTLE_MOTION.hold;

    if (!reduceMotion && settleReady && !settleStartedRef.current) {
      settleStartedRef.current = true;
      onSettleStart();
    }

    const settleProgress = reduceMotion
      ? initialScrollProgress
      : scrollProgressRef.current;
    const headerTransition = resolveHeaderTransition(settleProgress);
    const geometryTransition = resolveHelloGeometryTransition(
      headerTransition.rotation,
    );
    materials.tube.uniforms.uFlatten.value = geometryTransition.flatten;

    applyHeaderHandoff(headerTransition.handoff);

    const group = groupRef.current;

    if (group) {
      group.visible = headerTransition.handoff < 1;
      const responsiveScale = Math.min(1.05, viewport.width / 9.05);
      const headerTransform = headerTransformRef.current;
      const startRotation = HELLO_SETTLE_MOTION.startRotation;
      const endRotation = HELLO_SETTLE_MOTION.endRotation;

      group.scale.setScalar(
        THREE.MathUtils.lerp(
          responsiveScale * HELLO_SETTLE_MOTION.startScale,
          headerTransform.scale,
          headerTransition.scale,
        ),
      );
      group.position.x = THREE.MathUtils.lerp(
        0,
        headerTransform.x,
        headerTransition.travel,
      );
      group.position.y = THREE.MathUtils.lerp(
        HELLO_SETTLE_MOTION.startY,
        headerTransform.y,
        headerTransition.travel,
      );
      group.rotation.set(
        THREE.MathUtils.lerp(
          startRotation[0],
          endRotation[0],
          headerTransition.rotation,
        ),
        THREE.MathUtils.lerp(
          startRotation[1],
          endRotation[1],
          headerTransition.rotation,
        ),
        geometryTransition.zRotation,
      );
    }
  });

  if (!environment) return null;

  const responsiveScale = Math.min(1.05, viewport.width / 9.05);
  const initialProgress = initialScrollProgress;
  const initialTransition = resolveHeaderTransition(initialProgress);
  const initialGeometryTransition = resolveHelloGeometryTransition(
    initialTransition.rotation,
  );
  const initialHeaderTransform = headerTransformRef.current;
  const startRotation = HELLO_SETTLE_MOTION.startRotation;
  const endRotation = HELLO_SETTLE_MOTION.endRotation;
  const initialRotation = [
    THREE.MathUtils.lerp(
      startRotation[0],
      endRotation[0],
      initialTransition.rotation,
    ),
    THREE.MathUtils.lerp(
      startRotation[1],
      endRotation[1],
      initialTransition.rotation,
    ),
    initialGeometryTransition.zRotation,
  ] as const;

  return (
    <group
      ref={groupRef}
      position={[
        THREE.MathUtils.lerp(
          0,
          initialHeaderTransform.x,
          initialTransition.travel,
        ),
        THREE.MathUtils.lerp(
          HELLO_SETTLE_MOTION.startY,
          initialHeaderTransform.y,
          initialTransition.travel,
        ),
        0,
      ]}
      rotation={initialRotation}
      visible={initialTransition.handoff < 1}
      scale={
        THREE.MathUtils.lerp(
          responsiveScale * HELLO_SETTLE_MOTION.startScale,
          initialHeaderTransform.scale,
          initialTransition.scale,
        )
      }
    >
      <mesh
        geometry={geometries.stem.geometry}
        material={groupedMaterial}
        renderOrder={2}
      />
      <mesh
        geometry={geometries.word.geometry}
        material={groupedMaterial}
        renderOrder={2}
      />
    </group>
  );
}

type PersonalIntroductionProps = {
  reduceMotion: boolean;
  initialScrollProgress: number;
  subscribeScrollProgress: SubscribeScrollProgress;
};

function PersonalIntroduction({
  reduceMotion,
  initialScrollProgress,
  subscribeScrollProgress,
}: PersonalIntroductionProps) {
  const motionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisibleState] = useState(reduceMotion);
  const visibleRef = useRef(reduceMotion);

  const setVisible = useCallback(
    (visible: boolean) => {
      visibleRef.current = visible;
      setVisibleState(visible);
    },
    [],
  );

  const applyTravel = useCallback(
    (scrollProgress: number) => {
      const translateYVh = reduceMotion
        ? 0
        : resolveProfileTravelOffsetVh(scrollProgress);

      if (motionRef.current) {
        motionRef.current.style.transform =
          `translate3d(0, ${translateYVh.toFixed(2)}vh, 0)`;
      }

    },
    [reduceMotion],
  );

  const applyProgress = useCallback(
    (scrollProgress: number) => {
      const shouldBeVisible =
        reduceMotion ||
        resolveProfileRevealVisibility(scrollProgress, visibleRef.current);

      if (visibleRef.current !== shouldBeVisible) {
        setVisible(shouldBeVisible);
      }

      applyTravel(scrollProgress);
    },
    [applyTravel, reduceMotion, setVisible],
  );

  useLayoutEffect(() => {
    applyTravel(initialScrollProgress);

    if (reduceMotion) {
      setVisible(true);
    }
  }, [applyTravel, initialScrollProgress, reduceMotion, setVisible]);

  useEffect(() => {
    if (reduceMotion) return;

    return subscribeScrollProgress(applyProgress);
  }, [applyProgress, reduceMotion, subscribeScrollProgress]);

  return (
    <section className={styles.profileLayer} aria-labelledby="profile-title">
      <div className={styles.profileContent}>
        <h2 id="profile-title" className={styles.srOnly}>
          About aqhours
        </h2>
        <div ref={motionRef} className={styles.profileMotion}>
          {visible && (
            <>
              <p className={styles.profileStatement}>
                <span className={styles.profileLead}>I am</span>{" "}
                <span className={styles.profileName}>
                  <span className={styles.profileHandwritten}>aqhours</span>.
                </span>
              </p>
              <div className={styles.profileLocation}>
                <span className={styles.profileLocationLead}>Living in</span>
                <span className={styles.profileLocationPlace}>
                  <span className={styles.profileLocationPin}>
                    <LocationPin />
                  </span>
                  Honggutan, Nanchang
                </span>
              </div>
            </>
          )}
          <div className={styles.locationCardTravel}>
            {visible && <LocationCard />}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GlassStrokePrototype() {
  const reduceMotion = useReducedMotionPreference();
  const headerBackdropRef = useRef<HTMLDivElement>(null);
  const headerTargetRef = useRef<HTMLDivElement>(null);
  const headerLogoRef = useRef<SVGSVGElement>(null);
  const headerLayerRef = useRef<HTMLDivElement>(null);
  const {
    scrollStageRef,
    scrollProgressRef,
    scrollSession,
    startAutoScroll,
    subscribeScrollProgress,
  } = useScrollMotionController({
    reduceMotion,
    autoScrollDuration: HELLO_SETTLE_MOTION.autoScrollDuration,
  });

  const scrollStageHeight = reduceMotion
    ? "100svh"
    : `${(1 + HELLO_SETTLE_MOTION.scrollViewports) * 100}svh`;

  return (
    <>
      <div
        ref={headerBackdropRef}
        className={`${styles.headerBackdrop} backdrop-blur-md`}
        data-visible="false"
        aria-hidden="true"
      />

      <header className={styles.siteHeader} aria-label="网站页眉">
        <a
          className={styles.headerIdentity}
          href="/"
          aria-label="aqhours 首页"
        >
          aqhours
        </a>

        <nav className={styles.headerNav} aria-label="主要导航">
          <a className={styles.headerLink} href="/blog">
            Blog
          </a>
          <a className={styles.headerLink} href="/studio">
            Studio
          </a>
          <a className={styles.headerLink} href="/photos">
            Photos
          </a>
        </nav>
      </header>

      <div
        ref={headerLayerRef}
        className={styles.headerLogoLayer}
        aria-hidden="true"
      >
        <div ref={headerTargetRef} className={styles.headerLogoTarget}>
          <svg
            ref={headerLogoRef}
            className={styles.headerFlatLogo}
            viewBox="0 0 638 200"
            fill="none"
            aria-hidden="true"
            style={{ visibility: "hidden" }}
          >
            <path d={HELLO_STEM_SVG_PATH} />
            <path d={HELLO_WORD_SVG_PATH} />
          </svg>
        </div>
      </div>

      <div
        className={styles.sceneVisualLayer}
        aria-hidden="true"
      >
        {scrollSession.ready && (
          <Canvas
            camera={{
              fov: 32,
              near: 0.1,
              far: 100,
              position: [0, 0, CLOUD_CAMERA_Z],
            }}
            dpr={[1, 1.75]}
            frameloop={reduceMotion ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, stencil: false }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            <Suspense fallback={null}>
              <ThreeCloudBackdrop
                reduceMotion={reduceMotion}
                initialScrollProgress={scrollSession.startProgress}
                scrollProgressRef={scrollProgressRef}
              />
            </Suspense>
            <GlassStroke
              reduceMotion={reduceMotion}
              tuning={DEFAULT_GLASS_TUNING}
              initialScrollProgress={scrollSession.startProgress}
              scrollProgressRef={scrollProgressRef}
              headerBackdropRef={headerBackdropRef}
              headerTargetRef={headerTargetRef}
              headerLogoRef={headerLogoRef}
              headerLayerRef={headerLayerRef}
              onSettleStart={startAutoScroll}
            />
          </Canvas>
        )}
      </div>

      <main
        ref={scrollStageRef}
        className={styles.prototype}
        style={{ minHeight: scrollStageHeight }}
        data-scroll-session={scrollSession.ready ? "ready" : "pending"}
        data-scroll-start={scrollSession.startProgress.toFixed(3)}
        data-auto-settle={scrollSession.allowAutoSettle ? "true" : "false"}
      >
        <h1 className={styles.srOnly}>hello 连写玻璃字形实验</h1>

        <div className={styles.stage}>
          {scrollSession.ready && (
            <PersonalIntroduction
              reduceMotion={reduceMotion}
              initialScrollProgress={scrollSession.startProgress}
              subscribeScrollProgress={subscribeScrollProgress}
            />
          )}
        </div>
      </main>
    </>
  );
}
