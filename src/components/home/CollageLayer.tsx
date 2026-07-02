"use client";

import { motion } from "motion/react";

const sparkles = [
  "left-[21%] top-[13%] text-[#12C7FF] scale-75",
  "right-[18%] top-[16%] text-[#FFD166] scale-110",
  "left-[8%] bottom-[34%] text-[#5EEAD4] scale-100",
  "right-[24%] bottom-[21%] hidden text-[#FFD166] scale-75 md:block",
];

function Sparkle({ className, index }: { className: string; index: number }) {
  return (
    <motion.svg
      className={`absolute h-8 w-8 ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
      animate={{
        opacity: [0.55, 1, 0.55],
        scale: [0.82, 1, 0.82],
        rotate: [-8, 8, -8],
      }}
      transition={{ duration: 3.8 + index * 0.32, repeat: Infinity, ease: "easeInOut", delay: index * 0.16 }}
      aria-hidden="true"
    >
      <path d="M16 2.8L18.9 12.9L29.2 16L18.9 19.1L16 29.2L13.1 19.1L2.8 16L13.1 12.9L16 2.8Z" fill="currentColor" />
      <circle cx="24" cy="7.5" r="2" fill="currentColor" opacity="0.74" />
    </motion.svg>
  );
}

export function CollageLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {sparkles.map((className, index) => (
        <Sparkle key={className} className={className} index={index} />
      ))}
    </div>
  );
}
