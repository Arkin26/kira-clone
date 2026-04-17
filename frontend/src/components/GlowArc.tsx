"use client";

import type { HTMLAttributes } from "react";

const ACCENT = "158, 255, 214";

/** +70% vs original blur / spread / ellipse height */
const G = 1.7;

/** Horizontal fade at left/right “corners”. */
const EDGE_MASK =
  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.97) 11%, rgba(0,0,0,0.97) 89%, transparent 100%)";

export type GlowArcProps = HTMLAttributes<HTMLDivElement>;

/**
 * Full-viewport-width arc glow (parent should be `position: relative`).
 * Glow extent scaled ~+70% vertically vs the first version; transparent rim + blur only.
 */
export default function GlowArc({ className = "", style, ...rest }: GlowArcProps) {
  const blurRadial = Math.round(32 * G);
  const blurRim = Math.round(12 * G);
  const ellipseH = Math.round(400 * G);
  const ellipseBottom = Math.round(-220 * G);

  return (
    <div
      className={`pointer-events-none ${className}`}
      aria-hidden
      style={{
        position: "absolute",
        overflow: "hidden",
        /* Full viewport width from any centered parent */
        left: "50%",
        width: "100vw",
        marginLeft: "-50vw",
        ...style,
      }}
      {...rest}
    >
      {/* Soft body — taller falloff up/down */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: "min(155vw, 2100px)",
          bottom: `${-32 * G}%`,
          height: `${82 * G}%`,
          background: `radial-gradient(ellipse 50% ${Math.round(40 * G)}% at 50% 100%, rgba(${ACCENT},0.32) 0%, rgba(${ACCENT},0.1) 48%, transparent 72%)`,
          filter: `blur(${blurRadial}px)`,
          WebkitMaskImage: EDGE_MASK,
          maskImage: EDGE_MASK,
        }}
      />

      {/* Rim — box-shadow stacks ×1.7 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[110%] min-w-[100vw] border-0 bg-transparent shadow-none outline-none ring-0 rounded-[50%]"
        style={{
          height: `${ellipseH}px`,
          bottom: `${ellipseBottom}px`,
          boxShadow: `
            0 0 ${Math.round(40 * G)}px ${Math.round(18 * G)}px rgba(${ACCENT},0.5),
            0 0 ${Math.round(90 * G)}px ${Math.round(45 * G)}px rgba(${ACCENT},0.28),
            0 0 ${Math.round(180 * G)}px ${Math.round(90 * G)}px rgba(${ACCENT},0.12),
            0 0 ${Math.round(300 * G)}px ${Math.round(140 * G)}px rgba(${ACCENT},0.05)
          `,
          filter: `blur(${blurRim}px)`,
          WebkitMaskImage: EDGE_MASK,
          maskImage: EDGE_MASK,
        }}
      />
    </div>
  );
}
