"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

import styles from "./LocationCard.module.css";

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

export function GoogleMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GOOGLE_MAPS_API_KEY || !GOOGLE_MAPS_MAP_ID) return;

    let disposed = false;
    let map: google.maps.Map | null = null;
    let marker: google.maps.marker.AdvancedMarkerElement | null = null;
    let activeColorScheme: "DARK" | "LIGHT" | null = null;
    let renderMap: (() => void) | null = null;

    const clearMap = () => {
      if (marker) marker.map = null;
      if (map) google.maps.event.clearInstanceListeners(map);
      marker = null;
      map = null;
      container.replaceChildren();
    };

    const themeObserver = new MutationObserver(() => {
      if (!disposed) renderMap?.();
    });

    void loadMapsLibraries(GOOGLE_MAPS_API_KEY).then(
      ([{ Map }, { AdvancedMarkerElement }]) => {
        if (disposed || !containerRef.current) return;

        renderMap = () => {
          const colorScheme =
            document.documentElement.dataset.theme === "night"
              ? "DARK"
              : "LIGHT";
          if (colorScheme === activeColorScheme) return;

          clearMap();
          activeColorScheme = colorScheme;
          map = new Map(container, {
            center: HONGGUTAN_CENTER,
            zoom: 11.5,
            mapId: GOOGLE_MAPS_MAP_ID,
            colorScheme,
            backgroundColor: colorScheme === "DARK" ? "#071b35" : "#e5f0eb",
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
        };

        renderMap();
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      }
    );

    return () => {
      disposed = true;
      themeObserver.disconnect();
      clearMap();
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
      className={`${styles.map} ${styles.googleMap}`}
      data-native-wheel="true"
      role="application"
      aria-label="Google Maps — Honggutan, Nanchang"
    />
  );
}
