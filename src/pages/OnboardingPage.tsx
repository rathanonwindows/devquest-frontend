import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { ParticleField } from "../components/ui/ParticleField";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { API_URL } from "../lib/api";

const PRESET_DURATIONS = [
  { label: "⚡ 1 Month", desc: "Rapid Sprint", months: 1 },
  { label: "🛡️ 3 Months", desc: "Recommended", months: 3 },
  { label: "👑 6 Months", desc: "Deep Mastery", months: 6 },
  { label: "♾️ Flexible", desc: "No Rush", months: null },
];

function getDaysRemaining(dateStr: string) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const CLASSES = [
  {
    id: "frontend",
    title: "Frontend Mage",
    icon: "🧙‍♂️",
    desc: "Master visual spells, CSS sorcery, and modern React alchemy.",
    color: "#a855f7",
  },
  {
    id: "backend",
    title: "Backend Knight",
    icon: "🛡️",
    desc: "Guard data integrity, slay API bugs, and rule server architecture.",
    color: "#3b82f6",
  },
  {
    id: "fullstack",
    title: "Full-Stack Rogue",
    icon: "🗡️",
    desc: "Dual-wield client and server to build entire digital worlds solo.",
    color: "#f59e0b",
  },
];

const LEVELS = [
  { id: "beginner", label: "Novice (Lv. 1)", desc: "Brand new to code" },
  { id: "intermediate", label: "Apprentice (Lv. 15)", desc: "Know the basics" },
  { id: "advanced", label: "Veteran (Lv. 50)", desc: "Ready for mastery" },
];

const STYLES = [
  { id: "visual", label: "👁️ Visual Scrolls", desc: "Diagrams & video walkthroughs" },
  { id: "hands-on", label: "⚔️ Combat Trials", desc: "Writing code in the trenches" },
  { id: "reading", label: "📜 Ancient Codexes", desc: "Docs & architectural deep-dives" },
  { id: "mixed", label: "🔮 Arcane Synthesis (Mixed)", desc: "Adaptive blend of trials, visuals & scrolls" },
];

const TARGETS = [
  { id: "internship", label: "🛡️ Guild Internship", desc: "Join a company as an apprentice" },
  { id: "job", label: "👑 Full-Time Knight", desc: "Become a professional software engineer" },
  { id: "hobby", label: "🏕️ Indie Adventurer", desc: "Build passion projects & fun creations" },
];

const LOADING_STEPS = [
  "Attuning to your chosen class archetype...",
  "Calibrating quest difficulty and pacing...",
  "Plotting milestone skill tree & node paths...",
  "Enchanting learning realms and coding trials...",
  "Destiny forged! Teleporting to your dashboard...",
];

function OnboardingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Wizard Step (0: Class, 1: Stats & Pace, 2: Goal & Deadline)
  const [step, setStep] = useState(0);

  // Form State
  const [goal, setGoal] = useState("frontend");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [dailyHours, setDailyHours] = useState(2);
  const [deadline, setDeadline] = useState("");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [target, setTarget] = useState("internship");

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const apiUrl = API_URL;

  // If user account already exists and is onboarded, skip onboarding and redirect to dashboard
  useEffect(() => {
    if (!session) {
      setCheckingExisting(false);
      return;
    }

    let isMounted = true;
    const checkExistingAccount = async () => {
      try {
        const res = await fetch(`${apiUrl}/me/account`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const account = await res.json();
          if (account.isOnboarded || account.hasRoadmap) {
            if (isMounted) {
              navigate("/dashboard", { replace: true });
              return;
            }
          }
        }
      } catch {
        // Fallback: stay on onboarding
      } finally {
        if (isMounted) {
          setCheckingExisting(false);
        }
      }
    };

    checkExistingAccount();

    return () => {
      isMounted = false;
    };
  }, [session, apiUrl, navigate]);

  // Staggered loading messages cycle
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingStepIndex(0);

    const startTime = Date.now();

    try {
      const res = await fetch(`${apiUrl}/roadmap/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          goal,
          dailyHours: Number(dailyHours),
          deadline: deadline || null,
          currentLevel,
          learningStyle,
          target,
        }),
      });

      if (!res.ok) throw new Error();

      // Ensure minimum 2.8s of the magical forging sequence so player enjoys it
      const elapsed = Date.now() - startTime;
      if (elapsed < 2800) {
        await new Promise((r) => setTimeout(r, 2800 - elapsed));
      }

      navigate("/dashboard");
    } catch {
      setError("The summoning spell faltered. Check your inputs or connection and try again.");
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <LoadingScreen
        title="CONSULTING QUEST CODEX"
        subtitle="Verifying adventurer character record & quest trajectory..."
        icon="📜"
        badge="DEVQUEST REALM // CHECKING SAVE"
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-soft), transparent), var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        overflowX: "hidden",
      }}
    >
      <ParticleField />

      {/* ════════════════ MAGICAL RITUAL LOADING OVERLAY ════════════════ */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(6, 6, 10, 0.88)",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
            }}
          >
            {/* Pulsing Arcane Orb */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, var(--accent) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 50px var(--accent)",
                marginBottom: 36,
                position: "relative",
              }}
            >
              <span style={{ fontSize: 44 }}>🔮</span>
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: "2px dashed var(--accent)",
                  opacity: 0.5,
                }}
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px", color: "#fff" }}
            >
              Forging Your Personalized Quest Path...
            </motion.h2>

            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 15,
                  color: "var(--accent)",
                  fontFamily: "monospace",
                  minHeight: 24,
                  margin: "0 0 28px",
                }}
              >
                {LOADING_STEPS[loadingStepIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Glowing Progress Track */}
            <div
              style={{
                width: "100%",
                maxWidth: 340,
                height: 6,
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <motion.div
                initial={{ width: "10%" }}
                animate={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent), #ec4899)",
                  boxShadow: "0 0 12px var(--accent)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════ MAIN CHARACTER CREATION CARD ════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 620,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md, 20px)",
          padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Step Indicator Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 28 : 8,
                  height: 6,
                  borderRadius: 999,
                  background: i === step ? "var(--accent)" : i < step ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Step {step + 1} of 3
          </span>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ──────────────── STEP 1: CLASS SELECTION ──────────────── */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                ⚔️ Character Archetype
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
                Choose Your Coding Class
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                This dictates your core questline and the elemental technologies you'll master.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {CLASSES.map((cls) => {
                const isSelected = goal === cls.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setGoal(cls.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: "var(--radius-md, 12px)",
                      border: isSelected ? `2px solid var(--accent)` : "1px solid var(--border)",
                      background: isSelected ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 0 20px var(--accent-soft)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: "rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {cls.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 3 }}>
                        {cls.title}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {cls.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: isSelected ? "6px solid var(--accent)" : "2px solid var(--border)",
                        background: isSelected ? "#fff" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <Button
              variant="primary"
              onClick={() => setStep(1)}
              style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 600 }}
            >
              Continue to Stats & Pace →
            </Button>
          </motion.div>
        )}

        {/* ──────────────── STEP 2: STATS & PACE ──────────────── */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                📊 Attribute Calibration
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
                Tune Your Training Stamina
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                Set your starting experience and how many hours you can commit to questing daily.
              </p>
            </div>

            {/* Current Level */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
                Starting Skill Level
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {LEVELS.map((lvl) => {
                  const isSelected = currentLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCurrentLevel(lvl.id)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "var(--radius-md, 8px)",
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.2)",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{lvl.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Hours Slider / Presets */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                  Daily Quest Stamina
                </label>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                  ⚡ {dailyHours} {dailyHours === 1 ? "hour" : "hours"} / day
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--accent)",
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                <span>0.5h (Casual)</span>
                <span>2h (Recommended)</span>
                <span>8h (Full Immersion)</span>
              </div>
            </div>

            {/* Learning Style */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
                Preferred Learning Style
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STYLES.map((st) => {
                  const isSelected = learningStyle === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setLearningStyle(st.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md, 8px)",
                        border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{st.label}</span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="ghost" onClick={() => setStep(0)} style={{ flex: 1, padding: "13px" }}>
                ← Back
              </Button>
              <Button variant="primary" onClick={() => setStep(2)} style={{ flex: 2, padding: "13px", fontWeight: 600 }}>
                Next: Campaign Goal →
              </Button>
            </div>
          </motion.div>
        )}

        {/* ──────────────── STEP 3: CAMPAIGN TARGET & DEADLINE ──────────────── */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                🎯 Ultimate Victory Condition
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
                Set Your Final Destination
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                What is your ultimate objective at the end of this questline?
              </p>
            </div>

            {/* Target Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {TARGETS.map((t) => {
                const isSelected = target === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTarget(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md, 10px)",
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: isSelected ? "5px solid var(--accent)" : "2px solid var(--border)",
                        background: isSelected ? "#fff" : "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>

                        {/* ══════════════ QUEST TIMER / DEADLINE ══════════════ */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                  Target Completion Date (Optional Quest Timer)
                </label>
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Clear timer
                  </button>
                )}
              </div>

              {/* Quick Duration Presets */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                {PRESET_DURATIONS.map((preset) => {
                  const today = new Date();
                  let presetDate = "";
                  if (preset.months) {
                    const d = new Date();
                    d.setMonth(today.getMonth() + preset.months);
                    presetDate = d.toISOString().split("T")[0];
                  }
                  const isSelected = preset.months === null ? !deadline : deadline === presetDate;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.months === null) {
                          setDeadline("");
                        } else {
                          const d = new Date();
                          d.setMonth(d.getMonth() + preset.months);
                          setDeadline(d.toISOString().split("T")[0]);
                        }
                      }}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "var(--radius-md, 8px)",
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.2)",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{preset.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dark Themed Date Input */}
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md, 8px)",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid var(--border)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    colorScheme: "dark", // 🔥 THIS FORCES THE BROWSER POPUP INTO DARK MODE
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Dynamic countdown label */}
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                {deadline ? (
                  (() => {
                    const days = getDaysRemaining(deadline);
                    return days && days > 0 ? (
                      <span style={{ color: "var(--accent)" }}>
                        🎯 Quest deadline set: {new Date(deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} (~{days} days remaining)
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>Deadline: Today</span>
                    );
                  })()
                ) : (
                  <span>No deadline set — quest freely at your own pace.</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="ghost" onClick={() => setStep(1)} style={{ flex: 1, padding: "13px" }}>
                ← Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                style={{
                  flex: 2,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 0 25px var(--accent-soft)",
                }}
              >
                ✨ Forge My Roadmap & Begin Quest →
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default OnboardingPage;