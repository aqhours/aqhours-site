"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";

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
const CAROUSEL_STEP_DURATION = 2_000;
const CAROUSEL_STEP_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
let carouselTimelineOrigin: number | null = null;

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

export function HomepageFavorites() {
  const reduceMotion = useReducedMotion() ?? false;
  const marqueesRef = useRef<HTMLDivElement>(null);
  const marqueesInView = useInView(marqueesRef, { amount: 0.05 });
  const initial = {
    opacity: 0,
    transform: reduceMotion
      ? "translate3d(0, 0, 0)"
      : "translate3d(0, 24px, 0)",
  };
  const visible = {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
  };

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
            delay: reduceMotion ? 0 : 0.08,
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
