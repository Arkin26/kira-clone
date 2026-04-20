"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

const CX = 450;
const CY = 450;
/**
 * Padding around the 900×900 “content square” in user units.
 * Keep this modest: an oversized viewBox shrinks the whole graphic when the SVG
 * scales to fit its pixel box (lots of empty margin — looks zoomed out).
 */
const VIEW_PAD = 320;
const VIEW_SIZE = 900 + VIEW_PAD * 2;
const SPOKE_COUNT = 62;
/** Perspective: camera offset along +Z (world); larger = less extreme foreshortening */
const PERSP_D = 520;
/** Focal scale — ×0.6 vs prior (visual ~40% smaller) */
const PERSP_F = 806;

/** Spoke stroke at hub, fading along the ray */
const LINE_GRAY_BRIGHT = "#3d3d3d";
const LINE_GRAY_FADE = "rgba(61, 61, 61, 0)";

const FILTER_LOGO_GREEN =
  "brightness(0.92) sepia(1) hue-rotate(82deg) saturate(1.72) contrast(1.05)";
const FILTER_LOGO_GRAY = "grayscale(0.92) brightness(0.94) contrast(0.96)";

/** ×3 vs raw spoke length (100% longer than previous ×1.5) */
const LINE_LENGTH_MULT = 3;
/** Pull in the longest rays so outliers don’t dominate */
const MAX_SPOKE_LEN = 430;
/** Final touch: all world-space spoke lengths ×0.8 (20% shorter) */
const STRING_LENGTH_SCALE = 0.8;
/** Depth-based logo size (scaled with projection) */
const NODE_SIZE_MULT = 0.879;

const NODE_IMAGES = [
  "/nodes/eth.png",
  "/nodes/xrp.png",
  "/nodes/dollar.png",
  "/nodes/btc.png",
  "/nodes/bnb.png",
  "/nodes/sol.png",
];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * Horizontal spread limit for scroll animation. Uses the **scene container**
 * width (not `innerWidth`) so values match the padded Token column; using the
 * viewport width overstated safe translate and caused clipping under
 * `overflow-x: hidden` on the page.
 */
function maxSpreadPxForContainerWidth(containerWidthPx: number): number {
  const w = Math.max(1, containerWidthPx);
  const half = w * 0.5;
  const raw = w * 0.02;
  /**
   * translateX stacks on `textGap` (up to ~132px) and large clamp() headlines.
   * Reserve must scale with container so `safe` never goes negative on mid widths.
   */
  const gapMax = 132;
  const labelReserve = Math.min(210, half * 0.42);
  const edgePad = 16;
  const reservePx = Math.min(half - edgePad, gapMax + labelReserve + edgePad);
  const safe = Math.max(0, half - reservePx);
  /** Base ×2 (+100%), then ×3 more (+200% vs that) → ×6 on budgeted min(raw, safe). */
  return Math.min(raw, safe) * 6;
}

type Vec3 = { x: number; y: number; z: number };

/** Rotate direction around +Y (horizontal spin): X/Z plane turns in screen space */
function rotateY(v: Vec3, angleRad: number): Vec3 {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return {
    x: v.x * c + v.z * s,
    y: v.y,
    z: -v.x * s + v.z * c,
  };
}

/** Even distribution on unit sphere (Fibonacci / golden spiral) */
function fibonacciSphere(i: number, n: number): Vec3 {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = n <= 1 ? 0 : 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;
  const len = Math.hypot(x, y, z) || 1;
  return { x: x / len, y: y / len, z: z / len };
}

export type UniverseVisualizerProps = {
  className?: string;
  /** Use when placing inside a section so the scene fills the parent instead of the viewport */
  embedded?: boolean;
};

type SpokeBase = {
  dir: Vec3;
  len: number;
  strokeW: number;
  imgSrc: string;
  /** ~40% green, rest gray */
  tint: "green" | "gray";
  i: number;
};

type SpokeDraw = SpokeBase & {
  x2: number;
  y2: number;
  nodeSize: number;
  nodeOpacity: number;
  nodeFilter: string;
};

