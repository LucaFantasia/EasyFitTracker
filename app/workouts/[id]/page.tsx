import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Row, Pill } from "@/app/_components/ui";
import { deleteWorkout } from "./actions";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return null;

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "<1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: workout, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      name,
      performed_at,
      duration_seconds,
      workout_exercises (
        id,
        exercise_name,
        exercise_order,
        exercise_sets (
          id,
          set_order,
          reps,
          weight
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !workout) notFound();

  const durationLabel = formatDuration(workout.duration_seconds);

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
        <Row gap={10} style={{ justifyContent: "space-between" as any, alignItems: "center" as any }}>
          <Link
            href="/workouts"
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.92)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            ← History
          </Link>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href={`/workouts/${id}/edit`}
              style={{
                height: 44,
                padding: "0 14px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.92)",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Edit
            </Link>

            <form action={deleteWorkout}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 999,
                  fontWeight: 900,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(239,68,68,0.18)",
                  color: "rgba(255,255,255,0.92)",
                  whiteSpace: "nowrap",
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </Row>
      </div>

      <Screen>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          {workout.name || "Workout"}
        </h1>

        <Row gap={8} style={{ flexWrap: "wrap" as any, marginBottom: 18 }}>
          {workout.performed_at ? (
            <Pill>{new Date(workout.performed_at).toLocaleString()}</Pill>
          ) : null}
          {durationLabel ? <Pill>{durationLabel}</Pill> : null}
        </Row>

        <div style={{ display: "grid", gap: 12 }}>
          {workout.workout_exercises
            ?.sort((a: any, b: any) => (a.exercise_order ?? 0) - (b.exercise_order ?? 0))
            .map((ex: any) => (
              <Card key={ex.id}>
                <div
                  style={{
                    fontWeight: 900,
                    color: "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  {ex.exercise_name}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {ex.exercise_sets
                    ?.sort((a: any, b: any) => (a.set_order ?? 0) - (b.set_order ?? 0))
                    .map((s: any) => (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background: "rgba(255,255,255,0.04)",
                          fontWeight: 800,
                        }}
                      >
                        <div style={{ opacity: 0.8 }}>Set {s.set_order}</div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span>{s.reps} reps</span>
                          <span style={{ opacity: 0.7 }}>•</span>
                          <span>{s.weight} kg</span>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
        </div>
      </Screen>
    </div>
  );
}
