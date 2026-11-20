import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../lib/api";
import { playButtonTap } from "../../lib/soundEffects";

export interface AnalyticsSummary {
  player: {
    level: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    completedQuests: number;
    totalQuests: number;
    completionPercent: number;
  };
  dailyXpVelocity: {
    date: string;
    day: string;
    xp: number;
    quests: number;
  }[];
  realmMastery: {
    realmId: string;
    name: string;
    shortName: string;
    icon: string;
    completed: number;
    total: number;
    percent: number;
    xpEarned: number;
    xpTotal: number;
  }[];
  recentActivity: {
    topicTitle: string;
    completedAt: string;
    xpAwarded: number;
  }[];
}

const REALM_ACCENTS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  "html-kingdom": {
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.35)",
    glow: "rgba(245, 158, 11, 0.25)",
    text: "#fbbf24",
  },
  "css-forest": {
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.35)",
    glow: "rgba(16, 185, 129, 0.25)",
    text: "#34d399",
  },
  "javascript-mountains": {
    bg: "rgba(56, 189, 248, 0.08)",
    border: "rgba(56, 189, 248, 0.35)",
    glow: "rgba(56, 189, 248, 0.25)",
    text: "#38bdf8",
  },
  "react-spire": {
    bg: "rgba(168, 85, 247, 0.08)",
    border: "rgba(168, 85, 247, 0.35)",
    glow: "rgba(168, 85, 247, 0.25)",
    text: "#c084fc",
  },
};

function getTierName(level: number): { name: string; color: string } {
  if (level >= 50) return { name: "Legendary Grandmaster", color: "#f43f5e" };
  if (level >= 30) return { name: "Archmage of Code", color: "#ec4899" };
  if (level >= 20) return { name: "Master Alchemist", color: "#a855f7" };
  if (level >= 10) return { name: "Artisan Developer", color: "#38bdf8" };
  if (level >= 5) return { name: "Journeyman Scripter", color: "#10b981" };
  if (level >= 2) return { name: "Guild Apprentice", color: "#f59e0b" };
  return { name: "Novice Initiate", color: "#94a3b8" };
}

interface AnalyticsViewProps {
  initialAnalytics?: AnalyticsSummary | null;
  onRefresh?: (data: AnalyticsSummary) => void;
}

