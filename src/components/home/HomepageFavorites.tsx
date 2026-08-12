"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type PanInfo,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import styles from "./HomepageFavorites.module.css";
import { FavoritesStickerShowcase } from "./FavoritesStickerShowcase";

type FavoriteLogo = {
  name: string;
  src: string;
  width: string;
  height: string;
  maskMode?: "alpha" | "luminance";
};

type ScatterStyle = CSSProperties & {
  "--favorite-logo-width": string;
  "--favorite-logo-height": string;
  "--scatter-x": string;
  "--scatter-y": string;
  "--scatter-width": string;
  "--scatter-responsive-width": string;
  "--scatter-rotation": string;
  "--scatter-delay": string;
  "--scatter-depth": string;
};

type ScatterOffset = {
  x: number;
  y: number;
};

type FavoriteSong = {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  rotation: string;
  offset: string;
  favoriteLyric?: readonly string[];
};

const AQOURS_FINALE_STICKER: FavoriteLogo = {
  name: "LoveLive! Sunshine!! Aqours Finale LoveLive! ～EIKYU stage～",
  src: "/logo_svg/aqours-finale-live.svg",
  width: "82%",
  height: "66%",
};

const FAVORITE_SONGS: FavoriteSong[] = [
  {
    id: "birds-of-a-feather",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    fileName: "HIT ME HARD AND SOFT1400bb.jpg",
    rotation: "-4deg",
    offset: "12px",
  },
  {
    id: "all-too-well",
    title: "All Too Well (10 Minute Version)",
    artist: "Taylor Swift",
    fileName:
      "Red (Taylor’s Version) (+ A Message from Taylor)1400x1400bb.jpg",
    rotation: "2.5deg",
    offset: "-2px",
  },
  {
    id: "yuuki-wa-doko-ni",
    title: "勇気はどこに？君の胸に！",
    artist: "Aqours",
    fileName: "勇気はどこに?君の胸に!1400x1400bb.jpg",
    rotation: "-1.5deg",
    offset: "8px",
  },
  {
    id: "eien-hours",
    title: "永久hours",
    artist: "Aqours",
    fileName: "永久hours1400bb.jpg",
    rotation: "3.5deg",
    offset: "-5px",
  },
  {
    id: "aosora-jumping-heart",
    title: "青空Jumping Heart",
    artist: "Aqours",
    fileName: "青空Jumping Heart1400x1400bb.jpg",
    rotation: "-2.5deg",
    offset: "10px",
  },
];

const TECHNOLOGY_LOGOS: FavoriteLogo[] = [
  {
    name: "Arch Linux",
    src: "/logo_svg/arch-linux.svg",
    width: "88%",
    height: "70%",
  },
  {
    name: "Dia",
    src: "/logo_svg/dia.svg",
    width: "76%",
    height: "58%",
  },
  {
    name: "Figma",
    src: "/logo_svg/figma.svg",
    width: "34%",
    height: "80%",
  },
  {
    name: "ChatGPT",
    src: "/logo_svg/chatgpt.svg",
    width: "34%",
    height: "76%",
  },
  {
    name: "Claude",
    src: "/logo_svg/claude.svg",
    width: "86%",
    height: "58%",
  },
  {
    name: "Visual Studio Code",
    src: "/logo_svg/visual-studio-code.svg",
    width: "36%",
    height: "78%",
  },
  {
    name: "TypeScript",
    src: "/logo_svg/typescript.svg",
    width: "36%",
    height: "78%",
    maskMode: "luminance",
  },
  {
    name: "Ghostty",
    src: "/logo_svg/ghostty.svg",
    width: "82%",
    height: "58%",
  },
  {
    name: "GitHub",
    src: "/logo_svg/github.svg",
    width: "36%",
    height: "78%",
  },
  {
    name: "Docker",
    src: "/logo_svg/docker.svg",
    width: "88%",
    height: "58%",
  },
  {
    name: "Tailwind CSS",
    src: "/logo_svg/tailwind-css.svg",
    width: "48%",
    height: "72%",
  },
  {
    name: "Love Live! Asia Tour",
    src: "/logo_svg/love-live-asia-tour.svg",
    width: "82%",
    height: "66%",
  },
];

