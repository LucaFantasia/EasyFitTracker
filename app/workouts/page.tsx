import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Row, Pill, Button } from "@/app/_components/ui";

function HeaderButton({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "primary";
}) {
  const common: React.CSSProperties = {
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
  };

  return (
    <Link href={href} style={common}>
      {children}
    </Link>
  );
}

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, performed_at, workout_exercises(id, exercise_sets(id))")
    .order("performed_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Sticky mobile header */}
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
        <Row gap={10} style={{ justifyContent: "space-between" as any }}>
          <HeaderButton href="/dashboard" variant="ghost">
            ← Dashboard
          </HeaderButton>

          <HeaderButton href="/workouts/new" variant="primary">
            + New
          </HeaderButton>
        </Row>
      </div>

      <Screen>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Workouts</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          Your training history
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workouts?.map((w) => {
            const exerciseCount = w.workout_exercises.length;
            const setCount = w.workout_exercises.reduce(
              (acc, e) => acc + e.exercise_sets.length,
              0
            );

            return (
              <Link
                key={w.id}
                href={`/workouts/${w.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card>
                  <h3 style={{ marginBottom: 6, color: "var(--accent)" }}>
                    {w.name || "Workout"}
                  </h3>

                  <Row gap={8} style={{ flexWrap: "wrap" as any }}>
                    <Pill>{exerciseCount} exercises</Pill>
                    <Pill>{setCount} sets</Pill>
                    <Pill>{new Date(w.performed_at).toLocaleDateString()}</Pill>
                  </Row>
                </Card>
              </Link>
            );
          })}
        </div>

        {(!workouts || workouts.length === 0) && (
          <Card style={{ marginTop: 14 }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              No workouts yet. Tap <b>+ New</b> to log your first one.
            </p>
          </Card>
        )}
      </Screen>

      {/* Keep your bottom CTA if you still want it — but on mobile it’s redundant now.
          If you prefer, delete this whole block. */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          right: 16,
          display: "none", // <- set to "block" if you want both top + bottom
        }}
      >
        <Link href="/workouts/new">
          <Button full type="button">
            + New workout
          </Button>
        </Link>
      </div>
    </div>
  );
}
