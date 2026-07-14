"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./GlassStrokePrototype.module.css";

// PROTOTYPE 02 — one material study only. No Aqhours lettering, clouds, or scene modes yet.
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
    glassColor = mix(glassColor, vec3(1.0), highlight * 0.62);
    glassColor = mix(glassColor, uSkyBottom * 0.72, shadowBand * 0.14);
    glassColor = mix(vec3(0.78, 0.91, 1.0), glassColor, 0.82);

    float alpha = 0.28 + fresnel * 0.62 + highlight * 0.3 + innerBand * 0.1;
    alpha = clamp(alpha, 0.28, 0.96);

    gl_FragColor = vec4(glassColor, alpha);
  }
`;

function makeMaterialStudyCurve() {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const start = new THREE.Vector3(-3.65, -0.42, 0.02);

  path.add(
    new THREE.CubicBezierCurve3(
      start,
      new THREE.Vector3(-3.05, -1.28, 0.12),
      new THREE.Vector3(-1.75, -1.18, 0.28),
      new THREE.Vector3(-1.02, -0.4, 0.14),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1.02, -0.4, 0.14),
      new THREE.Vector3(-0.28, 0.42, -0.1),
      new THREE.Vector3(0.04, 1.45, -0.3),
      new THREE.Vector3(0.55, 1.02, -0.24),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.55, 1.02, -0.24),
      new THREE.Vector3(1.08, 0.5, -0.18),
      new THREE.Vector3(0.92, -0.58, 0.16),
      new THREE.Vector3(0.22, -0.72, 0.34),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.22, -0.72, 0.34),
      new THREE.Vector3(-0.48, -0.86, 0.4),
      new THREE.Vector3(-0.54, 0.18, 0.12),
      new THREE.Vector3(0.16, 0.3, -0.06),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.16, 0.3, -0.06),
      new THREE.Vector3(0.84, 0.4, -0.18),
      new THREE.Vector3(1.1, -0.76, 0.26),
      new THREE.Vector3(1.74, -0.7, 0.2),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(1.74, -0.7, 0.2),
      new THREE.Vector3(2.38, -0.64, 0.08),
      new THREE.Vector3(2.32, 0.34, -0.14),
      new THREE.Vector3(3.12, 0.45, -0.04),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(3.12, 0.45, -0.04),
      new THREE.Vector3(3.52, 0.5, 0.03),
      new THREE.Vector3(3.67, 0.18, 0.1),
      new THREE.Vector3(3.82, 0.04, 0.14),
    ),
  );

  return path;
}

function makeVariableTubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
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
      0.205 *
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

  const curve = useMemo(() => makeMaterialStudyCurve(), []);
  const geometry = useMemo(() => makeVariableTubeGeometry(curve, 420, 48), [curve]);
  const capGeometry = useMemo(
    () => new THREE.SphereGeometry(0.195, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2),
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

  const scale = Math.min(1, viewport.width / 8.15);

  return (
    <group ref={groupRef} rotation={[-0.04, -0.08, -0.025]} scale={scale}>
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
      <h1 className={styles.srOnly}>Aqhours 玻璃材质实验</h1>

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
        <span>PROTOTYPE 02 · MATERIAL STUDY</span>
        <strong>原创环境反射玻璃笔画</strong>
        <small>当前只确认通透度、边缘色散与多层高光</small>
      </aside>
    </main>
  );
}
