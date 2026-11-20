import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { isSoundEnabled, setSoundEnabled, playButtonTap } from "../../lib/soundEffects";

export interface QuestAchievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface QuestCompletionData {
  topicTitle: string;
  xpAwarded: number;
  newTotalXp: number;
  newLevel: number;
  isLevelUp: boolean;
  currentStreak: number;
  isBounty?: boolean;
  nextTopic: {
    id: string;
    title: string;
    baseXp: number;
  } | null;
  newlyUnlockedAchievements?: QuestAchievement[];
}

interface CelebrationModalProps {
  isOpen: boolean;
  data: QuestCompletionData | null;
  onNextQuest?: (nextTopicId: string) => void;
  onReturnDashboard: () => void;
  onClose: () => void;
}

/**
 * High-definition, razor-sharp SVG vector Crown for Level-Up Ascension.
 * Replaces fuzzy/blurry emoji on Retina displays with crisp vector geometry.
 */
function LevelUpCrownIcon({ size = 58 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5))" }}
    >
      <defs>
        <linearGradient id="crownGold" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="crownRim" x1="10" y1="46" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="gemRuby" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <radialGradient id="gemCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>

      {/* Main Crown Body */}
      <path
        d="M10 48L6 22L21 33L32 12L43 33L58 22L54 48H10Z"
        fill="url(#crownGold)"
        stroke="#78350f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Spire Peak Spheres */}
      <circle cx="6" cy="21" r="3.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
      <circle cx="21" cy="33" r="3" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
      <circle cx="32" cy="11" r="4.5" fill="#fff" stroke="#b45309" strokeWidth="1.2" />
      <circle cx="43" cy="33" r="3" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
      <circle cx="58" cy="21" r="3.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />

      {/* Crown Rim / Base Headband */}
      <rect
        x="9"
        y="46"
        width="46"
        height="8"
        rx="3"
        fill="url(#crownRim)"
        stroke="#78350f"
        strokeWidth="1.5"
      />

      {/* Gemstones on the Base Rim */}
      <circle cx="18" cy="50" r="2.5" fill="url(#gemCyan)" stroke="#0369a1" strokeWidth="0.8" />
      <circle cx="32" cy="50" r="3.2" fill="url(#gemRuby)" stroke="#991b1b" strokeWidth="0.8" />
      <circle cx="46" cy="50" r="2.5" fill="url(#gemCyan)" stroke="#0369a1" strokeWidth="0.8" />

      {/* Central Star Diamond in Crown Center */}
      <polygon
        points="32,22 35,28 41,29 36,34 38,40 32,36 26,40 28,34 23,29 29,28"
        fill="#ffffff"
        opacity="0.95"
      />
    </svg>
  );
}

/**
 * High-definition, razor-sharp SVG vector Trophy for Quest Victory.
 * Replaces blurry emoji on Retina displays with crisp vector geometry.
 */
function QuestVictoryTrophyIcon({ size = 58 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 4px 12px rgba(124, 92, 255, 0.5))" }}
    >
      <defs>
        <linearGradient id="trophyGold" x1="16" y1="8" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#fcd34d" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="trophyBase" x1="18" y1="46" x2="46" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="trophyHandles" x1="6" y1="14" x2="58" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Left and Right Ornate Handles */}
      <path
        d="M20 18H14C10.6863 18 8 20.6863 8 24C8 28.5 12 32 19 32"
        stroke="url(#trophyHandles)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M44 18H50C53.3137 18 56 20.6863 56 24C56 28.5 52 32 45 32"
        stroke="url(#trophyHandles)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Main Cup Body */}
      <path
        d="M18 12H46V26C46 33.732 39.732 40 32 40C24.268 40 18 33.732 18 26V12Z"
        fill="url(#trophyGold)"
        stroke="#78350f"
        strokeWidth="1.5"
      />

      {/* Cup Rim Highlight */}
      <rect x="17" y="10" width="30" height="4" rx="2" fill="#fffbeb" stroke="#b45309" strokeWidth="1" />

      {/* Trophy Stem */}
      <rect x="29" y="40" width="6" height="8" rx="1" fill="url(#trophyGold)" stroke="#78350f" strokeWidth="1" />

      {/* Trophy Pedestal Base */}
      <path
        d="M22 48H42L45 56H19L22 48Z"
        fill="url(#trophyBase)"
        stroke="#4b5563"
        strokeWidth="1.5"
      />
      <rect x="17" y="56" width="30" height="3" rx="1.5" fill="#f59e0b" />

      {/* Center Star Emblem on Cup */}
      <polygon
        points="32,20 34,24 38,25 35,28 36,32 32,29 28,32 29,28 26,25 30,24"
        fill="#ffffff"
        opacity="0.95"
      />
    </svg>
  );
}

