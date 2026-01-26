import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Row, Pill } from "@/app/_components/ui";
import { logout } from "../(auth)/actions";

function HeaderButton({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "primary";
}) {
  return (
    <Link
      href={href}
      style={{
        height: 44,
        padding: "0 14px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        border: "1px solid rgba(255,255,255,0.12)",
        background: variant === "primary" ? "var(--accent)" : "rgba(255,255,255,0.06)",
        color: variant === "primary" ? "#022c22" : "rgba(255,255,255,0.92)",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, performed_at")
    .order("performed_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 950, lineHeight: 1.1 }}>Easy Fit Tracker</div>
            <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
              Quick workout logging
            </div>
          </div>

          <Row gap={10}>
            <HeaderButton href="/workouts/new" variant="primary">
              + New
            </HeaderButton>
            <HeaderButton href="/workouts" variant="ghost">
              History
            </HeaderButton>
          </Row>
        </div>
      </div>

      <Screen>
        {/* Logout as a server-action form */}
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Log out
            </button>
          </form>
        </div>

        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Recent workouts</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workouts?.map((w) => (
            <Link key={w.id} href={`/workouts/${w.id}`} style={{ textDecoration: "none" }}>
              <Card>
                <div style={{ fontWeight: 900, fontSize: 16, color: "var(--accent)" }}>
                  {w.name || "Workout"}
                </div>
                <Row gap={8} style={{ marginTop: 8, flexWrap: "wrap" as any }}>
                  <Pill>{new Date(w.performed_at).toLocaleString()}</Pill>
                </Row>
              </Card>
            </Link>
          ))}

          {(!workouts || workouts.length === 0) && (
            <Card>
              <div style={{ color: "var(--muted)", fontWeight: 700 }}>
                No workouts yet. Tap <b>+ New</b> to start.
              </div>
            </Card>
          )}
        </div>
      </Screen>
    </div>
  );
}