const CULTURE_LOGOS: FavoriteLogo[] = [
  {
    name: "Love Live! Series",
    src: "/logo_svg/love-live-series.svg",
    width: "90%",
    height: "50%",
  },
  {
    name: "Love Live! Sunshine!! Series",
    src: "/logo_svg/love-live-sunshine-series.svg",
    width: "90%",
    height: "58%",
  },
  {
    name: "μ's",
    src: "/logo_svg/love-live-muse.svg",
    width: "38%",
    height: "82%",
  },
  {
    name: "Aqours",
    src: "/logo_svg/aqours.svg",
    width: "72%",
    height: "72%",
  },
  {
    name: "Takami Chika",
    src: "/logo_png/takami-chika.png",
    width: "92%",
    height: "64%",
  },
  {
    name: "Infinity Nikki",
    src: "/logo_svg/infinity-nikki.svg",
    width: "90%",
    height: "68%",
  },
  {
    name: "Shining Nikki",
    src: "/logo_svg/shining-nikki.svg",
    width: "40%",
    height: "82%",
  },
  {
    name: "Apple",
    src: "/logo_svg/apple.svg",
    width: "34%",
    height: "78%",
  },
  {
    name: "Apple Music",
    src: "/logo_svg/apple-music.svg",
    width: "34%",
    height: "78%",
    maskMode: "luminance",
  },
  {
    name: "Cities: Skylines II",
    src: "/logo_svg/cities-skylines-ii.svg",
    width: "90%",
    height: "68%",
  },
  {
    name: "Haidilao",
    src: "/logo_svg/haidilao.svg",
    width: "76%",
    height: "58%",
  },
];

const FAVORITE_LOGOS = [
  AQOURS_FINALE_STICKER,
  ...TECHNOLOGY_LOGOS,
  ...CULTURE_LOGOS,
];

const FADE_UP_EASE = [0.23, 1, 0.32, 1] as const;
const ALBUM_SPACE_TRANSITION = {
  type: "spring",
  duration: 0.52,
  bounce: 0,
} as const;

const SCATTERED_FAVORITES = FAVORITE_LOGOS.map(
  (logo, index) => ({
    ...logo,
    x: [6, 20, 34, 47, 64, 81, 92, 12, 27, 39, 50, 76, 92, 5, 20, 36, 55, 71, 84, 95, 13, 25, 57, 84][
      index
    ],
    y: [13, 8, 17, 8, 16, 8, 20, 39, 32, 42, 26, 39, 40, 67, 60, 71, 60, 73, 61, 76, 91, 87, 91, 92][
      index
    ],
    itemWidth: [122, 142, 86, 94, 132, 88, 92, 126, 88, 136, 98, 148, 152, 160, 92, 118, 148, 146, 86, 150, 124, 90, 112, 92][
      index
    ],
    rotation: [-8, 4, -3, 7, -5, 3, 9, 5, -7, 2, 8, -4, 3, -6, 7, -2, 5, -8, 4, -3, 8, -5, 2, -7][
      index
    ],
    form: (["acrylic", "ticket", "sticker", "badge"] as const)[index % 4],
  }),
);

type ScatteredFavorite = (typeof SCATTERED_FAVORITES)[number];

