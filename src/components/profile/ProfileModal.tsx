import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import {
  isSoundEnabled,
  setSoundEnabled,
  playButtonTap,
  playSuccessChime,
} from "../../lib/soundEffects";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  initialName?: string | null;
  initialGoal?: string | null;
  initialDailyHours?: number | null;
  email?: string;
  totalQuests: number;
  completedQuests: number;
  totalXp: number;
  currentLevel: number;
  onProfileSaved: () => void;
  onOpenCertificate: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  token,
  initialName,
  initialGoal,
  initialDailyHours,
  email,
  totalQuests,
  completedQuests,
  totalXp,
  currentLevel,
  onProfileSaved,
  onOpenCertificate,
}: ProfileModalProps) {
  const [name, setName] = useState(initialName || "");
  const [goal, setGoal] = useState(initialGoal || "frontend");
  const [dailyHours, setDailyHours] = useState<number>(initialDailyHours || 2);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setGoal(initialGoal || "frontend");
      setDailyHours(initialDailyHours || 2);
      setSoundActive(isSoundEnabled());
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, initialName, initialGoal, initialDailyHours]);

  if (!isOpen) return null;

  const handleSoundToggle = (enabled: boolean) => {
    setSoundActive(enabled);
    setSoundEnabled(enabled);
    if (enabled) {
      playSuccessChime();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    playButtonTap();

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          goal,
          dailyHours: Number(dailyHours),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to update profile");
      }

      playSuccessChime();
      setSaveSuccess(true);
      onProfileSaved();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9998,
          padding: 20,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 380 }}
          style={{
            maxWidth: 580,
            width: "100%",
            background: "linear-gradient(145deg, #181926 0%, #101018 100%)",
            border: "1px solid rgba(124, 92, 255, 0.3)",
            borderRadius: 18,
            boxShadow: "0 0 50px rgba(124, 92, 255, 0.2), 0 24px 48px rgba(0, 0, 0, 0.8)",
            padding: "28px 32px",
            color: "var(--text-primary)",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🧙‍♂️</span>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
                    Adventurer Record & Settings
                  </h2>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    Manage your player persona, audio preferences, and academic diplomas
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 18,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Quick Player Summary Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(124, 92, 255, 0.08)",
              border: "1px solid rgba(124, 92, 255, 0.2)",
              borderRadius: 12,
              padding: "12px 18px",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase" }}>
                Active Adventurer Account
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{email}</div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                playButtonTap();
                onOpenCertificate();
              }}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderColor: "#f59e0b",
                color: "#f59e0b",
                background: "rgba(245, 158, 11, 0.08)",
              }}
            >
              📜 View Arcane Diploma
            </Button>
          </div>

          {/* Mini Character Stats Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 12px",
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Mastered</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
                {completedQuests} / {totalQuests || 22}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Arcane XP</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>
                {totalXp} XP
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Rank</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#a855f7", marginTop: 2 }}>
                Level {currentLevel}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Field 1: Display Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Adventurer Title / Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Srujan Poojary or Archmage Eldrin"
                maxLength={60}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                Bestowed officially upon your Realm Mastery Diploma and certificate prints.
              </span>
            </div>

            {/* Field 2: Class Archetype / Goal */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Class Archetype & Focus Path
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { id: "frontend", icon: "🧙‍♂️", label: "Frontend Mage", desc: "HTML, CSS & React" },
                  { id: "backend", icon: "🛡️", label: "Backend Knight", desc: "APIs, Logic & State" },
                  { id: "fullstack", icon: "🗡️", label: "Full-Stack Rogue", desc: "Complete Mastery" },
                ].map((arch) => {
                  const isSelected = goal === arch.id;
                  return (
                    <div
                      key={arch.id}
                      onClick={() => {
                        playButtonTap();
                        setGoal(arch.id);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(124, 92, 255, 0.15)" : "rgba(0, 0, 0, 0.25)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 20 }}>{arch.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#fff" : "#94a3b8", marginTop: 4 }}>
                        {arch.label}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{arch.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Daily Study Target */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Daily Study Target: {dailyHours} {dailyHours === 1 ? "Hour" : "Hours"} / Day
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                <span>1h (Casual)</span>
                <span>2-3h (Optimal)</span>
                <span>4h+ (Intense Grinder)</span>
              </div>
            </div>

            {/* Field 4: Arcane Audio Feedback Toggle (Per user instructions: inside profile!) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🔔</span> Arcane Audio Feedback & Fanfares
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Synthesized retro chimes for quest completions, level-ups, and clicks
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {soundActive && (
                  <button
                    type="button"
                    onClick={() => playSuccessChime()}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid var(--border)",
                      color: "#cbd5e1",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    🔊 Test
                  </button>
                )}

                <label
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: 44,
                    height: 24,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={soundActive}
                    onChange={(e) => handleSoundToggle(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: soundActive ? "var(--accent)" : "#334155",
                      borderRadius: 24,
                      transition: "0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: 18,
                        width: 18,
                        left: soundActive ? 23 : 3,
                        bottom: 3,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: "0.2s",
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div
                style={{
                  fontSize: 12,
                  color: "#f87171",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            {saveSuccess && (
              <div
                style={{
                  fontSize: 12,
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                ✅ Adventurer Record updated successfully! Roadmap schedule refreshed.
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <Button type="button" variant="ghost" onClick={onClose} style={{ fontSize: 13, padding: "8px 16px" }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                style={{
                  fontSize: 13,
                  padding: "8px 20px",
                  fontWeight: 700,
                  boxShadow: "0 0 16px var(--accent-glow)",
                }}
              >
                {saving ? "Inscribing..." : "💾 Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
