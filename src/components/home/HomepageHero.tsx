"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CollageLayer } from "./CollageLayer";
import { KineticHourglass } from "./KineticHourglass";
import { WaveRibbons } from "./WaveRibbons";

const navigation = ["Link 01", "Link 02", "Link 03", "Link 04"];

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
  const isCompact = useCompactViewport();
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const hourglassProfile = shouldReduceMotion
    ? {
        input: [0, 1],
        x: ["0vw", "0vw"],
        y: [isCompact ? "-16vh" : "0vh", isCompact ? "-16vh" : "0vh"],
        rotate: ["0deg", "0deg"],
        scale: [isCompact ? 0.76 : 0.8, isCompact ? 0.76 : 0.8],
      }
    : isCompact
      ? {
          input: [0, 0.7, 1],
          x: ["-4vw", "-1vw", "0vw"],
          y: ["-1vh", "-9vh", "-16vh"],
          rotate: ["-28deg", "-10deg", "0deg"],
          scale: [1.58, 1.14, 0.76],
        }
      : {
          input: [0, 0.72, 1],
          x: ["7vw", "4vw", "0vw"],
          y: ["0vh", "0vh", "0vh"],
          rotate: ["-28deg", "-9deg", "0deg"],
          scale: [2.18, 1.34, 0.8],
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

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A43]">
      <section ref={sceneRef} className="relative h-[200vh] bg-[#F7FBFF]">
        <span id="about" className="absolute top-[100vh]" aria-hidden="true" />
        <div className="sticky top-0 h-[100vh] min-h-[640px] overflow-hidden bg-[#F7FBFF] sm:min-h-[720px]">
          <div className="absolute inset-0 bg-[linear-gradient(116deg,#FFFFFF_0%,#F7FBFF_34%,#E9F8FF_66%,#FFFFFF_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(255,209,102,0.18),transparent_28%),radial-gradient(circle_at_86%_30%,rgba(94,234,212,0.2),transparent_30%),radial-gradient(circle_at_60%_90%,rgba(255,138,101,0.15),transparent_26%)]" />
          <div className="hero-dotted-grid absolute inset-x-0 top-16 h-[66vh] opacity-30" />

          <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-end px-4 py-4 sm:px-8 lg:px-10">
            <nav className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A5486] sm:flex sm:gap-2 sm:text-[11px]">
              {navigation.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="liquid-glass inline-flex items-center justify-center rounded-full px-3 py-1.5 transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] sm:px-3.5"
                >
                  <span>{item}</span>
                </a>
              ))}
            </nav>
          </header>

          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20"
            style={{ transform: hourglassTransform, willChange: "transform" }}
            aria-hidden="true"
          >
            <KineticHourglass intro={false} />
          </motion.div>

          <motion.div
            className={[
              "absolute left-1/2 top-[14vh] z-40 flex w-[min(91vw,640px)] -translate-x-1/2 flex-col items-center text-center transition-opacity duration-300 ease-[var(--ease-out)] md:left-[6vw] md:top-[17vh] md:w-[610px] md:translate-x-0 md:items-start md:text-left lg:left-[7vw]",
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