function useEntranceMotion(reduceMotion: boolean) {
  return {
    initial: {
      opacity: 0,
      transform: reduceMotion
        ? "translate3d(0, 0, 0)"
        : "translate3d(0, 24px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  };
}

function ScatteredFavoriteItem({
  logo,
  index,
  offset,
  active,
  reduceMotion,
  constraintsRef,
  onDrag,
  onDragStart,
  onDragEnd,
}: {
  logo: ScatteredFavorite;
  index: number;
  offset: ScatterOffset;
  active: boolean;
  reduceMotion: boolean;
  constraintsRef: RefObject<HTMLDivElement | null>;
  onDrag: (index: number, info: PanInfo) => void;
  onDragStart: (index: number) => void;
  onDragEnd: (index: number, info: PanInfo) => void;
}) {
  const scatterStyle: ScatterStyle = {
    "--favorite-logo-width": logo.width,
    "--favorite-logo-height": logo.height,
    "--scatter-x": `${logo.x}%`,
    "--scatter-y": `${logo.y}%`,
    "--scatter-width": `${logo.itemWidth}px`,
    "--scatter-responsive-width": `clamp(${Math.round(logo.itemWidth * 0.58)}px, ${(logo.itemWidth * 0.07742).toFixed(2)}vw, ${logo.itemWidth}px)`,
    "--scatter-rotation": `${logo.rotation}deg`,
    "--scatter-delay": `${index * -0.31}s`,
    "--scatter-depth": `${8 + (index % 5) * 3}px`,
  };

  return (
    <li
      className={styles.scatterItem}
      data-active={active ? "true" : "false"}
      data-form={logo.form}
      style={scatterStyle}
    >
      <motion.div
        className={styles.scatterOffset}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 260, damping: 28, bounce: 0 }}
      >
        <motion.div
          className={styles.scatterDrag}
          drag={!reduceMotion}
          dragConstraints={constraintsRef}
          dragElastic={0.06}
          dragMomentum={false}
          dragSnapToOrigin
          whileDrag={{ scale: 1.035 }}
          onDragStart={() => onDragStart(index)}
          onDrag={(_, info) => onDrag(index, info)}
          onDragEnd={(_, info) => onDragEnd(index, info)}
        >
          <span className={styles.scatterBreath}>
            <span className={styles.paperclip} aria-hidden="true" />
            <span className={styles.scatterObject}>
              <span className={styles.scatterEdge} aria-hidden="true" />
              <img
                className={styles.scatterLogo}
                src={logo.src}
                alt={logo.name}
                draggable={false}
              />
              <span className={styles.scatterIndex} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>
          </span>
        </motion.div>
      </motion.div>
    </li>
  );
}

