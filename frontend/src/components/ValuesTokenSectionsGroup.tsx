"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { FaqSection } from "./FaqSection";
import { IntegrationShopSection } from "./IntegrationShopSection";
import { TokenSection } from "./TokenSection";
import { ValuesSection } from "./ValuesSection";
import { SOLANA_TOKEN_DECOR_SIZE_CSS, VALUES_SOLANA_ACCENT } from "./SolanaToken3D";

const SolanaToken3D = dynamic(
  () => import("./SolanaToken3D").then((m) => m.SolanaToken3D),
  { ssr: false, loading: () => null },
);

/**
 * Wraps Values + Token sections with a shared black backdrop.
 * 3D tokens render in a high z-index overlay so they sit above all section content.
 */
export function ValuesTokenSectionsGroup() {
  const valuesSectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [seamY, setSeamY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = valuesSectionRef.current;
    if (!el) return;
    const update = () => setSeamY(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative overflow-visible bg-[#000000]"
      style={{ isolation: "auto" }}
    >
      <div className="relative z-0" style={{ position: "relative", zIndex: 0 }}>
        <ValuesSection ref={valuesSectionRef} />
        <TokenSection />
        <IntegrationShopSection />
        <FaqSection />
      </div>

      {seamY !== null ? (
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0"
          style={
            {
              ["--seam-y" as string]: `${seamY}px`,
              zIndex: 100,
              overflow: "visible",
              isolation: "isolate",
              transform: "translateZ(0)",
            } as CSSProperties
          }
          aria-hidden
        >
          {/* Top-left of Values section */}
          <div
            style={{
              position: "absolute",
              top: "clamp(12px, 1.8vw, 24px)",
              left: "clamp(-198px, -12vw, -108px)",
              width: SOLANA_TOKEN_DECOR_SIZE_CSS,
              height: SOLANA_TOKEN_DECOR_SIZE_CSS,
              maxWidth: "90vw",
              transform: "translateY(calc(-30% - 20%)) rotate(-26deg)",
              transformOrigin: "center center",
            }}
          >
            <SolanaToken3D
              accent={VALUES_SOLANA_ACCENT}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Seam-centered token */}
          <div
            style={{
              position: "absolute",
              top: "var(--seam-y)",
              left: 0,
              right: 0,
              height: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                width: SOLANA_TOKEN_DECOR_SIZE_CSS,
                height: SOLANA_TOKEN_DECOR_SIZE_CSS,
                transform: "translateY(calc(-50% + 8% + 30% - 20%)) rotate(15deg)",
                transformOrigin: "right center",
              }}
            >
              <SolanaToken3D
                accent={VALUES_SOLANA_ACCENT}
                style={{ width: "100%", height: "100%" }}
                tilt={[0.4, 0.22, -0.52]}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
