"use client";

import { useEffect, useRef } from "react";
import { motion, type MotionValue, useReducedMotion } from "motion/react";

type Particle = {
  lane: number;
  y: number;
  speed: number;
  size: number;
  phase: number;
  twinkle: number;
  depth: number;
  spin: number;
  kind: "dot" | "star" | "shard";
  hue: "blue" | "sea" | "yellow" | "mint" | "coral";
};

const colors = {
  blue: "0, 157, 255",
  sea: "18, 199, 255",
  yellow: "255, 209, 102",
  mint: "94, 234, 212",
  coral: "255, 138, 101",
};

function halfWidthForY(y: number) {
  const topHalf = 0.35;
  const waistHalf = 0.035;
  const distanceFromWaist = Math.abs(y - 0.5) / 0.5;
  return waistHalf + (topHalf - waistHalf) * Math.max(0, Math.min(1, distanceFromWaist));
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const length = i % 2 === 0 ? radius : radius * 0.38;
    const px = x + Math.cos(angle) * length;
    const py = y + Math.sin(angle) * length;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.3);
  ctx.lineTo(radius * 0.55, -radius * 0.1);
  ctx.lineTo(0, radius * 1.25);
  ctx.lineTo(-radius * 0.48, radius * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function wrapProgress(value: number) {
  return ((value % 1) + 1) % 1;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const kind = index % 11 === 0 ? "shard" : index % 7 === 0 ? "star" : "dot";
    const hue = index % 29 === 0 ? "coral" : index % 17 === 0 ? "mint" : index % 11 === 0 ? "yellow" : index % 3 === 0 ? "sea" : "blue";

    return {
      lane: Math.random() * 2 - 1,
      y: Math.random(),
      speed: 0.014 + Math.random() * 0.028,
      size: kind === "dot" ? 1.4 + Math.random() * 3.1 : 2.1 + Math.random() * 2.7,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.55 + Math.random() * 0.45,
      depth: 0.55 + Math.random() * 0.65,
      spin: Math.random() * Math.PI * 2,
      kind,
      hue,
    };
  });
}