function FavoriteThingsDesk({ reduceMotion }: { reduceMotion: boolean }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pointerInsideRef = useRef(false);
  const [offsets, setOffsets] = useState<ScatterOffset[]>(() =>
    SCATTERED_FAVORITES.map(() => ({ x: 0, y: 0 })),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const currentXTarget = useMotionValue(0);
  const currentYTarget = useMotionValue(0);
  const lightXTarget = useMotionValue(50);
  const lightYTarget = useMotionValue(42);
  const lightOpacityTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, { stiffness: 120, damping: 20 });
  const rotateY = useSpring(rotateYTarget, { stiffness: 120, damping: 20 });
  const currentX = useSpring(currentXTarget, { stiffness: 90, damping: 18 });
  const currentY = useSpring(currentYTarget, { stiffness: 90, damping: 18 });
  const lightX = useSpring(lightXTarget, {
    stiffness: 95,
    damping: 20,
    mass: 0.8,
  });
  const lightY = useSpring(lightYTarget, {
    stiffness: 95,
    damping: 20,
    mass: 0.8,
  });
  const lightOpacity = useSpring(lightOpacityTarget, {
    stiffness: 90,
    damping: 20,
  });
  const deskLight =
    useMotionTemplate`radial-gradient(ellipse 28% 20% at ${lightX}% ${lightY}%, rgba(255,255,255,.1), rgba(255,255,255,.025) 48%, transparent 100%)`;

  const resetPointer = () => {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    currentXTarget.set(0);
    currentYTarget.set(0);
    lightOpacityTarget.set(0);
    pointerInsideRef.current = false;
  };

  const handleCollision = useCallback(
    (sourceIndex: number, info: PanInfo) => {
      const surface = surfaceRef.current;
      if (!surface) return;
      const bounds = surface.getBoundingClientRect();
      const source = SCATTERED_FAVORITES[sourceIndex];

      setOffsets((currentOffsets) => {
        const sourceX =
          (source.x / 100) * bounds.width +
          currentOffsets[sourceIndex].x +
          info.offset.x;
        const sourceY =
          (source.y / 100) * bounds.height +
          currentOffsets[sourceIndex].y +
          info.offset.y;
        const sourceWidth =
          source.itemWidth * (source.form === "badge" ? 0.76 : 1);
        const sourceHeight =
          source.itemWidth * (source.form === "badge" ? 0.76 : 0.58);
        let changed = false;
        const nextOffsets = currentOffsets.map((offset) => ({ ...offset }));

        SCATTERED_FAVORITES.forEach((item, itemIndex) => {
          if (itemIndex === sourceIndex) return;
          const itemWidth =
            item.itemWidth * (item.form === "badge" ? 0.76 : 1);
          const itemHeight =
            item.itemWidth * (item.form === "badge" ? 0.76 : 0.58);
          const itemX =
            (item.x / 100) * bounds.width + currentOffsets[itemIndex].x;
          const itemY =
            (item.y / 100) * bounds.height + currentOffsets[itemIndex].y;
          const dx = itemX - sourceX;
          const dy = itemY - sourceY;
          const overlapX = (sourceWidth + itemWidth) * 0.43 - Math.abs(dx);
          const overlapY = (sourceHeight + itemHeight) * 0.43 - Math.abs(dy);

          if (overlapX <= 0 || overlapY <= 0) return;
          const length = Math.hypot(dx, dy) || 1;
          const push = Math.min(6, Math.max(2, Math.min(overlapX, overlapY) * 0.14));
          nextOffsets[itemIndex].x = Math.max(
            -90,
            Math.min(90, nextOffsets[itemIndex].x + (dx / length) * push),
          );
          nextOffsets[itemIndex].y = Math.max(
            -70,
            Math.min(70, nextOffsets[itemIndex].y + (dy / length) * push),
          );
          changed = true;
        });

        return changed ? nextOffsets : currentOffsets;
      });
    },
    [],
  );

  const settleDraggedItem = useCallback((index: number, info: PanInfo) => {
    setOffsets((currentOffsets) =>
      currentOffsets.map((offset, itemIndex) =>
        itemIndex === index
          ? {
              x: Math.max(-140, Math.min(140, offset.x + info.offset.x)),
              y: Math.max(-100, Math.min(100, offset.y + info.offset.y)),
            }
          : offset,
      ),
    );
    setActiveIndex(null);
  }, []);

  return (
    <div className={styles.deskStage}>
      <motion.div
        className={styles.deskPlane}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
        }}
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType === "touch") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;

          if (!pointerInsideRef.current) {
            lightXTarget.jump(x * 100);
            lightYTarget.jump(y * 100);
            pointerInsideRef.current = true;
          }
          lightOpacityTarget.set(1);
          rotateXTarget.set((0.5 - y) * 1.5);
          rotateYTarget.set((x - 0.5) * 2);
          currentXTarget.set((x - 0.5) * 4);
          currentYTarget.set((y - 0.5) * 3);
          lightXTarget.set(x * 100);
          lightYTarget.set(y * 100);
        }}
        onPointerLeave={resetPointer}
      >
        <div
          ref={surfaceRef}
          className={styles.deskSurface}
        >
          <motion.ul
            className={styles.scatterItems}
            style={{
              x: reduceMotion ? 0 : currentX,
              y: reduceMotion ? 0 : currentY,
            }}
            aria-label="Favorite things pinned across a desktop"
          >
            {SCATTERED_FAVORITES.map((logo, index) => (
              <ScatteredFavoriteItem
                logo={logo}
                index={index}
                offset={offsets[index]}
                active={activeIndex === index}
                reduceMotion={reduceMotion}
                constraintsRef={surfaceRef}
                onDrag={handleCollision}
                onDragStart={setActiveIndex}
                onDragEnd={settleDraggedItem}
                key={logo.name}
              />
            ))}
          </motion.ul>
          <motion.div
            className={styles.deskPointerLight}
            style={{ backgroundImage: deskLight, opacity: lightOpacity }}
            aria-hidden="true"
          />
        </div>
      </motion.div>
      <p className={styles.deskCaption}>
        Drag to rearrange
      </p>
    </div>
  );
}