export function AnalyticsView({ initialAnalytics, onRefresh }: AnalyticsViewProps = {}) {
  const { session } = useAuth();
  const [data, setData] = useState<AnalyticsSummary | null>(initialAnalytics || null);
  const [loading, setLoading] = useState(!initialAnalytics);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const apiUrl = API_URL;

  // Sync if initialAnalytics updates from parent
  useEffect(() => {
    if (initialAnalytics) {
      setData(initialAnalytics);
      setLoading(false);
    }
  }, [initialAnalytics]);

  const fetchAnalytics = async (isBackground = false) => {
    if (!session?.access_token) return;
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(`${apiUrl}/me/analytics?_t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "Cache-Control": "no-cache",
        },
      });
      if (!res.ok) throw new Error("Failed to load analytics telemetry");
      const json = await res.json();
      setData(json);
      onRefresh?.(json);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      if (!isBackground) {
        setError(err?.message || "Failed to load analytics telemetry");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    const hasData = Boolean(initialAnalytics);
    fetchAnalytics(hasData);
  }, [session?.access_token]);

  const maxVelocityXp = useMemo(() => {
    if (!data?.dailyXpVelocity || data.dailyXpVelocity.length === 0) return 100;
    const maxVal = Math.max(...data.dailyXpVelocity.map((d) => d.xp));
    return maxVal > 0 ? maxVal : 100;
  }, [data]);

  const tier = useMemo(() => {
    return getTierName(data?.player.level || 1);
  }, [data]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "3px solid rgba(168, 85, 247, 0.2)",
            borderTopColor: "var(--accent, #a855f7)",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Gathering your arcane battle telemetry...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 16,
          maxWidth: 600,
          margin: "40px auto",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>
          Telemetry Offline
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          {error || "Could not retrieve player statistics."}
        </div>
        <button
          onClick={() => {
            playButtonTap();
            fetchAnalytics();
          }}
          style={{
            padding: "8px 18px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Retry Calibration
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1240,
        margin: "0 auto",
        padding: "0 24px 80px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* ══════════ TOP TELEMETRY HUD RIBBON ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Card 1: Player Rank */}
        <div
          style={{
            padding: "20px 22px",
            background: "rgba(18, 20, 36, 0.8)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>
            Guild Rank
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>
              Level {data.player.level}
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: tier.color }}>
            {tier.name}
          </div>
        </div>

        {/* Card 2: Total XP */}
        <div
          style={{
            padding: "20px 22px",
            background: "rgba(18, 20, 36, 0.8)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>
            Harvested XP
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24", fontFamily: "var(--font-heading)" }}>
              {data.player.totalXp.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, color: "rgba(251, 191, 36, 0.8)", fontWeight: 700 }}>XP</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Earned from completed trials
          </div>
        </div>

        {/* Card 3: Curriculum Completion */}
        <div
          style={{
            padding: "20px 22px",
            background: "rgba(18, 20, 36, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>
            Curriculum Mastery
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#38bdf8", fontFamily: "var(--font-heading)" }}>
              {data.player.completedQuests}/{data.player.totalQuests}
            </span>
            <span style={{ fontSize: 14, color: "#38bdf8", fontWeight: 700 }}>
              ({data.player.completionPercent}%)
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Total trials conquered
          </div>
        </div>

        {/* Card 4: Consistency Streak */}
        <div
          style={{
            padding: "20px 22px",
            background: "rgba(18, 20, 36, 0.8)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>
            Consistency Streak
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#f87171", fontFamily: "var(--font-heading)" }}>
              {data.player.currentStreak}
            </span>
            <span style={{ fontSize: 14, color: "rgba(248, 113, 113, 0.8)", fontWeight: 700 }}>Days</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Personal record: {data.player.longestStreak} days
          </div>
        </div>
      </motion.div>

      {/* ══════════ 14-DAY XP VELOCITY TIMELINE (INTERACTIVE BAR CHART) ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          padding: "26px 28px",
          background: "rgba(18, 20, 36, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          backdropFilter: "blur(16px)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "var(--font-heading)" }}>
                14-Day XP Velocity Timeline
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Daily experience production and quest completion frequency.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent, #a855f7)" }} />
              Active Battle Day
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255, 255, 255, 0.1)" }} />
              Rest Day
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
            height: 180,
            paddingTop: 30,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
          }}
        >
          {data.dailyXpVelocity.map((dayData, idx) => {
            const hasXp = dayData.xp > 0;
            const barHeightPercent = hasXp
              ? Math.max(18, Math.round((dayData.xp / maxVelocityXp) * 100))
              : 8;
            const isHovered = hoveredBarIndex === idx;

            return (
              <div
                key={dayData.date}
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      bottom: `calc(${barHeightPercent}% + 12px)`,
                      background: "rgba(10, 10, 20, 0.95)",
                      border: "1px solid rgba(168, 85, 247, 0.5)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      zIndex: 20,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#fff" }}>{dayData.date}</div>
                    <div style={{ color: "#fbbf24", fontWeight: 700 }}>+{dayData.xp} XP</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{dayData.quests} quest(s)</div>
                  </motion.div>
                )}

                {/* Animated Bar Column */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeightPercent}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  style={{
                    width: "100%",
                    maxWidth: 32,
                    borderRadius: "6px 6px 2px 2px",
                    background: hasXp
                      ? isHovered
                        ? "linear-gradient(180deg, #c084fc 0%, #7e22ce 100%)"
                        : "linear-gradient(180deg, #a855f7 0%, #6b21a8 100%)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: hasXp
                      ? "1px solid rgba(168, 85, 247, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    boxShadow: hasXp ? "0 0 12px rgba(168, 85, 247, 0.3)" : "none",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                />

                {/* Day Label below bar */}
                <div style={{ marginTop: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: hasXp ? "#fff" : "var(--text-muted)" }}>
                    {dayData.day}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>
                    {dayData.date.split(" ")[1]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════ 4-REALM DOMAIN MASTERY ══════════ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🗺️</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "var(--font-heading)" }}>
            Four Realms Domain Mastery
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {data.realmMastery.map((realm, idx) => {
            const colors = REALM_ACCENTS[realm.realmId] || {
              bg: "rgba(255, 255, 255, 0.05)",
              border: "rgba(255, 255, 255, 0.1)",
              glow: "transparent",
              text: "#fff",
            };

            const isMastered = realm.percent === 100;
            const isInProgress = realm.percent > 0 && !isMastered;

            return (
              <motion.div
                key={realm.realmId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                style={{
                  padding: "22px 24px",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 18,
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), inset 0 0 20px ${colors.glow}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{realm.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{realm.shortName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{realm.name}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: isMastered
                        ? "rgba(16, 185, 129, 0.2)"
                        : isInProgress
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(255, 255, 255, 0.06)",
                      border: isMastered
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : isInProgress
                        ? "1px solid rgba(245, 158, 11, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      color: isMastered ? "#34d399" : isInProgress ? "#fbbf24" : "var(--text-muted)",
                    }}
                  >
                    {isMastered ? "Mastered 👑" : isInProgress ? "Active ⚔️" : "Uncharted 🔒"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)" }}>Domain Quests</span>
                    <span style={{ fontWeight: 700, color: colors.text }}>
                      {realm.completed} / {realm.total} ({realm.percent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(0, 0, 0, 0.35)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${realm.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      style={{
                        height: "100%",
                        background: colors.text,
                        borderRadius: 999,
                        boxShadow: `0 0 10px ${colors.glow}`,
                      }}
                    />
                  </div>
                </div>

                {/* XP Breakdown */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    paddingTop: 6,
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <span>Experience Claimed</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>
                    {realm.xpEarned} / {realm.xpTotal} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══════════ RECENT ACTIVITY CONQUEST LEDGER ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          padding: "26px 28px",
          background: "rgba(18, 20, 36, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>📜</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "var(--font-heading)" }}>
            Conquest Ledger (Recent Trials)
          </h2>
        </div>

        {data.recentActivity.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: 12,
              border: "1px dashed rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚔️</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>No trials conquered yet.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Mount your steed and embark on your first quest in the Bounty Deck!
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.recentActivity.map((activity, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>⚔️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                      {activity.topicTitle}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Conquered on {activity.completedAt}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  +{activity.xpAwarded} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
