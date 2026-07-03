"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CollageLayer } from "./CollageLayer";
import { KineticHourglass } from "./KineticHourglass";
import { WaveRibbons } from "./WaveRibbons";

const aboutStats = ["About 01", "About 02", "About 03"];

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsCompact(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  return isCompact;
}

export function HomepageHero() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const isCompact = useCompactViewport();
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  const hourglassProfile = shouldReduceMotion
    ? {
        input: [0, 1],
        x: ["0vw", "0vw"],
        y: [isCompact ? "-16vh" : "0vh", isCompact ? "-16vh" : "0vh"],
        rotate: ["0deg", "0deg"],
        scale: [isCompact ? 0.72 : 0.78, isCompact ? 0.72 : 0.78],
      }
    : isCompact
      ? {
          input: [0, 0.62, 1],
          x: ["-4vw", "11vw", "25vw"],
          y: ["-1vh", "-8vh", "-15vh"],
          rotate: ["-28deg", "86deg", "180deg"],
          scale: [1.42, 1.02, 0.72],
        }
      : {
          input: [0, 0.62, 1],
          x: ["7vw", "15vw", "27vw"],
          y: ["0vh", "0vh", "0vh"],
          rotate: ["-28deg", "86deg", "180deg"],
          scale: [1.92, 1.2, 0.78],
        };

  const hourglassX = useTransform(scrollYProgress, hourglassProfile.input, hourglassProfile.x);
  const hourglassY = useTransform(scrollYProgress, hourglassProfile.input, hourglassProfile.y);
  const hourglassRotate = useTransform(scrollYProgress, hourglassProfile.input, hourglassProfile.rotate);
  const hourglassScale = useTransform(scrollYProgress, hourglassProfile.input, hourglassProfile.scale);
  const hourglassTransform = useMotionTemplate`translate3d(calc(-50% + ${hourglassX}), calc(-50% + ${hourglassY}), 0) rotate(${hourglassRotate}) scale(${hourglassScale})`;

  const collageOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 0.35, 0.22]);
  const waveOpacity = useTransform(scrollYProgress, [0, 0.62, 1], [1, 0.92, 0.74]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsIntroVisible(latest < 0.48);
    setIsAboutVisible(latest > 0.5);
  });

  const handleExploreClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const aboutTarget = document.getElementById("about");
    if (!aboutTarget) return;

    const startY = window.scrollY;
    const targetY = aboutTarget.getBoundingClientRect().top + window.scrollY;
    const distance = targetY - startY;

    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    if (shouldReduceMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const duration = 1850;
    const startedAt = performance.now();
    const easeOutSoft = (progress: number) => 1 - Math.pow(1 - progress, 1.65);

    const animateScroll = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      window.scrollTo(0, startY + distance * easeOutSoft(progress));

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationRef.current = null;
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  };

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A43]">
      <section ref={sceneRef} className="relative h-[200vh] bg-[#F7FBFF]">
        <span id="about" className="absolute top-[100vh]" aria-hidden="true" />
        <div className="sticky top-0 h-[100vh] min-h-[640px] overflow-hidden bg-[#F7FBFF] sm:min-h-[720px]">
          <div className="absolute inset-0 bg-[linear-gradient(116deg,#FFFFFF_0%,#F7FBFF_34%,#E9F8FF_66%,#FFFFFF_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(255,209,102,0.18),transparent_28%),radial-gradient(circle_at_86%_30%,rgba(94,234,212,0.2),transparent_30%),radial-gradient(circle_at_60%_90%,rgba(255,138,101,0.15),transparent_26%)]" />
          <div className="hero-dotted-grid absolute inset-x-0 top-16 h-[66vh] opacity-30" />

          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20"
            style={{ transform: hourglassTransform, willChange: "transform" }}
            aria-hidden="true"
          >
            <KineticHourglass intro={false} />
          </motion.div>

          <motion.div
            className={[
              "absolute bottom-[26vh] left-5 z-40 flex w-[min(88vw,620px)] flex-col items-start text-left transition-opacity duration-300 ease-[var(--ease-out)] sm:left-8 md:bottom-[25vh] md:left-[6vw] md:w-[610px] lg:left-[7vw]",
              isIntroVisible ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <h1 className="hero-serif text-[clamp(1.32rem,5.25vw,1.86rem)] font-bold leading-[1.24] tracking-normal text-[#26062F] md:text-[clamp(2rem,3.15vw,2.9rem)]">
              <span className="block whitespace-nowrap">与你相伴的时光</span>
              <span className="block whitespace-nowrap">如此珍贵 如此难忘</span>
              <span className="block whitespace-nowrap">想要紧紧抱着不愿放手</span>
            </h1>
            <div className="mt-5 flex items-center">
              <a
                href="#about"
                onClick={handleExploreClick}
                className="liquid-glass inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A5486] transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] sm:px-[18px] sm:py-2.5 sm:text-xs"
              >
                <span>Explore</span>
              </a>
            </div>
          </motion.div>

          <motion.div className="pointer-events-none absolute inset-0 z-30" style={{ opacity: collageOpacity }}>
            <CollageLayer />
          </motion.div>

          <motion.section
            aria-labelledby="about-heading"
            className={[
              "pointer-events-none absolute inset-0 z-40 px-5 transition-opacity duration-300 ease-[var(--ease-out)] sm:px-8 lg:px-10",
              isAboutVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <div className="relative flex h-full items-end justify-center pb-[7vh] md:items-center md:justify-start md:pb-0">
              <div className="liquid-glass w-[min(92vw,430px)] rounded-[28px] px-5 py-5 text-[#102A43] shadow-[0_18px_50px_rgba(0,157,255,0.12)] sm:px-6 sm:py-6 md:ml-[6vw] lg:ml-[7vw]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A5486]">About</p>
                  <h2 id="about-heading" className="hero-serif mt-2 text-[clamp(1.65rem,7vw,2.35rem)] font-bold leading-tight text-[#26062F] md:text-[2.6rem]">
                    关于我
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#102A43]/78 sm:text-[15px]">
                    这里暂时放关于我的占位内容。之后可以替换成个人介绍、创作方向、时间线或任何你想表达的故事。
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {aboutStats.map((item) => (
                      <div key={item} className="rounded-2xl border border-[#AEE4F8]/70 bg-white/38 px-3 py-2 text-xs font-semibold text-[#0A5486]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: waveOpacity }}>
            <WaveRibbons />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
