import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { AchievementsView, type AchievementItem } from "../components/dashboard/AchievementsView";
import { AnalyticsView, type AnalyticsSummary } from "../components/dashboard/AnalyticsView";
import { MentorDrawer } from "../components/mentor/MentorDrawer";
import { DailyBountyCard, type DailyBountyData } from "../components/dashboard/DailyBountyCard";
import { ProfileDropdown } from "../components/profile/ProfileDropdown";
import { CertificateModal } from "../components/profile/CertificateModal";
import { playButtonTap } from "../lib/soundEffects";
import { API_URL } from "../lib/api";

interface UserProgressRecord {
  id?: string;
  topicId?: string;
  status: string;
  completedAt?: string | null;
}

interface RoadmapEntry {
  id: string;
  order: number;
  targetDate: string;
  topic: {
    id: string;
    title: string;
    baseXp: number;
    difficulty?: number;
    estimatedHours?: number;
    description?: string | null;
    chapter?: {
      id?: string;
      title?: string;
      region?: {
        id?: string;
        name?: string;
        slug?: string;
        order?: number;
      };
    };
    progress?: UserProgressRecord[];
  };
}

export interface RealmDefinition {
  id: string;
  order: number;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  description: string;
}

export const WORLD_REALMS: RealmDefinition[] = [
  {
    id: "html-kingdom",
    order: 1,
    name: "Realm I: HTML Kingdom",
    shortName: "HTML Kingdom",
    icon: "🏰",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.35)",
    description: "Document anatomy, HTML5 semantic structure, and accessible web standards.",
  },
  {
    id: "css-forest",
    order: 2,
    name: "Realm II: CSS Forest",
    shortName: "CSS Forest",
    icon: "🌲",
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.35)",
    description: "The cascade, Box Model dimensions, Flexbox & Grid layouts, and responsive queries.",
  },
  {
    id: "javascript-mountains",
    order: 3,
    name: "Realm III: JavaScript Mountains",
    shortName: "JS Mountains",
    icon: "⛰️",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.35)",
    description: "Variables, algorithmic collections, event listeners, DOM mutations, and async APIs.",
  },
  {
    id: "react-spire",
    order: 4,
    name: "Realm IV: React Spire",
    shortName: "React Spire",
    icon: "⚡",
    accentColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.35)",
    description: "Component alchemy, reactive state with useState, side-effects, and dynamic rendering.",
  },
];

export function getRealmForEntry(entry: RoadmapEntry): RealmDefinition {
  const regName = entry.topic.chapter?.region?.name?.toLowerCase() || "";
  const regSlug = entry.topic.chapter?.region?.slug?.toLowerCase() || "";
  const title = entry.topic.title.toLowerCase();

  if (
    regSlug.includes("react") ||
    regName.includes("react") ||
    title.includes("react") ||
    title.includes("usestate") ||
    title.includes("useeffect") ||
    title.includes("conditional rendering")
  ) {
    return WORLD_REALMS[3];
  }
  if (
    regSlug.includes("javascript") ||
    regName.includes("javascript") ||
    title.includes("javascript") ||
    title.includes("arrays") ||
    title.includes("objects") ||
    title.includes("dom") ||
    title.includes("storage") ||
    title.includes("async") ||
    title.includes("fetch")
  ) {
    return WORLD_REALMS[2];
  }
  if (
    regSlug.includes("css") ||
    regName.includes("css") ||
    title.includes("css") ||
    title.includes("box model") ||
    title.includes("flexbox") ||
    title.includes("grid") ||
    title.includes("responsive") ||
    title.includes("transitions") ||
    title.includes("keyframes")
  ) {
    return WORLD_REALMS[1];
  }
  return WORLD_REALMS[0];
}

export const CLASS_ARCHETYPES: Record<
  string,
  { title: string; icon: string; color: string; desc: string }
> = {
  frontend: {
    title: "Frontend Mage",
    icon: "🧙‍♂️",
    color: "#a855f7",
    desc: "Visual UI, CSS Layouts & React Alchemy",
  },
  backend: {
    title: "Backend Knight",
    icon: "🛡️",
    color: "#3b82f6",
    desc: "Data Integrity, APIs & State Architecture",
  },
  fullstack: {
    title: "Full-Stack Rogue",
    icon: "🗡️",
    color: "#f59e0b",
    desc: "Complete Client-Server Digital Mastery",
  },
};

export const LEVEL_TIERS: Record<
  string,
  { label: string; badge: string; desc: string }
> = {
  beginner: { label: "Novice", badge: "Lv. 1", desc: "Foundational Campaign" },
  intermediate: { label: "Apprentice", badge: "Lv. 15", desc: "101 Basics Pruned" },
  advanced: { label: "Veteran", badge: "Lv. 50", desc: "Fast-Track Mastery" },
};

interface Stats {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  completedQuests?: number;
}

export type DashboardView = "deck" | "map" | "tree" | "achievements" | "analytics";