// Native Web Audio API celebratory arpeggio fanfare
function playTriumphantChime(isMuted: boolean) {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Fanfare chord arpeggio: C4, E4, G4, C5, E5, G5 triumph
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.7);
    });
  } catch {
    // Audio autoplay policy handled silently
  }
}

export function CelebrationModal({
  isOpen,
  data,
  onNextQuest,
  onReturnDashboard,
  onClose,
}: CelebrationModalProps) {
  const [displayedXp, setDisplayedXp] = useState(0);
  const [isMuted, setIsMuted] = useState(!isSoundEnabled());
  const [barProgress, setBarProgress] = useState(0);

  // Trigger celebration effects each time the modal opens
  useEffect(() => {
    if (!isOpen || !data) return;

    // Check current preference
    const soundMuted = !isSoundEnabled();
    setIsMuted(soundMuted);

    // Play triumphant fanfare
    playTriumphantChime(soundMuted);

    // Count up XP reward smoothly
    setDisplayedXp(0);
    const targetXp = data.xpAwarded;
    const duration = 750;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = Math.max(1, Math.ceil(targetXp / steps));

    let current = 0;
    const xpTimer = setInterval(() => {
      current += increment;
      if (current >= targetXp) {
        setDisplayedXp(targetXp);
        clearInterval(xpTimer);
      } else {
        setDisplayedXp(current);
      }
    }, stepTime);

    // Animate progress bar progression
    const prevXp = Math.max(0, data.newTotalXp - data.xpAwarded);
    const startPercent = Math.min(100, Math.max(10, ((prevXp % 1000) / 1000) * 100));
    const targetPercent = data.isLevelUp ? 100 : Math.min(100, Math.max(15, ((data.newTotalXp % 1000) / 1000) * 100));

    setBarProgress(startPercent);
    const barTimer = setTimeout(() => {
      setBarProgress(targetPercent);
    }, 200);

    return () => {
      clearInterval(xpTimer);
      clearTimeout(barTimer);
    };
  }, [isOpen, data, isMuted]);

  // Support ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  // Celebratory particles
  const confettiShapes = ["star", "square", "circle", "diamond"];
  const confettiColors = ["#7c5cff", "#f59e0b", "#10b981", "#38bdf8", "#ec4899", "#fbbf24"];
  const confettiParticles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 440 - 70,
    scale: Math.random() * 0.7 + 0.6,
    rotation: Math.random() * 720 - 360,
    shape: confettiShapes[i % confettiShapes.length],
    color: confettiColors[i % confettiColors.length],
    duration: 2.0 + (i % 4) * 0.25,
  }));

  const xpIntoCurrentLevel = data.newTotalXp % 1000;
  const xpNeededForNext = 1000 - xpIntoCurrentLevel;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(4, 4, 8, 0.90)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          overflowY: "auto",
        }}
      >
        
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {confettiParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
                scale: p.scale,
                rotate: p.rotation,
              }}
              transition={{
                duration: p.duration,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.shape === "star" ? (
                <span style={{ color: p.color, fontSize: 16, textShadow: `0 0 8px ${p.color}` }}>★</span>
              ) : p.shape === "diamond" ? (
                <span style={{ color: p.color, fontSize: 14, textShadow: `0 0 8px ${p.color}` }}>◆</span>
              ) : (
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: p.shape === "circle" ? "50%" : 2,
                    background: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Ambient Center Glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: data.isLevelUp
              ? "radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 68%)"
              : "radial-gradient(circle, rgba(124, 92, 255, 0.18) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        {/* Main Spacious Victory Card Container */}
        <motion.div
          initial={{ scale: 0.88, y: 25, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 15, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 580,
            background: "linear-gradient(165deg, rgba(20, 20, 30, 0.98) 0%, rgba(11, 11, 18, 0.99) 100%)",
            border: data.isLevelUp
              ? "1.5px solid rgba(245, 158, 11, 0.6)"
              : "1.5px solid rgba(124, 92, 255, 0.5)",
            borderRadius: 24,
            padding: "36px 36px 32px",
            boxShadow: data.isLevelUp
              ? "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(245, 158, 11, 0.25)"
              : "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(124, 92, 255, 0.25)",
            textAlign: "center",
          }}
        >
          {/* Top Sound Toggle Icon */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              setSoundEnabled(!nextMuted);
            }}
            title={isMuted ? "Unmute victory sound" : "Mute victory sound"}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              cursor: "pointer",
              color: isMuted ? "var(--text-muted)" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Top Banner Accent Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderRadius: "24px 24px 0 0",
              background: data.isLevelUp
                ? "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, transparent)"
                : "linear-gradient(90deg, transparent, #7c5cff, #10b981, transparent)",
            }}
          />

          {/* Crisp Vector Medallion Emblem */}
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 240, delay: 0.08 }}
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              margin: "0 auto 16px",
              background: data.isLevelUp
                ? "radial-gradient(circle at 35% 35%, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.35) 100%)"
                : "radial-gradient(circle at 35% 35%, rgba(124, 92, 255, 0.22) 0%, rgba(67, 56, 202, 0.35) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: data.isLevelUp
                ? "2px solid rgba(251, 191, 36, 0.6)"
                : "2px solid rgba(167, 139, 250, 0.6)",
              boxShadow: data.isLevelUp
                ? "0 0 35px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(245, 158, 11, 0.2)"
                : "0 0 35px rgba(124, 92, 255, 0.35), inset 0 0 15px rgba(124, 92, 255, 0.2)",
            }}
          >
            {data.isLevelUp ? (
              <LevelUpCrownIcon size={56} />
            ) : (
              <QuestVictoryTrophyIcon size={56} />
            )}
          </motion.div>

          {/* Level-Up Ascension Badge */}
          {data.isLevelUp && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.18, type: "spring" }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 999,
                background: "linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(251, 191, 36, 0.28), rgba(245, 158, 11, 0.18))",
                border: "1px solid rgba(245, 158, 11, 0.5)",
                color: "#fef08a",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 12,
                boxShadow: "0 0 18px rgba(245, 158, 11, 0.25)",
              }}
            >
              <span>🌟</span> ASCENDED TO LEVEL {data.newLevel}
            </motion.div>
          )}

          {/* Daily Bounty 2x Bonus Badge */}
          {data.isBounty && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.22, type: "spring" }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 999,
                background: "linear-gradient(90deg, rgba(245, 158, 11, 0.25), rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.25))",
                border: "1.5px solid #f59e0b",
                color: "#fef08a",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
                boxShadow: "0 0 24px rgba(245, 158, 11, 0.45)",
              }}
            >
              <span>⚔️</span> 2X DAILY BOUNTY BONUS CLAIMED!
            </motion.div>
          )}

          {/* Headline */}
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
              color: "#ffffff",
            }}
          >
            {data.isLevelUp
              ? "Level Up & Quest Conquered!"
              : "Quest Trial Conquered!"}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              margin: "0 0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span>You demonstrated mastery over</span>
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                background: "rgba(255, 255, 255, 0.08)",
                padding: "2px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {data.topicTitle}
            </span>
          </p>

          {/* Rewards Telemetry Grid - Spacious & Uncongested */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {/* XP Gained Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 16,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                XP Loot Awarded
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#f59e0b",
                  textShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <span>⚡</span>
                <span>+{displayedXp} XP</span>
              </div>
            </div>

            {/* Player Rank & Streak Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 16,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Rank & Streak
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>Lv. {data.newLevel}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>|</span>
                <span style={{ color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  🔥 {data.currentStreak}d
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar - Generous Padding */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                Level {data.newLevel} Mastery
              </span>
              <span style={{ color: "#f59e0b", fontWeight: 800 }}>
                {data.newTotalXp} XP Total
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.07)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.div
                initial={{ width: `${Math.max(10, barProgress - 20)}%` }}
                animate={{ width: `${barProgress}%` }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: data.isLevelUp
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #7c5cff, #10b981)",
                  boxShadow: data.isLevelUp ? "0 0 12px #f59e0b" : "0 0 12px #7c5cff",
                }}
              />
            </div>

            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                marginTop: 8,
                textAlign: "right",
              }}
            >
              {xpNeededForNext} XP to Level {data.newLevel + 1}
            </div>
          </div>

          {/* Newly Unlocked Achievements Trophy Banner */}
          {data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0 && (
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(124, 92, 255, 0.14) 100%)",
                border: "1.5px solid #f59e0b",
                borderRadius: 16,
                padding: "14px 18px",
                marginBottom: 20,
                textAlign: "left",
                boxShadow: "0 0 25px rgba(245, 158, 11, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#f59e0b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                <span>🏆</span> ACHIEVEMENT UNLOCKED!
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.newlyUnlockedAchievements.map((ach) => (
                  <div key={ach.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(245, 158, 11, 0.2)",
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {ach.icon || "🎖️"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ach.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{ach.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.nextTopic && onNextQuest && (
              <Button
                variant="primary"
                onClick={() => {
                  playButtonTap();
                  onNextQuest(data.nextTopic!.id);
                }}
                style={{
                  width: "100%",
                  padding: "13px",
                  fontSize: 14,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 0 22px var(--accent-glow)",
                }}
              >
                <span>⚔️</span> Embark on Next Quest: {data.nextTopic.title} →
              </Button>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Button
                variant="secondary"
                onClick={() => {
                  playButtonTap();
                  onReturnDashboard();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                📜 Return to Command Hub
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  playButtonTap();
                  onClose();
                }}
                style={{
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Review Code
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
