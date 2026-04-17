"use client";

import Image, { StaticImageData } from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import GlowArc from "./GlowArc";
import GlassSurface from "./ui/GlassSurface";

import bitcoinIcon from "../../../icons8-bitcoin-logo-24.png";
import ethereumIcon from "../../../icons8-ethereum-logo-50.png";
import euroIcon from "../../../icons8-euro-64.png";
import litecoinIcon from "../../../icons8-litecoin-64.png";
import metamaskIcon from "../../../icons8-metamask-logo-50.png";
import tetherIcon from "../../../icons8-tether-24.png";
import tronIcon from "../../../icons8-tron-64.png";
import usdCircledIcon from "../../../icons8-us-dollar-circled-50.png";
import xrpIcon from "../../../icons8-xrp-64.png";

type TokenIcon = {
  name: string;
  src: StaticImageData;
};

const TOKENS: TokenIcon[] = [
  { name: "Bitcoin", src: bitcoinIcon },
  { name: "Ethereum", src: ethereumIcon },
  { name: "Litecoin", src: litecoinIcon },
  { name: "MetaMask", src: metamaskIcon },
  { name: "Tether", src: tetherIcon },
  { name: "Tron", src: tronIcon },
  { name: "XRP", src: xrpIcon },
  { name: "Euro", src: euroIcon },
  { name: "US Dollar", src: usdCircledIcon },
];

const ACCENT = "#9EFFD6";
const ACCENT_RGB = "158, 255, 214";

const CARD_POSITIONS = [
  { left: "50%", top: "2%", z: 6 },
  { left: "32%", top: "18%", z: 5 },
  { left: "68%", top: "18%", z: 5 },
  { left: "11%", top: "34%", z: 4 },
  { left: "50%", top: "34%", z: 7 },
  { left: "89%", top: "34%", z: 4 },
  { left: "32%", top: "50%", z: 5 },
  { left: "68%", top: "50%", z: 5 },
  { left: "50%", top: "66%", z: 6 },
] as const;

export function TokenSection() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 180,
    damping: 18,
    mass: 0.8,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    stiffness: 180,
    damping: 18,
    mass: 0.8,
  });
  const shiftX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-16, 16]), {
    stiffness: 120,
    damping: 22,
    mass: 0.9,
  });

  return (
    <section
      style={{
        background: "#000000",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
        padding: "70px 8vw 90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "4px",
            padding: "5px 10px",
            textTransform: "uppercase",
          }}
        >
          Token
        </span>
        <h2
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.95)",
            fontSize: "clamp(2.1rem, 5vw, 3.4rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
          }}
        >
          Connected liquid token carousel
        </h2>
      </div>

      {/* Full section width so arc can span 100vw; glow sits behind the carousel */}
      <div
        style={{
          alignSelf: "stretch",
          width: "100%",
          minHeight: "560px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <GlowArc
          style={{
            top: "calc(50% - min(150px, 16vh))",
            height: "min(476px, 54.4vh)",
            transform: "translateY(-40%)",
            zIndex: 0,
          }}
        />

        <motion.div
          data-debug="token-carousel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            pointerX.set(x);
            pointerY.set(y);
          }}
          onMouseLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
          style={{
            width: "min(96vw, 1060px)",
            minHeight: "560px",
            overflow: "visible",
            position: "relative",
            margin: "0 auto",
            zIndex: 1,
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
        >
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            rotateX,
            rotateY,
            x: shiftX,
            transformStyle: "preserve-3d",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "880px",
              maxWidth: "96%",
              height: "500px",
            }}
          >
            {TOKENS.map((token, index) => {
              const pos = CARD_POSITIONS[index];
              return (
                <motion.div
                  key={token.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: 0.1 + index * 0.07, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    transform: "translateX(-50%)",
                    zIndex: pos.z,
                    width: "150px",
                    height: "150px",
                    borderRadius: "26px",
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                    border: `1px solid rgba(${ACCENT_RGB},0.12)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 40px rgba(0,0,0,0.5), 0 0 36px rgba(${ACCENT_RGB},0.08)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GlassSurface
                    width={84}
                    height={84}
                    borderRadius={999}
                    borderWidth={0.09}
                    brightness={58}
                    opacity={0.92}
                    blur={11}
                    backgroundOpacity={0.05}
                    saturation={1.1}
                    distortionScale={-160}
                    redOffset={0}
                    greenOffset={10}
                    blueOffset={20}
                    mixBlendMode="screen"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid rgba(${ACCENT_RGB},0.35)`,
                      boxShadow: `inset 0 0 16px rgba(${ACCENT_RGB},0.2), 0 8px 22px rgba(0,0,0,0.35), 0 0 22px rgba(${ACCENT_RGB},0.12)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Circular pool of light — center below circle so edge is a smooth arc, not a flat line */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "-8%",
                        borderRadius: "50%",
                        pointerEvents: "none",
                        zIndex: 0,
                        background: `radial-gradient(circle at 50% 122%,
                          ${ACCENT} 0%,
                          rgba(${ACCENT_RGB},0.55) 22%,
                          rgba(${ACCENT_RGB},0.22) 48%,
                          rgba(${ACCENT_RGB},0.06) 62%,
                          transparent 76%)`,
                        filter: "blur(2px)",
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "52%",
                        height: "52%",
                      }}
                    >
                      <Image
                        src={token.src}
                        alt={`${token.name} icon`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          filter: `drop-shadow(0 0 8px rgba(${ACCENT_RGB},0.45))`,
                        }}
                      />
                    </div>
                  </GlassSurface>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
