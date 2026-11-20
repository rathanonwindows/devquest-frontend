import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../lib/api";
import { playButtonTap } from "../../lib/soundEffects";

export interface MentorMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
  isRefusal?: boolean;
}

interface MentorDrawerProps {
  topicId?: string;
  topicTitle?: string;
  exercisePrompt?: string;
  userCode?: Record<string, string>;
  failedCriteria?: string[];
  defaultOpen?: boolean;
}

export function MentorDrawer({
  topicId,
  topicTitle,
  exercisePrompt,
  userCode,
  failedCriteria = [],
  defaultOpen = false,
}: MentorDrawerProps) {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const apiUrl = API_URL;

  // Close when clicking outside drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initialize with welcoming Socratic prompt
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "mentor",
          text: `🧙‍♂️ **Greetings, adventurer!** I am the **Grand Scribe**, your arcane companion.\n\nI am bound to guide you through your web development journey (**HTML, CSS, JavaScript & React**) and assist with your active quest trials.\n\nNeed a hint, code review, or diagnostic on a failing test? Select a quick scroll or ask away!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: MentorMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/mentor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          message: text,
          topicId,
          topicTitle: topicTitle || "Web Development",
          exercisePrompt,
          userCode,
          failedCriteria,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Scribe is temporarily meditating. Please try again.");
      }

      const data = await res.json();
      const reply = data.reply || "My arcane crystal had a disturbance. Please try again.";
      const isRefusal = Boolean(data.isRefusal);

      const mentorMsg: MentorMessage = {
        id: `m-${Date.now()}`,
        sender: "mentor",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRefusal,
      };

      setMessages((prev) => [...prev, mentorMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      const errorMsg: MentorMessage = {
        id: `e-${Date.now()}`,
        sender: "mentor",
        text: `⚠️ **Arcane Disruption**: ${err?.message || "Could not reach the Grand Scribe."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "mentor",
        text: `📜 **Scroll of Records Reset**. Ready for your next query on **${topicTitle || "Web Development"}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Render stylized markdown text with safe parsing
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // Close code block
          elements.push(
            <pre
              key={`cb-${idx}`}
              style={{
                background: "rgba(0, 0, 0, 0.45)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                margin: "8px 0",
                fontSize: 12,
                color: "#38bdf8",
                overflowX: "auto",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Format bold and inline code
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} style={{ color: "#fff", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "2px 6px",
                borderRadius: 4,
                color: "#a855f7",
                fontSize: "0.9em",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        elements.push(
          <div key={`li-${idx}`} style={{ display: "flex", gap: 6, margin: "3px 0", paddingLeft: 4 }}>
            <span style={{ color: "var(--accent, #f59e0b)" }}>•</span>
            <div>{formattedParts}</div>
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={`empty-${idx}`} style={{ height: 6 }} />);
      } else {
        elements.push(
          <div key={`p-${idx}`} style={{ margin: "2px 0", lineHeight: 1.5 }}>
            {formattedParts}
          </div>
        );
      }
    });

    return elements;
  };

  return (
    <>
      {/* ══════════ FLOATING ORB LAUNCHER ══════════ */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          <motion.button
            onClick={() => {
              playButtonTap();
              setIsOpen(true);
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              background: "linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(76, 29, 149, 0.95))",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              borderRadius: 999,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(168, 85, 247, 0.4), 0 8px 32px rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)",
              outline: "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "radial-gradient(circle, #a855f7 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 0 12px rgba(168, 85, 247, 0.8)",
              }}
            >
              🧙‍♂️
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>Grand Scribe</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>AI Mentor Online</div>
            </div>

            {hasUnread && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  border: "2px solid #000",
                  boxShadow: "0 0 8px #f59e0b",
                }}
              />
            )}
          </motion.button>
        </motion.div>
      )}

      {/* ══════════ EXPANDED MENTOR DRAWER ══════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              width: "min(420px, calc(100vw - 32px))",
              height: "min(620px, calc(100vh - 120px))",
              background: "rgba(13, 14, 25, 0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              borderRadius: 20,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 32px rgba(168, 85, 247, 0.2)",
              display: "flex",
              flexDirection: "column",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "linear-gradient(90deg, rgba(88, 28, 135, 0.4) 0%, rgba(30, 27, 75, 0.4) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #a855f7, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    boxShadow: "0 0 10px rgba(168, 85, 247, 0.6)",
                  }}
                >
                  🧙‍♂️
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Grand Scribe</span>
                    <span
                      style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        background: "rgba(168, 85, 247, 0.2)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 999,
                        color: "#d8b4fe",
                        fontWeight: 700,
                      }}
                    >
                      Web Dev Only
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)" }}>
                    {topicTitle ? `Trial: ${topicTitle}` : "Curriculum Codex Companion"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => {
                    playButtonTap();
                    handleClearHistory();
                  }}
                  title="Clear chat records"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: 6,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  🔄
                </button>
                <button
                  onClick={() => {
                    playButtonTap();
                    setIsOpen(false);
                  }}
                  title="Minimize Scribe"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Prompt Pills Bar */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "8px 14px",
                overflowX: "auto",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                background: "rgba(0, 0, 0, 0.25)",
                scrollbarWidth: "none",
              }}
            >
              <button
                onClick={() => {
                  playButtonTap();
                  handleSendMessage("Give me a subtle hint to solve this quest objective");
                }}
                style={{
                  whiteSpace: "nowrap",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 999,
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#fbbf24",
                  cursor: "pointer",
                }}
              >
                🔮 Hint
              </button>

              {failedCriteria.length > 0 && (
                <button
                  onClick={() => {
                    playButtonTap();
                    handleSendMessage(`Why is this test criterion failing: "${failedCriteria[0]}"?`);
                  }}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 999,
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#f87171",
                    cursor: "pointer",
                  }}
                >
                  🐞 Why Failing?
                </button>
              )}

              <button
                onClick={() => {
                  playButtonTap();
                  handleSendMessage("Please review my current code and tell me if I am on the right track");
                }}
                style={{
                  whiteSpace: "nowrap",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 999,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  background: "rgba(56, 189, 248, 0.1)",
                  color: "#38bdf8",
                  cursor: "pointer",
                }}
              >
                📜 Review Code
              </button>

              <button
                onClick={() => {
                  playButtonTap();
                  handleSendMessage("Can you explain the core concept required in this quest?");
                }}
                style={{
                  whiteSpace: "nowrap",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 999,
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  background: "rgba(168, 85, 247, 0.1)",
                  color: "#c084fc",
                  cursor: "pointer",
                }}
              >
                ⚡ Explain Concept
              </button>
            </div>

            {/* Chat Message Scroll Feed */}
            <div
              style={{
                flex: 1,
                padding: "14px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      maxWidth: "100%",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "88%",
                        padding: "10px 14px",
                        borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                        background: isUser
                          ? "linear-gradient(135deg, #4338ca, #6366f1)"
                          : msg.isRefusal
                          ? "rgba(120, 53, 15, 0.45)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: isUser
                          ? "1px solid rgba(99, 102, 241, 0.4)"
                          : msg.isRefusal
                          ? "1px solid rgba(245, 158, 11, 0.4)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#e2e8f0",
                        fontSize: 13,
                        boxShadow: isUser
                          ? "0 4px 12px rgba(67, 56, 202, 0.25)"
                          : "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      {msg.isRefusal && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                            color: "#f59e0b",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                          }}
                        >
                          <span>⚔️</span> Out of Syllabus Guardrail
                        </div>
                      )}
                      {renderMessageContent(msg.text)}
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-muted, #64748b)",
                        marginTop: 4,
                        padding: "0 4px",
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(168, 85, 247, 0.3)",
                      borderTopColor: "#a855f7",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#d8b4fe", fontStyle: "italic" }}>
                    Consulting the DevQuest scrolls...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar & Strict Boundary Notice */}
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(0, 0, 0, 0.4)",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  playButtonTap();
                  handleSendMessage();
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about HTML, CSS, JS, React or your quest..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  style={{
                    padding: "0 16px",
                    background: inputValue.trim() ? "var(--accent, #a855f7)" : "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: inputValue.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}
                >
                  ⚡
                </button>
              </form>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted, #64748b)",
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                🛡️ Strictly bound to DevQuest Web Development syllabus (HTML, CSS, JS & React).
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
