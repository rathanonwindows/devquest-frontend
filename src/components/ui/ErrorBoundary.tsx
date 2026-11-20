import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DevQuest Realm caught uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            background: "radial-gradient(circle at 50% 30%, rgba(124, 92, 255, 0.15) 0%, #0b0b0e 70%)",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              background: "rgba(18, 18, 26, 0.92)",
              border: "1px solid rgba(124, 92, 255, 0.35)",
              boxShadow: "0 0 50px rgba(124, 92, 255, 0.2)",
              borderRadius: 20,
              padding: "36px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>🛡️</div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "var(--accent, #7c5cff)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              DEVQUEST REALM // RUNTIME SHIELD
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>
              Realm Distortion Detected
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 24px" }}>
              An unexpected anomaly occurred while rendering this trial. Your adventurer profile and saved progress remain safe in the codex.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#f87171",
                  textAlign: "left",
                  maxHeight: 100,
                  overflowY: "auto",
                  marginBottom: 24,
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7c5cff, #6366f1)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(124, 92, 255, 0.4)",
                }}
              >
                ⚔️ Return to Dashboard
              </button>
              <button
                onClick={this.handleHardReload}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ↺ Reload View
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