function useHourglassCanvas(flowDirection?: MotionValue<number>, rotationDegrees?: MotionValue<number>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = createParticles(42);
    let frame = 0;
    let previousTime = performance.now();
    let animationId = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const delta = Math.min(48, time - previousTime);
      previousTime = time;
      frame += delta * 0.001;
      const rawFlowDirection = flowDirection?.get() ?? 1;
      const rotationRadians = (((rotationDegrees?.get() ?? 0) * Math.PI) / 180) % (Math.PI * 2);
      const flowMagnitude = Math.abs(Math.max(-1, Math.min(1, rawFlowDirection)));
      const uprightness = Math.abs(Math.cos(rotationRadians));
      const gravityFlow = Math.max(0, Math.min(1, (uprightness - 0.08) / 0.42)) * flowMagnitude;
      const surfaceFrame = frame * (0.35 + gravityFlow * 0.65);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      gradient.addColorStop(0.42, "rgba(18, 199, 255, 0.08)");
      gradient.addColorStop(0.52, "rgba(255, 209, 102, 0.055)");
      gradient.addColorStop(1, "rgba(0, 157, 255, 0.2)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-rotationRadians);
      ctx.translate(-width / 2, -height / 2);

      for (let band = 0; band < 3; band += 1) {
        ctx.beginPath();
        const baseY = height * (0.16 + band * 0.16);
        let started = false;
        for (let x = width * 0.16; x <= width * 0.84; x += 12) {
          const wave = Math.sin(x * 0.017 + surfaceFrame * 0.72 + band * 1.3) * (4.5 + gravityFlow * (3.2 + band * 1.4));
          const taper = Math.sin((x / width) * Math.PI);
          const y = baseY + wave * taper;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = `rgba(18, 199, 255, ${0.09 - band * 0.018})`;
        ctx.lineWidth = 1 + band * 0.38;
        ctx.stroke();
      }

      for (let layer = 0; layer < 3; layer += 1) {
        const baseY = height * (0.69 + layer * 0.055);
        ctx.beginPath();
        ctx.moveTo(width * 0.16, height);
        ctx.lineTo(width * 0.16, baseY);
        for (let x = width * 0.16; x <= width * 0.84; x += 10) {
          const taper = Math.sin((x / width) * Math.PI);
          const y = baseY + Math.sin(x * 0.022 + surfaceFrame * (0.9 + layer * 0.18)) * (4.5 + gravityFlow * (5 - layer * 1.2)) * taper;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width * 0.84, height);
        ctx.closePath();
        ctx.fillStyle =
          layer === 0 ? "rgba(18, 199, 255, 0.16)" : layer === 1 ? "rgba(94, 234, 212, 0.13)" : "rgba(255, 138, 101, 0.18)";
        ctx.fill();
      }

      ctx.lineCap = "round";
      for (let stream = 0; stream < 6; stream += 1) {
        const offset = wrapProgress(frame * 0.08 + stream * 0.13) * 0.27 - 0.135;
        const streamY = height * (0.5 + offset);
        const x = width * (0.5 + Math.sin(frame * 1.4 + stream) * 0.01);
        const alpha = (0.2 + (1 - Math.abs(offset) / 0.135) * 0.4) * gravityFlow;
        if (alpha <= 0.02) continue;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.72})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x, streamY - 8);
        ctx.lineTo(x + Math.sin(stream) * 2, streamY + 9);
        ctx.stroke();
      }

      particles.forEach((particle) => {
        if (!shouldReduceMotion) {
          particle.y += particle.speed * (delta / 1000) * gravityFlow;
          if (particle.y > 1.045) {
            particle.y = -0.045;
            particle.lane = Math.random() * 2 - 1;
          }
        }

        const halfWidth = halfWidthForY(particle.y);
        const waistPull = 1 - Math.min(1, Math.abs(particle.y - 0.5) / 0.18);
        const lowerSwirl = particle.y > 0.58 ? Math.sin(frame * 0.9 + particle.phase + particle.y * 12) * 0.026 : 0;
        const drift = Math.sin(frame * 0.64 + particle.phase + particle.y * 6.2) * (0.018 + particle.depth * 0.008);
        const xNorm = 0.5 + particle.lane * halfWidth * (1 - waistPull * 0.78) + drift + lowerSwirl;
        const x = xNorm * width;
        const y = particle.y * height;
        const waistGlow = 1 - Math.min(1, Math.abs(particle.y - 0.5) / 0.22);
        const basinGlow = particle.y > 0.62 ? (particle.y - 0.62) * 0.32 : 0;
        const alpha = (0.34 + waistGlow * 0.2 + basinGlow) * particle.twinkle * particle.depth * (0.46 + gravityFlow * 0.54);
        const color = colors[particle.hue];
        const radius = Math.max(1.1, particle.size * (0.58 + waistGlow * 0.12));

        const trailLength = particle.kind === "dot" ? (8 + particle.speed * 180) * gravityFlow : 5;
        if (particle.kind === "dot" && gravityFlow > 0.12) {
          const trailStartY = y - trailLength;
          const trail = ctx.createLinearGradient(x, trailStartY, x, y);
          trail.addColorStop(0, `rgba(${color}, 0)`);
          trail.addColorStop(1, `rgba(${color}, ${alpha * 0.38})`);
          ctx.strokeStyle = trail;
          ctx.lineWidth = Math.max(0.6, radius * 0.4);
          ctx.beginPath();
          ctx.moveTo(x + Math.sin(particle.phase) * 1.4, trailStartY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.shadowBlur = 0;

        if (particle.kind === "star") {
          drawStar(ctx, x, y, radius * 0.95);
        } else if (particle.kind === "shard") {
          drawShard(ctx, x, y, radius * 0.9, particle.spin + frame * 0.22);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0;
      for (let fleck = 0; fleck < 6; fleck += 1) {
        const x = width * (0.28 + fleck * 0.078 + Math.sin(frame * 0.7 + fleck) * 0.004);
        const y = height * (0.76 + Math.sin(frame * 1.1 + fleck * 1.7) * 0.018);
        const alpha = 0.12 + Math.sin(frame * 1.3 + fleck) * 0.05;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + (fleck % 3) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      if (!shouldReduceMotion) {
        animationId = requestAnimationFrame(render);
      }
    };

    render(previousTime);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, [flowDirection, rotationDegrees, shouldReduceMotion]);

  return canvasRef;
}

type KineticHourglassProps = {
  className?: string;
  flowDirection?: MotionValue<number>;
  rotationDegrees?: MotionValue<number>;
  intro?: boolean;
};

export function KineticHourglass({ className, flowDirection, rotationDegrees, intro = true }: KineticHourglassProps) {
  const canvasRef = useHourglassCanvas(flowDirection, rotationDegrees);

  return (
    <motion.div
      className={["relative mx-auto aspect-[0.72] w-[min(37vw,340px)] min-w-[190px] max-w-[340px] sm:min-w-[235px]", className]
        .filter(Boolean)
        .join(" ")}
      initial={intro ? { opacity: 0, y: 26, scale: 0.95 } : false}
      animate={intro ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={intro ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      <div className="hero-hourglass-shadow pointer-events-none absolute bottom-[3%] left-[19%] h-[9%] w-[62%] rounded-full bg-[#009DFF]/25 blur-2xl" />

      <div className="hero-hourglass-shell relative h-full w-full">
        <div className="hero-canvas-mask absolute inset-[6%] overflow-hidden">
          <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
        </div>

        <div className="hero-hourglass-glass pointer-events-none absolute inset-[6%] border border-[#AEE4F8]/70" />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 420 584" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hourglassFrame" x1="50" x2="370" y1="28" y2="550" gradientUnits="userSpaceOnUse">
              <stop stopColor="#AEE4F8" />
              <stop offset="0.48" stopColor="#6BCBF0" />
              <stop offset="1" stopColor="#AEE4F8" />
            </linearGradient>
            <linearGradient id="hourglassFrameEdge" x1="87" x2="334" y1="74" y2="518" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.78" />
              <stop offset="0.5" stopColor="#AEE4F8" stopOpacity="0.82" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.52" />
            </linearGradient>
            <linearGradient id="hourglassWarm" x1="84" x2="334" y1="40" y2="540" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DDF7FF" />
              <stop offset="0.44" stopColor="#AEE4F8" />
              <stop offset="1" stopColor="#DDF7FF" />
            </linearGradient>
            <linearGradient id="facetSea" x1="128" x2="290" y1="86" y2="190" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DFFFF8" />
              <stop offset="0.48" stopColor="#5EEAD4" />
              <stop offset="1" stopColor="#009DFF" />
            </linearGradient>
            <linearGradient id="facetBlue" x1="210" x2="330" y1="70" y2="218" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CFF5FF" />
              <stop offset="0.5" stopColor="#12C7FF" />
              <stop offset="1" stopColor="#0084D6" />
            </linearGradient>
            <filter id="frameGlow" x="-30%" y="-20%" width="160%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softBlueGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <ellipse cx="210" cy="541" rx="128" ry="20" fill="#009DFF" opacity="0.16" filter="url(#softBlueGlow)" />
          <path d="M126 84 L184 99 L164 189 L112 163 Z" fill="url(#facetSea)" opacity="0.38" />
          <path d="M196 92 L276 104 L258 204 L176 187 Z" fill="url(#facetBlue)" opacity="0.34" />
          <path d="M286 99 L328 110 L304 202 L266 194 Z" fill="#009DFF" opacity="0.28" />
          <path
            d="M69 43 C103 24 318 24 351 43"
            stroke="url(#hourglassWarm)"
            strokeWidth="13"
            strokeLinecap="round"
            filter="url(#frameGlow)"
          />
          <path
            d="M69 541 C104 563 318 563 351 541"
            stroke="url(#hourglassWarm)"
            strokeWidth="13"
            strokeLinecap="round"
            filter="url(#frameGlow)"
          />
          <path
            d="M91 69 C122 134 165 202 205 286 C244 202 299 134 329 69"
            stroke="url(#hourglassFrame)"
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M91 515 C126 449 169 371 205 286 C246 371 296 449 329 515"
            stroke="url(#hourglassFrame)"
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M104 76 C134 141 170 204 205 286 C241 204 286 141 316 76"
            stroke="url(#hourglassFrameEdge)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.86"
          />
          <path
            d="M105 508 C137 443 171 371 205 286 C242 371 283 443 316 508"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.54"
          />
          <path
            d="M107 86 C156 105 263 105 313 86"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.74"
          />
          <path
            d="M110 496 C159 478 263 478 312 496"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.66"
          />
          <path
            d="M122 92 C142 159 176 215 200 260"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.62"
          />
          <path
            d="M121 493 C143 425 176 367 200 316"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.52"
          />
          <circle cx="151" cy="118" r="3.4" fill="#FFFFFF" opacity="0.84" />
          <circle cx="280" cy="454" r="2.8" fill="#FFD166" opacity="0.74" />
        </svg>
      </div>
    </motion.div>
  );
}
