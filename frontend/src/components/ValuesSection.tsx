"use client";

import { motion } from "framer-motion";
import GlassSurface from "./ui/GlassSurface";

const LEFT_BLOCK_OFFSET_X = -150;
const RIGHT_BLOCK_OFFSET_X = -30;

const values = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Security Teams",
    description: "Security teams work to keep your money safe",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20c0-3 2.2-5 5-5s5 2 5 5" />
      </svg>
    ),
    title: "Authentication",
    description: "We use top authentication to protect your account",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <circle cx="12" cy="12" r="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "Safety Funds",
    description: "Hold money with established financial institutions",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    title: "Account Place",
    description: "Place all your account, all in one place",
  },
];

export function ValuesSection() {
  return (
    <section
      style={{
        background: "#000000",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        padding: "80px 20vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif",
        minHeight: "320px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: LEFT_BLOCK_OFFSET_X - 20 }}
        whileInView={{ opacity: 1, x: LEFT_BLOCK_OFFSET_X }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          flexShrink: 0,
          width: "min(44vw, 620px)",
          minWidth: "500px",
          textAlign: "left",
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
            marginBottom: "22px",
            textTransform: "uppercase",
          }}
        >
          Our Values
        </span>
        <h2
          style={{
            fontSize: "4.00rem",
            fontWeight: 300,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 18px",
          }}
        >
          The strategic choice
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.55,
            margin: 0,
            maxWidth: "340px",
          }}
        >
          We're on a mission to bring transparency to finance and show your upfront.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, x: RIGHT_BLOCK_OFFSET_X }}
        whileInView={{ opacity: 1, y: 0, x: RIGHT_BLOCK_OFFSET_X }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          background: "#000000",
          padding: "13px",
          position: "relative",
          width: "600px",
          minWidth: "500px",
          borderRadius: "31px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "320px",
                height: "320px",
              background:
                  "radial-gradient(circle, rgba(158,255,214,0.5) 0%, rgba(158,255,214,0.26) 30%, rgba(158,255,214,0.15) 52%, rgba(158,255,214,0.09) 68%, rgba(158,255,214,0.05) 80%, rgba(158,255,214,0.02) 90%, rgba(158,255,214,0.008) 96%, rgba(158,255,214,0) 100%)",
                filter: "blur(3.8px)",
            }}
          />
        </div>

        {values.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: "easeOut" }}
            style={{
              position: "relative",
              zIndex: 1,
              background: "#020202",
              borderRadius: "23px",
              border: "1px solid rgba(255,255,255,0.04)",
              padding: "32px 30px 38px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "23px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <GlassSurface
              width={48}
              height={48}
              borderRadius={29}
              borderWidth={0.08}
              brightness={55}
              opacity={0.9}
              blur={10}
              backgroundOpacity={0.04}
              saturation={1.1}
              distortionScale={-160}
              redOffset={0}
              greenOffset={10}
              blueOffset={20}
              mixBlendMode="screen"
              style={{
                position: "relative",
                overflow: "hidden",
                color: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(158,255,214,0.28)",
                boxShadow: "inset 0 0 14px rgba(158,255,214,0.2), 0 0 18px rgba(158,255,214,0.12)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "33%",
                  background:
                    "radial-gradient(ellipse at 50% 120%, rgba(158,255,214,0.92) 0%, rgba(158,255,214,0.45) 45%, rgba(158,255,214,0) 100%)",
                  filter: "blur(2px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </div>
            </GlassSurface>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                textAlign: "left",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
