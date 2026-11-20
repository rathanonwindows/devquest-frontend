import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../lib/api";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  triggerType: "quests_completed" | "streak" | "xp_total" | "realm_completed";
  triggerValue: number;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: {
    current: number;
    target: number;
    percent: number;
  };
}

interface AchievementsViewProps {
  initialAchievements?: AchievementItem[] | null;
  onRefresh?: (data: AchievementItem[]) => void;
}

export function AchievementsView({ initialAchievements, onRefresh }: AchievementsViewProps = {}) {
  const { session } = useAuth();
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    initialAchievements && initialAchievements.length > 0 ? initialAchievements : []
  );
  const [loading, setLoading] = useState(!initialAchievements || initialAchievements.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const apiUrl = API_URL;

  // Sync if initialAchievements updates from parent
  useEffect(() => {
    if (initialAchievements && initialAchievements.length > 0) {
      setAchievements(initialAchievements);
      setLoading(false);
    }
  }, [initialAchievements]);

  const fetchAchievements = async (isBackground = false) => {
    if (!session?.access_token) return;
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(`${apiUrl}/me/achievements?_t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "Cache-Control": "no-cache",
        },
      });
      if (!res.ok) throw new Error("Failed to load achievements");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAchievements(data);
        onRefresh?.(data);
      }
    } catch (err: any) {
      console.error("Failed to load achievements:", err);
      if (!isBackground) {
        setError(err?.message || "Failed to load achievements");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // If we already have cached achievements, do a silent background sync; otherwise show loader
    const hasData = Boolean(initialAchievements && initialAchievements.length > 0);
    fetchAchievements(hasData);
  }, [session?.access_token]);

  const unlockedCount = useMemo(() => achievements.filter((a) => a.isUnlocked).length, [achievements]);
  const totalCount = achievements.length;
  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (statusFilter === "unlocked" && !a.isUnlocked) return false;
      if (statusFilter === "locked" && a.isUnlocked) return false;
      if (typeFilter !== "all" && a.triggerType !== typeFilter) return false;
      return true;
    });
  }, [achievements, statusFilter, typeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22 }}
      style={{
        flex: 1,
        maxWidth: 1360,
        width: "100%",
        margin: "0 auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ═════════ 1. TROPHY CODEX HERO BANNER ═════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(124, 92, 255, 0.14) 50%, rgba(19, 19, 26, 0.98) 100%)",
          border: "1.5px solid rgba(245, 158, 11, 0.35)",
          borderRadius: "var(--radius-lg, 16px)",
          padding: "26px 30px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #f59e0b, var(--accent), transparent)",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  textTransform: "uppercase",
                }}
              >
                🏆 HALL OF VALOR
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Permanent Account Accolades
              </span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>
              Trophy Codex
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, maxWidth: 600 }}>
              Commemorate your ascent through the coding realms. Complete trials, maintain streaks, and conquer entire world acts to unlock prestigious accolades.
            </p>
          </div>

          {/* Overall Trophy Mastery Card */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 14,
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border)",
              textAlign: "right",
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Codex Completion
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", margin: "4px 0" }}>
              {unlockedCount} / {totalCount} <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>({overallPercent}%)</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 6,
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${overallPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #10b981)",
                  borderRadius: 999,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═════════ 2. FILTER & SORT CONTROLS ═════════ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {/* Status Filter */}
        <div style={{ display: "flex", gap: 6, background: "rgba(0, 0, 0, 0.35)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          {(
            [
              { id: "all", label: `All (${totalCount})` },
              { id: "unlocked", label: `Claimed (${unlockedCount})` },
              { id: "locked", label: `Locked (${totalCount - unlockedCount})` },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setStatusFilter(btn.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                border: "none",
                background: statusFilter === btn.id ? "var(--accent)" : "transparent",
                color: statusFilter === btn.id ? "#000" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { id: "all", label: "All Categories", icon: "🌐" },
            { id: "realm_completed", label: "Realm Conquests", icon: "🏰" },
            { id: "quests_completed", label: "Trial Milestones", icon: "⚔️" },
            { id: "streak", label: "Streaks", icon: "🔥" },
            { id: "xp_total", label: "XP Pools", icon: "🌟" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: typeFilter === cat.id ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                background: typeFilter === cat.id ? "rgba(124, 92, 255, 0.16)" : "rgba(255, 255, 255, 0.02)",
                color: typeFilter === cat.id ? "#fff" : "var(--text-secondary)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ padding: "12px 18px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ═════════ 3. TROPHY GRID ═════════ */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)", fontSize: 14 }}>
          <span>⚔️ Consulting the Grand Trophy Archives...</span>
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-surface)", borderRadius: 14, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>No Trophies in this category</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Switch filters above to view all achievements.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
          {filteredAchievements.map((ach) => {
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, borderColor: ach.isUnlocked ? "#f59e0b" : "rgba(124, 92, 255, 0.4)" }}
                transition={{ duration: 0.2 }}
                style={{
                  background: ach.isUnlocked
                    ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(19, 19, 26, 0.95) 100%)"
                    : "var(--bg-surface)",
                  border: ach.isUnlocked ? "1.5px solid rgba(245, 158, 11, 0.45)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 14px)",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: ach.isUnlocked ? "0 4px 20px rgba(245, 158, 11, 0.12)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Glow accent for unlocked badges */}
                {ach.isUnlocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 120,
                      height: 120,
                      background: "radial-gradient(circle at top right, rgba(245, 158, 11, 0.15), transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                <div>
                  {/* Top row: Icon + Claimed pill */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: ach.isUnlocked ? "rgba(245, 158, 11, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: ach.isUnlocked ? "1.5px solid #f59e0b" : "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        boxShadow: ach.isUnlocked ? "0 0 16px rgba(245, 158, 11, 0.3)" : "none",
                        filter: ach.isUnlocked ? "none" : "grayscale(80%) opacity(0.6)",
                      }}
                    >
                      {ach.icon || "🏆"}
                    </div>

                    {ach.isUnlocked ? (
                      <span
                        style={{
                          fontSize: 9,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#f59e0b",
                          color: "#000",
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)",
                        }}
                      >
                        ✓ CLAIMED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 9,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        🔒 LOCKED
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: ach.isUnlocked ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      margin: "0 0 6px",
                    }}
                  >
                    {ach.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                      margin: "0 0 16px",
                    }}
                  >
                    {ach.description}
                  </p>
                </div>

                {/* Bottom Progress & Unlock Details */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {ach.isUnlocked ? "Status" : "Progress"}
                    </span>
                    <span style={{ color: ach.isUnlocked ? "#10b981" : "var(--accent)" }}>
                      {ach.isUnlocked
                        ? "Completed"
                        : `${ach.progress.current} / ${ach.progress.target} (${ach.progress.percent}%)`}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      borderRadius: 999,
                      background: "rgba(255, 255, 255, 0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${ach.isUnlocked ? 100 : ach.progress.percent}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: ach.isUnlocked
                          ? "#10b981"
                          : "linear-gradient(90deg, var(--accent), #f59e0b)",
                        boxShadow: ach.isUnlocked ? "0 0 8px #10b981" : "none",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {ach.unlockedAt && (
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: "right" }}>
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