function FavoriteSongRecord({
  song,
  index,
  selected,
  hasSelection,
  reduceMotion,
  onSelect,
}: {
  song: FavoriteSong;
  index: number;
  selected: boolean;
  hasSelection: boolean;
  reduceMotion: boolean;
  onSelect: (
    index: number,
    trigger: HTMLButtonElement,
    restoreFocus: boolean,
  ) => void;
}) {
  const [pointerActive, setPointerActive] = useState(false);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const lightXTarget = useMotionValue(50);
  const lightYTarget = useMotionValue(50);
  const rotateX = useSpring(rotateXTarget, {
    stiffness: 180,
    damping: 24,
    mass: 0.72,
  });
  const rotateY = useSpring(rotateYTarget, {
    stiffness: 180,
    damping: 24,
    mass: 0.72,
  });
  const lightX = useSpring(lightXTarget, {
    stiffness: 140,
    damping: 26,
    mass: 0.8,
  });
  const lightY = useSpring(lightYTarget, {
    stiffness: 140,
    damping: 26,
    mass: 0.8,
  });
  const coverTransform =
    useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  const sheenBackground =
    useMotionTemplate`radial-gradient(ellipse 34% 24% at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.035) 48%, transparent 100%)`;
  const shelfRotation = Number.parseFloat(song.rotation);
  const shelfOffset = Number.parseFloat(song.offset);
  const artworkSrc = `/album/${encodeURIComponent(song.fileName)}`;

  const resetPointerMotion = useCallback(() => {
    setPointerActive(false);
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    lightXTarget.set(50);
    lightYTarget.set(50);
  }, [lightXTarget, lightYTarget, rotateXTarget, rotateYTarget]);

  return (
    <motion.li
      className={styles.record}
      data-pointer-active={pointerActive ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      layout
      layoutDependency={hasSelection}
      initial={false}
      animate={{
        rotate: hasSelection ? 0 : shelfRotation,
        y: hasSelection ? 0 : shelfOffset,
      }}
      transition={{
        layout: ALBUM_SPACE_TRANSITION,
        rotate: ALBUM_SPACE_TRANSITION,
        y: ALBUM_SPACE_TRANSITION,
      }}
    >
      <motion.div
        className={styles.recordSelectionMotion}
        animate={{
          opacity: hasSelection && !selected ? 0.76 : 1,
        }}
        transition={{ duration: reduceMotion ? 0.16 : 0.18, ease: "easeOut" }}
      >
        <button
          className={styles.recordButton}
          type="button"
          aria-label={
            selected
              ? `Stop the visual playback of ${song.title} by ${song.artist}`
              : `Select ${song.title} by ${song.artist}`
          }
          aria-expanded={selected}
          aria-controls="favorite-song-now-playing"
          onClick={(event) => {
            const restoreFocus = event.detail === 0;

            setPointerActive(false);
            rotateXTarget.jump(0);
            rotateYTarget.jump(0);
            lightXTarget.jump(50);
            lightYTarget.jump(50);
            if (!restoreFocus) event.currentTarget.blur();
            onSelect(index, event.currentTarget, restoreFocus);
          }}
          onPointerEnter={(event) => {
            if (reduceMotion || event.pointerType === "touch") return;

            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;

            lightXTarget.jump(x * 100);
            lightYTarget.jump(y * 100);
            setPointerActive(true);
          }}
          onPointerMove={(event) => {
            if (reduceMotion || event.pointerType === "touch") return;

            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;

            rotateXTarget.set((0.5 - y) * 7);
            rotateYTarget.set((x - 0.5) * 9);
            lightXTarget.set(x * 100);
            lightYTarget.set(y * 100);
          }}
          onPointerLeave={resetPointerMotion}
          onPointerCancel={resetPointerMotion}
        >
          <motion.div
            className={styles.recordArtworkTransition}
            layout
            layoutDependency={hasSelection}
            layoutId={
              reduceMotion ? undefined : `favorite-album-${song.id}`
            }
            transition={ALBUM_SPACE_TRANSITION}
          >
            <motion.div
              className={styles.recordSleeve}
              style={{ transform: coverTransform }}
            >
              <Image
                src={artworkSrc}
                alt={`${song.title} artwork`}
                fill
                unoptimized
                sizes="(max-width: 720px) 62vw, (max-width: 1100px) 30vw, 220px"
              />
              <motion.span
                className={styles.recordSheen}
                style={{ background: sheenBackground }}
                aria-hidden="true"
              />
            </motion.div>
          </motion.div>
        </button>
        <div className={styles.songDetails}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{song.title}</strong>
            <small>{song.artist}</small>
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}

function AlbumNowPlaying({
  song,
  index,
  reduceMotion,
  onClose,
}: {
  song: FavoriteSong;
  index: number;
  reduceMotion: boolean;
  onClose: () => void;
}) {
  const titleId = `favorite-now-playing-title-${song.id}`;
  const artworkSrc = `/album/${encodeURIComponent(song.fileName)}`;

  return (
    <motion.article
      className={styles.nowPlaying}
      role="region"
      aria-labelledby={titleId}
      initial={{ opacity: reduceMotion ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reduceMotion ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0.16 : 0 }}
    >
      <motion.div
        className={styles.nowPlayingAtmosphere}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{
          opacity: 0,
          transition: { duration: reduceMotion ? 0.12 : 0.18 },
        }}
        transition={{
          delay: reduceMotion ? 0 : 0.22,
          duration: reduceMotion ? 0.16 : 0.46,
          ease: [0.23, 1, 0.32, 1],
        }}
        aria-hidden="true"
      >
        <Image src={artworkSrc} alt="" fill unoptimized sizes="100vw" />
      </motion.div>

      <div className={styles.nowPlayingRecord}>
        <motion.div
          className={styles.nowPlayingStatus}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduceMotion ? 0.12 : 0.16 },
          }}
          transition={{
            delay: reduceMotion ? 0 : 0.28,
            duration: reduceMotion ? 0.16 : 0.3,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <span className={styles.nowPlayingEqualizer} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Now playing</span>
          <span>Track {String(index + 1).padStart(2, "0")}</span>
        </motion.div>

        <motion.div
          className={styles.nowPlayingArtwork}
          layoutId={reduceMotion ? undefined : `favorite-album-${song.id}`}
          transition={ALBUM_SPACE_TRANSITION}
        >
          <Image
            src={artworkSrc}
            alt={`${song.title} artwork`}
            fill
            unoptimized
            sizes="(max-width: 720px) 76vw, 390px"
          />
          <span className={styles.nowPlayingArtworkLight} aria-hidden="true" />
        </motion.div>

        <motion.header
          className={styles.nowPlayingMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduceMotion ? 0.12 : 0.16 },
          }}
          transition={{
            delay: reduceMotion ? 0 : 0.3,
            duration: reduceMotion ? 0.16 : 0.32,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <h3 id={titleId}>{song.title}</h3>
          <p>{song.artist}</p>
        </motion.header>
      </div>

      <motion.div
        className={styles.nowPlayingLyricColumn}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: reduceMotion ? 0.12 : 0.16 },
        }}
        transition={{
          delay: reduceMotion ? 0 : 0.38,
          duration: reduceMotion ? 0.16 : 0.38,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <blockquote className={styles.nowPlayingLyric}>
          <span className={styles.nowPlayingLyricLabel}>Favorite lyric</span>
          {song.favoriteLyric?.length ? (
            song.favoriteLyric.map((line) => <p key={line}>{line}</p>)
          ) : (
            <>
              <p>Favorite lyric to be added.</p>
              <small>
                This space is ready for the lines you want to keep from this
                record.
              </small>
            </>
          )}
        </blockquote>

        <button
          className={styles.nowPlayingClose}
          type="button"
          onClick={onClose}
          aria-label={`Stop the visual playback of ${song.title}`}
        >
          <span aria-hidden="true">←</span>
          <span>Back to the shelf</span>
        </button>
      </motion.div>
    </motion.article>
  );
}

