"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./HomepageFavorites.module.css";

type FavoriteLogo = {
  name: string;
  src: string;
  width: string;
  height: string;
  maskMode?: "alpha" | "luminance";
};

type LogoStyle = CSSProperties & {
  "--favorite-logo-image": string;
  "--favorite-logo-width": string;
  "--favorite-logo-height": string;
  "--favorite-logo-mask-mode"?: FavoriteLogo["maskMode"];
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
    name: "Aqours Finale Live",
    src: "/logo_svg/aqours-finale-live.svg",
    width: "82%",
    height: "66%",
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
  {
    name: "Nanchang Hangkong University",
    src: "/logo_svg/nanchang-hangkong-university.svg",
    width: "38%",
    height: "82%",
  },
];

const FADE_UP_EASE = [0.23, 1, 0.32, 1] as const;
const ALBUM_SPACE_TRANSITION = {
  type: "spring",
  duration: 0.52,
  bounce: 0,
} as const;
const CAROUSEL_STEP_DURATION = 2_000;
const CAROUSEL_STEP_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
let carouselTimelineOrigin: number | null = null;

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

function LogoSequence({
  logos,
  duplicate = false,
}: {
  logos: FavoriteLogo[];
  duplicate?: boolean;
}) {
  return (
    <ul className={styles.logoGroup} aria-hidden={duplicate || undefined}>
      {logos.map((logo) => {
        const logoStyle: LogoStyle = {
          "--favorite-logo-image": `url("${encodeURI(logo.src)}")`,
          "--favorite-logo-width": logo.width,
          "--favorite-logo-height": logo.height,
          "--favorite-logo-mask-mode": logo.maskMode,
        };

        return (
          <li className={styles.logoItem} key={logo.name}>
            <span
              className={styles.logoMark}
              style={logoStyle}
              aria-hidden="true"
            />
            {!duplicate && <span className={styles.srOnly}>{logo.name}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function LogoMarquee({
  label,
  logos,
  direction,
  reduceMotion,
  isActive,
}: {
  label: string;
  logos: FavoriteLogo[];
  direction: "left" | "right";
  reduceMotion: boolean;
  isActive: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduceMotion) return;

    const stepCount = logos.length;
    const keyframes = Array.from({ length: stepCount + 1 }, (_, step) => {
      const progress = step / stepCount;
      const translateX =
        direction === "left" ? -50 * progress : -50 * (1 - progress);

      return {
        transform: `translate3d(${translateX}%, 0, 0)`,
        easing: CAROUSEL_STEP_EASE,
      };
    });
    const animation = track.animate(keyframes, {
      duration: stepCount * CAROUSEL_STEP_DURATION,
      fill: "both",
      iterations: Infinity,
    });
    const initialStep = direction === "left" ? 2 : 5;
    const timelineNow = document.timeline.currentTime;
    let timelineElapsed = 0;

    if (typeof timelineNow === "number") {
      carouselTimelineOrigin ??= timelineNow;
      timelineElapsed = timelineNow - carouselTimelineOrigin;
    }

    animation.pause();
    animation.currentTime =
      (initialStep % stepCount) * CAROUSEL_STEP_DURATION + timelineElapsed;
    animationRef.current = animation;

    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [direction, logos.length, reduceMotion]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || reduceMotion) return;

    if (isActive) {
      animation.play();
    } else {
      animation.pause();
    }
  }, [isActive, reduceMotion]);

  return (
    <div className={styles.marqueeRow} aria-label={label}>
      <div
        ref={trackRef}
        className={styles.marqueeTrack}
        data-direction={direction}
      >
        <LogoSequence logos={logos} />
        <LogoSequence logos={logos} duplicate />
      </div>
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
    useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.07) 24%, transparent 52%)`;
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
            if (event.pointerType !== "touch") setPointerActive(true);
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
  const marqueesRef = useRef<HTMLDivElement>(null);
  const marqueesInView = useInView(marqueesRef, { amount: 0.05 });
  const { initial, visible } = useEntranceMotion(reduceMotion);

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
          initial={initial}
          whileInView={visible}
          viewport={{ once: true, amount: 0.7 }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.72,
            ease: FADE_UP_EASE,
          }}
        >
          A few of my favorite things.
        </motion.h2>

        <motion.div
          ref={marqueesRef}
          className={styles.marquees}
          initial={initial}
          whileInView={visible}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            delay: reduceMotion ? 0 : 0.12,
            duration: reduceMotion ? 0.2 : 0.78,
            ease: FADE_UP_EASE,
          }}
        >
          <LogoMarquee
            label="Favorite technology, creative tools, and culture"
            logos={TECHNOLOGY_LOGOS}
            direction="left"
            reduceMotion={reduceMotion}
            isActive={marqueesInView}
          />
          <LogoMarquee
            label="Favorite culture, entertainment, services, and institutions"
            logos={CULTURE_LOGOS}
            direction="right"
            reduceMotion={reduceMotion}
            isActive={marqueesInView}
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
