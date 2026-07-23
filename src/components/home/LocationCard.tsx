"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { GoogleMap } from "./GoogleMap";
import styles from "./LocationCard.module.css";

const MAX_ROTATE_X = 3.8;
const MAX_ROTATE_Y = 5.2;
const MAP_PROVIDER = process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "amap";
const AMAP_API_KEY = process.env.NEXT_PUBLIC_AMAP_API_KEY;
const AMAP_DEVELOPMENT_SECURITY_JS_CODE =
  process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE;
const HONGGUTAN_CENTER: [number, number] = [115.83, 28.65];

let aMapPromise: Promise<typeof window.AMap> | null = null;

function getMapStyle() {
  return document.documentElement.dataset.theme === "night"
    ? "amap://styles/darkblue"
    : "amap://styles/f068f1616ca8804b3fc1d203aa5f3a6b";
}

function loadAMap(apiKey: string) {
  if (!aMapPromise) {
    window._AMapSecurityConfig = AMAP_DEVELOPMENT_SECURITY_JS_CODE
      ? { securityJsCode: AMAP_DEVELOPMENT_SECURITY_JS_CODE }
      : {
          serviceHost: new URL("/_AMapService", window.location.origin).toString(),
        };

    aMapPromise = import("@amap/amap-jsapi-loader").then(({ load }) =>
      load({
        key: apiKey,
        version: "2.0",
      }).then(() => window.AMap)
    );
  }

  return aMapPromise;
}

function createPositionMarker() {
  const marker = document.createElement("div");
  marker.className = styles.positionMarker;

  const firstRing = document.createElement("span");
  firstRing.className = styles.markerPulseRing;
  const secondRing = document.createElement("span");
  secondRing.className = styles.markerPulseRing;
  const center = document.createElement("span");
  center.className = styles.markerCenter;

  marker.append(firstRing, secondRing, center);
  return marker;
}

function AMapMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !AMAP_API_KEY) return;

    let disposed = false;
    let map: AMap.Map | null = null;
    let marker: AMap.Marker | null = null;

    const clearMap = () => {
      if (marker && map) map.remove(marker);
      if (map) map.destroy();
      marker = null;
      map = null;
      container.replaceChildren();
    };

    setLoadFailed(false);
    void loadAMap(AMAP_API_KEY).then(
      (AMap) => {
        if (disposed || !containerRef.current) return;

        const mapOptions: AMap.MapOptions = {
          center: HONGGUTAN_CENTER,
          zoom: 11.5,
          viewMode: "2D",
          mapStyle: getMapStyle(),
          showLabel: true,
          dragEnable: true,
          zoomEnable: true,
          scrollWheel: true,
          touchZoom: true,
          doubleClickZoom: true,
          keyboardEnable: true,
        };

        map = new AMap.Map(container, mapOptions);
        marker = new AMap.Marker({
          position: HONGGUTAN_CENTER,
          content: createPositionMarker(),
          anchor: "center",
          clickable: false,
          zIndex: 5,
        });
        map.add(marker);

        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      },
      () => {
        if (!disposed) setLoadFailed(true);
      }
    );

    const themeObserver = new MutationObserver(() => {
      if (!disposed) map?.setMapStyle(getMapStyle());
    });

    return () => {
      disposed = true;
      themeObserver.disconnect();
      clearMap();
    };
  }, []);

  if (!AMAP_API_KEY || loadFailed) {
    return (
      <div className={styles.missingMap} role="status">
        <span>AMap</span>
        <small>
          {loadFailed
            ? "Unable to load the AMap JavaScript API"
            : "Configure the AMap JavaScript API key"}
        </small>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.map}
      data-native-wheel="true"
      role="application"
      aria-label="AMap — Honggutan, Nanchang"
    />
  );
}

function InteractiveMap() {
  return MAP_PROVIDER === "google" ? <GoogleMap /> : <AMapMap />;
}

type LocationCardProps = {
  visible: boolean;
};

export function LocationCard({ visible }: LocationCardProps) {
  const [entranceReady, setEntranceReady] = useState(false);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, {
    stiffness: 150,
    damping: 22,
    mass: 0.8,
  });
  const rotateY = useSpring(rotateYTarget, {
    stiffness: 150,
    damping: 22,
    mass: 0.8,
  });
  const cardTransform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const resetTilt = useCallback(() => {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
  }, [rotateXTarget, rotateYTarget]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntranceReady(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMouseMove = (event: MouseEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;

      const normalizedX = event.clientX / window.innerWidth - 0.5;
      const normalizedY = event.clientY / window.innerHeight - 0.5;
      rotateXTarget.set(normalizedY * -2 * MAX_ROTATE_X);
      rotateYTarget.set(normalizedX * 2 * MAX_ROTATE_Y);
    };
    const handleMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) resetTilt();
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
      capture: true,
    });
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("blur", resetTilt);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove, true);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("blur", resetTilt);
    };
  }, [resetTilt, rotateXTarget, rotateYTarget]);

  return (
    <div
      className={styles.entrance}
      data-visible={visible && entranceReady ? "true" : "false"}
      aria-hidden={!visible}
      inert={!visible}
    >
      <motion.article
        className={styles.mapTilt}
        style={{ transform: cardTransform }}
        aria-label="Map of Honggutan, Nanchang"
      >
        <InteractiveMap />
        <span className={styles.mapCaption}>Nanchang, China</span>
      </motion.article>
    </div>
  );
}
