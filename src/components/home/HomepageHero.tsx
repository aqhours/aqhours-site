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
  resolveProfileRevealState,
  resolveProfileTravelOffsetVh,
  type ProfileRevealState,
} from "./helloScrollSession";
import {
  HELLO_TILT_COMPENSATION_RADIANS,
  resolveHelloGeometryTransition,
  resolveProjectedHorizontalCenterOffset,
} from "./helloGeometry";
import {
  HERO_CLOUD_BANKS,
  HERO_CLOUD_FIELD,
} from "./heroCloudConfig";
import {
  useScrollMotionController,
  type SubscribeScrollProgress,
} from "./useScrollMotionController";
import { LocationCard } from "./LocationCard";
import styles from "./HomepageHero.module.css";

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

const GLASS_FRAGMENT_SHADER = /* glsl */ `
  uniform samplerCube uEnvironment;
  uniform float uCloudTravel;
  uniform float uSweep;
  uniform float uSweepStrength;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;
  varying float vCapProgress;

  float glassLuma(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float edge = 1.0 - facing;
    float outerRim = pow(edge, 5.8);
    float edgeGlint = pow(edge, 15.0);
    float rimShoulder = smoothstep(0.28, 0.58, edge) *
      (1.0 - smoothstep(0.86, 0.98, edge));

    // Two separated cylindrical responses keep the body clear between them.
    vec3 lightDirection = normalize(vec3(-0.58, 0.68, 0.46));
    float lightFacing = dot(normal, lightDirection);
    float satinBand = exp(-pow((lightFacing - 0.26) / 0.16, 2.0));
    float satinShoulder = exp(-pow((lightFacing - 0.25) / 0.3, 2.0));
    float innerStreak = exp(-pow((lightFacing + 0.34) / 0.072, 2.0));

    vec3 reflectionDirection = reflect(-viewDirection, normal);
    float cloudAngle = uCloudTravel * 6.28318530718;
    reflectionDirection.xz += vec2(
      sin(cloudAngle),
      cos(cloudAngle * 0.74 + 0.65)
    ) * 0.085;
    vec3 refractionDirection = refract(-viewDirection, normal, 1.0 / 1.44);
    vec3 reflected = textureCube(uEnvironment, normalize(reflectionDirection)).rgb;
    vec3 refracted = textureCube(uEnvironment, normalize(refractionDirection)).rgb;
    vec3 neutralReflection = mix(vec3(glassLuma(reflected)), reflected, 0.42);
    vec3 neutralRefraction = mix(vec3(glassLuma(refracted)), refracted, 0.3);
    vec3 rimEnvironment = mix(
      vec3(glassLuma(reflected)),
      reflected,
      0.78
    );
    float reflectedCloudLight = smoothstep(
      0.46,
      0.9,
      glassLuma(reflected)
    );

    float flow =
      (1.0 - smoothstep(0.015, 0.07, abs(vPathProgress - uSweep))) *
      uSweepStrength;
    float capProfile = smoothstep(0.04, 0.96, vCapProgress);
    float capRing = smoothstep(0.06, 0.34, capProfile) *
      (1.0 - smoothstep(0.68, 0.98, capProfile));
    vec3 glassColor = mix(neutralRefraction, neutralReflection, 0.3);
    glassColor = mix(glassColor, rimEnvironment, outerRim * 0.82);
    glassColor = mix(
      glassColor,
      vec3(1.0),
      satinBand * (0.5 + reflectedCloudLight * 0.38) +
        satinShoulder * (0.025 + reflectedCloudLight * 0.035) +
        innerStreak * (0.32 + reflectedCloudLight * 0.26) +
        rimShoulder * (0.055 + reflectedCloudLight * 0.08) +
        edgeGlint * 0.9 +
        flow * 0.08
    );
    glassColor = mix(glassColor, neutralRefraction, capRing * 0.38);

    float alpha = clamp(
      0.0008 + satinBand * (0.075 + reflectedCloudLight * 0.09) +
        satinShoulder * (0.002 + reflectedCloudLight * 0.003) +
        innerStreak * (0.038 + reflectedCloudLight * 0.045) +
        rimShoulder * (0.009 + reflectedCloudLight * 0.016) +
        outerRim * 0.24 + edgeGlint * 0.2 +
        flow * 0.012 + capRing * 0.05,
      0.0008,
      0.42
    );
    gl_FragColor = vec4(glassColor, alpha);
  }
`;

