"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/** Matches the mint accent used in `ValuesSection` gradients and borders. */
export const VALUES_SOLANA_ACCENT = "#9EFFD6";

/** Decor canvas size: prior `min(294px, 36.4vw)` + 20%. */
export const SOLANA_TOKEN_DECOR_SIZE_CSS = "min(353px, 43.68vw)";

/** Dark gunmetal base for the coin body. */
export const SOLANA_TOKEN_BASE = "#252529";

export type SolanaToken3DProps = {
  className?: string;
  style?: React.CSSProperties;
  /** Face / mark accent (defaults to `VALUES_SOLANA_ACCENT`). */
  accent?: string;
  /** Initial tilt of the coin in 3D (radians). */
  tilt?: [number, number, number];
};

function SolanaMark({ color }: { color: string }) {
  const tilt = 0.48;
  const barW = 0.54;
  const barH = 0.082;
  const depth = 0.014;
  const ys: [number, number, number] = [0.15, 0, -0.15];

  return (
    <group position={[0, 0, 0.099]}>
      {ys.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, tilt]}>
          <boxGeometry args={[barW, barH, depth]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.42}
            metalness={0.22}
            roughness={0.28}
          />
        </mesh>
      ))}
    </group>
  );
}

function CoinScene({
  accent = VALUES_SOLANA_ACCENT,
  base = SOLANA_TOKEN_BASE,
  tilt = [0.38, -0.32, -0.42],
}: {
  accent?: string;
  base?: string;
  tilt?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (g) g.rotation.y += delta * 0.338;
  });

  const cylinderGeo = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 0.18, 72),
    [],
  );

  /** Slightly smaller than unit so tilt + rim glow stay inside the canvas frustum. */
  const sceneScale = 0.84;

  return (
    <group ref={group} rotation={tilt} scale={sceneScale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={cylinderGeo}>
        <meshPhysicalMaterial
          color={base}
          metalness={0.92}
          roughness={0.22}
          clearcoat={0.35}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0, 0.091]}>
        <circleGeometry args={[0.86, 72]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.18}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, 0, -0.091]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.86, 72]} />
        <meshStandardMaterial
          color={base}
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0, 0.0895]}>
        <ringGeometry args={[0.82, 1.04, 96]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.35}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -0.0895]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.82, 1.04, 96]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.1}
          transparent
          opacity={0.42}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <SolanaMark color={accent} />

      <pointLight position={[1.6, 2.2, 3.4]} intensity={0.55} color="#ffffff" />
      <pointLight position={[-2.4, -1.2, 2.2]} intensity={0.22} color={accent} />
    </group>
  );
}

/**
 * Reusable 3D Solana-style token: dark metal body, mint mark, white rim glow.
 * Drop into any client layout; parent controls size and placement.
 */
export function SolanaToken3D({ className, style, accent, tilt }: SolanaToken3DProps) {
  const accentColor = accent ?? VALUES_SOLANA_ACCENT;
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: "100%",
        minHeight: "100%",
        lineHeight: 0,
        zIndex: 1,
        isolation: "isolate",
        transform: "translateZ(0)",
        ...style,
      }}
    >
      <Canvas
        className="block h-full w-full touch-none"
        style={{ width: "100%", height: "100%", display: "block" }}
        dpr={[1, 2]}
        camera={{ position: [0, 0.08, 5.25], fov: 42, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.setClearAlpha(0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={0.28} />
        <directionalLight position={[5, 6, 7]} intensity={1.05} color="#ffffff" />
        <directionalLight position={[-4, -2, 3]} intensity={0.35} color="#c8d4ff" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <CoinScene accent={accentColor} tilt={tilt} />
        </Suspense>
      </Canvas>
    </div>
  );
}
