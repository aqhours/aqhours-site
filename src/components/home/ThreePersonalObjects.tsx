"use client";

import {
  Center,
  Clone,
  Resize,
  useGLTF,
} from "@react-three/drei";
import {
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type ThreePersonalObjectsProps = {
  reduceMotion: boolean;
  initialScrollProgress: number;
  scrollProgressRef: MutableRefObject<number>;
  scrollStageRef: RefObject<HTMLElement | null>;
};

type ObjectSpec = {
  x: number;
  mobileX: number;
  y: number;
  mobileY: number;
  z: number;
  scale: number;
  mobileScale: number;
  rotation: [number, number, number];
  phase: number;
  speed: number;
  drift: number;
  hitbox: [number, number, number];
};

const OBJECTS: readonly ObjectSpec[] = [
  {
    x: -0.235,
    mobileX: -0.235,
    y: 0.17,
    mobileY: 0.215,
    z: 0.42,
    scale: 0.83,
    mobileScale: 0.54,
    rotation: [-0.12, 0.46, -0.18],
    phase: 0.4,
    speed: 0.34,
    drift: 0.1,
    hitbox: [1.02, 1.06, 0.58],
  },
  {
    x: 0.185,
    mobileX: 0.225,
    y: 0.205,
    mobileY: 0.195,
    z: 0.68,
    scale: 0.79,
    mobileScale: 0.52,
    rotation: [0.16, -0.56, 0.14],
    phase: 1.8,
    speed: 0.28,
    drift: 0.12,
    hitbox: [0.58, 1.12, 0.34],
  },
  {
    x: 0.035,
    mobileX: 0.015,
    y: -0.225,
    mobileY: -0.225,
    z: -0.62,
    scale: 1.42,
    mobileScale: 0.88,
    rotation: [-0.02, -0.2, 0.018],
    phase: 2.7,
    speed: 0.22,
    drift: 0.08,
    hitbox: [1.12, 0.72, 0.72],
  },
  {
    x: -0.205,
    mobileX: -0.34,
    y: -0.18,
    mobileY: -0.29,
    z: -0.38,
    scale: 1.08,
    mobileScale: 0.28,
    rotation: [-0.14, 0.54, -0.2],
    phase: 3.5,
    speed: 0.3,
    drift: 0.09,
    hitbox: [0.72, 1.12, 0.3],
  },
  {
    x: 0.21,
    mobileX: 0.34,
    y: -0.17,
    mobileY: -0.28,
    z: 0.2,
    scale: 0.52,
    mobileScale: 0.27,
    rotation: [0.2, -0.44, -0.13],
    phase: 4.3,
    speed: 0.36,
    drift: 0.08,
    hitbox: [0.82, 1.08, 0.54],
  },
  {
    x: 0.265,
    mobileX: 0.4,
    y: 0.01,
    mobileY: 0.01,
    z: -0.82,
    scale: 0.5,
    mobileScale: 0.24,
    rotation: [-0.12, -0.3, 0.22],
    phase: 5.1,
    speed: 0.27,
    drift: 0.07,
    hitbox: [1.08, 0.88, 0.7],
  },
] as const;

type DragInteraction = {
  pointerId: number | null;
  captureController: PointerCaptureController | null;
  rotationX: number;
  rotationY: number;
  velocityX: number;
  velocityY: number;
  lastClientX: number;
  lastClientY: number;
  lastTime: number;
};

type PointerCaptureController = {
  hasPointerCapture: (pointerId: number) => boolean;
  releasePointerCapture: (pointerId: number) => void;
  setPointerCapture: (pointerId: number) => void;
};

const DRAG_RADIANS_PER_PIXEL = 0.008;
const MAX_RELEASE_VELOCITY = 7.5;
const INERTIA_DAMPING = 6.25;

function createDragInteraction(): DragInteraction {
  return {
    pointerId: null,
    captureController: null,
    rotationX: 0,
    rotationY: 0,
    velocityX: 0,
    velocityY: 0,
    lastClientX: 0,
    lastClientY: 0,
    lastTime: 0,
  };
}

function wrapRotation(value: number) {
  return THREE.MathUtils.euclideanModulo(value + Math.PI, Math.PI * 2) - Math.PI;
}

function getPointerCaptureController(event: ThreeEvent<PointerEvent>) {
  return event.target as EventTarget & PointerCaptureController;
}

type DetailedModelProps = {
  path: string;
  rotation?: [number, number, number];
};

function DetailedModel({ path, rotation = [0, 0, 0] }: DetailedModelProps) {
  const { scene } = useGLTF(path, false, true);

  return (
    <Resize>
      <Center>
        <group rotation={rotation}>
          <Clone object={scene} deep="materialsOnly" />
        </group>
      </Center>
    </Resize>
  );
}

function DetailedHeadphonesModel() {
  return <DetailedModel path="/models/personal/airpods-max.glb" />;
}

function DetailedPhoneModel() {
  return (
    <DetailedModel
      path="/models/personal/iphone-17-pro-max.glb"
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}

function DetailedLaptopModel() {
  return <DetailedModel path="/models/personal/macbook-air-m3.glb" />;
}

function DetailedTabletModel() {
  return (
    <DetailedModel
      path="/models/personal/ipad-pro-m5.glb"
      rotation={[-Math.PI / 2, 0, Math.PI / 3]}
    />
  );
}

function DetailedWatchModel() {
  return <DetailedModel path="/models/personal/apple-watch.glb" />;
}

function DetailedEarbudsModel() {
  return (
    <DetailedModel
      path="/models/personal/airpods-pro-2.glb"
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

function smoothstep(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function useLocalStudioEnvironment(rootRef: RefObject<THREE.Group | null>) {
  const { gl } = useThree();

  useLayoutEffect(() => {
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0.04);
    const envMap = target.texture;
    const previous = new Map<
      THREE.MeshStandardMaterial,
      { envMap: THREE.Texture | null; intensity: number }
    >();

    room.dispose();
    pmrem.dispose();

    rootRef.current?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        if (previous.has(material)) return;

        previous.set(material, {
          envMap: material.envMap,
          intensity: material.envMapIntensity,
        });
        material.envMap = envMap;
        material.envMapIntensity = 0.82;
        material.needsUpdate = true;
      });
    });

    return () => {
      previous.forEach((value, material) => {
        material.envMap = value.envMap;
        material.envMapIntensity = value.intensity;
        material.needsUpdate = true;
      });
      target.dispose();
    };
  }, [gl, rootRef]);
}

