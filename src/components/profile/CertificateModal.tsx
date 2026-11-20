import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { playLevelUpFanfare } from "../../lib/soundEffects";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string | null;
  email?: string;
  goal?: string | null;
  totalQuests: number;
  completedQuests: number;
  totalXp: number;
  currentLevel: number;
}

const ARCHETYPE_TITLES: Record<string, { title: string; subtitle: string; icon: string }> = {
  frontend: {
    title: "Grand Sorcerer of Frontend Alchemy",
    subtitle: "Mastery of HTML Semantic Structure, CSS Layouts & Reactive Spire Architecture",
    icon: "🧙‍♂️",
  },
  backend: {
    title: "Knight Commander of Backend Architecture",
    subtitle: "Mastery of Data Integrity, Server Endpoints & Algorithmic Foundations",
    icon: "🛡️",
  },
  fullstack: {
    title: "Legendary Archon of Full-Stack Sorcery",
    subtitle: "Complete Mastery of Client-Side Magic & Server Infrastructure",
    icon: "🗡️",
  },
};

export function CertificateModal({
  isOpen,
  onClose,
  studentName,
  email,
  goal,
  totalQuests,
  completedQuests,
  totalXp,
  currentLevel,
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const isMasteredAll = totalQuests > 0 && completedQuests >= totalQuests;

  useEffect(() => {
    if (isOpen && isMasteredAll) {
      playLevelUpFanfare();
    }
  }, [isOpen, isMasteredAll]);

  if (!isOpen) return null;

  const displayName =
    studentName && studentName.trim().length > 0
      ? studentName.trim()
      : email
      ? email.split("@")[0]
      : "Valiant Adventurer";

  const archetypeKey = (goal || "frontend").toLowerCase();
  const archetypeInfo = ARCHETYPE_TITLES[archetypeKey] || ARCHETYPE_TITLES["frontend"];

  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Deterministic certificate verification hash
  const certId = `DQ-CERT-${Math.abs(
    (displayName + (email || "")).split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 1337)
  )
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")}`;

  const handlePrint = () => {
    window.print();
  };

  // If the student hasn't mastered all quests, render the Sealed Trial Gate
  if (!isMasteredAll) {
    const percent = Math.round(((completedQuests || 0) / (totalQuests || 22)) * 100);
    const remaining = Math.max(1, (totalQuests || 22) - (completedQuests || 0));

    return (
      <AnimatePresence>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 24, stiffness: 350 }}
            style={{
              maxWidth: 520,
              width: "100%",
              background: "linear-gradient(160deg, #181926 0%, #0d0e16 100%)",
              border: "1.5px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 20,
              padding: "36px 32px",
              textAlign: "center",
              boxShadow: "0 0 50px rgba(245, 158, 11, 0.2), 0 24px 48px rgba(0, 0, 0, 0.85)",
              color: "#e2e8f0",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.12)",
                border: "2px solid #f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                margin: "0 auto 18px",
                boxShadow: "0 0 24px rgba(245, 158, 11, 0.35)",
              }}
            >
              🔒
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "#f59e0b",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Arcane Seal Active
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", color: "#fff" }}>
              Diploma Trial Sealed
            </h2>

            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 22px" }}>
              The Imperial Diploma of Realm Mastery is conferred exclusively upon Adventurers who have conquered
              every trial in the curriculum.
            </p>

            {/* Campaign Progress Gauge */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: "#cbd5e1", fontWeight: 600 }}>Mastery Progress</span>
                <span style={{ color: "#f59e0b", fontWeight: 800 }}>
                  {completedQuests} / {totalQuests || 22} Quests ({percent}%)
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f59e0b, #10b981)",
                    borderRadius: 999,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                Conquer <strong>{remaining} more quest{remaining === 1 ? "" : "s"}</strong> to unlock and print your official diploma.
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px",
                fontWeight: 700,
                fontSize: 13,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#000",
              }}
            >
              Return to Campaign Trials
            </Button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div
        className="certificate-modal-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.88)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20,
          overflowY: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <style>
          {`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .certificate-print-area, .certificate-print-area * {
                visibility: visible !important;
              }
              .certificate-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 30px !important;
                box-shadow: none !important;
                border: 8px solid #b45309 !important;
                background: #0f111a !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .certificate-no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          style={{
            maxWidth: 880,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Top Actions Bar (Hidden during print) */}
          <div
            className="certificate-no-print"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(22, 22, 34, 0.9)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 12,
              padding: "10px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>📜</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.04em" }}>
                DEVQUEST IMPERIAL CODE REGISTRY
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                variant="primary"
                onClick={handlePrint}
                style={{
                  padding: "7px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#000",
                }}
              >
                🖨️ Print / Save as PDF
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                style={{ padding: "7px 14px", fontSize: 12, color: "#cbd5e1" }}
              >
                ✕ Close
              </Button>
            </div>
          </div>

          {/* ═════════ THE GILDED CERTIFICATE OF MASTERY ═════════ */}
          <div
            ref={certificateRef}
            className="certificate-print-area"
            style={{
              position: "relative",
              background: "linear-gradient(145deg, #13141f 0%, #0a0b12 50%, #171626 100%)",
              border: "12px solid #b45309",
              borderRadius: 16,
              padding: "48px 40px",
              boxShadow: "0 0 60px rgba(245, 158, 11, 0.25), 0 30px 60px rgba(0, 0, 0, 0.9)",
              overflow: "hidden",
              textAlign: "center",
              color: "#e2e8f0",
            }}
          >
            {/* Gilded Inner Double Border */}
            <div
              style={{
                position: "absolute",
                inset: 10,
                border: "2px solid rgba(245, 158, 11, 0.45)",
                borderRadius: 10,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 14,
                border: "1px dashed rgba(245, 158, 11, 0.25)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />

            {/* Corner Arcane Crests */}
            <div style={{ position: "absolute", top: 22, left: 24, fontSize: 18, color: "#f59e0b" }}>⚜️</div>
            <div style={{ position: "absolute", top: 22, right: 24, fontSize: 18, color: "#f59e0b" }}>⚜️</div>
            <div style={{ position: "absolute", bottom: 22, left: 24, fontSize: 18, color: "#f59e0b" }}>⚜️</div>
            <div style={{ position: "absolute", bottom: 22, right: 24, fontSize: 18, color: "#f59e0b" }}>⚜️</div>

            {/* Watermark Crest Background */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 260,
                opacity: 0.03,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              ⚔️
            </div>

            {/* Header / Crest */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.3))",
                  border: "2px solid #f59e0b",
                  fontSize: 28,
                  boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
                  marginBottom: 12,
                }}
              >
                {archetypeInfo.icon}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.22em",
                  color: "#f59e0b",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                DevQuest Imperial Academy of Code Sorcery
              </div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "#fff",
                  margin: "0 0 4px",
                  textTransform: "uppercase",
                  textShadow: "0 2px 10px rgba(245, 158, 11, 0.3)",
                  fontFamily: "Georgia, serif",
                }}
              >
                Diploma of Realm Mastery
              </h1>
              <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                Attestation of Algorithmic Valor & Full-Stack Heroism
              </div>
            </div>

            {/* Presentation Line */}
            <div style={{ fontSize: 14, color: "#cbd5e1", margin: "20px 0 8px" }}>
              Be it known across all digital realms that by supreme determination and code craftsmanship,
            </div>

            {/* Student Name */}
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#fbbf24",
                letterSpacing: "0.03em",
                fontFamily: "Georgia, serif",
                padding: "6px 0",
                borderBottom: "2px solid rgba(245, 158, 11, 0.4)",
                display: "inline-block",
                minWidth: 320,
                maxWidth: "90%",
                textShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
                marginBottom: 12,
              }}
            >
              {displayName}
            </div>

            {/* Bestowal of Title */}
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
              has satisfied all sovereign trials and is hereby conferred the sacred title of:
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.04em",
                marginBottom: 6,
              }}
            >
              {archetypeInfo.title}
            </div>
            <div style={{ fontSize: 12, color: "#a5b4fc", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.5 }}>
              {archetypeInfo.subtitle}
            </div>

            {/* Campaign Statistics Deck */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                maxWidth: 680,
                margin: "0 auto 32px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Quests Mastered
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
                  {completedQuests} / {totalQuests || 22}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Arcane XP
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>
                  {totalXp.toLocaleString()} XP
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Ascension Rank
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#a855f7", marginTop: 2 }}>
                  Level {currentLevel}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Conferred Date
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginTop: 4 }}>
                  {issueDate}
                </div>
              </div>
            </div>

            {/* Footer with Arcane Wax Seal & Signatures */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                maxWidth: 680,
                margin: "0 auto",
                paddingTop: 10,
              }}
            >
              {/* Left Signature */}
              <div style={{ textAlign: "center", width: 180 }}>
                <div
                  style={{
                    fontFamily: "Georgia, cursive, serif",
                    fontSize: 16,
                    color: "#f59e0b",
                    marginBottom: 4,
                  }}
                >
                  Lord Srujan
                </div>
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)", paddingTop: 4, fontSize: 10, color: "#94a3b8" }}>
                  Grand Guild Architect
                </div>
              </div>

              {/* Center Imperial Wax Seal */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #b91c1c 0%, #7f1d1d 80%, #450a0a 100%)",
                    border: "3px solid #f59e0b",
                    boxShadow: "0 0 20px rgba(185, 28, 28, 0.6), inset 0 0 10px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    position: "relative",
                  }}
                >
                  <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>🛡️</span>
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: "#f59e0b",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginTop: 6,
                  }}
                >
                  Official Academy Seal
                </div>
              </div>

              {/* Right Verification Code */}
              <div style={{ textAlign: "center", width: 180 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.08em", marginBottom: 4 }}>
                  {certId}
                </div>
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)", paddingTop: 4, fontSize: 10, color: "#94a3b8" }}>
                  Cryptographic Verification ID
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
