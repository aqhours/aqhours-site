"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./GlassStrokePrototype.module.css";

// PROTOTYPE 04 — one-stroke write-on and traveling reflection study.
const VERTEX_SHADER = /* glsl */ `
  attribute float aPathProgress;
  uniform float uPathOffset;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vPathProgress = clamp(aPathProgress + uPathOffset, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform samplerCube uEnvironment;
  uniform float uTime;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uEdgeTint;
  uniform float uSweep;
  uniform float uSweepStrength;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vPathProgress;

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
    float fresnel = pow(1.0 - facing, 2.65);

    vec3 reflection = reflect(-viewDirection, normal);
    reflection.xz = rotate2d(uTime * 0.035) * reflection.xz;

    float aberration = 0.012 + fresnel * 0.038;
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
    innerReflection.xy = rotate2d(-uTime * 0.022 + 0.4) * innerReflection.xy;
    vec3 innerLayer = textureCube(uEnvironment, innerReflection).rgb;

    float reflectedLight = glassLuma(dispersedReflection);
    float innerLight = glassLuma(innerLayer);
    float highlight = smoothstep(0.68, 0.98, reflectedLight);
    float innerBand = smoothstep(0.58, 0.92, innerLight);
    float shadowBand = 1.0 - smoothstep(0.06, 0.32, innerLight);
    float sweepDistance = abs(vPathProgress - uSweep);
    float travelingHighlight = exp(-pow(sweepDistance / 0.036, 2.0)) * uSweepStrength;
    float travelingCore = exp(-pow(sweepDistance / 0.011, 2.0)) * uSweepStrength;

    vec3 skyTint = mix(uSkyBottom, uSkyTop, normal.y * 0.5 + 0.5);
    vec3 glassColor = mix(skyTint, dispersedReflection, 0.7);
    glassColor = mix(glassColor, innerLayer, 0.28 + innerBand * 0.16);
    glassColor += uEdgeTint * fresnel * (0.55 + innerBand * 0.35);
    glassColor = mix(glassColor, vec3(1.0), highlight * 0.46);
    glassColor = mix(glassColor, uSkyBottom * 0.72, shadowBand * 0.14);
    glassColor = mix(
      glassColor,
      vec3(0.9, 0.985, 1.0),
      travelingHighlight * (0.16 + facing * 0.22)
    );
    glassColor += vec3(0.16, 0.34, 0.42) * travelingCore * fresnel;
    glassColor = mix(vec3(0.82, 0.94, 1.0), glassColor, 0.94);

    float alpha =
      0.045 + fresnel * 0.46 + highlight * 0.12 + innerBand * 0.035 +
      travelingHighlight * 0.075;
    alpha = clamp(alpha, 0.045, 0.64);

    gl_FragColor = vec4(glassColor, alpha);
  }
`;

type SkeletonPoint = readonly [number, number];
type SkeletonSegment = readonly [SkeletonPoint, SkeletonPoint, SkeletonPoint];

