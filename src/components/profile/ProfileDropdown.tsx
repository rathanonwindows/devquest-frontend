import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import {
  isSoundEnabled,
  setSoundEnabled,
  playButtonTap,
  playSuccessChime,
} from "../../lib/soundEffects";

export const CURATED_AVATARS = [
  { id: "mage", emoji: "🧙‍♂️", label: "Mage" },
  { id: "elf", emoji: "🧝‍♀️", label: "Elf" },
  { id: "ninja", emoji: "🥷", label: "Ninja" },
  { id: "robot", emoji: "🤖", label: "Golem" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
  { id: "fox", emoji: "🦊", label: "Kitsune" },
  { id: "knight", emoji: "⚔️", label: "Paladin" },
  { id: "monarch", emoji: "👑", label: "Monarch" },
  { id: "scholar", emoji: "🦉", label: "Scholar" },
  { id: "rogue", emoji: "🐺", label: "Rogue" },
  { id: "alchemist", emoji: "⚡", label: "Spark" },
  { id: "guardian", emoji: "🛡️", label: "Guardian" },
];

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  initialName?: string | null;
  initialAvatar?: string | null;
  initialGoal?: string | null;
  initialDailyHours?: number | null;
  email?: string;
  totalQuests: number;
  completedQuests: number;
  totalXp: number;
  currentLevel: number;
  onProfileSaved: () => void;
  onOpenCertificate: () => void;
  onSignOut: () => void;
}

