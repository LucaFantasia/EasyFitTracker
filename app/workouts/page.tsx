import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Row, Pill, Button } from "@/app/_components/ui";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select(
      "id, name, performed_at, workout_exercises(id, exercise_sets(id))"
    )
    .order("performed_at", { ascending: false });

  return (
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
            <Link key={w.id} href={`/workouts/${w.id}`}>
              <Card>
                <h3 style={{ marginBottom: 6 }}>
                  {w.name || "Workout"}
                </h3>

                <Row gap={8}>
                  <Pill>{exerciseCount} exercises</Pill>
                  <Pill>{setCount} sets</Pill>
                  <Pill>
                    {new Date(w.performed_at).toLocaleDateString()}
                  </Pill>
                </Row>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <Link href="/workouts/new">
          <Button full>+ New workout</Button>
        </Link>
      </div>
    </Screen>
  );
}
