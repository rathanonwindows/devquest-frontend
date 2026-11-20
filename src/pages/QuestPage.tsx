import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useAuth } from "../contexts/AuthContext";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { Button } from "../components/ui/Button";
import { CelebrationModal, type QuestCompletionData } from "../components/ui/CelebrationModal";
import {
  verifyTopicSolution,
  type VerificationResult,
} from "../lib/questVerification";
import { getTopicStudyGuide, type StudyGuide } from "../lib/topicStudyGuides";
import { MentorDrawer } from "../components/mentor/MentorDrawer";
import {
  playSuccessChime,
  playQuestComplete,
  playLevelUpFanfare,
  playButtonTap,
} from "../lib/soundEffects";
import { API_URL } from "../lib/api";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  platform: string;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  region?: {
    id: string;
    name: string;
    slug?: string;
    theme?: string;
  };
}

interface TopicDetail {
  id: string;
  title: string;
  description: string | null;
  baseXp: number;
  difficulty?: number;
  estimatedHours?: number;
  exercisePrompt: string | null;
  exerciseFiles: Record<string, string> | null;
  chapter?: Chapter | null;
  resources: { id?: string; rank?: number; resource: Resource }[];
  progress?: { status: string; completedAt?: string | null } | null;
}

// Bridge component to sync live code from SandpackProvider to QuestPage state
function ArenaStateBridge({
  onCodeChange,
}: {
  onCodeChange: (files: Record<string, string>) => void;
}) {
  const { sandpack } = useSandpack();
  const lastSerializedRef = useRef<string>("");
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    const extracted: Record<string, string> = {};
    for (const [path, fileObj] of Object.entries(sandpack.files)) {
      extracted[path] = typeof fileObj === "string" ? fileObj : fileObj.code;
    }

    const serialized = JSON.stringify(extracted);
    if (serialized === lastSerializedRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      lastSerializedRef.current = serialized;
      onCodeChange(extracted);
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sandpack.files, onCodeChange]);

  return null;
}

// Reset button inside Sandpack context
function SandpackResetTrigger({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      title="Reset files to initial trial starter template"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <span>↺</span> Reset Starter
    </button>
  );
}

interface CodeSyntaxError {
  file: string;
  line: number;
  message: string;
  snippet?: string;
  hint?: string;
}

function validateArenaCode(files: Record<string, any>): CodeSyntaxError | null {
  for (const [rawPath, fileObj] of Object.entries(files)) {
    const filename = rawPath.replace(/^\/+/, "");
    const code = typeof fileObj === "string" ? fileObj : fileObj?.code || "";
    if (!code) continue;

    const lines = code.split("\n");

    // ── 1. HTML VALIDATION ──
    if (filename.endsWith(".html")) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) continue;

        // Check for empty tags '<>' or stray closing brackets '>>', '?>'
        if (/<>[^<]*|>>|\?[>]+/i.test(line)) {
          return {
            file: filename,
            line: i + 1,
            message: "Malformed HTML tag or stray bracket token detected.",
            snippet: trimmed,
            hint: 'Ensure all tags have valid names and are enclosed with single "<" and ">".',
          };
        }

        // Check for tags with invalid characters in tag name
        const allTags = line.matchAll(/<([^>]*)>/g);
        for (const tagMatch of allTags) {
          const content = tagMatch[1].trim();
          if (!content) continue;
          if (content.startsWith("!DOCTYPE") || content.startsWith("!--")) continue;

          let cleanContent = content;
          if (cleanContent.startsWith("/")) cleanContent = cleanContent.slice(1).trim();

          const nameMatch = cleanContent.match(/^([^\s/>]+)/);
          if (nameMatch) {
            const tagName = nameMatch[1];
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(tagName)) {
              return {
                file: filename,
                line: i + 1,
                message: `Invalid HTML tag name "<${tagName}>".`,
                snippet: tagMatch[0],
                hint: "HTML tag names can only start with a letter and contain letters, numbers, and hyphens (e.g. <form>, <div>, <input>).",
              };
            }
          }

          // Check for unclosed attribute quotes
          const dQuotes = (content.match(/"/g) || []).length;
          const sQuotes = (content.match(/'/g) || []).length;
          if (dQuotes % 2 !== 0 || sQuotes % 2 !== 0) {
            return {
              file: filename,
              line: i + 1,
              message: `Unclosed attribute quote in tag "${tagMatch[0]}".`,
              snippet: tagMatch[0],
              hint: 'Make sure all attribute values are enclosed with matching quotation marks (e.g. type="text").',
            };
          }
        }
      }
    }

    // ── 2. CSS VALIDATION ──
    if (filename.endsWith(".css")) {
      let openBraces = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const char of line) {
          if (char === "{") openBraces++;
          if (char === "}") openBraces--;
          if (openBraces < 0) {
            return {
              file: filename,
              line: i + 1,
              message: 'Unexpected closing brace "}" without matching opening brace.',
              snippet: line.trim(),
              hint: 'Check your CSS rule blocks to ensure braces "{" and "}" are properly paired.',
            };
          }
        }
      }
      if (openBraces > 0) {
        return {
          file: filename,
          line: lines.length,
          message: 'Unclosed CSS declaration block. Missing "}".',
          hint: 'Ensure every CSS rule block opened with "{" is closed with "}".',
        };
      }
    }

    // ── 3. JS VALIDATION ──
    if (filename.endsWith(".js") && !filename.includes("sandpack")) {
      try {
        new Function(code);
      } catch (err: any) {
        return {
          file: filename,
          line: 1,
          message: err?.message || "JavaScript syntax error",
          hint: "Check your JavaScript code for missing parentheses, commas, or semicolons.",
        };
      }
    }
  }

  return null;
}

