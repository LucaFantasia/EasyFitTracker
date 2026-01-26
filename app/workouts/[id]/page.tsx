import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Row, Pill, Divider } from "@/app/_components/ui";
import WorkoutDetailActions from "./WorkoutDetailActions";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      `
      id,
      name,
      performed_at,
      workout_exercises(
        id,
        exercise_name,
        exercise_sets(
          id,
          reps,
          weight,
          set_order
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (!workout) notFound();

  return (
    <Screen>
      <Link href="/workouts">← Back</Link>

      <h1 style={{ marginTop: 12 }}>{workout.name || "Workout"}</h1>

      <Row gap={8} style={{ marginBottom: 12 }}>
        <Pill>{new Date(workout.performed_at).toLocaleString()}</Pill>
      </Row>

      <WorkoutDetailActions workoutId={workout.id} />

      <Divider />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {workout.workout_exercises.map((ex, i) => (
          <Card key={ex.id}>
            <h3 style={{ marginBottom: 12 }}>
              {i + 1}. {ex.exercise_name}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ex.exercise_sets
                .sort((a, b) => a.set_order - b.set_order)
                .map((set) => (
                  <Row key={set.id} gap={8}>
                    <Pill>Set {set.set_order}</Pill>
                    <span>
                      {set.reps} reps @ {set.weight} kg
                    </span>
                  </Row>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  );
}
