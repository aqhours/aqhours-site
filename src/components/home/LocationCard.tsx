"use client";

import { useEffect, useRef, useState } from "react";

import { GoogleMap } from "./GoogleMap";
import styles from "./LocationCard.module.css";

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
  const center = document.createElement("span");
  center.className = styles.markerCenter;

  marker.append(firstRing, center);
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
          dragEnable: false,
          zoomEnable: false,
          scrollWheel: false,
          touchZoom: false,
          doubleClickZoom: false,
          keyboardEnable: false,
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
      role="img"
      aria-label="AMap — Honggutan, Nanchang"
    />
  );
}

function InteractiveMap() {
  return MAP_PROVIDER === "google" ? <GoogleMap /> : <AMapMap />;
}

export function LocationCard({ visible }: { visible: boolean }) {
  const [entranceReady, setEntranceReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntranceReady(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={styles.entrance}
      data-visible={visible && entranceReady ? "true" : "false"}
      aria-hidden={!visible}
      inert={!visible}
    >
      <article
        className={styles.mapTilt}
        aria-label="Map of Honggutan, Nanchang"
      >
        <InteractiveMap />
      </article>
    </div>
  );
}