// Live Syntax & Compilation Error Overlay rendered over SandpackPreview
function ArenaLiveErrorOverlay() {
  const { sandpack } = useSandpack();

  const sandpackError = sandpack.error?.message;

  const syntaxError = useMemo(() => {
    if (sandpackError) return null;
    return validateArenaCode(sandpack.files);
  }, [sandpack.files, sandpackError]);

  const displayError: CodeSyntaxError | null = sandpackError
    ? {
        file: "Runtime",
        line: 1,
        message: sandpackError,
        hint: "Review your code syntax and resolve the runtime exception above.",
      }
    : syntaxError;

  if (!displayError) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(10, 10, 16, 0.96)",
        backdropFilter: "blur(8px)",
        zIndex: 30,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 16,
        overflowY: "auto",
        borderLeft: "4px solid #ef4444",
        boxShadow: "inset 0 0 40px rgba(239, 68, 68, 0.12)",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Syntax & Compilation Error
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {displayError.file} &bull; Line {displayError.line}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "3px 8px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          PARSER ERROR
        </span>
      </div>

      <div
        style={{
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: 8,
          padding: "14px 16px",
          color: "#fee2e2",
          fontSize: 13,
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        {displayError.message}
      </div>

      {displayError.snippet && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
            Offending Code Line:
          </span>
          <div
            style={{
              background: "#050508",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#38bdf8",
              fontSize: 12,
              lineHeight: 1.4,
              overflowX: "auto",
            }}
          >
            <span style={{ color: "#f87171", marginRight: 10, fontWeight: 700 }}>{displayError.line} |</span>
            <span style={{ color: "#fca5a5" }}>{displayError.snippet}</span>
            <div style={{ color: "#ef4444", marginTop: 4 }}>
              {" ".repeat(String(displayError.line).length + 3) + "^".repeat(Math.min(30, displayError.snippet.length || 1))}
            </div>
          </div>
        </div>
      )}

      {displayError.hint && (
        <div
          style={{
            background: "rgba(56, 189, 248, 0.06)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 8,
            padding: "12px 14px",
            color: "#bae6fd",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          💡 <strong style={{ color: "#38bdf8" }}>Guild Scribe Clue:</strong> {displayError.hint}
        </div>
      )}
    </motion.div>
  );
}

function QuestPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Primary page mode: Approach B (Study Chamber ↔ Trial Arena)
  const [pageMode, setPageMode] = useState<"study" | "arena">("study");

  // Topic & progress state
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prerequisite Lock Gate State (Fix 1)
  const [isLockedGate, setIsLockedGate] = useState(false);
  const [lockedPrereqTitle, setLockedPrereqTitle] = useState<string | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);

  // Workspace UI states
  const [activeTab, setActiveTab] = useState<"briefing" | "resources">("briefing");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"preview" | "console">("preview");
  const [resetCounter, setResetCounter] = useState(0);

  // Live code & verification states
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  const [hasRunVerification, setHasRunVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Celebration fanfare modal states
  const [celebrationData, setCelebrationData] = useState<QuestCompletionData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Ref to track loaded topic ID and prevent redundant resets on tab/app switch
  const loadedTopicIdRef = useRef<string | null>(null);

  const apiUrl = API_URL;
  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    }),
    [session?.access_token]
  );

  // Fetch topic details & verify prerequisite lock status
  useEffect(() => {
    if (!topicId || !session?.access_token) return;

    // Fix 4: Prevent reset, re-fetch, and re-animation on tab/app refocus if topic is already loaded
    if (loadedTopicIdRef.current === topicId && topic !== null) {
      return;
    }

    setTopic(null);
    setCompleted(false);
    setError(null);
    setIsLockedGate(false);
    setHasRunVerification(false);

    // Parallel fetch topic and roadmap to verify prerequisites
    Promise.all([
      fetch(`${apiUrl}/topics/${topicId}`, { headers: authHeaders }),
      fetch(`${apiUrl}/roadmap/latest?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { ...authHeaders, "Cache-Control": "no-cache" },
      }),
    ])
      .then(async ([topicRes, roadmapRes]) => {
        if (!topicRes.ok) throw new Error("Failed to load topic");
        const topicData: TopicDetail = await topicRes.json();
        loadedTopicIdRef.current = topicId;

        let isLocked = false;
        let prereqTitle = "";
        let nextIncompleteId = "";

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          if (roadmapData?.entries && Array.isArray(roadmapData.entries)) {
            const sortedEntries = [...roadmapData.entries].sort((a: any, b: any) => a.order - b.order);
            const activeIndex = sortedEntries.findIndex(
              (e: any) => !e.topic.progress?.some((p: any) => p.status === "completed")
            );

            if (activeIndex !== -1) {
              const currentTopicIndex = sortedEntries.findIndex((e: any) => e.topic.id === topicId);
              const isTopicAlreadyDone = topicData.progress?.status === "completed";

              // If this quest comes after the active incomplete quest and isn't completed, it is SEALED
              if (currentTopicIndex > activeIndex && !isTopicAlreadyDone) {
                isLocked = true;
                prereqTitle = sortedEntries[activeIndex].topic.title;
                nextIncompleteId = sortedEntries[activeIndex].topic.id;
              }
            }
          }
        }

        if (isLocked) {
          setIsLockedGate(true);
          setLockedPrereqTitle(prereqTitle);
          setActiveQuestId(nextIncompleteId);
          setTopic(topicData);
        } else {
          setTopic(topicData);
          if (topicData.progress?.status === "completed") {
            setCompleted(true);
            setPageMode("arena");
          } else {
            setPageMode("study");
          }
          if (topicData.exerciseFiles) {
            setUserCode(topicData.exerciseFiles);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load topic:", err);
        setError("Unable to warp to quest trial. Please verify connection to the guild server.");
      });
  }, [topicId, session?.access_token, apiUrl, authHeaders, topic]);

  // Fix 3: Open victory celebration with synthesized fallback data if needed
  const handleOpenCelebration = useCallback(() => {
    playButtonTap();
    if (!celebrationData && topic) {
      setCelebrationData({
        topicTitle: topic.title,
        xpAwarded: topic.baseXp,
        newTotalXp: topic.baseXp,
        newLevel: Math.max(1, Math.floor(topic.baseXp / 1000) + 1),
        isLevelUp: false,
        currentStreak: 1,
        nextTopic: null,
      });
    }
    setShowCelebration(true);
  }, [celebrationData, topic]);

  // Code change callback from Sandpack
  const handleCodeChange = useCallback((files: Record<string, string>) => {
    setUserCode(files);
  }, []);

  // Compute live verification checks
  const verificationResult: VerificationResult = useMemo(() => {
    if (!topic) {
      return { allPassed: false, score: 0, total: 0, criteria: [] };
    }
    return verifyTopicSolution(
      topic.title,
      topic.exercisePrompt,
      userCode,
      topic.exerciseFiles
    );
  }, [topic, userCode]);

  // Manual test verification trigger
  const handleRunVerification = () => {
    playButtonTap();
    setIsVerifying(true);
    setTimeout(() => {
      setHasRunVerification(true);
      setIsVerifying(false);
      if (verificationResult.allPassed) {
        playSuccessChime();
      }
    }, 350);
  };

  // Reset starter files
  const handleResetFiles = () => {
    playButtonTap();
    if (window.confirm("Reset files to initial quest trial template? Any unsaved edits will be cleared.")) {
      if (topic?.exerciseFiles) {
        setUserCode(topic.exerciseFiles);
      }
      setResetCounter((c) => c + 1);
      setHasRunVerification(false);
    }
  };

  // Complete quest trial submission
  const handleComplete = async () => {
    playButtonTap();
    if (!topicId || submitting) return;

    // Check verification if not already passed
    if (!verificationResult.allPassed && !completed) {
      setHasRunVerification(true);
      const proceed = window.confirm(
        `⚔️ Warning: Not all verification checks are satisfied (${verificationResult.score}/${verificationResult.total} passed).\n\nSubmit anyway to claim trial?`
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/quests/${topicId}/complete`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to complete quest trial.");
      }

      const data: QuestCompletionData = await res.json();
      setCompleted(true);
      setCelebrationData(data);
      if (data.isLevelUp) {
        playLevelUpFanfare();
      } else {
        playQuestComplete();
      }
      setShowCelebration(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err?.message || "Failed to complete quest trial.");
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut listener (Escape to return)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showCelebration) {
        navigate("/dashboard");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, showCelebration]);

  // ── TEMPLATE & FILE RESILIENCY (Guaranteed Hook Order) ──
  const isReactTemplate = useMemo(() => {
    if (!topic) return false;
    const title = topic.title.toLowerCase();
    return (
      title.includes("react") ||
      title.includes("usestate") ||
      title.includes("useeffect") ||
      Boolean(topic.exerciseFiles?.["/App.js"]) ||
      Boolean(topic.exerciseFiles?.["App.js"]) ||
      Boolean(topic.exerciseFiles?.["/index.js"]?.includes("import React"))
    );
  }, [topic]);

  const hasJsFile = useMemo(() => {
    if (!topic) return false;
    const title = topic.title.toLowerCase();
    // Only topics that actually teach or require JavaScript logic
    const hasJsTitle =
      title.includes("javascript") ||
      title.includes("js basics") ||
      title.includes("arrays") ||
      title.includes("objects") ||
      title.includes("dom") ||
      title.includes("storage") ||
      title.includes("async") ||
      title.includes("fetch");

    // Or topics whose exercise files genuinely contain non-empty JS code
    const hasRealJsCode = Boolean(
      (topic.exerciseFiles?.["/index.js"] && topic.exerciseFiles["/index.js"].trim().length > 0) ||
      (topic.exerciseFiles?.["index.js"] && topic.exerciseFiles["index.js"].trim().length > 0)
    );

    return hasJsTitle || hasRealJsCode;
  }, [topic]);

  const sandpackTemplate: "react" | "vanilla" | "static" = isReactTemplate
    ? "react"
    : hasJsFile
    ? "vanilla"
    : "static";

  // Initial sandbox files - stable reference, ONLY recreated on topicId, resetCounter, or template change!
  // Decoupled from userCode so typing does NOT reload the SandpackProvider iframe!
  const initialEditorFiles = useMemo(() => {
    if (!topic) return {};
    const base = topic.exerciseFiles || {};
    const sanitized: Record<string, any> = {};

    for (const [rawKey, content] of Object.entries(base)) {
      const key = rawKey.startsWith("/") ? rawKey : `/${rawKey}`;
      // In static HTML/CSS templates, filter out dummy empty /index.js so it doesn't show as a tab
      if (
        sandpackTemplate === "static" &&
        key === "/index.js" &&
        (typeof content === "string" ? content.trim() === "" : false)
      ) {
        continue;
      }
      sanitized[key] = content;
    }

    if (!sanitized["/index.html"] && !isReactTemplate) {
      sanitized["/index.html"] = "<!DOCTYPE html>\n<html>\n<body>\n</body>\n</html>";
    }

    return sanitized;
  }, [topic?.id, resetCounter, sandpackTemplate, isReactTemplate]);

  // Determine active default file
  const defaultActiveFile = useMemo(() => {
    const keys = Object.keys(initialEditorFiles);
    if (sandpackTemplate === "static") {
      if (keys.includes("/index.html")) return "/index.html";
    }
    if (sandpackTemplate === "react") {
      if (keys.includes("/App.js")) return "/App.js";
      if (keys.includes("/index.js")) return "/index.js";
    }
    return keys[0] || "/index.html";
  }, [initialEditorFiles, sandpackTemplate]);

  if (!topic) {
    return (
      <LoadingScreen
        title="WARPING TO QUEST ARENA"
        subtitle="Assembling sandbox runtime, test suites, and quest trial scrolls..."
        icon="⚔️"
        badge="DEVQUEST ARENA // SANDBOX LOADING"
      />
    );
  }

  // ── PREREQUISITE LOCK GATE SCREEN (Fix 1) ──
  if (isLockedGate) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={{
            maxWidth: 540,
            width: "100%",
            background: "linear-gradient(145deg, #161622 0%, #101018 100%)",
            border: "2px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "var(--radius-lg, 20px)",
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 0 60px rgba(239, 68, 68, 0.2), 0 20px 40px rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              border: "2px solid rgba(239, 68, 68, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              margin: "0 auto 20px",
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)",
            }}
          >
            🔒
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Ancient Runes Active
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 12px", color: "#fff" }}>
            Quest Trial Sealed
          </h2>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 28px" }}>
            The gates to <strong style={{ color: "#fff" }}>{topic.title}</strong> are sealed. You must first prove
            your valor and conquer <strong style={{ color: "var(--warning)" }}>{lockedPrereqTitle}</strong> before unlocking this chamber.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeQuestId && (
              <Button
                variant="primary"
                onClick={() => {
                  playButtonTap();
                  navigate(`/quest/${activeQuestId}`);
                }}
                style={{
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 0 25px var(--accent-glow)",
                }}
              >
                <span>⚔️</span> Warp to Active Quest: {lockedPrereqTitle} →
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                playButtonTap();
                navigate("/dashboard");
              }}
              style={{
                padding: "12px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              📜 Return to Command Hub
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const regionName = topic.chapter?.region?.name || "DevQuest Atlas";
  const chapterTitle = topic.chapter?.title || "Fundamentals";
  const difficultyStars = "★".repeat(topic.difficulty || 1);
  const difficultyLabel =
    (topic.difficulty || 1) <= 1
      ? "Novice"
      : (topic.difficulty || 1) === 2
      ? "Apprentice"
      : (topic.difficulty || 1) === 3
      ? "Adept"
      : "Master";

  // Study Chamber Guide (Approach B)
  const studyGuide: StudyGuide = getTopicStudyGuide(topic.title, topic.description);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 10% 10%, rgba(124, 92, 255, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.06) 0%, transparent 40%),
          var(--bg-base)
        `,
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Ambient Cosmic Atmosphere */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "fixed",
          top: "10%",
          left: "5%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 92, 255, 0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ══════════ TOP COMMAND HUD & NAVIGATION BAR ══════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(10, 10, 15, 0.9)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1680,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Left: Navigation and Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Button
              variant="secondary"
              onClick={() => {
                playButtonTap();
                navigate("/dashboard");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
              }}
            >
              <span>←</span>
              <span>Hub</span>
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  background: "rgba(255,255,255,0.1)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                ESC
              </span>
            </Button>

            {/* Breadcrumb path */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                🏰 {regionName}
              </span>
              <span>/</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{chapterTitle}</span>
              <span>/</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{topic.title}</span>
            </div>
          </div>

          {/* Center: Dual-Mode Animated Segmented Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--radius-md, 10px)",
              padding: 3,
              border: "1px solid var(--border)",
              position: "relative",
            }}
          >
            <button
              onClick={() => {
                playButtonTap();
                setPageMode("study");
              }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: pageMode === "study" ? "#fff" : "var(--text-secondary)",
                transition: "color 0.2s ease",
              }}
            >
              {pageMode === "study" && (
                <motion.div
                  layoutId="activeModePill"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--accent)",
                    borderRadius: 8,
                    boxShadow: "0 0 18px var(--accent-glow)",
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>📖 Study Chamber</span>
            </button>

            <button
              onClick={() => {
                playButtonTap();
                setPageMode("arena");
              }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: pageMode === "arena" ? "#fff" : "var(--text-secondary)",
                transition: "color 0.2s ease",
              }}
            >
              {pageMode === "arena" && (
                <motion.div
                  layoutId="activeModePill"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--accent)",
                    borderRadius: 8,
                    boxShadow: "0 0 18px var(--accent-glow)",
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>⚔️ Trial Arena</span>
            </button>
          </div>

          {/* Right: Quest Status & Loot Telemetry */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ color: "#f59e0b" }}>{difficultyStars}</span>
              <span>{difficultyLabel}</span>
            </div>

            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                fontSize: 12,
                fontWeight: 800,
                color: "var(--warning)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>💎</span>
              <span>+{topic.baseXp} XP</span>
            </div>

            {completed ? (
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.18)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 0 14px rgba(16, 185, 129, 0.2)",
                }}
              >
                <span>🏆</span>
                <span>CONQUERED</span>
              </div>
            ) : (
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(124, 92, 255, 0.15)",
                  border: "1px solid rgba(124, 92, 255, 0.4)",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>⚔️</span>
                <span>TRIAL ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════ DUAL-MODE ANIMATED CONTENT (APPROACH B) ══════════ */}
      <AnimatePresence mode="wait">
        {pageMode === "study" ? (
          /* ── MODE 1: STUDY CHAMBER (Animated Concept & Deep Dive) ── */
          <motion.main
            key="study-chamber-view"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{
              maxWidth: 1100,
              width: "100%",
              margin: "0 auto",
              padding: "36px 24px 60px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(22, 22, 34, 0.9) 0%, rgba(14, 14, 22, 0.95) 100%)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 18px)",
                padding: "32px 36px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "linear-gradient(90deg, transparent, var(--accent), #38bdf8, transparent)",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  📖 Ancient Knowledge Codex
                </span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Estimated Study: ~{topic.estimatedHours || 2}h
                </span>
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 14px", color: "#fff", letterSpacing: "-0.02em" }}>
                {topic.title}
              </h1>

              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)", margin: 0 }}>
                {studyGuide.summary}
              </p>
            </div>

            {/* Section 1: Mental Model & Key Principles */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 16px)",
                padding: "28px 32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>🧠</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
                  {studyGuide.mentalModel.title}
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                {studyGuide.mentalModel.points.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 10,
                      padding: "14px 18px",
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "rgba(124, 92, 255, 0.2)",
                        color: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>{pt}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Essential Syntax Cheat Sheet */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 16px)",
                padding: "28px 32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
                    {studyGuide.cheatSheet.title}
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--text-secondary)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "3px 8px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {studyGuide.cheatSheet.language}
                </span>
              </div>

              <pre
                style={{
                  margin: 0,
                  background: "#08080d",
                  border: "1px solid #1e1e28",
                  borderRadius: 10,
                  padding: "20px 22px",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontFamily: "var(--font-mono, monospace)",
                  lineHeight: 1.6,
                  overflowX: "auto",
                }}
              >
                <code>{studyGuide.cheatSheet.code}</code>
              </pre>
            </div>

            {/* Section 3: Deep-Dive Scrolls (Curated Videos, Playgrounds, Docs) */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 16px)",
                padding: "28px 32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: 18 }}>📚</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
                  Curated Deep-Dive Scrolls
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                {studyGuide.deepDiveScrolls.map((scroll, i) => (
                  <a
                    key={i}
                    href={scroll.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "20px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.background = "rgba(124, 92, 255, 0.05)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: scroll.type === "video" ? "rgba(239, 68, 68, 0.15)" : "rgba(56, 189, 248, 0.15)",
                            color: scroll.type === "video" ? "#f87171" : "#38bdf8",
                            textTransform: "uppercase",
                          }}
                        >
                          {scroll.badge}
                        </span>
                        <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>↗</span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>
                        {scroll.title}
                      </h3>

                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                        {scroll.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Section 4: Pro-Tip Guild Lore */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-md, 12px)",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 24 }}>💡</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#f59e0b", letterSpacing: "0.06em", marginBottom: 2 }}>
                  Guild Master Pro-Tip
                </div>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>
                  {studyGuide.proTip}
                </div>
              </div>
            </div>

            {/* Launch Action to Enter Code Arena */}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Button
                variant="primary"
                onClick={() => {
                  playButtonTap();
                  setPageMode("arena");
                }}
                style={{
                  padding: "16px 40px",
                  fontSize: 16,
                  fontWeight: 800,
                  borderRadius: "var(--radius-md, 12px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 0 35px var(--accent-glow)",
                }}
              >
                <span>⚔️</span>
                <span>I'm Ready — Enter Code Arena & Begin Trial →</span>
              </Button>
            </div>
          </motion.main>
        ) : (
          /* ── MODE 2: TRIAL ARENA (Animated Interactive Workstation) ── */
          <motion.main
            key="trial-arena-view"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{
              maxWidth: 1680,
              width: "100%",
              margin: "0 auto",
              padding: "20px 24px 32px",
              flex: 1,
              display: "grid",
              gridTemplateColumns: "440px minmax(0, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* ── LEFT COLUMN: THE QUEST CODEX (Briefing, Objectives, Tests) ── */}
            <section
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 16px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                height: "calc(100vh - 110px)",
                position: "sticky",
                top: 76,
              }}
            >
              {/* Codex Tab Header with Sliding Indicator */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--border)",
                  background: "rgba(255, 255, 255, 0.02)",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => {
                    playButtonTap();
                    setActiveTab("briefing");
                  }}
                  style={{
                    position: "relative",
                    flex: 1,
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    color: activeTab === "briefing" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    transition: "color 0.15s ease",
                  }}
                >
                  {activeTab === "briefing" && (
                    <motion.div
                      layoutId="activeCodexTab"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "var(--accent)",
                        boxShadow: "0 0 10px var(--accent)",
                      }}
                    />
                  )}
                  <span>📜</span>
                  <span>Mission Codex</span>
                </button>

                <button
                  onClick={() => {
                    playButtonTap();
                    setActiveTab("resources");
                  }}
                  style={{
                    position: "relative",
                    flex: 1,
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    color: activeTab === "resources" ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    transition: "color 0.15s ease",
                  }}
                >
                  {activeTab === "resources" && (
                    <motion.div
                      layoutId="activeCodexTab"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "var(--accent)",
                        boxShadow: "0 0 10px var(--accent)",
                      }}
                    />
                  )}
                  <span>📚</span>
                  <span>Ancient Grimoire ({topic.resources?.length || 0})</span>
                </button>
              </div>

              {/* Codex Scrollable Body */}
              <div
                style={{
                  padding: 20,
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {activeTab === "briefing" ? (
                  <>
                    {/* Topic Lore & Description */}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--accent)",
                          marginBottom: 6,
                        }}
                      >
                        Trial Lore & Directives
                      </div>
                      <h1
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          margin: "0 0 10px",
                          color: "#fff",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {topic.title}
                      </h1>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "var(--text-secondary)",
                          margin: 0,
                        }}
                      >
                        {topic.description || "Master this foundational skill to advance through the kingdom's territory."}
                      </p>
                    </div>

                    {/* Primary Objective Directive Box */}
                    {topic.exercisePrompt && (
                      <div
                        style={{
                          background: "linear-gradient(145deg, rgba(124, 92, 255, 0.08) 0%, rgba(20, 20, 32, 0.6) 100%)",
                          border: "1px solid rgba(124, 92, 255, 0.35)",
                          borderRadius: "var(--radius-md, 12px)",
                          padding: "16px 18px",
                          boxShadow: "inset 0 0 15px rgba(124, 92, 255, 0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 8,
                          }}
                        >
                          <span>🎯</span>
                          <span>Primary Objective Directive</span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "#fff",
                            fontWeight: 500,
                          }}
                        >
                          {topic.exercisePrompt}
                        </div>
                      </div>
                    )}

                    {/* Solution Verification Runner Panel */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md, 12px)",
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span>⚡</span>
                          <span>Acceptance Test Suite</span>
                        </div>

                        <button
                          onClick={handleRunVerification}
                          disabled={isVerifying}
                          style={{
                            background: "rgba(124, 92, 255, 0.15)",
                            border: "1px solid rgba(124, 92, 255, 0.4)",
                            color: "var(--accent)",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span>{isVerifying ? "⏳" : "🧪"}</span>
                          <span>{isVerifying ? "Testing..." : "Run Test"}</span>
                        </button>
                      </div>

                      {/* Summary Bar */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: verificationResult.allPassed
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(245, 158, 11, 0.08)",
                          border: verificationResult.allPassed
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : "1px solid rgba(245, 158, 11, 0.2)",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: verificationResult.allPassed ? "#10b981" : "#f59e0b",
                          }}
                        >
                          {verificationResult.allPassed
                            ? "✓ ALL CHECKS SATISFIED"
                            : `${verificationResult.score} OF ${verificationResult.total} CHECKS SATISFIED`}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: verificationResult.allPassed ? "#10b981" : "var(--text-secondary)",
                          }}
                        >
                          {verificationResult.total > 0
                            ? `${Math.round((verificationResult.score / verificationResult.total) * 100)}%`
                            : "0%"}
                        </div>
                      </div>

                      {/* Criteria Checklist */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {verificationResult.criteria.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              background: "rgba(255, 255, 255, 0.02)",
                              border: c.passed
                                ? "1px solid rgba(16, 185, 129, 0.25)"
                                : "1px solid rgba(255, 255, 255, 0.07)",
                              borderRadius: 8,
                              padding: "10px 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 13 }}>{c.passed ? "✅" : "⏳"}</span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: c.passed ? "#fff" : "var(--text-secondary)",
                                  }}
                                >
                                  {c.label}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: c.passed ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                                  color: c.passed ? "#10b981" : "var(--text-muted)",
                                }}
                              >
                                {c.passed ? "PASSED" : "PENDING"}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 24 }}>
                              {c.description}
                            </div>
                            {!c.passed && hasRunVerification && c.hint && (
                              <div
                                style={{
                                  marginTop: 4,
                                  marginLeft: 24,
                                  padding: "4px 8px",
                                  background: "rgba(245, 158, 11, 0.1)",
                                  borderRadius: 4,
                                  fontSize: 11,
                                  color: "#f59e0b",
                                  fontFamily: "var(--font-mono, monospace)",
                                }}
                              >
                                💡 {c.hint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Ancient Grimoire (Resources Tab) */
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--accent)",
                          marginBottom: 4,
                        }}
                      >
                        Guild Knowledge Archives
                      </div>
                      <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#fff" }}>
                        Recommended Scrolls & Guides
                      </h3>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                        Consult these official scrolls to clarify mechanics, syntax, and best practices.
                      </p>
                    </div>

                    {topic.resources?.length === 0 ? (
                      <div
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          fontSize: 13,
                          background: "rgba(255, 255, 255, 0.02)",
                          borderRadius: 10,
                        }}
                      >
                        No additional scrolls filed for this quest. Rely on your trial directives!
                      </div>
                    ) : (
                      topic.resources.map(({ resource }) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md, 10px)",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            textDecoration: "none",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.backgroundColor = "rgba(124, 92, 255, 0.06)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                              {resource.title}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                              <span
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: "rgba(124, 92, 255, 0.15)",
                                  color: "var(--accent)",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {resource.platform}
                              </span>
                              <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>
                                {resource.type}
                              </span>
                            </div>
                          </div>
                          <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>↗</span>
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Codex Action Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--border)",
                  background: "rgba(10, 10, 15, 0.8)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {error && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: 6,
                      color: "#f87171",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {completed ? (
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button
                      variant="primary"
                      onClick={handleOpenCelebration}
                      style={{
                        flex: 1,
                        padding: "12px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <span>🏆</span>
                      <span>View Victory Fanfare ↺</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleComplete}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "13px",
                      fontSize: 14,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: verificationResult.allPassed
                        ? "linear-gradient(135deg, #7c5cff 0%, #6366f1 100%)"
                        : "rgba(124, 92, 255, 0.12)",
                      color: verificationResult.allPassed ? "#ffffff" : "#c4b5fd",
                      border: verificationResult.allPassed
                        ? "1px solid rgba(255, 255, 255, 0.4)"
                        : "1px solid rgba(124, 92, 255, 0.35)",
                      boxShadow: verificationResult.allPassed
                        ? "0 0 25px rgba(124, 92, 255, 0.55)"
                        : "none",
                      filter: submitting ? "brightness(0.8)" : "none",
                      cursor: submitting ? "wait" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{submitting ? "⚡" : "⚔️"}</span>
                    <span>
                      {submitting
                        ? "Claiming Glory..."
                        : verificationResult.allPassed
                        ? `Claim Quest XP (+${topic.baseXp} XP) ✨`
                        : "Submit Quest Solution"}
                    </span>
                  </Button>
                )}
              </div>
            </section>

            {/* ── RIGHT COLUMN: INTERACTIVE CODE ARENA (Sandpack) ── */}
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <SandpackProvider
                key={`${topic.id}-${resetCounter}`}
                template={sandpackTemplate}
                theme="dark"
                files={initialEditorFiles}
                options={{
                  activeFile: defaultActiveFile,
                  visibleFiles: Object.keys(initialEditorFiles),
                  autorun: true,
                  autoReload: true,
                }}
              >
                <ArenaStateBridge onCodeChange={handleCodeChange} />

                {/* Arena Console Header Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md, 10px)",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#10b981",
                          boxShadow: "0 0 8px #10b981",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#fff",
                        }}
                      >
                        DEVQUEST ARENA RUNTIME
                      </span>
                    </div>

                    <span style={{ color: "var(--text-muted)" }}>•</span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {sandpackTemplate === "react"
                        ? "React 18/19 Runtime"
                        : sandpackTemplate === "static"
                        ? "Static HTML5 / CSS3 Engine"
                        : "Vanilla JavaScript Runtime"}
                    </span>
                  </div>

                  {/* Workspace View Controls with Animated Sliding Indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: 6,
                        padding: 2,
                        border: "1px solid var(--border)",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() => {
                          playButtonTap();
                          setActiveWorkspaceTab("preview");
                        }}
                        style={{
                          position: "relative",
                          border: "none",
                          color: activeWorkspaceTab === "preview" ? "#fff" : "var(--text-secondary)",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "transparent",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {activeWorkspaceTab === "preview" && (
                          <motion.div
                            layoutId="activeWorkspaceTabIndicator"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "var(--bg-surface-raised)",
                              borderRadius: 4,
                              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                              zIndex: 0,
                            }}
                          />
                        )}
                        <span style={{ position: "relative", zIndex: 1 }}>🖥️ Preview</span>
                      </button>

                      <button
                        onClick={() => {
                          playButtonTap();
                          setActiveWorkspaceTab("console");
                        }}
                        style={{
                          position: "relative",
                          border: "none",
                          color: activeWorkspaceTab === "console" ? "#fff" : "var(--text-secondary)",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "transparent",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {activeWorkspaceTab === "console" && (
                          <motion.div
                            layoutId="activeWorkspaceTabIndicator"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "var(--bg-surface-raised)",
                              borderRadius: 4,
                              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                              zIndex: 0,
                            }}
                          />
                        )}
                        <span style={{ position: "relative", zIndex: 1 }}>📟 Console</span>
                      </button>
                    </div>

                    <SandpackResetTrigger onReset={handleResetFiles} />
                  </div>
                </div>

                {/* Sandpack Workstation Layout */}
                <div
                  style={{
                    borderRadius: "var(--radius-lg, 16px)",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <SandpackLayout
                    style={{
                      border: "none",
                      borderRadius: 0,
                      minHeight: 640,
                    }}
                  >
                    <SandpackCodeEditor
                      showLineNumbers
                      showInlineErrors
                      wrapContent
                      style={{
                        height: 640,
                        flex: 1,
                        minWidth: 320,
                      }}
                    />

                    <div
                      style={{
                        height: 640,
                        flex: 1,
                        minWidth: 320,
                        display: "flex",
                        flexDirection: "column",
                        borderLeft: "1px solid var(--border)",
                        background: "#0c0c12",
                      }}
                    >
                      <div style={{ flex: 1, display: activeWorkspaceTab === "preview" ? "block" : "none", height: "100%", position: "relative" }}>
                        <SandpackPreview
                          style={{ height: "100%" }}
                          showOpenInCodeSandbox={false}
                          showRefreshButton
                        />
                        <ArenaLiveErrorOverlay />
                      </div>

                      <div style={{ flex: 1, display: activeWorkspaceTab === "console" ? "block" : "none", height: "100%" }}>
                        <SandpackConsole
                          style={{ height: "100%" }}
                          showResetConsoleButton
                        />
                      </div>
                    </div>
                  </SandpackLayout>
                </div>
              </SandpackProvider>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {/* ══════════ LEVEL-UP & VICTORY CELEBRATION MODAL ══════════ */}
      <CelebrationModal
        isOpen={showCelebration}
        data={celebrationData}
        onNextQuest={(nextTopicId) => {
          setShowCelebration(false);
          navigate(`/quest/${nextTopicId}`);
        }}
        onReturnDashboard={() => {
          setShowCelebration(false);
          navigate("/dashboard");
        }}
        onClose={() => setShowCelebration(false)}
      />

      {/* ══════════ AI MENTOR COMPANION (WEB DEV GUARDED) ══════════ */}
      {topic && (
        <MentorDrawer
          topicId={topic.id}
          topicTitle={topic.title}
          exercisePrompt={topic.exercisePrompt || undefined}
          userCode={userCode}
          failedCriteria={verificationResult.criteria.filter((c) => !c.passed).map((c) => c.label)}
        />
      )}
    </div>
  );
}

export default QuestPage;