const GLASS_BACK_WALL_FRAGMENT_SHADER = /* glsl */ `
  uniform samplerCube uEnvironment;
  uniform float uCloudTravel;
  uniform float uSweep;
  uniform float uSweepStrength;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;
  varying float vCapProgress;

  float glassLuma(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float facing = abs(dot(normal, viewDirection));

    // This separate BackSide pass reads as the tube's far inner wall.
    vec3 wallLightDirection = normalize(vec3(0.46, 0.2, 0.86));
    float wallLight = dot(normal, wallLightDirection);
    float wallBand = exp(-pow((wallLight - 0.08) / 0.145, 2.0));
    float wallShoulder = exp(-pow((wallLight - 0.08) / 0.3, 2.0));
    wallBand *= smoothstep(0.12, 0.42, facing);
    wallShoulder *= smoothstep(0.08, 0.34, facing);
    vec3 reflectionDirection = reflect(-viewDirection, normal);
    float cloudAngle = uCloudTravel * 6.28318530718;
    reflectionDirection.xy += vec2(
      cos(cloudAngle * 0.82 + 0.9),
      sin(cloudAngle)
    ) * 0.065;
    vec3 environment = textureCube(
      uEnvironment,
      normalize(reflectionDirection)
    ).rgb;
    vec3 neutralEnvironment = mix(
      vec3(glassLuma(environment)),
      environment,
      0.28
    );
    float wallCloudLight = smoothstep(
      0.48,
      0.9,
      glassLuma(environment)
    );
    float flow =
      (1.0 - smoothstep(0.02, 0.09, abs(vPathProgress - uSweep))) *
      uSweepStrength;
    vec3 wallColor = mix(
      neutralEnvironment,
      vec3(1.0),
      wallBand * (0.28 + wallCloudLight * 0.32) +
        wallShoulder * 0.04
    );
    float alpha = clamp(
      wallBand * (0.026 + wallCloudLight * 0.038) +
        wallShoulder * 0.0025 + flow * wallBand * 0.01,
      0.0,
      0.075
    );

    gl_FragColor = vec4(wallColor, alpha);
  }
`;

type SkeletonPoint = readonly [number, number];
type SkeletonSegment = readonly [SkeletonPoint, SkeletonPoint, SkeletonPoint];

const STEM_CURVE_SAMPLES = 96;
const WORD_CURVE_SAMPLES = 300;
const STEM_TUBULAR_SEGMENTS = 132;
const WORD_TUBULAR_SEGMENTS = 420;
const RADIAL_SEGMENTS = 24;
const CAP_SEGMENTS = 10;
const TUBE_BASE_RADIUS = 0.235;
const HELLO_DEPTH_SCALE = 0.97;
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

const CLOUD_CAMERA_Z = 8.6;
const PROFILE_CLOUD_REVEAL_START = 0.42;
const PROFILE_CLOUD_REVEAL_END = 0.68;
const PROFILE_CLOUD_ALPHA_TEST = 0.1;
const PROFILE_CLOUD_NEAR_FADE = 3.2;
const PROFILE_CLOUD_Z = -0.6;