function DashboardPage() {
  const { session, signOut } = useAuth();

  // Active Hub View
  const [activeView, setActiveView] = useState<DashboardView>("deck");
  const [bountyFilter, setBountyFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedRealmId, setSelectedRealmId] = useState<string>("all");
  const [collapsedRealms, setCollapsedRealms] = useState<Record<string, boolean>>({});
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);

  // Account and Archetype Metadata from Backend
  const [accountInfo, setAccountInfo] = useState<{
    id?: string;
    email?: string;
    name?: string | null;
    avatar?: string | null;
    goal?: string | null;
    currentLevel?: string | null;
    dailyHours?: number | null;
    hasRoadmap?: boolean;
    totalQuests?: number;
    targetFinishDate?: string | null;
  } | null>(null);

  // Daily Bounty Data
  const [bounty, setBounty] = useState<DailyBountyData | null>(null);

  // Modal / Dropdown states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // State from real backend
  const [entries, setEntries] = useState<RoadmapEntry[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [cachedAchievements, setCachedAchievements] = useState<AchievementItem[] | null>(null);
  const [cachedAnalytics, setCachedAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = API_URL;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/achievements?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCachedAchievements(data);
        }
      }
    } catch {
      // fallback
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/analytics?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setCachedAnalytics(data);
      }
    } catch {
      // fallback
    }
  };

  const fetchBounty = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/bounty?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setBounty(data);
      }
    } catch {
      // fallback
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/stats?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) setStats(await res.json());
    } catch {
      // fallback
    }
  };

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/account?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setAccountInfo(data);
      }
    } catch {
      // fallback
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${apiUrl}/me/progress?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const completedSet = new Set<string>();
          data.forEach((p: any) => {
            if (p.status === "completed") {
              completedSet.add(p.topicId);
            }
          });
          setCompletedTopicIds((prev) => new Set([...prev, ...completedSet]));
        }
      }
    } catch {
      // fallback
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`${apiUrl}/roadmap/latest?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.entries) {
          setEntries(data.entries);
          if (data.user) {
            setAccountInfo((prev) => ({
              ...prev,
              goal: data.user.goal ?? prev?.goal,
              currentLevel: data.user.currentLevel ?? prev?.currentLevel,
              dailyHours: data.user.dailyHours ?? prev?.dailyHours,
            }));
          }
          // Also sync any completed topics directly from the entries relation
          const setFromEntries = new Set<string>();
          data.entries.forEach((e: RoadmapEntry) => {
            if (e.topic.progress?.some((p) => p.status === "completed")) {
              setFromEntries.add(e.topic.id);
            }
          });
          if (setFromEntries.size > 0) {
            setCompletedTopicIds((prev) => new Set([...prev, ...setFromEntries]));
          }
        }
      }
    } catch {
      // fallback
    }
  };

  const generateRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/roadmap/generate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          goal: accountInfo?.goal || "frontend",
          dailyHours: accountInfo?.dailyHours || 2,
          currentLevel: accountInfo?.currentLevel || "beginner",
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to generate roadmap from server.");
      }
      const data = await res.json();
      setEntries(data.roadmap?.entries || data.entries);
      fetchAccount();
    } catch (err: any) {
      setError(err?.message || "Something went wrong generating your roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchAccount();
      fetchRoadmap();
      fetchProgress();
      fetchBounty();
      fetchAchievements();
      fetchAnalytics();
    }
  }, [session]);

  const sortedEntries = entries ? [...entries].sort((a, b) => a.order - b.order) : [];

  // Dynamic Progression Logic
  const isTopicDone = (e: RoadmapEntry) => {
    if (completedTopicIds.has(e.topic.id)) return true;
    return e.topic.progress?.some((p) => p.status === "completed") ?? false;
  };

  // Find the FIRST quest that is not yet completed
  const activeQuestIndex = sortedEntries.findIndex((e) => !isTopicDone(e));
  const allCompleted = sortedEntries.length > 0 && activeQuestIndex === -1;
  const currentQuest = activeQuestIndex !== -1 ? sortedEntries[activeQuestIndex] : (sortedEntries.length > 0 ? sortedEntries[0] : null);
  const completedCount = sortedEntries.filter(isTopicDone).length;

  // Real data calculations
  const totalClaimedXp = stats?.totalXp || 0;
  const currentLevel = stats?.level || 1;
  const xpIntoCurrentLevel = totalClaimedXp % 1000;
  const xpProgressPercent = Math.min(100, Math.max(8, (xpIntoCurrentLevel / 1000) * 100));

  const totalCampaignXp = sortedEntries.reduce((sum, e) => sum + (e.topic.baseXp || 0), 0);
  const totalCampaignHours = sortedEntries.reduce((sum, e) => sum + (e.topic.estimatedHours || 0), 0);
  const finalDeadline = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].targetDate : null;

  // Adaptive Profile Configurations
  const userGoal = (accountInfo?.goal || "frontend").toLowerCase();
  const playerArchetype = CLASS_ARCHETYPES[userGoal] || CLASS_ARCHETYPES["frontend"];
  const userLevelTier = (accountInfo?.currentLevel || "beginner").toLowerCase();
  const playerTier = LEVEL_TIERS[userLevelTier] || LEVEL_TIERS["beginner"];
  const dailyStudyHours = accountInfo?.dailyHours || 2;

  // Group quests by World Realm and calculate realm statistics
  const realmGroups = useMemo(() => {
    return WORLD_REALMS.map((realm) => {
      const realmEntries = sortedEntries.filter((e) => getRealmForEntry(e).id === realm.id);
      const totalHours = realmEntries.reduce((sum, e) => sum + (e.topic.estimatedHours || 0), 0);
      const totalXp = realmEntries.reduce((sum, e) => sum + (e.topic.baseXp || 0), 0);
      const completedCount = realmEntries.filter(isTopicDone).length;
      const isConquered = realmEntries.length > 0 && completedCount === realmEntries.length;
      const isActive = realmEntries.some((e) => !isTopicDone(e) && e.id === currentQuest?.id);
      const isLocked = !isConquered && !isActive && !realmEntries.some(isTopicDone) && realm.order > 1;

      return {
        realm,
        entries: realmEntries,
        totalHours,
        totalXp,
        completedCount,
        isConquered,
        isActive,
        isLocked,
      };
    });
  }, [sortedEntries, completedTopicIds, currentQuest]);

  const currentRealmGroup = useMemo(() => {
    return (
      realmGroups.find((r) => r.isActive) ||
      realmGroups[0] || {
        realm: WORLD_REALMS[0],
        entries: [],
        totalHours: 0,
        totalXp: 0,
        completedCount: 0,
        isConquered: false,
        isActive: true,
        isLocked: false,
      }
    );
  }, [realmGroups]);

  // Expand active realm by default, collapse future locked realms
  useEffect(() => {
    if (sortedEntries.length === 0) return;
    setCollapsedRealms((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const nextCollapsed: Record<string, boolean> = {};
      WORLD_REALMS.forEach((realm) => {
        const group = realmGroups.find((g) => g.realm.id === realm.id);
        if (group?.isActive) {
          nextCollapsed[realm.id] = false;
        } else if (group?.isConquered) {
          nextCollapsed[realm.id] = false;
        } else {
          nextCollapsed[realm.id] = true;
        }
      });
      return nextCollapsed;
    });
  }, [sortedEntries, realmGroups]);

  const toggleRealmCollapse = (realmId: string) => {
    setCollapsedRealms((prev) => ({
      ...prev,
      [realmId]: !prev[realmId],
    }));
  };

  const renderQuestCard = (e: RoadmapEntry) => {
    const originalIndex = sortedEntries.findIndex((item) => item.id === e.id);
    const isDone = isTopicDone(e);
    const isCurrent = !isDone && originalIndex === activeQuestIndex;
    const isLocked = !isDone && !isCurrent && originalIndex > activeQuestIndex;

    return (
      <motion.div
        key={e.id}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18 }}
        whileHover={{
          x: 4,
          borderColor: isCurrent
            ? "var(--accent)"
            : isDone
            ? "#10b981"
            : "rgba(124, 92, 255, 0.35)",
          backgroundColor: isCurrent
            ? "rgba(124, 92, 255, 0.08)"
            : isDone
            ? "rgba(16, 185, 129, 0.05)"
            : "rgba(255, 255, 255, 0.03)",
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderRadius: "var(--radius-md, 10px)",
          background: isCurrent
            ? "rgba(124, 92, 255, 0.06)"
            : isDone
            ? "rgba(16, 185, 129, 0.03)"
            : "rgba(255, 255, 255, 0.02)",
          border: isCurrent
            ? "1.5px solid var(--accent)"
            : isDone
            ? "1px solid rgba(16, 185, 129, 0.35)"
            : "1px solid var(--border)",
          boxShadow: isCurrent
            ? "0 0 16px rgba(124, 92, 255, 0.15)"
            : "none",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
            transition={isCurrent ? { duration: 2, repeat: Infinity } : undefined}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: isDone
                ? "#10b981"
                : isCurrent
                ? "var(--accent)"
                : "rgba(255,255,255,0.05)",
              color: isDone || isCurrent ? "#000" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: isCurrent
                ? "0 0 10px var(--accent-glow)"
                : isDone
                ? "0 0 10px rgba(16, 185, 129, 0.4)"
                : "none",
            }}
          >
            {isDone ? "✅" : isCurrent ? "⚔️" : originalIndex + 1}
          </motion.div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDone ? "#e2e8f0" : "#fff",
                  opacity: isDone ? 0.9 : 1,
                }}
              >
                {e.topic.title}
              </span>
              {isDone && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: "rgba(16, 185, 129, 0.18)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Completed
                </span>
              )}
              {isCurrent && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "var(--accent)",
                    color: "#000",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Active
                </span>
              )}
              {bounty && e.topic.id === bounty.topicId && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: "rgba(245, 158, 11, 0.22)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  ⭐ 2X Bounty
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              Target: {new Date(e.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} • ~{e.topic.estimatedHours || 2}h
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: bounty && e.topic.id === bounty.topicId ? "#fbbf24" : "var(--warning)",
            }}
          >
            +{bounty && e.topic.id === bounty.topicId ? e.topic.baseXp * 2 : e.topic.baseXp} XP
            {bounty && e.topic.id === bounty.topicId && " (2X)"}
          </div>

          {!isLocked || (bounty && e.topic.id === bounty.topicId) ? (
            <Link to={`/quest/${e.topic.id}`} style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant={isCurrent || (bounty && e.topic.id === bounty.topicId && !isDone) ? "primary" : "secondary"}
                  onClick={() => playButtonTap()}
                  style={{
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    boxShadow: isCurrent || (bounty && e.topic.id === bounty.topicId && !isDone)
                      ? "0 0 12px var(--accent-glow)"
                      : "none",
                    color: isDone ? "#10b981" : undefined,
                    borderColor: isDone ? "rgba(16, 185, 129, 0.3)" : undefined,
                  }}
                >
                  {isDone ? "Revisit ↺" : bounty && e.topic.id === bounty.topicId ? "Bounty Trial ⚔️" : "Embark →"}
                </Button>
              </motion.div>
            </Link>
          ) : (
            <div title="🔒 Complete earlier quests first">
              <Button
                disabled
                variant="ghost"
                style={{
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              >
                🔒 Locked
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 10% 10%, rgba(124, 92, 255, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
          var(--bg-base)
        `,
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* ═══ Living Ambient Cosmic Orbs Isolated Layer ═══ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <motion.div
          animate={{
            x: [0, 45, -30, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.15, 0.92, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: "8%",
            left: "4%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 92, 255, 0.15) 0%, transparent 70%)",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -35, 0],
            scale: [1, 0.9, 1.12, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.10) 0%, transparent 70%)",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ════════════════ TOP REALM NAVBAR ════════════════ */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(20px)",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent), #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 0 16px var(--accent-glow)",
              cursor: "pointer",
            }}
          >
            ⚔️
          </motion.div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>
              DEV<span style={{ color: "var(--accent)" }}>QUEST</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Player Dashboard
            </div>
          </div>
        </div>

        {/* ═══ RPG VIEW MODE SWITCHER (SMOOTH FLUID PILL) ═══ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.45)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: 4,
            gap: 4,
            position: "relative",
          }}
        >
          {(
            [
              { id: "deck", icon: "⚔️", label: "Bounty Deck" },
              { id: "map", icon: "🗺️", label: "Overworld Map" },
              { id: "tree", icon: "🌌", label: "Skill Tree" },
              { id: "achievements", icon: "🏆", label: "Trophy Codex" },
              { id: "analytics", icon: "📊", label: "Analytics" },
            ] as const
          ).map((view) => {
            const isActive = activeView === view.id;
            return (
              <motion.button
                key={view.id}
                onClick={() => {
                  playButtonTap();
                  setActiveView(view.id);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 18px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  transition: "color 0.2s ease",
                  zIndex: 1,
                  outline: "none",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeViewIndicator"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--accent)",
                      borderRadius: 999,
                      boxShadow: "0 0 16px var(--accent-glow)",
                      zIndex: -1,
                    }}
                  />
                )}
                <span>{view.icon}</span> {view.label}
              </motion.button>
            );
          })}
        </div>

        {/* User Account & Profile Trigger */}
        <div style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playButtonTap();
              setIsProfileDropdownOpen((prev) => !prev);
            }}
            title="Open Adventurer Profile & Settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: isProfileDropdownOpen ? "rgba(124, 92, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
              border: isProfileDropdownOpen ? "1px solid var(--accent)" : "1px solid var(--border)",
              fontSize: 13,
              cursor: "pointer",
              color: "#fff",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 16 }}>{accountInfo?.avatar || "🧙‍♂️"}</span>
            <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
              {accountInfo?.name || session?.user.email?.split("@")[0]}
            </span>
            <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 2 }}>
              {isProfileDropdownOpen ? "▲" : "▼"}
            </span>
          </motion.button>

          {/* Profile & Settings Dropdown Popover */}
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={() => setIsProfileDropdownOpen(false)}
            token={session?.access_token}
            initialName={accountInfo?.name}
            initialAvatar={accountInfo?.avatar}
            initialGoal={accountInfo?.goal}
            initialDailyHours={accountInfo?.dailyHours}
            email={session?.user.email}
            totalQuests={sortedEntries.length}
            completedQuests={completedCount}
            totalXp={totalClaimedXp}
            currentLevel={currentLevel}
            onProfileSaved={() => {
              fetchAccount();
              fetchRoadmap();
            }}
            onOpenCertificate={() => {
              setIsProfileDropdownOpen(false);
              setIsCertificateModalOpen(true);
            }}
            onSignOut={signOut}
          />
        </div>
      </header>

      {/* ════════════════ ERROR BANNER ════════════════ */}
      {error && (
        <div
          style={{
            maxWidth: 1280,
            margin: "20px auto 0",
            padding: "12px 20px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            borderRadius: "var(--radius-md, 8px)",
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          VIEWS CONTAINER WITH CROSS-FADE ANIMATE PRESENCE
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: GUILD COMMAND DECK */}
        {activeView === "deck" && (
          <motion.main
            key="deck"
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
          {/* ═════════ 1. HORIZONTAL PLAYER HUD BANNER (FULL WIDTH) ═════════ */}
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: "relative",
              zIndex: 1,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg, 16px)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            {/* Player Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "relative",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: `2px solid ${playerArchetype.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  boxShadow: `0 0 16px ${playerArchetype.color}33`,
                }}
              >
                {accountInfo?.avatar || playerArchetype.icon}
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: -6,
                    right: -6,
                    background: playerArchetype.color,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 999,
                    border: "1px solid #000",
                    boxShadow: `0 0 8px ${playerArchetype.color}`,
                  }}
                >
                  Lv. {currentLevel}
                </motion.div>
              </motion.div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{accountInfo?.name || session?.user.email?.split("@")[0]}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${playerArchetype.color}22`,
                      color: playerArchetype.color,
                      border: `1px solid ${playerArchetype.color}44`,
                    }}
                  >
                    {playerArchetype.title}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    {playerTier.label}
                  </span>
                  <span>•</span>
                  <span>⚡ {dailyStudyHours}h / day</span>
                  <span>•</span>
                  <button
                    onClick={() => {
                      playButtonTap();
                      setIsProfileDropdownOpen((prev) => !prev);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: 11,
                      cursor: "pointer",
                      padding: "0 2px",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Edit Profile ⚙️
                  </button>
                </div>
              </div>
            </div>

            {/* Central XP Bar with Specular Shimmer */}
            <div style={{ flex: "1 1 300px", maxWidth: 420 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>Rank Experience</span>
                <span style={{ color: "var(--warning)", fontWeight: 700 }}>
                  {totalClaimedXp} Total XP
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{
                    position: "relative",
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #f59e0b, var(--accent))",
                    boxShadow: "0 0 12px var(--accent)",
                    overflow: "hidden",
                  }}
                >
                  {/* Moving Mana Shimmer Reflection */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                      width: "60%",
                      animation: "xpShimmer 2.4s infinite ease-in-out",
                    }}
                  />
                </motion.div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 5, textAlign: "right" }}>
                {1000 - xpIntoCurrentLevel} XP to Level {currentLevel + 1}
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  textAlign: "center",
                  cursor: "default",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" }}>Streak</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <motion.span
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "inline-block" }}
                  >
                    🔥
                  </motion.span>
                  {stats?.currentStreak ?? 0}d
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" }}>Completed</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{completedCount} / {sortedEntries.length}</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" }}>XP Available</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--warning)" }}>+{totalCampaignXp}</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Date</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                  {finalDeadline ? new Date(finalDeadline).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Self-Paced"}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ═════════ 2. DAILY BOUNTY CHALLENGE (QUEST OF THE DAY • 2X XP) ═════════ */}
          <DailyBountyCard bounty={bounty} />

          {/* ═════════ ADAPTIVE CAMPAIGN CODEX CALLOUT ═════════ */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `linear-gradient(135deg, ${playerArchetype.color}15 0%, rgba(15, 15, 22, 0.6) 100%)`,
              border: `1px solid ${playerArchetype.color}33`,
              borderRadius: "var(--radius-md, 12px)",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${playerArchetype.color}25`,
                  border: `1px solid ${playerArchetype.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {playerArchetype.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Tailored Curriculum: {playerArchetype.title} Track</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: playerArchetype.color,
                      background: "rgba(0,0,0,0.35)",
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: `1px solid ${playerArchetype.color}44`,
                    }}
                  >
                    {playerTier.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {userLevelTier === "intermediate"
                    ? "✨ Diagnostic Fast-Track: Foundational 101 markup topics were credited from your prior experience. You start at active challenges with starter XP!"
                    : userLevelTier === "advanced"
                    ? "⚡ Veteran Fast-Track: Foundational HTML & basic syntax credited from your prior experience. You jump directly into layout algorithms & React!"
                    : userGoal === "backend"
                    ? "🛡️ Specialized backend track — focused on data intake, asynchronous APIs, persistence, and state architecture."
                    : "📜 Complete 22-topic foundational curriculum scheduled via topological sort based on your daily study pace."}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" }}>Campaign Scope</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {sortedEntries.length} Quests • ⚡ {dailyStudyHours}h / day
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═════════ 2. MAIN 2-COLUMN COMMAND WORKSPACE (70% / 30%) ═════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* ── LEFT COLUMN: ACTIVE QUEST SPOTLIGHT + ROSTER (70%) ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* FEATURED ACTIVE OBJECTIVE HERO STAGE */}
              {/* FEATURED ACTIVE OBJECTIVE HERO STAGE */}
              {allCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(245, 158, 11, 0.12) 50%, rgba(19, 19, 26, 0.98) 100%)",
                    border: "2px solid #10b981",
                    borderRadius: "var(--radius-lg, 16px)",
                    padding: "26px 28px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 0 35px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "linear-gradient(90deg, transparent, #10b981, #f59e0b, transparent)",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        padding: "3px 12px",
                        borderRadius: 999,
                        background: "#10b981",
                        color: "#000",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>👑</span> CAMPAIGN CONQUERED!
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                      {completedCount} / {sortedEntries.length} Quests Mastered
                    </span>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                    All Milestone Trials Completed! 🏆
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5, maxWidth: 650 }}>
                    You have ascended through every trial in this curriculum. Revisit any quest anytime to practice or refactor code in the interactive sandbox.
                  </p>
                  {sortedEntries.length > 0 && (
                    <div style={{ display: "flex", gap: 12 }}>
                      <Link to={`/quest/${sortedEntries[0].topic.id}`} style={{ textDecoration: "none" }}>
                        <Button
                          variant="secondary"
                          onClick={() => playButtonTap()}
                          style={{ padding: "9px 20px", fontSize: 13, fontWeight: 700 }}
                        >
                          ↺ Revisit First Quest
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : currentQuest ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(124, 92, 255, 0.14) 0%, rgba(19, 19, 26, 0.98) 100%)",
                    border: "2px solid var(--accent)",
                    borderRadius: "var(--radius-lg, 16px)",
                    padding: "26px 28px",
                    position: "relative",
                    overflow: "hidden",
                    animation: "borderAuraPulse 4s ease-in-out infinite",
                  }}
                >
                  {/* Subtle top energy flare */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "linear-gradient(90deg, transparent, var(--accent), #f59e0b, transparent)",
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: "var(--accent)",
                          color: "#000",
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#000",
                            animation: "beaconPing 1.8s infinite",
                          }}
                        />
                        ACTIVE OBJECTIVE // {currentRealmGroup.realm.icon} {currentRealmGroup.realm.shortName.toUpperCase()} • STEP {activeQuestIndex + 1} OF {sortedEntries.length}
                      </span>

                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        📅 Target: {new Date(currentQuest.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        background: "rgba(245, 158, 11, 0.14)",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        color: "#f59e0b",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: "0 0 12px rgba(245, 158, 11, 0.2)",
                      }}
                    >
                      +{currentQuest.topic.baseXp} XP Reward
                    </motion.div>
                  </div>

                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                    {currentQuest.topic.title}
                  </h2>

                  {currentQuest.topic.description && (
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5, maxWidth: 650 }}>
                      {currentQuest.topic.description}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>⏱️ {currentQuest.topic.estimatedHours ? `~${currentQuest.topic.estimatedHours} hours` : "Standard duration"}</span>
                      <span>⚔️ Sandpack Code Arena</span>
                    </div>

                    <Link to={`/quest/${currentQuest.topic.id}`} style={{ textDecoration: "none" }}>
                      <motion.div
                        whileHover={{ scale: 1.04, boxShadow: "0 0 30px var(--accent-glow)" }}
                        whileTap={{ scale: 0.96 }}
                        style={{ display: "inline-block" }}
                      >
                        <Button
                          variant="primary"
                          onClick={() => playButtonTap()}
                          style={{
                            padding: "11px 24px",
                            fontSize: 14,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span>⚔️</span> Embark on Quest Trial
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            style={{ display: "inline-block" }}
                          >
                            →
                          </motion.span>
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              ) : null}

              {/* UPCOMING QUESTLINE ROSTER */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📜 Campaign Quest Roster</h3>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      ({sortedEntries.length} total • 4 World Realms)
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setBountyFilter("all")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: bountyFilter === "all" ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: bountyFilter === "all" ? "var(--accent-soft)" : "transparent",
                        color: bountyFilter === "all" ? "#fff" : "var(--text-secondary)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      All ({sortedEntries.length})
                    </button>
                    <button
                      onClick={() => setBountyFilter("active")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: bountyFilter === "active" ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: bountyFilter === "active" ? "var(--accent-soft)" : "transparent",
                        color: bountyFilter === "active" ? "#fff" : "var(--text-secondary)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Remaining ({sortedEntries.length - completedCount})
                    </button>
                    <button
                      onClick={() => setBountyFilter("completed")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: bountyFilter === "completed" ? "1px solid #10b981" : "1px solid var(--border)",
                        background: bountyFilter === "completed" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                        color: bountyFilter === "completed" ? "#10b981" : "var(--text-secondary)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>
                </div>

                {/* World Realm Chapter Filter Tabs */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflowX: "auto",
                    paddingBottom: 8,
                    marginBottom: 16,
                  }}
                >
                  <button
                    onClick={() => setSelectedRealmId("all")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: selectedRealmId === "all" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: selectedRealmId === "all" ? "rgba(124, 92, 255, 0.2)" : "rgba(255, 255, 255, 0.02)",
                      color: selectedRealmId === "all" ? "#fff" : "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>🌐</span> All Realms
                  </button>

                  {realmGroups.map((group) => {
                    const isSelected = selectedRealmId === group.realm.id;
                    return (
                      <button
                        key={group.realm.id}
                        onClick={() => setSelectedRealmId(group.realm.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: isSelected
                            ? "1.5px solid var(--accent)"
                            : group.isActive
                            ? "1px solid rgba(124, 92, 255, 0.4)"
                            : "1px solid var(--border)",
                          background: isSelected
                            ? "rgba(124, 92, 255, 0.2)"
                            : group.isActive
                            ? "rgba(124, 92, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.02)",
                          color: isSelected
                            ? "#fff"
                            : group.isConquered
                            ? "#10b981"
                            : group.isActive
                            ? "#fff"
                            : "var(--text-secondary)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{group.realm.icon}</span>
                        <span>{group.realm.shortName}</span>
                        <span style={{ fontSize: 10, opacity: 0.75, fontWeight: 600 }}>
                          ({group.completedCount}/{group.entries.length})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Empty State */}
                {(!entries || entries.length === 0) && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      background: "var(--bg-surface)",
                      border: "1px dashed var(--border)",
                      borderRadius: "var(--radius-lg, 16px)",
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📜</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                      No Quest Campaign Mapped Yet
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.5 }}>
                      Choose your character class and calibrate your curriculum pacing to forge your interactive roadmap.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      <Link to="/onboarding" style={{ textDecoration: "none" }}>
                        <Button variant="primary" style={{ padding: "10px 22px", fontSize: 13, fontWeight: 700 }}>
                          🧙‍♂️ Choose Class & Setup Path →
                        </Button>
                      </Link>
                      <Button variant="secondary" onClick={generateRoadmap} disabled={loading} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600 }}>
                        {loading ? "Forging Contract..." : "⚡ Quick-Generate Standard Roadmap"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Realm-Segmented Roster with Collapsible Acts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {realmGroups
                    .filter((group) => selectedRealmId === "all" || group.realm.id === selectedRealmId)
                    .map((group) => {
                      if (group.entries.length === 0) return null;
                      const isCollapsed = selectedRealmId === "all" && !!collapsedRealms[group.realm.id];

                      const filteredRealmEntries = group.entries.filter((e) => {
                        if (bountyFilter === "active") return !isTopicDone(e);
                        if (bountyFilter === "completed") return isTopicDone(e);
                        return true;
                      });

                      return (
                        <div
                          key={group.realm.id}
                          style={{
                            borderRadius: "var(--radius-lg, 14px)",
                            border: group.isActive
                              ? "1.5px solid rgba(124, 92, 255, 0.45)"
                              : group.isConquered
                              ? "1px solid rgba(16, 185, 129, 0.35)"
                              : "1px solid var(--border)",
                            background: group.isActive
                              ? "linear-gradient(180deg, rgba(124, 92, 255, 0.05) 0%, rgba(19, 19, 26, 0.95) 100%)"
                              : "var(--bg-surface)",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Realm Header Bar */}
                          <div
                            onClick={() => toggleRealmCollapse(group.realm.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 18px",
                              background: group.isActive
                                ? "rgba(124, 92, 255, 0.08)"
                                : "rgba(255, 255, 255, 0.02)",
                              cursor: "pointer",
                              userSelect: "none",
                              borderBottom: isCollapsed ? "none" : "1px solid var(--border)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 22 }}>{group.realm.icon}</span>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                                    {group.realm.name}
                                  </span>
                                  {group.isConquered ? (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        background: "rgba(16, 185, 129, 0.2)",
                                        color: "#10b981",
                                        border: "1px solid rgba(16, 185, 129, 0.4)",
                                        fontWeight: 800,
                                      }}
                                    >
                                      ✅ Conquered ({group.completedCount}/{group.entries.length})
                                    </span>
                                  ) : group.isActive ? (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        background: "var(--accent)",
                                        color: "#000",
                                        fontWeight: 800,
                                        boxShadow: "0 0 10px var(--accent-glow)",
                                      }}
                                    >
                                      ⚔️ Active Realm ({group.completedCount}/{group.entries.length})
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        background: "rgba(255, 255, 255, 0.05)",
                                        color: "var(--text-secondary)",
                                        border: "1px solid var(--border)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      🔒 Locked (0/{group.entries.length})
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                                  {group.realm.description} • ~{group.totalHours}h required • +{group.totalXp} XP Pool
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  toggleRealmCollapse(group.realm.id);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text-secondary)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {isCollapsed ? "Expand ▼" : "Collapse ▲"}
                              </button>
                            </div>
                          </div>

                          {/* Quests inside this Realm */}
                          {!isCollapsed && (
                            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                              {filteredRealmEntries.length === 0 ? (
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", padding: "12px 0", textAlign: "center" }}>
                                  No quests match the "{bountyFilter}" filter in this realm.
                                </div>
                              ) : (
                                filteredRealmEntries.map((e) => renderQuestCard(e))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: CAMPAIGN LOGISTICS SIDEBAR (30%) ── */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Campaign Telemetry Card */}
              <motion.div
                whileHover={{ y: -3 }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 16px)",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 14 }}>
                  Campaign Telemetry
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Active Realm</span>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {currentRealmGroup.realm.icon} {currentRealmGroup.realm.shortName} (Est. ~{currentRealmGroup.totalHours}h)
                    </span>
                  </div>

                  {/* 4 World Realms Mini Progress Track */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                      Realm Conquest
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                      {realmGroups.map((g) => (
                        <div
                          key={g.realm.id}
                          title={`${g.realm.name}: ${g.completedCount}/${g.entries.length} completed (~${g.totalHours}h)`}
                          style={{
                            padding: "6px 2px",
                            borderRadius: 6,
                            textAlign: "center",
                            background: g.isConquered
                              ? "rgba(16, 185, 129, 0.15)"
                              : g.isActive
                              ? "rgba(124, 92, 255, 0.2)"
                              : "rgba(255, 255, 255, 0.02)",
                            border: g.isConquered
                              ? "1px solid #10b981"
                              : g.isActive
                              ? "1.5px solid var(--accent)"
                              : "1px solid var(--border)",
                            fontSize: 10,
                          }}
                        >
                          <div>{g.realm.icon}</div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: g.isConquered ? "#10b981" : g.isActive ? "var(--accent)" : "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {g.completedCount}/{g.entries.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Campaign Quests</span>
                    <span style={{ fontWeight: 700, color: "#fff" }}>
                      {completedCount} / {sortedEntries.length} Mastered
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Campaign XP</span>
                    <span style={{ fontWeight: 700, color: "var(--warning)" }}>+{totalCampaignXp} XP</span>
                  </div>

                  {totalCampaignHours > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Total Curriculum</span>
                      <span style={{ fontWeight: 700, color: "#fff" }}>~{totalCampaignHours}h (4 Realms)</span>
                    </div>
                  )}

                  {finalDeadline && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Target Deadline</span>
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                        {new Date(finalDeadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Streak Altar with Living Flame */}
              <motion.div
                whileHover={{ y: -3 }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 16px)",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>
                  Daily Streak
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1.08, 1.25, 1],
                      rotate: [0, -6, 5, -3, 0],
                      filter: [
                        "drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))",
                        "drop-shadow(0 0 18px rgba(245, 158, 11, 0.95))",
                        "drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))",
                      ],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      display: "inline-block",
                      transformOrigin: "bottom center",
                      cursor: "default",
                    }}
                  >
                    🔥
                  </motion.span>
                  <span>{stats?.currentStreak ?? 0}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>days</span>
                </div>

                <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Longest Streak</span>
                  <span style={{ fontWeight: 700, color: "var(--warning)" }}>{stats?.longestStreak ?? 0} days</span>
                </div>
              </motion.div>

              {/* Realm Adventure Map Shortcut */}
              <motion.div
                whileHover={{ y: -3 }}
                style={{
                  background: "linear-gradient(135deg, rgba(124, 92, 255, 0.08), rgba(0,0,0,0.3))",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 16px)",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
                  🗺️ Prefer Visual Path?
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.4 }}>
                  Follow your journey node-by-node on the winding Overworld Map.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setActiveView("map")}
                  style={{ width: "100%", padding: "8px", fontSize: 12, fontWeight: 600 }}
                >
                  Switch to Overworld Map →
                </Button>
              </motion.div>
            </aside>
          </div>
        </motion.main>
      )}

      {/* ═══════════════════════════════════════════════════════════
          VIEW 2: THE OVERWORLD ADVENTURE MAP (IDEA 2)
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "map" && (
        <motion.main
          key="map"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
          style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "36px 24px" }}
        >
          {/* Overworld Header Banner */}
          <div
            style={{
              padding: "24px 28px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg, 16px)",
              marginBottom: 40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🗺️</span>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>The Overworld Adventure Trail</h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "6px 0 0" }}>
                A winding quest route plotted across your milestones. Follow the waypoints to conquer every realm.
              </p>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>Conquered</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{completedCount} / {sortedEntries.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>Total XP</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--warning)" }}>+{totalCampaignXp}</div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {(!entries || entries.length === 0) && (
            <div style={{ textAlign: "center", padding: 60, background: "var(--bg-surface)", borderRadius: 16, border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#fff" }}>No Map Waypoints Yet</h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 20px", fontSize: 13, lineHeight: 1.5 }}>
                Choose your character class and calibrate your curriculum pacing to forge your interactive roadmap.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/onboarding" style={{ textDecoration: "none" }}>
                  <Button variant="primary" style={{ padding: "10px 22px", fontSize: 13, fontWeight: 700 }}>
                    🧙‍♂️ Choose Class & Setup Path →
                  </Button>
                </Link>
                <Button variant="secondary" onClick={generateRoadmap} disabled={loading} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600 }}>
                  {loading ? "Summoning Waypoints..." : "⚡ Quick-Generate Standard Roadmap"}
                </Button>
              </div>
            </div>
          )}

          {/* ═══ Winding Waypoint Adventure Path ═══ */}
          {sortedEntries.length > 0 && (
            <div style={{ position: "relative", padding: "20px 0 60px" }}>
              {/* Central Glowing Energy Path Line with Traveling Light Pulse */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 40,
                  bottom: 80,
                  width: 4,
                  transform: "translateX(-50%)",
                  background: "linear-gradient(180deg, var(--accent) 0%, rgba(124, 92, 255, 0.3) 70%, #f59e0b 100%)",
                  boxShadow: "0 0 16px var(--accent-glow)",
                  zIndex: 0,
                  overflow: "hidden",
                }}
              >
                {/* Flowing energy beam light pulse */}
                <motion.div
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 140,
                    background: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 56, position: "relative", zIndex: 1 }}>
                {sortedEntries.map((e, index) => {
                  const isDone = isTopicDone(e);
                  const isCurrent = !isDone && index === activeQuestIndex;
                  const isFinal = index === sortedEntries.length - 1;
                  const isLeft = index % 2 === 0;

                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        width: "100%",
                      }}
                    >
                      {/* Waypoint Card Container (alternating left/right) */}
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          maxWidth: 820,
                          alignItems: "center",
                          flexDirection: isLeft ? "row" : "row-reverse",
                        }}
                      >
                        {/* Waypoint Info Card */}
                        <motion.div
                          whileHover={{ y: -4, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            width: "44%",
                            background: isCurrent
                              ? "linear-gradient(135deg, rgba(124, 92, 255, 0.14), var(--bg-surface))"
                              : isDone
                              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.12), var(--bg-surface))"
                              : isFinal
                              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.14), var(--bg-surface))"
                              : "var(--bg-surface)",
                            border: isCurrent
                              ? "2px solid var(--accent)"
                              : isDone
                              ? "2px solid #10b981"
                              : isFinal
                              ? "2px solid #f59e0b"
                              : "1px solid var(--border)",
                            borderRadius: "var(--radius-lg, 16px)",
                            padding: "18px 22px",
                            boxShadow: isCurrent
                              ? "0 0 30px var(--accent-glow)"
                              : isDone
                              ? "0 0 24px rgba(16, 185, 129, 0.2)"
                              : isFinal
                              ? "0 0 30px rgba(245, 158, 11, 0.25)"
                              : "0 8px 24px rgba(0,0,0,0.3)",
                            textAlign: isLeft ? "right" : "left",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: isLeft ? "flex-end" : "flex-start",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: isCurrent
                                  ? "var(--accent)"
                                  : isDone
                                  ? "#10b981"
                                  : isFinal
                                  ? "#f59e0b"
                                  : "rgba(255,255,255,0.06)",
                                color: isCurrent || isDone || isFinal ? "#000" : "var(--text-secondary)",
                                textTransform: "uppercase",
                              }}
                            >
                              {isDone
                                ? "Conquered Waypoint"
                                : isCurrent
                                ? "Active Waypoint"
                                : isFinal
                                ? "Final Milestone"
                                : `Waypoint ${index + 1}`}
                            </span>

                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: isDone ? "#10b981" : "var(--warning)",
                              }}
                            >
                              {isDone ? "✓ Claimed" : `+${e.topic.baseXp} XP`}
                            </span>
                          </div>

                          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>
                            {e.topic.title}
                          </h3>

                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                            Target: {new Date(e.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </div>

                          {isDone || isCurrent ? (
                            <Link to={`/quest/${e.topic.id}`} style={{ textDecoration: "none" }}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: "inline-block" }}>
                                <Button
                                  variant={isCurrent ? "primary" : "secondary"}
                                  onClick={() => playButtonTap()}
                                  style={{
                                    padding: "6px 14px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: isDone ? "#10b981" : undefined,
                                  }}
                                >
                                  {isDone ? "Revisit Quest ↺" : "Embark Now →"}
                                </Button>
                              </motion.div>
                            </Link>
                          ) : (
                            <div title={`🔒 Quest Sealed: Complete earlier quests first`} style={{ display: "inline-block" }}>
                              <Button
                                disabled
                                variant="ghost"
                                style={{
                                  padding: "6px 14px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "var(--text-muted)",
                                  border: "1px solid rgba(255, 255, 255, 0.05)",
                                  background: "rgba(255, 255, 255, 0.02)",
                                  cursor: "not-allowed",
                                  opacity: 0.5,
                                }}
                              >
                                🔒 Locked
                              </Button>
                            </div>
                          )}
                        </motion.div>

                        {/* Connector horizontal beam */}
                        <div
                          style={{
                            width: "6%",
                            height: 2,
                            background: isCurrent ? "var(--accent)" : isDone ? "#10b981" : "rgba(255,255,255,0.15)",
                            boxShadow: isCurrent ? "0 0 8px var(--accent)" : isDone ? "0 0 8px #10b981" : "none",
                          }}
                        />

                        {/* Central Waypoint Rune Node with Radar Ripple */}
                        <div
                          style={{
                            position: "relative",
                            width: 52,
                            height: 52,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            flexShrink: 0,
                          }}
                        >
                          {/* Animated Radar Ripple Aura for Active Waypoint */}
                          {isCurrent && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                border: "2px solid var(--accent)",
                                animation: "radarRipple 2.2s infinite ease-out",
                                pointerEvents: "none",
                              }}
                            />
                          )}

                          <motion.div
                            animate={
                              isCurrent
                                ? { scale: [1, 1.08, 1] }
                                : isFinal
                                ? { scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }
                                : {}
                            }
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: "50%",
                              background: isCurrent
                                ? "var(--accent)"
                                : isDone
                                ? "#10b981"
                                : isFinal
                                ? "#f59e0b"
                                : "var(--bg-surface)",
                              border: isCurrent
                                ? "4px solid #fff"
                                : isDone
                                ? "4px solid #a7f3d0"
                                : isFinal
                                ? "4px solid #fde68a"
                                : "3px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: isDone ? 18 : 20,
                              color: isCurrent || isDone || isFinal ? "#000" : "var(--text-secondary)",
                              boxShadow: isCurrent
                                ? "0 0 28px var(--accent)"
                                : isDone
                                ? "0 0 24px rgba(16, 185, 129, 0.55)"
                                : isFinal
                                ? "0 0 28px #f59e0b"
                                : "none",
                            }}
                          >
                            {isDone ? "✅" : isCurrent ? "⚔️" : isFinal ? "👑" : index + 1}
                          </motion.div>
                        </div>

                        {/* Spacer on the opposite side to balance alignment */}
                        <div style={{ width: "50%" }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.main>
      )}

      {/* ═══════════════════════════════════════════════════════════
          VIEW 3: SKILL CONSTELLATION (PREVIEW READY FOR NEXT STEP)
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "tree" && (
        <motion.main
          key="tree"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
          style={{ flex: 1, maxWidth: 1360, width: "100%", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Constellation Header */}
          <div
            style={{
              padding: "20px 28px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg, 16px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🌌</span>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>The Constellation Skill Tree</h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                An interconnected node network of your roadmap topics. Select any star to inspect requirements and embark.
              </p>
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>Stars Mastered</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{completedCount} / {sortedEntries.length} Nodes</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>Constellation Loot</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--warning)" }}>+{totalCampaignXp} XP</div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {(!entries || entries.length === 0) && (
            <div style={{ textAlign: "center", padding: 60, background: "var(--bg-surface)", borderRadius: 16, border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌌</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#fff" }}>No Star Nodes Mapped Yet</h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 20px", fontSize: 13, lineHeight: 1.5 }}>
                Choose your character class and calibrate your curriculum pacing to forge your interactive roadmap.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/onboarding" style={{ textDecoration: "none" }}>
                  <Button variant="primary" style={{ padding: "10px 22px", fontSize: 13, fontWeight: 700 }}>
                    🧙‍♂️ Choose Class & Setup Path →
                  </Button>
                </Link>
                <Button variant="secondary" onClick={generateRoadmap} disabled={loading} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600 }}>
                  {loading ? "Igniting Stars..." : "⚡ Quick-Generate Standard Roadmap"}
                </Button>
              </div>
            </div>
          )}

          {/* Constellation Canvas + Inspector Grid */}
          {sortedEntries.length > 0 && (() => {
            const activeStar = sortedEntries.find((e) => e.topic.id === selectedStarId) || sortedEntries[0];

            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 340px",
                  gap: 24,
                }}
              >
                {/* ═══ The Constellation Star Map Canvas ═══ */}
                <div
                  style={{
                    position: "relative",
                    background: "radial-gradient(ellipse at 50% 40%, rgba(124, 92, 255, 0.08) 0%, rgba(10, 10, 15, 0.95) 70%)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg, 16px)",
                    minHeight: Math.max(620, sortedEntries.length * 110 + 100),
                    overflow: "hidden",
                    padding: "40px 20px",
                    boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Background Starfield Grid Lines */}
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  >
                    <defs>
                      <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Connecting Energy Beams between consecutive stars */}
                    {sortedEntries.map((_, i) => {
                      if (i === 0) return null;
                      const x1 = 50 + Math.sin((i - 1) * 1.3) * 32;
                      const y1 = 60 + (i - 1) * 110;
                      const x2 = 50 + Math.sin(i * 1.3) * 32;
                      const y2 = 60 + i * 110;

                      return (
                        <g key={`beam-${i}`}>
                          <line
                            x1={`${x1}%`}
                            y1={y1}
                            x2={`${x2}%`}
                            y2={y2}
                            stroke="rgba(124, 92, 255, 0.25)"
                            strokeWidth="3"
                          />
                          <line
                            x1={`${x1}%`}
                            y1={y1}
                            x2={`${x2}%`}
                            y2={y2}
                            stroke="url(#beamGrad)"
                            strokeWidth="1.5"
                            strokeDasharray="8 8"
                            style={{ animation: "beamDash 2.5s linear infinite" }}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Star Nodes placed along the constellation web with Zero-G Float */}
                  {sortedEntries.map((e, index) => {
                    const xPercent = 50 + Math.sin(index * 1.3) * 32;
                    const yPos = 60 + index * 110;
                    const isSelected = e.topic.id === activeStar.topic.id;
                    const isDone = isTopicDone(e);
                    const isCurrent = !isDone && index === activeQuestIndex;
                    const isFinal = index === sortedEntries.length - 1;

                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                        transition={{
                          scale: { duration: 0.3, delay: index * 0.04 },
                          y: { duration: 3.2 + (index % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: (index * 0.2) % 1.5 },
                        }}
                        whileHover={{ scale: 1.22 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedStarId(e.topic.id)}
                        style={{
                          position: "absolute",
                          left: `${xPercent}%`,
                          top: yPos,
                          transform: "translate(-50%, -50%)",
                          zIndex: isSelected ? 10 : 2,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {/* Radiant Star Core */}
                        <div
                          style={{
                            position: "relative",
                            width: isSelected ? 52 : 42,
                            height: isSelected ? 52 : 42,
                            borderRadius: "50%",
                            background: isSelected
                              ? "#fff"
                              : isCurrent
                              ? "var(--accent)"
                              : isDone
                              ? "#10b981"
                              : isFinal
                              ? "#f59e0b"
                              : "var(--bg-surface)",
                            border: isSelected
                              ? "4px solid var(--accent)"
                              : isCurrent
                              ? "3px solid #fff"
                              : isDone
                              ? "3px solid #a7f3d0"
                              : isFinal
                              ? "3px solid #fde68a"
                              : "2px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isSelected ? 22 : 18,
                            color: isCurrent || isFinal || isSelected || isDone ? "#fff" : "var(--text-secondary)",
                            boxShadow: isSelected
                              ? "0 0 35px var(--accent)"
                              : isCurrent
                              ? "0 0 25px var(--accent-glow)"
                              : isDone
                              ? "0 0 25px rgba(16, 185, 129, 0.55)"
                              : isFinal
                              ? "0 0 25px rgba(245, 158, 11, 0.4)"
                              : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Pulsing Ripple Halo when Selected or Active */}
                          {(isSelected || isCurrent) && (
                            <div
                              style={{
                                position: "absolute",
                                inset: -6,
                                borderRadius: "50%",
                                border: isSelected
                                  ? "2px solid var(--accent)"
                                  : "2px solid rgba(124, 92, 255, 0.6)",
                                animation: "radarRipple 2s infinite ease-out",
                                pointerEvents: "none",
                              }}
                            />
                          )}

                          {isDone ? "✅" : isCurrent ? "⚔️" : isFinal ? "👑" : "⭐"}
                        </div>

                        {/* Floating Star Title Pill */}
                        <div
                          style={{
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: isSelected
                              ? "var(--accent)"
                              : isDone
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(10, 10, 15, 0.85)",
                            border: isSelected
                              ? "1px solid #fff"
                              : isDone
                              ? "1px solid rgba(16, 185, 129, 0.35)"
                              : "1px solid var(--border)",
                            color: isSelected ? "#fff" : isDone ? "#10b981" : "var(--text-secondary)",
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            transition: "all 0.2s",
                          }}
                        >
                          {isDone ? `✓ ${e.topic.title}` : e.topic.title}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ═══ The Star Codex Inspector Column (Right) ═══ */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "sticky",
                      top: 90,
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg, 16px)",
                      padding: "24px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStar.topic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(() => {
                          const isActiveDone = isTopicDone(activeStar);
                          const isActiveCurrent = !isActiveDone && activeStar.topic.id === currentQuest?.topic.id;

                          return (
                            <>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: "0.08em",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    background: isActiveDone
                                      ? "rgba(16, 185, 129, 0.18)"
                                      : "var(--accent-soft)",
                                    color: isActiveDone ? "#10b981" : "var(--accent)",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {isActiveDone
                                    ? `✓ Star Node #${activeStar.order + 1} Conquered`
                                    : `Star Node #${activeStar.order + 1}`}
                                </span>

                                <span style={{ fontSize: 13, fontWeight: 700, color: isActiveDone ? "#10b981" : "var(--warning)" }}>
                                  {isActiveDone ? "✓ Claimed" : `+${activeStar.topic.baseXp} XP`}
                                </span>
                              </div>

                              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                                {activeStar.topic.title}
                              </h3>

                              {activeStar.topic.description ? (
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
                                  {activeStar.topic.description}
                                </p>
                              ) : (
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
                                  Master this skill node in your coding journey to advance your rank.
                                </p>
                              )}

                              <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />

                              {/* Real Node Properties */}
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "var(--text-secondary)" }}>Target Deadline</span>
                                  <span style={{ fontWeight: 600, color: "#fff" }}>
                                    {new Date(activeStar.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                </div>

                                {activeStar.topic.estimatedHours && (
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--text-secondary)" }}>Estimated Study</span>
                                    <span style={{ fontWeight: 600, color: "#fff" }}>
                                      ~{activeStar.topic.estimatedHours} hours
                                    </span>
                                  </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "var(--text-secondary)" }}>Arena Type</span>
                                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                                    Sandpack Interactive
                                  </span>
                                </div>
                              </div>

                              {/* Direct Launch Action */}
                              {isActiveDone || isActiveCurrent ? (
                                <Link to={`/quest/${activeStar.topic.id}`} style={{ textDecoration: "none" }}>
                                  <motion.div
                                    whileHover={{ scale: 1.03, boxShadow: isActiveCurrent ? "0 0 25px var(--accent-glow)" : "none" }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <Button
                                      variant={isActiveCurrent ? "primary" : "secondary"}
                                      onClick={() => playButtonTap()}
                                      style={{
                                        width: "100%",
                                        padding: "12px",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        color: isActiveDone ? "#10b981" : undefined,
                                        borderColor: isActiveDone ? "rgba(16, 185, 129, 0.35)" : undefined,
                                      }}
                                    >
                                      {isActiveDone ? (
                                        <>
                                          <span>↺</span> Revisit Quest Trial
                                        </>
                                      ) : (
                                        <>
                                          <span>⚔️</span> Warp to Quest Trial
                                          <motion.span
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                            style={{ display: "inline-block" }}
                                          >
                                            →
                                          </motion.span>
                                        </>
                                      )}
                                    </Button>
                                  </motion.div>
                                </Link>
                              ) : (
                                <Button
                                  disabled
                                  variant="ghost"
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "var(--text-muted)",
                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                    background: "rgba(255, 255, 255, 0.02)",
                                    cursor: "not-allowed",
                                    opacity: 0.5,
                                  }}
                                >
                                  🔒 Quest Sealed (Complete Current Quest First)
                                </Button>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.main>
      )}

        {/* VIEW 4: TROPHY CODEX / ACHIEVEMENTS */}
        {activeView === "achievements" && (
          <AchievementsView
            key="achievements"
            initialAchievements={cachedAchievements}
            onRefresh={setCachedAchievements}
          />
        )}

        {/* VIEW 5: PLAYER ANALYTICS COMMAND DECK */}
        {activeView === "analytics" && (
          <AnalyticsView
            key="analytics"
            initialAnalytics={cachedAnalytics}
            onRefresh={setCachedAnalytics}
          />
        )}
      </AnimatePresence>

      {/* FLOATING AI MENTOR COMPANION (WEB DEV GUARDED) */}
      <MentorDrawer />


      {/* REALM MASTERY DIPLOMA / CERTIFICATE MODAL */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        studentName={accountInfo?.name}
        email={session?.user.email}
        goal={accountInfo?.goal}
        totalQuests={sortedEntries.length}
        completedQuests={completedCount}
        totalXp={totalClaimedXp}
        currentLevel={currentLevel}
      />
    </div>
  );
}

export default DashboardPage;