export default function UniverseVisualizer({
  className,
  embedded = false,
}: UniverseVisualizerProps) {
  const uid = useId().replace(/:/g, "");

  const [angleY, setAngleY] = useState(0);
  /** Smoothed horizontal offset (px) — lerped toward scroll target */
  const [scrollSpreadPx, setScrollSpreadPx] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const spreadTargetRef = useRef(0);
  const spreadDisplayRef = useRef(0);

  const spokeBase = useMemo((): SpokeBase[] => {
    return Array.from({ length: SPOKE_COUNT }, (_, i) => {
      const base = 58 + seededRand(i * 3) * 92;
      const jitter = (seededRand(i * 11) - 0.5) * 48;
      const wobble = seededRand(i * 19) * 36;
      const len =
        Math.min(
          Math.max(48, base + jitter + wobble) * LINE_LENGTH_MULT,
          MAX_SPOKE_LEN,
        ) * STRING_LENGTH_SCALE;
      const strokeW = 0.55 + seededRand(i * 7) * 0.42;
      const imgSrc = NODE_IMAGES[i % NODE_IMAGES.length];
      const dir = fibonacciSphere(i, SPOKE_COUNT);
      const tint: "green" | "gray" = seededRand(i * 17) < 0.4 ? "green" : "gray";
      return { dir, len, strokeW, imgSrc, tint, i };
    });
  }, []);

  useEffect(() => {
    let raf = 0;
    const periodMs = 25200;
    const start = performance.now();
    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const tick = () => {
      if (mq?.matches) {
        setAngleY(0);
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = (performance.now() - start) % periodMs;
      setAngleY((t / periodMs) * Math.PI * 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * Light smoothing so motion follows scroll without post-scroll drift.
     * Higher = snappier (closer to 1:1 with scroll).
     */
    const SPREAD_SMOOTH = 0.32;

    let scrollRaf = 0;
    let smoothRaf = 0;

    /**
     * Parting progress 0→1 while the block crosses the viewport.
     * startTop/endTop are parallel-shifted so the ramp begins earlier; span stays vh+0.42h.
     */
    const updateSpreadTarget = () => {
      if (reduce) {
        spreadTargetRef.current = 0;
        spreadDisplayRef.current = 0;
        setScrollSpreadPx(0);
        return;
      }
      const el = sceneRef.current;
      if (!el) {
        spreadTargetRef.current = 0;
        return;
      }

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const h = rect.height;
      const containerW = rect.width;

      // Parallel shift +0.4h: spread starts and finishes earlier vs 0.22h / -0.2h,
      // while keeping the same scroll span (vh + 0.42h) so ramp speed is unchanged.
      const startTop = vh + 0.62 * h;
      const endTop = 0.2 * h;

      const span = startTop - endTop;
      /** +30% scroll distance to go from progress 0→1 (gentler ramp over more pixels). */
      const progressSpan = span * 1.3;
      let progress = 0;
      if (progressSpan > 1e-6) {
        progress = (startTop - rect.top) / progressSpan;
      }
      progress = Math.min(1, Math.max(0, progress));

      /** Softer scroll→spread mapping (less motion per px scrolled until late). */
      const spreadProgress = Math.pow(progress, 1.22);
      const maxPx = maxSpreadPxForContainerWidth(containerW);
      spreadTargetRef.current = spreadProgress * maxPx;
    };

    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(updateSpreadTarget);
    };

    const smoothLoop = () => {
      if (reduce) {
        if (spreadDisplayRef.current !== 0) {
          spreadDisplayRef.current = 0;
          setScrollSpreadPx(0);
        }
        smoothRaf = requestAnimationFrame(smoothLoop);
        return;
      }
      const target = spreadTargetRef.current;
      let display = spreadDisplayRef.current;
      display += (target - display) * SPREAD_SMOOTH;
      if (Math.abs(target - display) < 0.25) {
        display = target;
      }
      spreadDisplayRef.current = display;
      setScrollSpreadPx(display);
      smoothRaf = requestAnimationFrame(smoothLoop);
    };

    updateSpreadTarget();
    spreadDisplayRef.current = spreadTargetRef.current;
    setScrollSpreadPx(spreadDisplayRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateSpreadTarget, { passive: true });
    smoothRaf = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSpreadTarget);
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(smoothRaf);
    };
  }, []);

  const projectedSpokes = useMemo((): SpokeDraw[] => {
    return spokeBase.map((s) => {
      const u = rotateY(s.dir, angleY);
      const end: Vec3 = {
        x: u.x * s.len,
        y: u.y * s.len,
        z: u.z * s.len,
      };
      const denom = end.z + PERSP_D;
      const safe = Math.abs(denom) > 1e-4 ? denom : (denom >= 0 ? 1e-4 : -1e-4);
      const x2 = CX + (end.x * PERSP_F) / safe;
      const y2 = CY - (end.y * PERSP_F) / safe;
      const depthFactor = u.z;
      const nodeSize =
        Math.max(12, Math.min(32, 14 + depthFactor * 10)) * NODE_SIZE_MULT;
      const nodeOpacity = Math.max(0.38, Math.min(1, 0.5 + depthFactor * 0.4));
      const baseTint = s.tint === "green" ? FILTER_LOGO_GREEN : FILTER_LOGO_GRAY;
      const nodeFilter =
        depthFactor < 0
          ? `${baseTint} brightness(0.9)`
          : `${baseTint} brightness(1.04)`;
      return {
        ...s,
        x2,
        y2,
        nodeSize,
        nodeOpacity,
        nodeFilter,
      };
    });
  }, [spokeBase, angleY]);

  /**
   * Static offset from centerline at scroll 0 — vw-heavy so rest layout matches
   * first reference (moderate gap framing the hub, ~inner gap in the 20–25% range).
   */
  const textGap = "clamp(14px, min(11vw, 132px), 132px)";

  return (
    <div
      ref={sceneRef}
      className={className}
      style={{
        ...(embedded
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "#000000",
              overflow: "visible",
              perspective: "900px",
              perspectiveOrigin: "50% 45%",
              transformStyle: "preserve-3d",
            }
          : {
              position: "relative",
              width: "100vw",
              height: "100vh",
              maxWidth: "100%",
              background: "#000000",
              overflow: "visible",
              perspective: "900px",
              perspectiveOrigin: "50% 45%",
              transformStyle: "preserve-3d",
            }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "min(1080px, 96vw)",
          height: "min(1080px, 96vw)",
          transform: "translate(-50%, -50%)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox={`${-VIEW_PAD} ${-VIEW_PAD} ${VIEW_SIZE} ${VIEW_SIZE}`}
            width="100%"
            height="100%"
            overflow="visible"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              {projectedSpokes.map(({ x2, y2, i }) => (
                <linearGradient
                  key={`lg-${i}-${uid}`}
                  id={`lg${i}-${uid}`}
                  x1={CX}
                  y1={CY}
                  x2={x2}
                  y2={y2}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={LINE_GRAY_BRIGHT} />
                  <stop offset="100%" stopColor={LINE_GRAY_FADE} />
                </linearGradient>
              ))}
            </defs>

            {projectedSpokes.map(
              ({
                x2,
                y2,
                strokeW,
                imgSrc,
                nodeSize,
                nodeOpacity,
                nodeFilter,
                i,
              }) => (
                <g key={i}>
                  <line
                    x1={CX}
                    y1={CY}
                    x2={x2}
                    y2={y2}
                    stroke={`url(#lg${i}-${uid})`}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                  />
                  <image
                    href={imgSrc}
                    x={x2 - nodeSize / 2}
                    y={y2 - nodeSize / 2}
                    width={nodeSize}
                    height={nodeSize}
                    opacity={nodeOpacity}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ filter: nodeFilter }}
                  />
                </g>
              ),
            )}
          </svg>
        </div>
      </div>

      <p
        style={{
          position: "absolute",
          right: "50%",
          marginRight: textGap,
          top: "calc(48% - 6.75vh)",
          transform: `translateY(-50%) translateX(calc(-1 * ${scrollSpreadPx}px))`,
          willChange: "transform",
          fontSize: "clamp(3.15rem, 6.84vw, 3.96rem)",
          fontWeight: 300,
          letterSpacing: "0.02em",
          margin: 0,
          padding: 0,
          pointerEvents: "none",
          fontFamily: "Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
          zIndex: 2,
          backgroundImage:
            "linear-gradient(165deg, #ffffff 0%, #e4e4e4 38%, #9a9a9a 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        Understand
      </p>

      <p
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: textGap,
          top: "calc(52% + 3vh)",
          transform: `translateY(-50%) translateX(${scrollSpreadPx}px)`,
          willChange: "transform",
          fontSize: "clamp(3.78rem, 8.28vw, 5.04rem)",
          fontWeight: 300,
          letterSpacing: "0.01em",
          margin: 0,
          padding: 0,
          pointerEvents: "none",
          fontFamily: "Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
          zIndex: 2,
          backgroundImage:
            "linear-gradient(165deg, #ffffff 0%, #dedede 40%, #8f8f8f 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        The Universe
      </p>
    </div>
  );
}