// EDUCATION CLOUD — one Drei cloud anchored to the fourth screen.
const EDUCATION_CLOUD = {
  sectionId: "homepage-interlude",
  centerYVh: 0.78,
  mobileCenterYVh: 0.49,
  xRatio: 0.36,
  mobileXRatio: 0.34,
  z: -0.6,
  driftX: 0.2,
  driftSpeed: 0.285,
  seed: 307,
  segments: 18,
  bounds: [1.8, 0.9, 0.68] as [number, number, number],
  volume: 3.78,
  smallestVolume: 0.19,
  growth: 0.58,
  speed: 0.3,
  color: "#f5faff",
  opacity: 0.58,
  fade: 3.2,
  // scale: [0.72, 0.56, 0.66] as [number, number, number],
  scale: [0.5, 0.5, 0.5] as [number, number, number],
} as const;

type ProfileCloudSpec = {
  /** Stable random layout for the small cloud puffs. */
  seed: number;
  /** Horizontal side of the viewport: -1 is left, 1 is right. */
  side: -1 | 1;
  /** Starting phase for the ambient drift, expressed as a 0–1 cycle. */
  phase: number;
  /** Number of sprite puffs used to build the cloud. */
  segments: number;
  /** Horizontal position as a fraction of the Three.js viewport width. */
  xRatio: number;
  /** Base vertical position in Three.js world units; positive is upward. */
  y: number;
  /** Local x/y/z area in which Drei distributes the sprite puffs. */
  bounds: [number, number, number];
  /** Overall puff-volume multiplier used by Drei. */
  volume: number;
  /** Minimum relative puff volume before the overall multiplier is applied. */
  smallestVolume: number;
  /** Base cloud tint. */
  color: string;
  /** Per-puff opacity before the screen-level reveal/exit opacity. */
  opacity: number;
  /** Speed of Drei's internal puff growth and rotation. */
  speed: number;
  /** Final x/y/z scale applied to the complete cloud group. */
  scale: [number, number, number];
  /** Maximum horizontal ambient-drift distance in world units. */
  driftX: number;
  /** Maximum vertical ambient-drift distance in world units. */
  driftY: number;
};

const PROFILE_CLOUDS: readonly ProfileCloudSpec[] = [
  {
    seed: 211,
    side: -1,
    phase: 0.18,
    segments: 18,
    xRatio: 0.50,
    y: 0,
    bounds: [1, 0.36, 0.66],
    volume: 0.6,
    smallestVolume: 0.2,
    color: "#f7fbff",
    opacity: 0.34,
    speed: 0.1,
    scale: [0.5, 0.5, 0.5],
    driftX: 0.1,
    driftY: 0.06,
  },
  {
    seed: 223,
    side: 1,
    phase: 0.64,
    segments: 16,
    xRatio: 0.5,
    y: -0.6,
    bounds: [1, 0.34, 0.62],
    volume: 0.4,
    smallestVolume: 0.19,
    color: "#f4faff",
    opacity: 0.34,
    speed: 0.15,
    scale: [0.5, 0.5, 0.5],
    driftX: 0.08,
    driftY: 0.05,
  },
];

// POST-WRITE MOTION — edit these values to tune the transition checkpoint.
const HELLO_SETTLE_MOTION = {
  hold: 0.1,
  autoScrollDuration: 1.6,
  startScale: 0.8,
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

function makeGlassMaterial(
  pathOffset: number,
  fragmentShader: string,
  side: THREE.Side,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uEnvironment: { value: null },
      uCloudTravel: { value: 0 },
      uPathOffset: { value: pathOffset },
      uFlatten: { value: 0 },
      uSweep: { value: -1 },
      uSweepStrength: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side,
  });
}

function setGlassMaterialEnvironment(
  material: THREE.ShaderMaterial,
  environment: THREE.CubeTexture | null,
) {
  material.uniforms.uEnvironment.value = environment;
  material.needsUpdate = true;
}

function setGlassMaterialFlatten(
  material: THREE.ShaderMaterial,
  flatten: number,
) {
  material.uniforms.uFlatten.value = flatten;
}

function updateGlassMaterialFrame(
  material: THREE.ShaderMaterial,
  elapsedTime: number,
  sweep: number,
  sweepStrength: number,
) {
  material.uniforms.uCloudTravel.value =
    (elapsedTime % HERO_CLOUD_FIELD.duration) / HERO_CLOUD_FIELD.duration;
  material.uniforms.uSweep.value = sweep;
  material.uniforms.uSweepStrength.value = sweepStrength;
}