export function ProfileDropdown({
  isOpen,
  onClose,
  token,
  initialName,
  initialAvatar,
  initialGoal,
  initialDailyHours,
  email,
  totalQuests,
  completedQuests,
  totalXp,
  currentLevel,
  onProfileSaved,
  onOpenCertificate,
  onSignOut,
}: ProfileDropdownProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [name, setName] = useState(initialName || "");
  const [avatar, setAvatar] = useState(initialAvatar || "🧙‍♂️");
  const [goal, setGoal] = useState(initialGoal || "frontend");
  const [dailyHours, setDailyHours] = useState<number>(initialDailyHours || 2);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [diplomaLockedMessage, setDiplomaLockedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setAvatar(initialAvatar || "🧙‍♂️");
      setGoal(initialGoal || "frontend");
      setDailyHours(initialDailyHours || 2);
      setSoundActive(isSoundEnabled());
      setSaveSuccess(false);
      setDiplomaLockedMessage(false);
      setErrorMessage(null);
    }
  }, [isOpen, initialName, initialAvatar, initialGoal, initialDailyHours]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMasteredAll = totalQuests > 0 && completedQuests >= totalQuests;

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
          avatar,
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
      }, 2500);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiplomaClick = () => {
    playButtonTap();
    if (!isMasteredAll) {
      setDiplomaLockedMessage(true);
      setTimeout(() => setDiplomaLockedMessage(false), 3500);
    } else {
      onClose();
      onOpenCertificate();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: "62px",
          right: "24px",
          width: 360,
          background: "linear-gradient(170deg, #181926 0%, #0e0f17 100%)",
          border: "1px solid rgba(124, 92, 255, 0.3)",
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.75), 0 0 25px rgba(124, 92, 255, 0.15)",
          zIndex: 1000,
          padding: "18px 20px",
          color: "var(--text-primary)",
        }}
      >
        {/* Subtle Tab Switcher: Profile vs Settings */}
        <div
          style={{
            display: "flex",
            background: "rgba(0, 0, 0, 0.4)",
            borderRadius: 10,
            padding: 3,
            marginBottom: 16,
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              playButtonTap();
              setActiveTab("profile");
            }}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeTab === "profile" ? "var(--accent)" : "transparent",
              color: activeTab === "profile" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            👤 Profile
          </button>
          <button
            type="button"
            onClick={() => {
              playButtonTap();
              setActiveTab("settings");
            }}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeTab === "settings" ? "var(--accent)" : "transparent",
              color: activeTab === "settings" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* ═══ TAB 1: USER PROFILE & PFP ═══ */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Avatar Header & Curated PFP Grid */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(124, 92, 255, 0.15)",
                    border: "2px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    boxShadow: "0 0 12px var(--accent-glow)",
                    flexShrink: 0,
                  }}
                >
                  {avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    Choose Your Avatar
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Select a heroic persona
                  </div>
                </div>
              </div>

              {/* Curated Avatars Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 6,
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                {CURATED_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playButtonTap();
                      setAvatar(av.emoji);
                    }}
                    title={av.label}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: avatar === av.emoji ? "2px solid var(--accent)" : "1px solid rgba(255,255,255,0.06)",
                      background: avatar === av.emoji ? "rgba(124, 92, 255, 0.2)" : "rgba(255, 255, 255, 0.02)",
                      fontSize: 18,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Adventurer Name Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Adventurer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shadow Walker, Pixel Knight"
                maxLength={40}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                Account: {email}
              </div>
            </div>

            {/* Mini Player Stats Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>Mastered</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
                  {completedQuests} / {totalQuests || 22}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>Arcane XP</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>
                  {totalXp} XP
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>Rank</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#a855f7", marginTop: 2 }}>
                  Level {currentLevel}
                </div>
              </div>
            </div>

            {/* Realm Mastery Diploma Status Button */}
            <div>
              <button
                type="button"
                onClick={handleDiplomaClick}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: isMasteredAll ? "1px solid #f59e0b" : "1px solid var(--border)",
                  background: isMasteredAll ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isMasteredAll ? "#fbbf24" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📜</span> Realm Mastery Diploma
                </span>
                <span style={{ fontSize: 11, color: isMasteredAll ? "#10b981" : "var(--text-muted)" }}>
                  {isMasteredAll ? "Conferred ✨" : `🔒 (${completedQuests}/${totalQuests || 22})`}
                </span>
              </button>

              {diplomaLockedMessage && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#f59e0b",
                    marginTop: 4,
                    padding: "4px 8px",
                    background: "rgba(245, 158, 11, 0.1)",
                    borderRadius: 6,
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  🔒 Complete all {totalQuests || 22} curriculum quests to unlock your official diploma!
                </div>
              )}
            </div>

            {/* Feedback messages */}
            {errorMessage && (
              <div style={{ fontSize: 11, color: "#f87171" }}>
                ⚠️ {errorMessage}
              </div>
            )}
            {saveSuccess && (
              <div style={{ fontSize: 11, color: "#10b981" }}>
                ✅ Profile updated!
              </div>
            )}

            {/* Save Profile Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        )}

        {/* ═══ TAB 2: ADVANCED SETTINGS & AUDIO ═══ */}
        {activeTab === "settings" && (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Sound Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🔔</span> Arcane Audio Effects
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  Fantasy chimes & fanfares
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {soundActive && (
                  <button
                    type="button"
                    onClick={() => playSuccessChime()}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid var(--border)",
                      color: "#cbd5e1",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    🔊 Test
                  </button>
                )}

                <label style={{ position: "relative", display: "inline-block", width: 36, height: 20, cursor: "pointer" }}>
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
                      borderRadius: 20,
                      transition: "0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: 14,
                        width: 14,
                        left: soundActive ? 19 : 3,
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

            {/* Class Archetype */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Class Archetype
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[
                  { id: "frontend", icon: "🧙‍♂️", label: "Frontend" },
                  { id: "backend", icon: "🛡️", label: "Backend" },
                  { id: "fullstack", icon: "🗡️", label: "Full-Stack" },
                ].map((arch) => (
                  <div
                    key={arch.id}
                    onClick={() => {
                      playButtonTap();
                      setGoal(arch.id);
                    }}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      border: goal === arch.id ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: goal === arch.id ? "rgba(124, 92, 255, 0.15)" : "rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 16 }}>{arch.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: goal === arch.id ? "#fff" : "#94a3b8", marginTop: 2 }}>
                      {arch.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Hours Slider */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                Daily Study Target: {dailyHours}h / day
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                <span>1h (Casual)</span>
                <span>4h+ (Intense)</span>
              </div>
            </div>

            {/* Save Settings Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        )}

        {/* ═══ LOG OUT BUTTON (Inside Profile Dropdown) ═══ */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => {
              playButtonTap();
              onSignOut();
            }}
            style={{
              width: "100%",
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid rgba(239, 68, 68, 0.25)",
              background: "rgba(239, 68, 68, 0.06)",
              color: "#f87171",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.06)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
            }}
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
