"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";

import styles from "./LocationCard.module.css";

const MAX_ROTATE_X = 3.8;
const MAX_ROTATE_Y = 5.2;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const HONGGUTAN_CENTER = { lat: 28.65, lng: 115.83 };

let mapsLibrariesPromise: Promise<
  [google.maps.MapsLibrary, google.maps.MarkerLibrary]
> | null = null;

function loadMapsLibraries(apiKey: string) {
  if (!mapsLibrariesPromise) {
    setOptions({
      key: apiKey,
      v: "weekly",
      language: "en",
      region: "CN",
    });
    mapsLibrariesPromise = Promise.all([
      importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
    ]);
  }

  return mapsLibrariesPromise;
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

export function LocationPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 10.1c0 5.3-8 11.4-8 11.4S4 15.4 4 10.1a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InteractiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GOOGLE_MAPS_API_KEY || !GOOGLE_MAPS_MAP_ID) return;

    let disposed = false;
    let map: google.maps.Map | null = null;
    let marker: google.maps.marker.AdvancedMarkerElement | null = null;

    void loadMapsLibraries(GOOGLE_MAPS_API_KEY).then(
      ([{ Map }, { AdvancedMarkerElement }]) => {
        if (disposed || !containerRef.current) return;

        map = new Map(containerRef.current, {
          center: HONGGUTAN_CENTER,
          zoom: 11.5,
          mapId: GOOGLE_MAPS_MAP_ID,
          backgroundColor: "#e5f0eb",
          disableDefaultUI: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          cameraControl: false,
          rotateControl: false,
          scaleControl: false,
          zoomControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          keyboardShortcuts: true,
        });

        marker = new AdvancedMarkerElement({
          map,
          position: HONGGUTAN_CENTER,
          content: createPositionMarker(),
          anchorLeft: "-50%",
          anchorTop: "-50%",
          gmpClickable: false,
          zIndex: 5,
        });
      }
    );

    return () => {
      disposed = true;
      if (marker) marker.map = null;
      if (map) google.maps.event.clearInstanceListeners(map);
      container.replaceChildren();
    };
  }, []);

  if (!GOOGLE_MAPS_API_KEY || !GOOGLE_MAPS_MAP_ID) {
    return (
      <div className={styles.missingMap} role="status">
        <span>Google Maps</span>
        <small>Configure the Google Maps API key and Map ID</small>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.map}
      role="application"
      aria-label="Google Maps — Honggutan, Nanchang"
    />
  );
}

export function LocationCard() {
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
    <div className={styles.entrance}>
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