type ThreeCloudBackdropProps = {
  reduceMotion: boolean;
  initialScrollProgress: number;
  scrollProgressRef: MutableRefObject<number>;
};

type HeroCloudPuffRuntime = {
  opacity: number;
};

function ThreeCloudBackdrop({
  reduceMotion,
  initialScrollProgress,
  scrollProgressRef,
}: ThreeCloudBackdropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudFieldRef = useRef<THREE.Group>(null);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudPuffsRef = useRef<
    Array<Array<HeroCloudPuffRuntime | undefined>>
  >([]);
  const cloudMaterialsRef = useRef<THREE.Material[]>([]);
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
      cloudMaterialsRef.current.forEach((material) => {
        material.transparent = true;
        material.alphaTest = HERO_CLOUD_FIELD.alphaTest;
        material.opacity = 1;
        material.needsUpdate = true;
      });
    }

    if (!reduceMotion) cloudStreamElapsedRef.current += delta;

    const cloudMotionElapsed = cloudStreamElapsedRef.current;
    const streamProgress =
      cloudMotionElapsed / HERO_CLOUD_FIELD.duration;

    if (groupRef.current) {
      groupRef.current.position.set(
        0,
        resolveCloudFieldOffset(progress),
        0,
      );
    }

    HERO_CLOUD_BANKS.forEach((cloud, index) => {
      const instance = cloudRefs.current[index];
      if (!instance) return;

      const phase = cloud.depthPhase * Math.PI * 2;
      const driftElapsed = cloudMotionElapsed * cloud.driftSpeed;
      const streamPhase = (streamProgress + cloud.depthPhase) % 1;
      const streamZ = THREE.MathUtils.lerp(
        HERO_CLOUD_FIELD.farZ,
        HERO_CLOUD_FIELD.nearZ,
        streamPhase,
      );
      const fadeInProgress = reduceMotion
        ? 1
        : smootherStep(
            THREE.MathUtils.clamp(
              streamPhase / HERO_CLOUD_FIELD.fadeInPortion,
              0,
              1,
            ),
          );

      cloudPuffsRef.current[index]?.forEach((puff) => {
        if (puff) puff.opacity = cloud.opacity * fadeInProgress;
      });

      instance.position.set(
        cloud.position[0] + Math.sin(driftElapsed + phase) * cloud.drift[0],
        cloud.position[1] +
          Math.cos(driftElapsed * 0.82 + phase) * cloud.drift[1],
        streamZ,
      );
    });
  });

  return (
    <>
      <ambientLight color="#ffffff" intensity={1.35} />
      <directionalLight
        color="#fff8ee"
        intensity={1.8}
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
          limit={HERO_CLOUD_FIELD.spriteLimit}
          frustumCulled={false}
          renderOrder={-2}
        >
          {HERO_CLOUD_BANKS.map((cloud, index) => (
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
              color={HERO_CLOUD_FIELD.color}
              opacity={cloud.opacity}
              distribute={(puff, puffIndex) => {
                const bankPuffs = (cloudPuffsRef.current[index] ??= []);
                bankPuffs[puffIndex] = puff;

                // Drei treats an undefined result as "keep the seeded layout".
                return undefined as never;
              }}
              fade={HERO_CLOUD_FIELD.nearFade}
              growth={HERO_CLOUD_FIELD.growth}
              speed={reduceMotion ? 0 : cloud.speed}
              position={[
                cloud.position[0],
                cloud.position[1],
                THREE.MathUtils.lerp(
                  HERO_CLOUD_FIELD.farZ,
                  HERO_CLOUD_FIELD.nearZ,
                  cloud.depthPhase,
                ),
              ]}
              scale={[
                cloud.scale[0] * HERO_CLOUD_FIELD.sizeScale,
                cloud.scale[1] * HERO_CLOUD_FIELD.sizeScale,
                cloud.scale[2] * HERO_CLOUD_FIELD.sizeScale,
              ]}
            />
          ))}
        </Clouds>
      </group>
    </>
  );
}

