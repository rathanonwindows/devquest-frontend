import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { playButtonTap } from "../../lib/soundEffects";

export interface DailyBountyData {
  topicId: string;
  topicTitle: string;
  description: string | null;
  baseXp: number;
  bonusMultiplier: number;
  totalXp: number;
  expiresAt: string;
  isCompleted: boolean;
}

interface DailyBountyCardProps {
  bounty: DailyBountyData | null;
  loading?: boolean;
}

export function DailyBountyCard({ bounty, loading }: DailyBountyCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!bounty?.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const target = new Date(bounty.expiresAt).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bounty?.expiresAt]);

  if (loading || !bounty) {
    return null;
  }

  const format2Digits = (n: number) => n.toString().padStart(2, "0");

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 20, 10, 0.5) 100%)",
        border: "1.5px solid rgba(245, 158, 11, 0.4)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 0 30px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.05)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        overflow: "hidden",
      }}
    >
      {/* Background Animated Glint */}
      <motion.div
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "40%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.08), transparent)",
          transform: "skewX(-20deg)",
          pointerEvents: "none",
        }}
      />

      {/* Left: Info & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1, flex: 1, minWidth: 280 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            boxShadow: "0 0 16px rgba(245, 158, 11, 0.5)",
            flexShrink: 0,
          }}
        >
          ⚔️
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "rgba(245, 158, 11, 0.25)",
                color: "#fbbf24",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(245, 158, 11, 0.5)",
              }}
            >
              Daily Bounty • 2X Bonus Multiplier
            </span>

            {/* Countdown Clock */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(0, 0, 0, 0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span>⏳</span> Resets in: {format2Digits(timeLeft.hours)}:{format2Digits(timeLeft.minutes)}:
              {format2Digits(timeLeft.seconds)}
            </span>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
            {bounty.topicTitle}
          </h3>

          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Today's featured guild trial. Conquering this quest yields double XP rewards!
          </div>
        </div>
      </div>

      {/* Right: XP Payout & Action CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Bounty Reward
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24", textShadow: "0 0 12px rgba(245, 158, 11, 0.5)" }}>
            +{bounty.totalXp} XP
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
            ({bounty.baseXp} Base + {bounty.baseXp} Bonus)
          </div>
        </div>

        {bounty.isCompleted ? (
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#10b981",
              fontSize: 12,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>✅</span> Claimed Today
          </div>
        ) : (
          <Link to={`/quest/${bounty.topicId}`} style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                onClick={() => playButtonTap()}
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 13,
                  padding: "10px 18px",
                  boxShadow: "0 0 18px rgba(245, 158, 11, 0.5)",
                }}
              >
                Embark on Bounty →
              </Button>
            </motion.div>
          </Link>
        )}
      </div>
    </motion.section>
  );
}
