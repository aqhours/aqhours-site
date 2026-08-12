"use client";

// One Sticker Forge WebGL stage, fed by aqhours' favorite artwork.
// The renderer is vendored under its MIT license; no reference artwork is used.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./FavoritesStickerShowcase.module.css";

type StickerLogo = {
  name: string;
  src: string;
  width: string;
  height: string;
};

type StickerPoint = { x: number; y: number };

type StickerState = {
  ready: boolean;
  dragging: boolean;
  progress: number;
  grabPoint: StickerPoint | null;
  pointer: StickerPoint | null;
};

type StickerForgeElement = HTMLElement & {
  setSource(source: { type: "image"; src: string; name?: string }): Promise<void>;
  setOptions(options: Record<string, unknown>): void;
  reset(): void;
  reappear(): void;
  resize(): void;
  getState(): StickerState;
};

type StickerChoiceStyle = CSSProperties & {
  "--choice-logo-width": string;
  "--choice-logo-height": string;
  "--choice-rotation": string;
};

const FORGE_SCRIPT_ID = "aqhours-sticker-forge-runtime";
const FORGE_SCRIPT_SRC = "/vendor/sticker-forge/sticker-forge.es.js";

async function ensureStickerForge() {
  if (customElements.get("sticker-forge")) return;

  let script = document.getElementById(FORGE_SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = FORGE_SCRIPT_ID;
    script.type = "module";
    script.src = FORGE_SCRIPT_SRC;
    document.head.append(script);
  }

  await customElements.whenDefined("sticker-forge");
}

export function FavoritesStickerShowcase({
  logos,
  reduceMotion,
}: {
  logos: StickerLogo[];
  reduceMotion: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const forgeRef = useRef<StickerForgeElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detached, setDetached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    let forge: StickerForgeElement | null = null;
    const onReady = () => !cancelled && setReady(true);
    const onPeelStart = () => !cancelled && setDetached(false);
    const onPeelChange = (event: Event) => {
      const detail = (event as CustomEvent<{ progress?: number }>).detail;
      if (!cancelled) setProgress(detail?.progress ?? 0);
    };
    const onPeelEnd = (event: Event) => {
      const detail = (event as CustomEvent<{ progress?: number }>).detail;
      if (!cancelled) setProgress(detail?.progress ?? 0);
    };
    const onDetach = () => {
      if (cancelled) return;
      setDetached(true);
      setProgress(1);
    };
    const onError = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!cancelled) setError(detail?.message ?? "Sticker renderer failed to load.");
    };

    void ensureStickerForge()
      .then(async () => {
        if (cancelled) return;
        forge = document.createElement("sticker-forge") as StickerForgeElement;
        forge.className = styles.forgeElement;
        forge.setAttribute(
          "aria-label",
          "Interactive favorite sticker. Drag any visible white edge to peel it.",
        );
        forge.addEventListener("ready", onReady);
        forge.addEventListener("peelstart", onPeelStart);
        forge.addEventListener("peelchange", onPeelChange);
        forge.addEventListener("peelend", onPeelEnd);
        forge.addEventListener("detachcomplete", onDetach);
        forge.addEventListener("error", onError);
        host.replaceChildren(forge);
        forgeRef.current = forge;

        forge.setOptions({
          outline: { width: 16, color: "#ffffff" },
          edge: { width: 2.4, strength: 0.74 },
          shadow: {
            color: "#031426",
            opacity: 0.25,
            blur: 24,
            distance: 17,
            angle: 42,
          },
          lighting: {
            direction: { x: -0.38, y: 0.52, z: 0.76 },
            intensity: 0.76,
            ambient: 0.36,
            softness: 0.66,
          },
          peel: {
            radius: 0.12,
            stiffness: 0.72,
            grabWidth: 28,
            maxAngle: 3.55,
            release: "snap",
          },
          sound: { enabled: !reduceMotion, volume: 0.62 },
          back: { color: "#f7f5f2", gloss: 0.7, roughness: 0.3 },
          material: { type: "original", intensity: 0.82, scale: 1 },
          wind: reduceMotion ? 0 : 0.025,
          quality: "medium",
          tilt: -3,
        });
        await forge.setSource({
          type: "image",
          src: logos[0].src,
          name: logos[0].name,
        });
        if (!reduceMotion) forge.reappear();
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Sticker renderer failed to load.");
        }
      });

    return () => {
      cancelled = true;
      if (forge) {
        forge.removeEventListener("ready", onReady);
        forge.removeEventListener("peelstart", onPeelStart);
        forge.removeEventListener("peelchange", onPeelChange);
        forge.removeEventListener("peelend", onPeelEnd);
        forge.removeEventListener("detachcomplete", onDetach);
        forge.removeEventListener("error", onError);
        forge.remove();
      }
      forgeRef.current = null;
    };
  }, [logos, reduceMotion]);

  const selectSticker = useCallback(
    async (index: number) => {
      const forge = forgeRef.current;
      if (!forge || index === selectedIndex) {
        if (detached) {
          forge?.reset();
          if (!reduceMotion) forge?.reappear();
          setDetached(false);
          setProgress(0);
        }
        return;
      }

      setSelectedIndex(index);
      setReady(false);
      setDetached(false);
      setProgress(0);
      setError(null);
      forge.reset();
      await forge.setSource({
        type: "image",
        src: logos[index].src,
        name: logos[index].name,
      });
      if (!reduceMotion) forge.reappear();
      setReady(true);
    },
    [detached, logos, reduceMotion, selectedIndex],
  );

  const selected = logos[selectedIndex];

  return (
    <div className={styles.stickerShowcase}>
      <div className={styles.forgeStage}>
        <header className={styles.stageHeader}>
          <div>
            <span>PEELABLE FAVORITE</span>
            <h3>{selected.name}</h3>
          </div>
          <div className={styles.stageState} aria-live="polite">
            <span>{ready ? "EDGE READY" : "PREPARING"}</span>
            <span>PEEL {Math.round(progress * 100)}%</span>
          </div>
        </header>

        <div className={styles.forgeViewport} data-detached={detached ? "true" : "false"}>
          <div ref={hostRef} className={styles.forgeHost} />
          {!ready && !error && <span className={styles.loadingLabel}>forming die-cut edge…</span>}
          {error && <p className={styles.errorLabel}>{error}</p>}
          <p className={styles.peelInstruction}>
            Grab the visible white edge and pull inward
          </p>
          {detached && (
            <button
              className={styles.restoreButton}
              type="button"
              onClick={() => {
                forgeRef.current?.reset();
                if (!reduceMotion) forgeRef.current?.reappear();
                setDetached(false);
                setProgress(0);
              }}
            >
              Place it back
            </button>
          )}
        </div>
      </div>

      <aside className={styles.stickerArchive} aria-label="Choose a favorite sticker">
        <header>
          <span>STICKER ARCHIVE</span>
          <span>{logos.length} PIECES</span>
        </header>
        <div className={styles.stickerChoices}>
          {logos.map((logo, index) => {
            const choiceStyle: StickerChoiceStyle = {
              "--choice-logo-width": logo.width,
              "--choice-logo-height": logo.height,
              "--choice-rotation": `${[-5, 3, -2, 4, -4, 2][index % 6]}deg`,
            };

            return (
              <button
                className={styles.stickerChoice}
                data-selected={index === selectedIndex ? "true" : "false"}
                type="button"
                style={choiceStyle}
                aria-label={`Show ${logo.name} as the peelable sticker`}
                aria-pressed={index === selectedIndex}
                onClick={() => void selectSticker(index)}
                key={logo.name}
              >
                <img src={logo.src} alt="" draggable={false} />
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
