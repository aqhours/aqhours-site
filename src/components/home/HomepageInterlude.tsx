"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

import { sfProCompressed } from "@/app/fonts";
import styles from "./HomepageInterlude.module.css";

type EducationLineProps = {
  children: string;
  progress: MotionValue<number>;
  entranceRange: [number, number];
  reduceMotion: boolean;
};

function EducationLine({
  children,
  progress,
  entranceRange,
  reduceMotion,
}: EducationLineProps) {
  const entranceProgress = useTransform(
    progress,
    entranceRange,
    [0, 1],
    { clamp: true },
  );
  const transform = useTransform(
    entranceProgress,
    [0, 0.72, 1],
    [
      "translate3d(0, 100%, 0)",
      "translate3d(0, 0%, 0)",
      "translate3d(0, 0%, 0)",
    ],
  );
  const maskImage = useTransform(entranceProgress, (value) => {
    const transparentStop = 100 - value * 145;
    const solidStop = 100 - value * 100;

    return `linear-gradient(to bottom, transparent ${transparentStop}%, black ${solidStop}%)`;
  });

  return (
    <motion.span
      className={styles.line}
      style={{
        transform: reduceMotion ? "translate3d(0, 0%, 0)" : transform,
      }}
    >
      <span className={styles.lineBase}>{children}</span>
      <motion.span
        className={styles.lineClone}
        style={{
          maskImage: reduceMotion ? "none" : maskImage,
          WebkitMaskImage: reduceMotion ? "none" : maskImage,
        }}
        aria-hidden="true"
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

export function HomepageInterlude() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      id="homepage-interlude"
      className={styles.screen}
      aria-labelledby="homepage-interlude-title"
    >
      <h2
        id="homepage-interlude-title"
        className={`${styles.education} ${sfProCompressed.className}`}
        aria-label="Bachelor of Science in Computer Science and Technology earned; Master of Science student in the same field"
      >
        <EducationLine
          progress={scrollYProgress}
          // entranceRange={[0.11, 0.28]}
          entranceRange={[0.15 , 0.32]}
          reduceMotion={reduceMotion}
        >
          COMPUTER SCIENCE.
        </EducationLine>
        <EducationLine
          progress={scrollYProgress}
          entranceRange={[0.22, 0.39]}
          reduceMotion={reduceMotion}
        >
          B.S. EARNED.
        </EducationLine>
        <EducationLine
          progress={scrollYProgress}
          entranceRange={[0.30, 0.42]}
          reduceMotion={reduceMotion}
        >
          M.S. STUDENT.
        </EducationLine>
      </h2>
    </section>
  );
}
