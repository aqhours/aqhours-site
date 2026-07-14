"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./GlassStrokePrototype.module.css";

// PROTOTYPE 03 — one connected Aqhours word study. No clouds or scene modes yet.
const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform samplerCube uEnvironment;
  uniform float uTime;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uEdgeTint;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

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

    vec3 skyTint = mix(uSkyBottom, uSkyTop, normal.y * 0.5 + 0.5);
    vec3 glassColor = mix(skyTint, dispersedReflection, 0.7);
    glassColor = mix(glassColor, innerLayer, 0.28 + innerBand * 0.16);
    glassColor += uEdgeTint * fresnel * (0.55 + innerBand * 0.35);
    glassColor = mix(glassColor, vec3(1.0), highlight * 0.46);
    glassColor = mix(glassColor, uSkyBottom * 0.72, shadowBand * 0.14);
    glassColor = mix(vec3(0.82, 0.94, 1.0), glassColor, 0.94);

    float alpha = 0.045 + fresnel * 0.46 + highlight * 0.12 + innerBand * 0.035;
    alpha = clamp(alpha, 0.045, 0.64);

    gl_FragColor = vec4(glassColor, alpha);
  }
`;

type SkeletonPoint = readonly [number, number];
type SkeletonSegment = readonly [SkeletonPoint, SkeletonPoint, SkeletonPoint];

const AQHOURS_START: SkeletonPoint = [78, 560];
const AQHOURS_SEGMENTS: SkeletonSegment[] = [
  [[138, 370], [208, 118], [300, 78]],
  [[360, 50], [414, 410], [456, 560]],
  [[444, 480], [380, 332], [270, 320]],
  [[350, 318], [445, 334], [520, 326]],
  [[532, 230], [600, 180], [676, 215]],
  [[760, 255], [760, 400], [700, 460]],
  [[640, 515], [535, 485], [525, 395]],
  [[515, 300], [600, 240], [675, 275]],
  [[735, 305], [730, 390], [700, 450]],
  [[675, 520], [675, 600], [730, 625]],
  [[780, 645], [805, 520], [830, 400]],
  [[850, 300], [862, 165], [900, 118]],
  [[938, 82], [920, 370], [920, 455]],
  [[935, 360], [980, 285], [1040, 300]],
  [[1100, 315], [1090, 440], [1100, 455]],
  [[1120, 330], [1190, 265], [1260, 300]],
  [[1330, 335], [1330, 450], [1260, 485]],
  [[1190, 520], [1120, 450], [1140, 370]],
  [[1160, 300], [1260, 295], [1290, 360]],
  [[1305, 410], [1310, 470], [1345, 480]],
  [[1370, 485], [1375, 350], [1385, 310]],
  [[1370, 410], [1390, 500], [1450, 490]],
  [[1510, 480], [1510, 350], [1520, 310]],
  [[1515, 400], [1515, 480], [1560, 480]],
  [[1590, 480], [1590, 340], [1600, 310]],
  [[1605, 370], [1610, 310], [1660, 315]],
  [[1690, 320], [1700, 350], [1700, 380]],
  [[1705, 300], [1780, 275], [1820, 315]],
  [[1855, 350], [1810, 390], [1755, 408]],
  [[1705, 428], [1725, 495], [1790, 510]],
  [[1855, 525], [1900, 480], [1915, 430]],
];

function makeAqhoursCurve() {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const scale = 0.00515;
  const italicLean = 0.27;
  const originX = 996;
  const baselineY = 455;
  const depthAt = (index: number) =>
    Math.sin(index * 0.82) * 0.045 + Math.sin(index * 0.23) * 0.025;
  const toWorld = ([x, y]: SkeletonPoint, depth: number) => {
    const worldY = (baselineY - y) * scale;
    return new THREE.Vector3(
      (x - originX) * scale + worldY * italicLean,
      worldY,
      depth,
    );
  };

  let start = toWorld(AQHOURS_START, depthAt(0));

  AQHOURS_SEGMENTS.forEach(([controlA, controlB, endpoint], index) => {
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

  return new THREE.CatmullRomCurve3(path.getSpacedPoints(520), false, "centripetal");
}

function makeVariableTubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  baseRadius: number,
) {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
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

function GlassStroke() {
  const environment = useStudioEnvironment();
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const curve = useMemo(() => makeAqhoursCurve(), []);
  const geometry = useMemo(() => makeVariableTubeGeometry(curve, 880, 36, 0.145), [curve]);
  const capGeometry = useMemo(
    () => new THREE.SphereGeometry(0.138, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  );
  const start = useMemo(() => curve.getPointAt(0), [curve]);
  const end = useMemo(() => curve.getPointAt(1), [curve]);
  const startCapRotation = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        curve.getTangentAt(0).multiplyScalar(-1),
      ),
    [curve],
  );
  const endCapRotation = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        curve.getTangentAt(1),
      ),
    [curve],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uEnvironment: { value: null },
          uTime: { value: 0 },
          uSkyTop: { value: new THREE.Color("#d9f5ff") },
          uSkyBottom: { value: new THREE.Color("#2196ed") },
          uEdgeTint: { value: new THREE.Color("#d6f7ff") },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uEnvironment.value = environment;
    material.needsUpdate = true;
  }, [environment, material]);

  useEffect(
    () => () => {
      geometry.dispose();
      capGeometry.dispose();
      material.dispose();
    },
    [geometry, capGeometry, material],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (!environment) return null;

  const scale = Math.min(1, viewport.width / 10.35);

  return (
    <group ref={groupRef} rotation={[-0.025, -0.045, -0.015]} scale={scale}>
      <mesh geometry={geometry} material={material} />
      <mesh
        position={start}
        quaternion={startCapRotation}
        geometry={capGeometry}
        material={material}
      />
      <mesh
        position={end}
        quaternion={endCapRotation}
        geometry={capGeometry}
        material={material}
      />
    </group>
  );
}

export function GlassStrokePrototype() {
  return (
    <main className={styles.prototype}>
      <h1 className={styles.srOnly}>Aqhours 连写玻璃字形实验</h1>

      <div className={styles.stage} aria-hidden="true">
        <Canvas
          camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 8.6] }}
          dpr={[1, 1.75]}
          frameloop="demand"
          gl={{ alpha: true, antialias: true, stencil: false }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <GlassStroke />
        </Canvas>
      </div>

      <aside className={styles.prototypeNote} aria-label="原型状态">
        <span>PROTOTYPE 03 · CONNECTED WORD</span>
        <strong>完整斜体连写 Aqhours</strong>
        <small>当前只确认透明度、字形连接与整体斜度</small>
      </aside>
    </main>
  );
}
