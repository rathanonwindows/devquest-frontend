import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ParticleField } from "../components/ui/ParticleField";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-soft), transparent), var(--bg-base)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <ParticleField />

      <style>
        {`
          @media (min-width: 960px) {
            .desktop-floating-card {
              display: block !important;
            }
          }
        `}
      </style>

      {/* ════════════════ STICKY NAV ════════════════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 48px",
          background: "rgba(10, 10, 15, 0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "-0.02em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 0 12px var(--accent-glow)",
            }}
          >
            ⚔️
          </span>
          <span>
            DEV<span style={{ color: "var(--accent)" }}>QUEST</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            style={{ fontSize: 13, color: "var(--text-secondary)" }}
          >
            Log in
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 18px",
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            Get Started →
          </Button>
        </div>
      </nav>

      {/* ════════════════ HERO SECTION (SCREEN 1) ════════════════ */}
      <section
        style={{
          minHeight: "calc(100vh - 72px)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px 48px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid rgba(124, 92, 255, 0.4)",
            background: "rgba(124, 92, 255, 0.12)",
            fontSize: 13,
            fontWeight: 700,
            color: "#c4b5fd",
            marginBottom: 24,
            boxShadow: "0 0 20px rgba(124, 92, 255, 0.2)",
          }}
        >
          🗡️ An RPG for learning to code
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{
            fontSize: "clamp(40px, 6.5vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.08,
            maxWidth: 860,
            margin: "0 0 24px",
            letterSpacing: "-0.03em",
          }}
        >
          Turn learning code into an{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #7c5cff 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            epic adventure
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "var(--text-secondary)",
            maxWidth: 620,
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          DevQuest turns your personalized learning path into quests, XP, and
          levels — so becoming a developer actually feels like progress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
        >
          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            style={{
              fontSize: 16,
              fontWeight: 800,
              padding: "16px 36px",
              boxShadow: "0 0 25px var(--accent-glow)",
            }}
          >
            Begin Your Quest →
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const el = document.getElementById("realms-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ fontSize: 15, padding: "16px 28px", fontWeight: 600 }}
          >
            Explore the World Map
          </Button>
        </motion.div>

        {/* Floating Celebration Callout Card */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            position: "absolute",
            right: "8%",
            top: "32%",
            background: "rgba(20, 20, 30, 0.85)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "var(--radius-md, 12px)",
            padding: "14px 20px",
            fontSize: 13,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.2)",
            textAlign: "left",
            display: "none",
          }}
          className="desktop-floating-card"
        >
          <div style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✅</span> Quest Complete
          </div>
          <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
            <span style={{ color: "#fbbf24", fontWeight: 800 }}>+125 XP</span> • Streak +1 Day
          </div>
        </motion.div>

        {/* Scroll Indicator at bottom */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            const el = document.getElementById("arena-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            position: "absolute",
            bottom: 24,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span>Scroll to explore</span>
          <span style={{ fontSize: 18 }}>⌄</span>
        </motion.div>
      </section>

      {/* ════════════════ SECTION 1: THE INTERACTIVE ARENA ════════════════ */}
      <section
        id="arena-section"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "var(--accent)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Real Code Trials • Zero Fluff
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            A living in-browser battleground.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-secondary)",
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Stop passive video watching. Solve authentic developer challenges with
            live syntax rendering, automated test runners, and instant XP feedback.
          </p>
        </motion.div>

        {/* Live Arena Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: "linear-gradient(170deg, #161726 0%, #0d0d16 100%)",
            border: "1px solid rgba(124, 92, 255, 0.35)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 92, 255, 0.15)",
          }}
        >
          {/* Top Window Chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "rgba(0, 0, 0, 0.4)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 12, fontWeight: 600 }}>
                DevQuest Arena • Trial: Responsive Media Queries
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                }}
              >
                +95 XP
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                }}
              >
                ● 4/4 Tests Passing
              </span>
            </div>
          </div>

          {/* Arena Body: Code & Preview Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              minHeight: 320,
            }}
          >
            {/* Left: Code Editor Mock */}
            <div
              style={{
                padding: "24px",
                background: "rgba(0, 0, 0, 0.3)",
                borderRight: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.7,
                color: "#e2e8f0",
              }}
            >
              <div style={{ color: "#64748b", marginBottom: 8 }}>// Quest Objective: Responsive Viewport Grid</div>
              <div>
                <span style={{ color: "#ec4899" }}>@media</span> (<span style={{ color: "#38bdf8" }}>max-width</span>: 768px) {"{"}
              </div>
              <div style={{ paddingLeft: 20 }}>
                <span style={{ color: "#a78bfa" }}>.quest-grid</span> {"{"}
              </div>
              <div style={{ paddingLeft: 40 }}>
                <span style={{ color: "#94a3b8" }}>display</span>: <span style={{ color: "#38bdf8" }}>flex</span>;
              </div>
              <div style={{ paddingLeft: 40 }}>
                <span style={{ color: "#94a3b8" }}>flex-direction</span>: <span style={{ color: "#38bdf8" }}>column</span>;
              </div>
              <div style={{ paddingLeft: 40 }}>
                <span style={{ color: "#94a3b8" }}>gap</span>: <span style={{ color: "#fbbf24" }}>16px</span>;
              </div>
              <div style={{ paddingLeft: 20 }}>{"}"}</div>
              <div>{"}"}</div>

              <div
                style={{
                  marginTop: 24,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#10b981",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚡</span> Runes Aligned! Media queries adjust layout under 768px perfectly.
              </div>
            </div>

            {/* Right: Live Preview Mock & Automated Runes */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.015)",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12 }}>
                  RUNIC VERIFICATION RUNNER
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Media query specifies max-width breakpoint at 768px",
                    "Grid container transforms to single-column flex orientation",
                    "Spaced gap dimensions maintained across mobile viewports",
                    "No horizontal scroll overflow on compact devices",
                  ].map((criterion, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 12,
                        color: "#e2e8f0",
                        background: "rgba(0, 0, 0, 0.2)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <span style={{ color: "#10b981", fontSize: 14 }}>✓</span>
                      <span>{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
                <Button
                  variant="primary"
                  onClick={() => navigate("/login")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: "0 0 16px var(--accent-glow)",
                  }}
                >
                  Conquer Quest Trial →
                </Button>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Instant XP Claim
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════ SECTION 2: THE 4 WORLD REALMS ════════════════ */}
      <section
        id="realms-section"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#fbbf24",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            The Overworld Atlas
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Four mythic realms of web craft.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-secondary)",
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            A continuous topological syllabus where prerequisite knowledge unlocks
            the next territory, from the foundation of the web to modern reactive architecture.
          </p>
        </motion.div>

        {/* 4 Realms Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              realm: "Realm I",
              name: "HTML Kingdom",
              icon: "🏰",
              accent: "#f59e0b",
              bgGradient: "rgba(245, 158, 11, 0.1)",
              topics: "HTML Basics • Semantic Layout • Forms & Inputs",
              desc: "Master the skeletal anatomy of the digital web. Write accessible, semantic structures search engines and screen readers respect.",
            },
            {
              realm: "Realm II",
              name: "CSS Forest",
              icon: "🌲",
              accent: "#10b981",
              bgGradient: "rgba(16, 185, 129, 0.1)",
              topics: "Box Model • Flexbox • CSS Grid • Media Queries",
              desc: "Tame the cascade. Craft pixel-perfect dimensions, responsive mobile layouts, and modern grid kingdoms.",
            },
            {
              realm: "Realm III",
              name: "JS Mountains",
              icon: "⛰️",
              accent: "#38bdf8",
              bgGradient: "rgba(56, 189, 248, 0.1)",
              topics: "Arrays • Objects • DOM Mutations • Async Fetch",
              desc: "Breathe algorithmic life into the DOM. Handle user events, fetch real APIs, and persist offline state with localStorage.",
            },
            {
              realm: "Realm IV",
              name: "React Spire",
              icon: "⚡",
              accent: "#a855f7",
              bgGradient: "rgba(168, 85, 247, 0.1)",
              topics: "Components • Props • useState • useEffect",
              desc: "Ascend to component alchemy. Build reactive single-page applications with declarative state and lifecycle side-effects.",
            },
          ].map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                background: `linear-gradient(170deg, #161726 0%, #0e0f17 100%)`,
                border: `1.5px solid ${r.accent}44`,
                borderRadius: 16,
                padding: "28px 24px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${r.accent}15`,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: r.bgGradient,
                      border: `1px solid ${r.accent}66`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {r.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: r.accent,
                      textTransform: "uppercase",
                    }}
                  >
                    {r.realm}
                  </span>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                  {r.name}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 18 }}>
                  {r.desc}
                </p>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 12,
                }}
              >
                <strong style={{ color: "#fff" }}>Key Trials:</strong> {r.topics}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ SECTION 3: GAMEPLAY MECHANICS & FEATURES ════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#a78bfa",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Built for Retention & Mastery
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Gamified to the core.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-secondary)",
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Every feature was engineered to remove decision fatigue and make the climb
            to software engineering genuinely rewarding.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              icon: "⚔️",
              title: "Daily Bounty Challenges",
              desc: "A featured trial rotates every 24 hours at midnight UTC offering a 2X Bonus XP multiplier to keep your coding streak blazing.",
              highlight: "2X Bonus XP Multiplier",
            },
            {
              icon: "🧙‍♂️",
              title: "Grand Scribe AI Mentor",
              desc: "An in-game AI mentor that applies the Socratic method — providing conceptual guidance and debugging hints without spoiling answers.",
              highlight: "Guarded Web Dev Mentor",
            },
            {
              icon: "🏆",
              title: "Trophy Codex & Streaks",
              desc: "12 custom trophies across 3 tiers (Novice, Adept, Legend) unlocking automatically as you reach study milestones and streak records.",
              highlight: "12 Mythic Achievements",
            },
            {
              icon: "📜",
              title: "Realm Mastery Diplomas",
              desc: "Upon mastering all 22 curriculum trials, graduate with an official imperial parchment diploma complete with wax seal and PDF print export.",
              highlight: "Official PDF Parchment",
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                background: "rgba(255, 255, 255, 0.025)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(124, 92, 255, 0.12)",
                    border: "1px solid rgba(124, 92, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                  {feat.desc}
                </p>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  background: "rgba(124, 92, 255, 0.1)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {feat.highlight}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ SECTION 4: 3 PLAYER ARCHETYPES ════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "80px 24px",
          maxWidth: 1000,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(145deg, rgba(25, 25, 40, 0.7) 0%, rgba(12, 12, 18, 0.9) 100%)",
            border: "1px solid rgba(124, 92, 255, 0.3)",
            borderRadius: 20,
            padding: "48px 36px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#fbbf24",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Customized Learning Tracks
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 900, margin: "0 0 12px" }}>
            Choose your class archetype.
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 36px" }}>
            Whether you are diving into frontend alchemy or full-stack architecture,
            DevQuest tailors the curriculum and estimated timelines to your daily study pace.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginBottom: 36,
            }}
          >
            {[
              {
                icon: "🧙‍♂️",
                title: "Frontend Mage",
                color: "#7c5cff",
                desc: "HTML, CSS dimensions, Flexbox & React Spire reactivity.",
              },
              {
                icon: "🛡️",
                title: "Backend Knight",
                color: "#3b82f6",
                desc: "Data integrity, API consumption, state architecture & logic.",
              },
              {
                icon: "🗡️",
                title: "Full-Stack Rogue",
                color: "#f59e0b",
                desc: "Complete digital sorcery spanning client to server systems.",
              },
            ].map((arch) => (
              <div
                key={arch.title}
                style={{
                  background: "rgba(0, 0, 0, 0.35)",
                  border: `1px solid ${arch.color}44`,
                  borderRadius: 12,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{arch.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  {arch.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {arch.desc}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            style={{
              fontSize: 15,
              fontWeight: 800,
              padding: "14px 32px",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            Select Your Archetype →
          </Button>
        </motion.div>
      </section>

      {/* ════════════════ SECTION 5: FINAL CTA BANNER ════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          textAlign: "center",
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124, 92, 255, 0.15), transparent 70%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 680, margin: "0 auto" }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
            }}
          >
            Ready to embark on your coding journey?
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Join the guild. Earn XP. Level up your developer skills with real code.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            style={{
              fontSize: 17,
              fontWeight: 800,
              padding: "16px 40px",
              boxShadow: "0 0 30px var(--accent-glow)",
            }}
          >
            Start Playing DevQuest — Free Forever →
          </Button>
        </motion.div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid var(--border)",
          background: "rgba(10, 10, 15, 0.9)",
          padding: "36px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚔️</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>DevQuest</span>
          <span>• The Gamified Web Development Campaign</span>
        </div>

        <div>
          Built for aspiring developers who dare to level up.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;