export function ThreePersonalObjects({
  reduceMotion,
  initialScrollProgress,
  scrollProgressRef,
  scrollStageRef,
}: ThreePersonalObjectsProps) {
  const { invalidate, size, viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const objectRefs = useRef<Array<THREE.Group | null>>([]);
  const dragInteractionsRef = useRef<DragInteraction[]>(
    OBJECTS.map(() => createDragInteraction()),
  );
  const activeObjectRef = useRef<number | null>(null);
  const hoveredObjectRef = useRef<number | null>(null);
  const interactionEnabledRef = useRef(false);
  const previousCursorRef = useRef<string | null>(null);
  const previousUserSelectRef = useRef<string | null>(null);
  const isMobileLayout = size.width <= 720;

  useLocalStudioEnvironment(groupRef);

  const setDocumentCursor = (cursor: "grab" | "grabbing") => {
    if (previousCursorRef.current == null) {
      previousCursorRef.current = document.body.style.cursor;
    }
    document.body.style.cursor = cursor;
  };

  const restoreDocumentCursor = () => {
    if (previousCursorRef.current == null) return;
    document.body.style.cursor = previousCursorRef.current;
    previousCursorRef.current = null;
  };

  const lockDocumentSelection = () => {
    if (previousUserSelectRef.current == null) {
      previousUserSelectRef.current = document.body.style.userSelect;
    }
    document.body.style.userSelect = "none";
  };

  const restoreDocumentSelection = () => {
    if (previousUserSelectRef.current == null) return;
    document.body.style.userSelect = previousUserSelectRef.current;
    previousUserSelectRef.current = null;
  };

  const cancelActiveInteraction = () => {
    const activeIndex = activeObjectRef.current;
    if (activeIndex == null) return;

    const interaction = dragInteractionsRef.current[activeIndex];
    const capturedPointerId = interaction.pointerId;
    const captureController = interaction.captureController;

    interaction.pointerId = null;
    interaction.captureController = null;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    activeObjectRef.current = null;
    hoveredObjectRef.current = null;

    if (
      capturedPointerId != null
      && captureController?.hasPointerCapture(capturedPointerId)
    ) {
      captureController.releasePointerCapture(capturedPointerId);
    }

    restoreDocumentCursor();
    restoreDocumentSelection();
  };

  useEffect(() => {
    const cancelInteraction = (pointerId?: number) => {
      const activeIndex = activeObjectRef.current;

      if (activeIndex != null) {
        const interaction = dragInteractionsRef.current[activeIndex];
        if (pointerId != null && interaction.pointerId !== pointerId) return;

        const capturedPointerId = interaction.pointerId;
        const captureController = interaction.captureController;
        interaction.pointerId = null;
        interaction.captureController = null;
        interaction.velocityX = 0;
        interaction.velocityY = 0;

        if (
          capturedPointerId != null
          && captureController?.hasPointerCapture(capturedPointerId)
        ) {
          captureController.releasePointerCapture(capturedPointerId);
        }
      }

      activeObjectRef.current = null;
      hoveredObjectRef.current = null;
      restoreDocumentCursor();
      restoreDocumentSelection();
    };

    const handleNativeCancel = (event: PointerEvent) => {
      cancelInteraction(event.pointerId);
    };
    const handleWindowBlur = () => cancelInteraction();

    const eventSource = scrollStageRef.current;

    window.addEventListener("blur", handleWindowBlur);
    eventSource?.addEventListener("pointercancel", handleNativeCancel);
    eventSource?.addEventListener("lostpointercapture", handleNativeCancel);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      eventSource?.removeEventListener("pointercancel", handleNativeCancel);
      eventSource?.removeEventListener("lostpointercapture", handleNativeCancel);
      cancelInteraction();
    };
  }, []);

  const handlePointerOver = (
    index: number,
    event: ThreeEvent<PointerEvent>,
  ) => {
    if (!interactionEnabledRef.current) return;
    if (event.nativeEvent.pointerType !== "mouse") return;
    if (activeObjectRef.current != null && activeObjectRef.current !== index) {
      return;
    }

    event.stopPropagation();
    hoveredObjectRef.current = index;

    if (activeObjectRef.current == null) setDocumentCursor("grab");
  };

  const handlePointerOut = (index: number) => {
    if (hoveredObjectRef.current === index) hoveredObjectRef.current = null;
    if (activeObjectRef.current == null) restoreDocumentCursor();
  };

  const handlePointerDown = (
    index: number,
    event: ThreeEvent<PointerEvent>,
  ) => {
    if (!interactionEnabledRef.current) return;
    if (event.nativeEvent.pointerType !== "mouse") return;
    if (event.nativeEvent.button !== 0) return;
    if (activeObjectRef.current != null) return;

    event.stopPropagation();
    const interaction = dragInteractionsRef.current[index];
    interaction.pointerId = event.nativeEvent.pointerId;
    interaction.captureController = getPointerCaptureController(event);
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    interaction.lastClientX = event.nativeEvent.clientX;
    interaction.lastClientY = event.nativeEvent.clientY;
    interaction.lastTime = event.nativeEvent.timeStamp;
    activeObjectRef.current = index;

    try {
      getPointerCaptureController(event).setPointerCapture(
        event.nativeEvent.pointerId,
      );
    } catch {
      // Synthetic test events may not own an active browser pointer.
    }

    lockDocumentSelection();
    setDocumentCursor("grabbing");
  };

  const handlePointerMove = (
    index: number,
    event: ThreeEvent<PointerEvent>,
  ) => {
    const interaction = dragInteractionsRef.current[index];

    if (interaction.pointerId !== event.nativeEvent.pointerId) {
      handlePointerOver(index, event);
      return;
    }

    if ((event.nativeEvent.buttons & 1) === 0) {
      finishPointerInteraction(index, event, true);
      return;
    }

    event.stopPropagation();
    const elapsed = THREE.MathUtils.clamp(
      (event.nativeEvent.timeStamp - interaction.lastTime) / 1000,
      1 / 240,
      0.05,
    );
    const pointerDeltaX = event.nativeEvent.clientX - interaction.lastClientX;
    const pointerDeltaY = event.nativeEvent.clientY - interaction.lastClientY;
    const rotationDeltaX = pointerDeltaY * DRAG_RADIANS_PER_PIXEL;
    const rotationDeltaY = pointerDeltaX * DRAG_RADIANS_PER_PIXEL;
    const velocityBlend = 1 - Math.exp(-24 * elapsed);

    interaction.rotationX = wrapRotation(
      interaction.rotationX + rotationDeltaX,
    );
    interaction.rotationY = wrapRotation(
      interaction.rotationY + rotationDeltaY,
    );
    interaction.velocityX = THREE.MathUtils.lerp(
      interaction.velocityX,
      rotationDeltaX / elapsed,
      velocityBlend,
    );
    interaction.velocityY = THREE.MathUtils.lerp(
      interaction.velocityY,
      rotationDeltaY / elapsed,
      velocityBlend,
    );
    interaction.velocityX = THREE.MathUtils.clamp(
      interaction.velocityX,
      -MAX_RELEASE_VELOCITY,
      MAX_RELEASE_VELOCITY,
    );
    interaction.velocityY = THREE.MathUtils.clamp(
      interaction.velocityY,
      -MAX_RELEASE_VELOCITY,
      MAX_RELEASE_VELOCITY,
    );
    interaction.lastClientX = event.nativeEvent.clientX;
    interaction.lastClientY = event.nativeEvent.clientY;
    interaction.lastTime = event.nativeEvent.timeStamp;
    invalidate();
  };

  const finishPointerInteraction = (
    index: number,
    event: ThreeEvent<PointerEvent>,
    cancelled = false,
  ) => {
    const interaction = dragInteractionsRef.current[index];
    if (interaction.pointerId !== event.nativeEvent.pointerId) return;

    event.stopPropagation();

    const capturedPointerId = interaction.pointerId;
    const captureController = interaction.captureController;
    interaction.pointerId = null;
    interaction.captureController = null;
    activeObjectRef.current = null;

    if (captureController?.hasPointerCapture(capturedPointerId)) {
      captureController.releasePointerCapture(capturedPointerId);
    }

    if (cancelled || reduceMotion) {
      interaction.velocityX = 0;
      interaction.velocityY = 0;
    }

    restoreDocumentSelection();

    if (hoveredObjectRef.current === index && !cancelled) {
      setDocumentCursor("grab");
    } else {
      restoreDocumentCursor();
    }
  };

  useFrame((state, frameDelta) => {
    const group = groupRef.current;
    if (!group) return;

    const progress = reduceMotion ? initialScrollProgress : scrollProgressRef.current;
    const reveal = smoothstep((progress - 0.48) / 0.42);
    const stageBottom = scrollStageRef.current?.getBoundingClientRect().bottom;
    const stageExit = stageBottom == null
      ? 0
      : THREE.MathUtils.clamp(
          (viewport.height - (stageBottom / state.size.height) * viewport.height) / viewport.height,
          0,
          1,
        );
    const isMobile = state.size.width <= 720;
    const elapsed = reduceMotion ? 0 : state.clock.elapsedTime;
    const interactionEnabled = !reduceMotion
      && !isMobile
      && reveal > 0.96
      && stageExit < 0.995;

    if (interactionEnabledRef.current && !interactionEnabled) {
      cancelActiveInteraction();
      hoveredObjectRef.current = null;
      dragInteractionsRef.current.forEach((interaction) => {
        interaction.velocityX = 0;
        interaction.velocityY = 0;
      });
      if (activeObjectRef.current == null) restoreDocumentCursor();
    }
    interactionEnabledRef.current = interactionEnabled;

    group.visible = reveal > 0.001 && stageExit < 0.995;
    group.position.y = -viewport.height * (1 - reveal) * 0.62 + stageExit * viewport.height;
    group.scale.setScalar(THREE.MathUtils.lerp(0.72, 1, reveal));

    OBJECTS.forEach((spec, index) => {
      const object = objectRefs.current[index];
      if (!object) return;
      const phase = elapsed * spec.speed + spec.phase;
      const xRatio = isMobile ? spec.mobileX : spec.x;
      const yRatio = isMobile ? spec.mobileY : spec.y;
      const scale = isMobile ? spec.mobileScale : spec.scale;
      const interaction = dragInteractionsRef.current[index];

      if (
        interactionEnabled
        && interaction.pointerId == null
        && !reduceMotion
        && (Math.abs(interaction.velocityX) > 0.001
          || Math.abs(interaction.velocityY) > 0.001)
      ) {
        const safeDelta = Math.min(frameDelta, 0.05);
        const damping = Math.exp(-INERTIA_DAMPING * safeDelta);

        interaction.rotationX = wrapRotation(
          interaction.rotationX + interaction.velocityX * safeDelta,
        );
        interaction.rotationY = wrapRotation(
          interaction.rotationY + interaction.velocityY * safeDelta,
        );
        interaction.velocityX *= damping;
        interaction.velocityY *= damping;
      }

      object.visible = !isMobile || index <= 2;

      object.position.set(
        viewport.width * xRatio + Math.cos(phase * 0.73) * spec.drift * 0.45,
        viewport.height * yRatio + Math.sin(phase) * spec.drift,
        spec.z,
      );
      object.rotation.set(
        spec.rotation[0]
          + Math.sin(phase * 0.62) * 0.055
          + interaction.rotationX,
        spec.rotation[1]
          + Math.cos(phase * 0.51) * 0.075
          + interaction.rotationY,
        spec.rotation[2] + Math.sin(phase * 0.43) * 0.045,
      );
      object.scale.setScalar(scale);
    });
  });

  const models = [
    <DetailedHeadphonesModel key="headphones" />,
    <DetailedPhoneModel key="phone" />,
    <DetailedLaptopModel key="laptop" />,
    isMobileLayout ? null : <DetailedTabletModel key="tablet" />,
    isMobileLayout ? null : <DetailedWatchModel key="watch" />,
    isMobileLayout ? null : <DetailedEarbudsModel key="earbuds" />,
  ];

  return (
    <group ref={groupRef} visible={initialScrollProgress >= 0.48}>
      <hemisphereLight args={["#eaf8ff", "#173044", 0.72]} />
      <directionalLight color="#fff3e8" intensity={1.65} position={[-3, 5, 6]} />
      <pointLight color="#76c8ef" intensity={1.05} distance={12} position={[3, 1, 4]} />
      <pointLight color="#ff8a4c" intensity={0.72} distance={9} position={[-4, -1, 3]} />
      {models.map((model, index) => (
        <group
          key={OBJECTS[index].phase}
          ref={(instance) => {
            objectRefs.current[index] = instance;
          }}
        >
          {model}
          <mesh
            onPointerOver={(event) => handlePointerOver(index, event)}
            onPointerOut={() => handlePointerOut(index)}
            onPointerDown={(event) => handlePointerDown(index, event)}
            onPointerMove={(event) => handlePointerMove(index, event)}
            onPointerUp={(event) => finishPointerInteraction(index, event)}
          >
            <boxGeometry args={OBJECTS[index].hitbox} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthTest={false}
              depthWrite={false}
              colorWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
