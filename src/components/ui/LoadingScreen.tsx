import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
}

export function LoadingScreen({
  title = "CONSULTING QUEST CODEX",
  subtitle = "Deciphering adventurer milestones and roadmap telemetry...",
  icon = "⚔️",
  badge = "DEVQUEST REALM // SYNCHRONIZING",
}: LoadingScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124, 92, 255, 0.12) 0%, rgba(8, 8, 12, 0.98) 70%), var(--bg-base)",
        overflow: "hidden",
        color: "#fff",
        padding: "24px",
      }}
    >
      <ParticleField />

      {/* Ambient background glow orbs */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 92, 255, 0.22) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 420,
        }}
      >
        {/* Arcane Rune Ring Spinner */}
        <div
          style={{
            position: "relative",
            width: 124,
            height: 124,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          {/* Outer rotating dashed arcane rune orbit */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px dashed rgba(124, 92, 255, 0.45)",
              boxShadow: "0 0 24px rgba(124, 92, 255, 0.25)",
            }}
          />

          {/* Middle counter-rotating dual energy ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "var(--accent)",
              borderBottomColor: "#f59e0b",
              boxShadow: "0 0 18px var(--accent-glow)",
            }}
          />

          {/* Radar ripple halo */}
          <div
            style={{
              position: "absolute",
              inset: 18,
              borderRadius: "50%",
              border: "1.5px solid var(--accent)",
              animation: "radarRipple 2.4s infinite ease-out",
              pointerEvents: "none",
            }}
          />

          {/* Center Levitating Core Emblem */}
          <motion.div
            animate={{
              y: [-4, 4, -4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(124, 92, 255, 0.3), rgba(19, 19, 26, 0.98))",
              border: "2px solid var(--accent)",
              boxShadow: "0 0 30px var(--accent-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Status Pill Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 14px",
            borderRadius: 999,
            border: "1px solid rgba(124, 92, 255, 0.35)",
            background: "rgba(124, 92, 255, 0.08)",
            fontSize: 10,
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 14,
            boxShadow: "0 0 16px rgba(124, 92, 255, 0.15)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              animation: "beaconPing 1.8s infinite",
            }}
          />
          {badge}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.02em",
            margin: "0 0 8px",
            color: "#fff",
            textShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            margin: "0 0 24px",
            maxWidth: 340,
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>

        {/* Mana Flow Energy Progress Beam */}
        <div
          style={{
            width: 240,
            height: 4,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            animate={{
              x: ["-100%", "220%"],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "55%",
              background: "linear-gradient(90deg, transparent, var(--accent), #f59e0b, transparent)",
              boxShadow: "0 0 12px var(--accent-glow)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
