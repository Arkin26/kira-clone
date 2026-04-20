"use client";

import { motion } from "framer-motion";
import UniverseVisualizer from "./UniverseVisualizer";

export function TokenSection() {
  return (
    <section
      style={{
        background: "#000000",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "visible",
        position: "relative",
        padding: "0 0 90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        fontFamily: "var(--font-mulish), system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "min(92vh, 920px)",
          overflow: "visible",
          padding: "clamp(20px, 4vw, 56px) clamp(8px, 2.5vw, 28px)",
          boxSizing: "border-box",
        }}
      >
        <UniverseVisualizer embedded />
      </motion.div>

      <p
        style={{
          position: "relative",
          zIndex: 2,
          margin: "clamp(12px, 2.4vw, 22px) 0 0",
          maxWidth: "min(52ch, 92vw)",
          padding: "0 clamp(16px, 4vw, 24px)",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "clamp(0.95rem, 2.1vw, 1.2rem)",
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}
      >
        It&apos;s now a lot easier to pay someone. All you need is an email address to send
        cross-border commercial payments in over 24 currencies to almost anyone, anywhere.
      </p>

      <button
        type="button"
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "clamp(16px, 3vw, 28px)",
          padding: "12px 32px",
          borderRadius: "9999px",
          border: "none",
          cursor: "pointer",
          background: "#ffffff",
          color: "#000000",
          fontFamily: "var(--font-mulish), system-ui, sans-serif",
          fontSize: "clamp(0.9rem, 1.8vw, 1rem)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        Explore More
      </button>
    </section>
  );
}
