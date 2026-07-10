"use client";

import { type PointerEvent, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";

export function LiquidIdentity() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const highlightXTarget = useMotionValue(0);
  const highlightYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, { stiffness: 150, damping: 22, mass: 0.7 });
  const rotateY = useSpring(rotateYTarget, { stiffness: 150, damping: 22, mass: 0.7 });
  const highlightX = useSpring(highlightXTarget, { stiffness: 120, damping: 20, mass: 0.7 });
  const highlightY = useSpring(highlightYTarget, { stiffness: 120, damping: 20, mass: 0.7 });
  const cardTransform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  const highlightTransform = useMotionTemplate`translate3d(${highlightX}px, ${highlightY}px, 0)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType === "touch") return;

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    rotateXTarget.set(y * -7);
    rotateYTarget.set(x * 7);
    highlightXTarget.set(x * 34);
    highlightYTarget.set(y * 34);
  };

  const resetPointer = () => {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    highlightXTarget.set(0);
    highlightYTarget.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="identity-art"
      style={{ transform: shouldReduceMotion ? "none" : cardTransform }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="identity-aurora identity-aurora-blue" aria-hidden="true" />
      <div className="identity-aurora identity-aurora-rose" aria-hidden="true" />
      <motion.div className="identity-highlight" style={{ transform: highlightTransform }} aria-hidden="true" />

      <div className="identity-topline">
        <span>AQHOURS / PERSONAL SYSTEM</span>
        <i>∞</i>
      </div>

      <div className="identity-center">
        <div className="liquid-symbol" aria-hidden="true">
          <span className="liquid-lens liquid-lens-left" />
          <span className="liquid-lens liquid-lens-right" />
          <span className="liquid-neck" />
          <span className="liquid-shine" />
        </div>
        <div className="identity-name">
          <strong>AQ</strong>
          <span>HOURS</span>
        </div>
      </div>

      <div className="identity-orbit identity-orbit-one" aria-hidden="true" />
      <div className="identity-orbit identity-orbit-two" aria-hidden="true" />

      <div className="identity-facts">
        <span className="floating-fact floating-fact-place">NANCHANG</span>
        <span className="floating-fact floating-fact-create">CREATE</span>
        <span className="floating-fact floating-fact-album">ALBUM MODE</span>
      </div>

      <div className="identity-bottomline">
        <span>COMPUTER SCIENCE</span>
        <span>100,000 MIN / YEAR</span>
      </div>
    </motion.div>
  );
}