type ThreeProfileCloudsProps = ThreeCloudBackdropProps & {
  scrollStageRef: RefObject<HTMLElement | null>;
};

function ThreeProfileClouds({
  reduceMotion,
  initialScrollProgress,
  scrollProgressRef,
  scrollStageRef,
}: ThreeProfileCloudsProps) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const cloudFieldRef = useRef<THREE.Group>(null);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudMaterialsRef = useRef<THREE.Material[]>([]);

  useFrame((state) => {
    const progress = reduceMotion
      ? initialScrollProgress
      : scrollProgressRef.current;
    const revealProgress = THREE.MathUtils.clamp(
      (progress - PROFILE_CLOUD_REVEAL_START) /
        (PROFILE_CLOUD_REVEAL_END - PROFILE_CLOUD_REVEAL_START),
      0,
      1,
    );
    const stageBottom = scrollStageRef.current?.getBoundingClientRect().bottom;
    const stageExitProgress = stageBottom == null
      ? 0
      : THREE.MathUtils.clamp(
          (viewport.height - (stageBottom / state.size.height) * viewport.height) /
            viewport.height,
          0,
          1,
        );
    const exitFade =
      1 -
      smootherStep(
        THREE.MathUtils.clamp((stageExitProgress - 0.72) / 0.28, 0, 1),
      );
    const opacity = smootherStep(revealProgress) * exitFade;
    const stageTravelY = stageExitProgress * viewport.height;

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
      cloudMaterialsRef.current.forEach((material) => {
        material.transparent = true;
        material.alphaTest = PROFILE_CLOUD_ALPHA_TEST;
        material.needsUpdate = true;
      });
    }

    if (groupRef.current) groupRef.current.visible = opacity > 0.001;
    cloudMaterialsRef.current.forEach((material) => {
      material.opacity = opacity;
    });

    PROFILE_CLOUDS.forEach((cloud, index) => {
      const instance = cloudRefs.current[index];
      if (!instance) return;

      const phase = cloud.phase * Math.PI * 2;
      const elapsed = reduceMotion ? 0 : state.clock.elapsedTime;
      const baseX = viewport.width * cloud.xRatio * cloud.side;
      instance.position.set(
        baseX + Math.sin(elapsed * 0.085 + phase) * cloud.driftX,
        cloud.y +
          stageTravelY +
          Math.sin(elapsed * 0.11 + phase) * cloud.driftY,
        PROFILE_CLOUD_Z,
      );
    });
  });

  return (
    <group
      ref={groupRef}
      visible={initialScrollProgress >= PROFILE_CLOUD_REVEAL_START}
    >
      <Clouds
        ref={cloudFieldRef}
        texture="/textures/cloud.png"
        material={THREE.MeshLambertMaterial}
        limit={48}
        frustumCulled={false}
        renderOrder={-1}
      >
        {PROFILE_CLOUDS.map((cloud, index) => (
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
            opacity={cloud.opacity}
              fade={PROFILE_CLOUD_NEAR_FADE}
            speed={reduceMotion ? 0 : cloud.speed}
            position={[
              viewport.width * cloud.xRatio * cloud.side,
              cloud.y,
              PROFILE_CLOUD_Z,
            ]}
            scale={cloud.scale}
          />
        ))}
      </Clouds>
    </group>
  );
}

