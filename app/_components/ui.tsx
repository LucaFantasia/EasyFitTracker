import { ReactNode } from "react";
import type { CSSProperties, ButtonHTMLAttributes } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return <div style={{ padding: 16, paddingBottom: 96 }}>{children}</div>;
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Row({
  children,
  gap = 12,
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center", ...style }}>
      {children}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}

export function Divider() {
  return <hr style={{ margin: "16px 0" }} />;
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "danger" | "ghost";
  full?: boolean;
  style?: CSSProperties;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style">;

export function Button({
  children,
  variant = "primary",
  full,
  style,
  ...props
}: ButtonProps) {
  const colors =
    variant === "danger"
      ? { bg: "var(--danger)", color: "#fff" }
      : variant === "ghost"
      ? { bg: "transparent", color: "var(--accent)" }
      : { bg: "var(--accent)", color: "#052e16" };

  return (
    <button
      {...props}
      style={{
        width: full ? "100%" : "auto",
        padding: "14px 18px",
        borderRadius: 14,
        fontWeight: 600,
        background: colors.bg,
        color: colors.color,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