export function HomepageFavorites() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      id="homepage-favorites"
      className={styles.favorites}
      aria-labelledby="homepage-favorites-title"
    >
      <div className={styles.content}>
        <motion.h2
          id="homepage-favorites-title"
          className={styles.heading}
        >
          A few of my favorite things.
        </motion.h2>

        <motion.div className={styles.deskEntrance}>
          <FavoritesStickerShowcase
            logos={FAVORITE_LOGOS}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </div>
    </section>
  );
}

export function HomepageFavoriteSongs() {
  const reduceMotion = useReducedMotion() ?? false;
  const { initial, visible } = useEntranceMotion(reduceMotion);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const preservedScrollYRef = useRef<number | null>(null);
  const selectedSong =
    selectedIndex === null ? null : FAVORITE_SONGS[selectedIndex];

  const preserveViewport = useCallback(() => {
    preservedScrollYRef.current = window.scrollY;
  }, []);

  const closeAlbum = useCallback(() => {
    preserveViewport();
    setSelectedIndex(null);
    window.requestAnimationFrame(() => {
      openerRef.current?.focus({ preventScroll: true });
    });
  }, [preserveViewport]);

  useLayoutEffect(() => {
    const preservedScrollY = preservedScrollYRef.current;
    if (preservedScrollY === null) return;

    window.scrollTo(window.scrollX, preservedScrollY);
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(window.scrollX, preservedScrollY);
      preservedScrollYRef.current = null;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAlbum();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAlbum, selectedIndex]);

  return (
    <section
      id="homepage-songs"
      className={styles.songs}
      aria-labelledby="homepage-songs-title"
    >
      <div className={styles.songsContent}>
        <motion.header
          className={styles.songsHeader}
          initial={initial}
          whileInView={visible}
          viewport={{ once: true, amount: 0.7 }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.72,
            ease: FADE_UP_EASE,
          }}
        >
          <span>NOW SPINNING · PERSONAL SELECTION</span>
          <h2 id="homepage-songs-title">Songs I keep on repeat.</h2>
        </motion.header>

        <LayoutGroup id="favorite-album-playback">
          <motion.div
            className={styles.songsStage}
            data-playing={selectedSong ? "true" : "false"}
            layout
            transition={ALBUM_SPACE_TRANSITION}
          >
            <motion.ol
              className={styles.recordWall}
              data-has-selection={selectedSong ? "true" : "false"}
              aria-label="A wall of favorite songs"
              layout
              initial={initial}
              whileInView={visible}
              viewport={{ once: true, amount: 0.22 }}
              transition={{
                layout: ALBUM_SPACE_TRANSITION,
                delay: reduceMotion ? 0 : 0.08,
                duration: reduceMotion ? 0.2 : 0.8,
                ease: FADE_UP_EASE,
              }}
            >
              {FAVORITE_SONGS.map((song, index) => (
                <FavoriteSongRecord
                  song={song}
                  index={index}
                  selected={selectedIndex === index}
                  hasSelection={selectedIndex !== null}
                  reduceMotion={reduceMotion}
                  onSelect={(nextIndex, trigger, restoreFocus) => {
                    preserveViewport();
                    openerRef.current = restoreFocus ? trigger : null;
                    setSelectedIndex((currentIndex) =>
                      currentIndex === nextIndex ? null : nextIndex,
                    );
                  }}
                  key={song.id}
                />
              ))}
            </motion.ol>

            <AnimatePresence initial={false} mode="popLayout">
              {selectedSong && selectedIndex !== null && (
                <motion.div
                  id="favorite-song-now-playing"
                  className={styles.nowPlayingViewport}
                  layout
                  initial={{ opacity: reduceMotion ? 0 : 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: reduceMotion ? 0 : 1 }}
                  transition={{
                    layout: ALBUM_SPACE_TRANSITION,
                    opacity: { duration: 0.16, ease: "easeOut" },
                  }}
                  key="favorite-song-now-playing"
                >
                  <AnimatePresence initial={false} mode="sync">
                    <AlbumNowPlaying
                      song={selectedSong}
                      index={selectedIndex}
                      reduceMotion={reduceMotion}
                      onClose={closeAlbum}
                      key={selectedSong.id}
                    />
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