function ThreeEducationCloud({ reduceMotion }: { reduceMotion: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const cloudRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const sectionTopRef = useRef(0);
  const targetRef = useRef(new THREE.Vector3(0, 0, EDUCATION_CLOUD.z));

  useEffect(() => {
    const section = document.getElementById(EDUCATION_CLOUD.sectionId);
    if (!section) return;

    const measureSection = () => {
      sectionTopRef.current = section.getBoundingClientRect().top + window.scrollY;
      invalidate();
    };
    const handleReducedMotionScroll = () => invalidate();

    measureSection();
    window.addEventListener("resize", measureSection, { passive: true });
    if (reduceMotion) {
      window.addEventListener("scroll", handleReducedMotionScroll, {
        passive: true,
      });
    }
    void document.fonts.ready.then(measureSection);

    return () => {
      window.removeEventListener("resize", measureSection);
      window.removeEventListener("scroll", handleReducedMotionScroll);
    };
  }, [invalidate, reduceMotion]);

  useFrame((state) => {
    const cloud = cloudRef.current;
    const group = groupRef.current;
    if (!cloud || !group || sectionTopRef.current === 0) return;

    const isMobile = state.size.width <= 720;
    const centerYVh = isMobile
      ? EDUCATION_CLOUD.mobileCenterYVh
      : EDUCATION_CLOUD.centerYVh;
    const xRatio = isMobile
      ? EDUCATION_CLOUD.mobileXRatio
      : EDUCATION_CLOUD.xRatio;
    const centerYPx =
      sectionTopRef.current - window.scrollY + state.size.height * centerYVh;
    const currentViewport = state.viewport.getCurrentViewport(
      state.camera,
      targetRef.current,
    );
    const elapsed = reduceMotion ? 0 : state.clock.elapsedTime;
    const driftX =
      Math.sin(elapsed * EDUCATION_CLOUD.driftSpeed) *
      EDUCATION_CLOUD.driftX;

    cloud.position.set(
      currentViewport.width * xRatio + driftX,
      (0.5 - centerYPx / state.size.height) * currentViewport.height,
      EDUCATION_CLOUD.z,
    );
    cloud.updateMatrixWorld(true);
    group.visible =
      centerYPx > -state.size.height * 0.35 &&
      centerYPx < state.size.height * 1.35;
  }, -2);

  return (
    <group ref={groupRef} visible={false}>
      <Clouds
        texture="/textures/cloud.png"
        material={THREE.MeshLambertMaterial}
        limit={EDUCATION_CLOUD.segments}
        frustumCulled={false}
        renderOrder={-1}
      >
        <Cloud
          ref={cloudRef}
          seed={EDUCATION_CLOUD.seed}
          segments={EDUCATION_CLOUD.segments}
          bounds={EDUCATION_CLOUD.bounds}
          volume={EDUCATION_CLOUD.volume}
          smallestVolume={EDUCATION_CLOUD.smallestVolume}
          growth={EDUCATION_CLOUD.growth}
          speed={reduceMotion ? 0 : EDUCATION_CLOUD.speed}
          color={EDUCATION_CLOUD.color}
          opacity={EDUCATION_CLOUD.opacity}
          fade={EDUCATION_CLOUD.fade}
          scale={EDUCATION_CLOUD.scale}
        />
      </Clouds>
    </group>
  );
}

type GlassStrokeProps = {
  reduceMotion: boolean;
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
  const { camera, invalidate, size, viewport } = useThree();

  const curves = useMemo(
    () => ({
      stem: makeHelloCurve(
        HELLO_STEM_START,
        HELLO_STEM_SEGMENTS,
        STEM_CURVE_SAMPLES,
        0,
        HELLO_DEPTH_SCALE,
      ),
      word: makeHelloCurve(
        HELLO_WORD_START,
        HELLO_WORD_SEGMENTS,
        WORD_CURVE_SAMPLES,
        HELLO_STEM_SEGMENTS.length,
        HELLO_DEPTH_SCALE,
      ),
      flatStem: makeHelloCurve(
        HELLO_STEM_START,
        HELLO_STEM_SEGMENTS,
        STEM_CURVE_SAMPLES,
        0,
        0,
      ),
      flatWord: makeHelloCurve(
        HELLO_WORD_START,
        HELLO_WORD_SEGMENTS,
        WORD_CURVE_SAMPLES,
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
  const startXRef = useRef(0);
  const updateStartX = useCallback(() => {
    const responsiveScale = Math.min(1.05, viewport.width / 9.05);
    const startScale = responsiveScale * HELLO_SETTLE_MOTION.startScale;
    const startRotation = HELLO_SETTLE_MOTION.startRotation;
    const rotation = new THREE.Euler(...startRotation);
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    const scale = new THREE.Vector3(startScale, startScale, startScale);
    const translation = new THREE.Vector3();
    const transform = new THREE.Matrix4();
    const projectedVertex = new THREE.Vector3();
    const positions = [
      geometries.stem.geometry.getAttribute("position"),
      geometries.word.geometry.getAttribute("position"),
    ] as THREE.BufferAttribute[];

    if (
      camera instanceof THREE.PerspectiveCamera ||
      camera instanceof THREE.OrthographicCamera
    ) {
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld(true);

    const projectedCenterAtX = (worldX: number) => {
      translation.set(worldX, HELLO_SETTLE_MOTION.startY, 0);
      transform.compose(translation, quaternion, scale);
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;

      positions.forEach((position) => {
        for (let index = 0; index < position.count; index += 1) {
          projectedVertex
            .fromBufferAttribute(position, index)
            .applyMatrix4(transform)
            .project(camera);
          minX = Math.min(minX, projectedVertex.x);
          maxX = Math.max(maxX, projectedVertex.x);
        }
      });

      return (minX + maxX) / 2;
    };

    startXRef.current = resolveProjectedHorizontalCenterOffset(
      projectedCenterAtX,
    );
  }, [camera, geometries, viewport.width]);
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
    updateStartX();
    updateHeaderTransform();
    invalidate();
  }, [invalidate, updateHeaderTransform, updateStartX]);
  const materials = useMemo(
    () => ({
      backWall: makeGlassMaterial(
        0,
        GLASS_BACK_WALL_FRAGMENT_SHADER,
        THREE.BackSide,
      ),
      outerWall: makeGlassMaterial(
        0,
        GLASS_FRAGMENT_SHADER,
        THREE.FrontSide,
      ),
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
    Object.values(materials).forEach((material) => {
      setGlassMaterialFlatten(material, geometryTransition.flatten);
    });
    applyHeaderHandoff(transition.handoff);
  }, [applyHeaderHandoff, initialScrollProgress, materials]);
  const groupedBackWallMaterial = useMemo(
    () => [materials.backWall, materials.backWall],
    [materials.backWall],
  );
  const groupedOuterWallMaterial = useMemo(
    () => [materials.outerWall, materials.outerWall],
    [materials.outerWall],
  );

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      setGlassMaterialEnvironment(material, environment);
    });
    invalidate();
  }, [environment, invalidate, materials]);

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
      updateGlassMaterialFrame(
        material,
        reduceMotion ? 0 : state.clock.elapsedTime,
        sweep,
        sweepStrength,
      );
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
    Object.values(materials).forEach((material) => {
      setGlassMaterialFlatten(material, geometryTransition.flatten);
    });

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
        startXRef.current,
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
          startXRef.current,
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
        material={groupedBackWallMaterial}
        renderOrder={1}
      />
      <mesh
        geometry={geometries.word.geometry}
        material={groupedBackWallMaterial}
        renderOrder={1}
      />
      <mesh
        geometry={geometries.stem.geometry}
        material={groupedOuterWallMaterial}
        renderOrder={2}
      />
      <mesh
        geometry={geometries.word.geometry}
        material={groupedOuterWallMaterial}
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
  const [revealState, setRevealState] = useState<ProfileRevealState>(() => ({
    visible: reduceMotion,
    hasEntered: reduceMotion,
  }));
  const revealStateRef = useRef(revealState);

  const commitRevealState = useCallback((next: ProfileRevealState) => {
    const current = revealStateRef.current;
    if (
      current.visible === next.visible &&
      current.hasEntered === next.hasEntered
    ) {
      return;
    }

    revealStateRef.current = next;
    setRevealState(next);
  }, []);

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
      const nextRevealState = reduceMotion
        ? { visible: true, hasEntered: true }
        : resolveProfileRevealState(
            scrollProgress,
            revealStateRef.current,
          );

      commitRevealState(nextRevealState);
      applyTravel(scrollProgress);
    },
    [applyTravel, commitRevealState, reduceMotion],
  );

  useLayoutEffect(() => {
    applyProgress(initialScrollProgress);
  }, [applyProgress, initialScrollProgress]);

  useEffect(() => {
    if (reduceMotion) return;

    return subscribeScrollProgress(applyProgress);
  }, [applyProgress, reduceMotion, subscribeScrollProgress]);

  return (
    <section
      className={styles.profileLayer}
      aria-labelledby="homepage-about-title"
    >
      <div className={styles.profileContent}>
        <h2 id="homepage-about-title" className={styles.srOnly}>
          About aqhours
        </h2>
        <div
          ref={motionRef}
          className={styles.profileMotion}
          data-visible={revealState.visible ? "true" : "false"}
          aria-hidden={!revealState.visible}
          inert={!revealState.visible}
        >
          <p className={styles.profileStatement}>
            <span className={styles.profileLead}>I am</span>{" "}
            <span className={styles.profileName}>
              <span className={styles.profileHandwritten}>aqhours</span>.
            </span>
          </p>
          <p className={styles.profileDescription}>
            A passionate Software Designer and CSer
          </p>
          <div className={styles.profileLocation}>
            <span className={styles.profileLocationLead}>Living in</span>
            <span className={styles.profileLocationPlace}>Honggutan, Nanchang</span>
          </div>
          <div className={styles.locationCardTravel}>
            {revealState.hasEntered && (
              <LocationCard visible={revealState.visible} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomepageHero() {
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
          data-umami-event="navigation-click"
          data-umami-event-destination="home"
          aria-label="aqhours，意为 eternal hours，返回首页"
        >
          <span className={styles.headerWordmark}>aqhours</span>
          <span className={styles.headerIdentityDivider} aria-hidden="true" />
          <span className={styles.headerMeaning}>eternal hours</span>
        </a>

        <nav className={styles.headerNav} aria-label="主要导航">
          <span className={styles.headerNavGroup}>
            <a
              className={styles.headerLink}
              href="/blog"
              data-umami-event="navigation-click"
              data-umami-event-destination="blog"
            >
              Blog
            </a>
            <a
              className={styles.headerLink}
              href="/studio"
              data-umami-event="navigation-click"
              data-umami-event-destination="studio"
            >
              Studio
            </a>
            <a
              className={styles.headerLink}
              href="/photos"
              data-umami-event="navigation-click"
              data-umami-event-destination="photos"
            >
              Photos
            </a>
          </span>
          <span className={styles.headerNavGroup}>
            <a
              className={styles.headerLink}
              href="https://github.com/aqhours"
              data-umami-event="navigation-click"
              data-umami-event-destination="github"
            >
              GitHub
            </a>
            <a
              className={styles.headerLink}
              href="mailto:aqhours@gmail.com"
              data-umami-event="navigation-click"
              data-umami-event-destination="email"
            >
              Email
            </a>
          </span>
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
            dpr={[1, 1.25]}
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
              <ThreeProfileClouds
                reduceMotion={reduceMotion}
                initialScrollProgress={scrollSession.startProgress}
                scrollProgressRef={scrollProgressRef}
                scrollStageRef={scrollStageRef}
              />
              <ThreeEducationCloud reduceMotion={reduceMotion} />
            </Suspense>
            <GlassStroke
              reduceMotion={reduceMotion}
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
        className={styles.heroScrollStage}
        style={{ minHeight: scrollStageHeight }}
        data-scroll-session={scrollSession.ready ? "ready" : "pending"}
        data-scroll-start={scrollSession.startProgress.toFixed(3)}
        data-auto-settle={scrollSession.allowAutoSettle ? "true" : "false"}
      >
        <h1 className={styles.srOnly}>aqhours</h1>

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
