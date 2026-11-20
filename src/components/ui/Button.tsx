import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: "var(--radius-md)" as any,
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid transparent",
    transition: "all 0.15s ease",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent)",
      color: "white",
      boxShadow: "0 0 24px var(--accent-glow)",
    },
    secondary: {
      background: "var(--bg-surface-raised)",
      color: "var(--text-primary)",
      border: "1px solid var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
    },
  };

  return <button {...props} style={{ ...base, ...variants[variant], ...style }} />;
}