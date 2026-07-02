"use client";

import { motion } from "motion/react";
import { CollageLayer } from "./CollageLayer";
import { KineticHourglass } from "./KineticHourglass";
import { WaveRibbons } from "./WaveRibbons";

const navigation = ["Link 01", "Link 02", "Link 03", "Link 04"];

export function HomepageHero() {
  return (
    <main className="min-h-screen bg-[#F7FBFF]">
      <section className="relative h-[100vh] min-h-[640px] overflow-hidden bg-[#F7FBFF] sm:min-h-[720px]">
        <div className="absolute inset-0 bg-[linear-gradient(116deg,#FFFFFF_0%,#F7FBFF_36%,#E9F8FF_66%,#FFFFFF_100%)]" />
        <div className="hero-dotted-grid absolute inset-x-0 top-16 h-[66vh] opacity-35" />

        <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-end px-4 py-4 text-[#102A43] sm:px-8 lg:px-10">
          <nav className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A5486] sm:flex sm:gap-2 sm:text-[11px]">
            {navigation.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-full border border-[#AEE4F8]/75 bg-white/55 px-3 py-1.5 shadow-[0_8px_22px_rgba(0,157,255,0.06)] backdrop-blur transition-transform duration-150 active:scale-[0.97] sm:px-3.5"
              >
                {item}
              </a>
            ))}
          </nav>
        </header>

        <div className="absolute left-1/2 top-[53%] z-20 -translate-x-1/2 -translate-y-1/2 lg:left-[66%]">
          <KineticHourglass />
        </div>

        <motion.div
          className="absolute left-1/2 top-[18vh] z-40 flex w-[min(92vw,680px)] -translate-x-1/2 flex-col items-center text-center md:left-[7vw] md:top-[26vh] md:w-[640px] md:translate-x-0 md:items-start md:text-left lg:left-[8vw] lg:top-[26vh]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          <h1 className="hero-serif text-[clamp(1.42rem,6vw,2rem)] font-bold leading-[1.22] tracking-normal text-[#26062F] md:text-[clamp(2.05rem,3.35vw,3rem)]">
            <span className="block whitespace-nowrap">与你相伴的时光</span>
            <span className="block whitespace-nowrap">如此珍贵 如此难忘</span>
            <span className="block whitespace-nowrap">想要紧紧抱着不愿放手</span>
          </h1>
          <div className="mt-5 flex items-center">
            <a
              href="#"
              className="rounded-full border border-[#AEE4F8]/85 bg-white/58 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A5486] shadow-[0_8px_20px_rgba(0,157,255,0.08)] backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-xs"
            >
              Explore
            </a>
          </div>
        </motion.div>

        <CollageLayer />
        <WaveRibbons />
      </section>
    </main>
  );
}
