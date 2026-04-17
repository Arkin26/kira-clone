"use client";

import { motion } from "framer-motion";

const values = [
  {
    icon: (
      <svg
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        background: "#080808",
        padding: "80px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "80px",
        fontFamily: "'Inter', sans-serif",
        minHeight: "320px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ flexShrink: 0, maxWidth: "440px", textAlign: "left" }}
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
            fontSize: "3.25rem",
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 18px",
          }}
        >
          The strategic
          <br />
          choice
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          background: "#080808",
          padding: "10px",
          position: "relative",
          maxWidth: "580px",
          borderRadius: "24px",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "1px",
            height: "1px",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "-160px",
              width: "320px",
              height: "1px",
              background:
                "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.6) 65%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "-160px",
              width: "1px",
              height: "320px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.6) 65%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "-4px",
              top: "-4px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "rgba(255,255,255,1)",
              boxShadow:
                "0 0 8px 4px rgba(255,255,255,0.6), 0 0 24px 10px rgba(255,255,255,0.25), 0 0 60px 24px rgba(255,255,255,0.1)",
            }}
          />
          {[45, -45, 135, -135].map((deg, rayIndex) => (
            <div
              key={rayIndex}
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                width: "100px",
                height: "1px",
                background: "linear-gradient(to right, rgba(255,255,255,0.5), rgba(255,255,255,0))",
                transform: `rotate(${deg}deg)`,
                transformOrigin: "left center",
              }}
            />
          ))}
        </div>

        {values.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0) 100%), #111111",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.09)",
              padding: "28px 26px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "18px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 50%, rgba(0,0,0,0.2) 100%)",
                border: "1px solid rgba(255,255,255,0.13)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.85)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {item.icon}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
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
                  fontSize: "13px",
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