const STEM_TUBULAR_SEGMENTS = 260;
const WORD_TUBULAR_SEGMENTS = 820;
const RADIAL_SEGMENTS = 36;
const WRITE_DELAY = 0.24;
const WRITE_DURATION = 3.35;
const FLOW_PAUSE = 0.55;
const FLOW_DURATION = 5.4;

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
) {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const pathProgresses: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const offset = new THREE.Vector3();

  for (let segment = 0; segment <= tubularSegments; segment += 1) {
    const progress = segment / tubularSegments;
    curve.getPointAt(progress, point);

    const radius =
      baseRadius *
      (0.95 + Math.sin(progress * Math.PI) * 0.08 + Math.sin(progress * Math.PI * 5) * 0.025);
    const normal = frames.normals[segment];
    const binormal = frames.binormals[segment];

    for (let side = 0; side < radialSegments; side += 1) {
      const angle = (side / radialSegments) * Math.PI * 2;
      offset
        .copy(normal)
        .multiplyScalar(Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius * 0.84);

      positions.push(point.x + offset.x, point.y + offset.y, point.z + offset.z);
      offset.normalize();
      normals.push(offset.x, offset.y, offset.z);
      pathProgresses.push(THREE.MathUtils.lerp(progressStart, progressEnd, progress));
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
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("aPathProgress", new THREE.Float32BufferAttribute(pathProgresses, 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  return geometry;
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

function makeGlassMaterial(pathOffset: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uEnvironment: { value: null },
      uTime: { value: 0 },
      uSkyTop: { value: new THREE.Color("#d9f5ff") },
      uSkyBottom: { value: new THREE.Color("#2196ed") },
      uEdgeTint: { value: new THREE.Color("#d6f7ff") },
      uPathOffset: { value: pathOffset },
      uSweep: { value: -1 },
      uSweepStrength: { value: 0 },
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
};

function GlassStroke({ reduceMotion, runId }: GlassStrokeProps) {
  const environment = useStudioEnvironment();
  const startCapRef = useRef<THREE.Mesh>(null);
  const stemEndCapRef = useRef<THREE.Mesh>(null);
  const wordStartCapRef = useRef<THREE.Mesh>(null);
  const leadCapRef = useRef<THREE.Mesh>(null);
  const animationStartRef = useRef<number | null>(null);
  const { viewport } = useThree();

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
        0.145,
        0,
        stemShare,
      ),
      word: makeVariableTubeGeometry(
        curves.word,
        WORD_TUBULAR_SEGMENTS,
        RADIAL_SEGMENTS,
        0.145,
        stemShare,
        1,
      ),
    }),
    [curves, stemShare],
  );
  const capGeometry = useMemo(() => {
    const cap = new THREE.SphereGeometry(0.139, RADIAL_SEGMENTS, 24);
    const vertexCount = cap.getAttribute("position").count;
    cap.setAttribute(
      "aPathProgress",
      new THREE.Float32BufferAttribute(new Float32Array(vertexCount), 1),
    );
    return cap;
  }, []);
  const capTransforms = useMemo(
    () => {
      const up = new THREE.Vector3(0, 1, 0);
      const makeRotation = (
        curve: THREE.Curve<THREE.Vector3>,
        progress: number,
        direction: number,
      ) =>
        new THREE.Quaternion().setFromUnitVectors(
          up,
          curve.getTangentAt(progress).multiplyScalar(direction).normalize(),
        );

      return {
        startPosition: curves.stem.getPointAt(0),
        startRotation: makeRotation(curves.stem, 0, -1),
        stemEndPosition: curves.stem.getPointAt(1),
        stemEndRotation: makeRotation(curves.stem, 1, 1),
        wordStartPosition: curves.word.getPointAt(0),
        wordStartRotation: makeRotation(curves.word, 0, -1),
      };
    },
    [curves],
  );
  const materials = useMemo(
    () => ({
      tube: makeGlassMaterial(0),
      startCap: makeGlassMaterial(0),
      seamCaps: makeGlassMaterial(stemShare),
      leadCap: makeGlassMaterial(0),
    }),
    [stemShare],
  );
  const animationVectors = useMemo(
    () => ({
      point: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      material.uniforms.uEnvironment.value = environment;
      material.needsUpdate = true;
    });
  }, [environment, materials]);

  useEffect(() => {
    animationStartRef.current = null;
    geometries.stem.setDrawRange(
      0,
      reduceMotion ? geometries.stem.index?.count ?? 0 : 0,
    );
    geometries.word.setDrawRange(
      0,
      reduceMotion ? geometries.word.index?.count ?? 0 : 0,
    );

    if (startCapRef.current) startCapRef.current.visible = reduceMotion;
    if (stemEndCapRef.current) stemEndCapRef.current.visible = reduceMotion;
    if (wordStartCapRef.current) wordStartCapRef.current.visible = reduceMotion;
    if (leadCapRef.current) leadCapRef.current.visible = reduceMotion;
  }, [geometries, reduceMotion, runId]);

  useEffect(
    () => () => {
      geometries.stem.dispose();
      geometries.word.dispose();
      capGeometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
    [geometries, capGeometry, materials],
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
    geometries.stem.setDrawRange(
      0,
      Math.ceil(stemProgress * STEM_TUBULAR_SEGMENTS) * RADIAL_SEGMENTS * 6,
    );
    geometries.word.setDrawRange(
      0,
      Math.ceil(wordProgress * WORD_TUBULAR_SEGMENTS) * RADIAL_SEGMENTS * 6,
    );

    const capVisible = progress > 0.001;
    if (startCapRef.current) startCapRef.current.visible = capVisible;
    if (stemEndCapRef.current) stemEndCapRef.current.visible = stemProgress >= 0.999;
    if (wordStartCapRef.current) wordStartCapRef.current.visible = wordProgress > 0.001;

    if (leadCapRef.current) {
      leadCapRef.current.visible = capVisible;
      const activeCurve = progress <= stemShare ? curves.stem : curves.word;
      const activeProgress = progress <= stemShare ? stemProgress : wordProgress;
      activeCurve.getPointAt(activeProgress, animationVectors.point);
      activeCurve.getTangentAt(activeProgress, animationVectors.tangent).normalize();
      leadCapRef.current.position.copy(animationVectors.point);
      leadCapRef.current.quaternion.setFromUnitVectors(
        animationVectors.up,
        animationVectors.tangent,
      );
    }

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

    materials.leadCap.uniforms.uPathOffset.value = progress;

    Object.values(materials).forEach((material) => {
      material.uniforms.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
      material.uniforms.uSweep.value = sweep;
      material.uniforms.uSweepStrength.value = sweepStrength;
    });
  });

  if (!environment) return null;

  const scale = Math.min(1.05, viewport.width / 9.05);

  return (
    <group rotation={[-0.025, -0.045, 0]} scale={scale}>
      <mesh geometry={geometries.stem} material={materials.tube} />
      <mesh geometry={geometries.word} material={materials.tube} />
      <mesh
        ref={startCapRef}
        position={capTransforms.startPosition}
        quaternion={capTransforms.startRotation}
        geometry={capGeometry}
        material={materials.startCap}
      />
      <mesh
        ref={stemEndCapRef}
        position={capTransforms.stemEndPosition}
        quaternion={capTransforms.stemEndRotation}
        geometry={capGeometry}
        material={materials.seamCaps}
      />
      <mesh
        ref={wordStartCapRef}
        position={capTransforms.wordStartPosition}
        quaternion={capTransforms.wordStartRotation}
        geometry={capGeometry}
        material={materials.seamCaps}
      />
      <mesh
        ref={leadCapRef}
        geometry={capGeometry}
        material={materials.leadCap}
      />
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
          <GlassStroke reduceMotion={reduceMotion} runId={runId} />
        </Canvas>
      </div>

      <aside className={styles.prototypeNote} aria-label="原型状态">
        <span>PROTOTYPE 04 · WRITE ON</span>
        <strong>一笔写出透明冰蓝 hello</strong>
        <small>当前只确认书写节奏、圆头笔尖与管内流光</small>
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
