import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Screen, Button } from "@/app/_components/ui";
import { updateWorkout } from "../actions";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select("id, name, performed_at")
    .eq("id", id)
    .single();

  if (!workout) notFound();

  return (
    <Screen>
      <h1>Edit workout</h1>

      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        {new Date(workout.performed_at).toLocaleString()}
      </p>

      <form action={updateWorkout}>
        <input type="hidden" name="id" value={workout.id} />

        <label style={{ fontSize: 14, color: "var(--muted)" }}>
          Workout name
        </label>

        <div style={{ margin: "8px 0 24px" }}>
          <input
            name="name"
            defaultValue={workout.name ?? ""}
            placeholder="Workout"
          />
        </div>

        <Button full type="submit">
          Save
        </Button>
      </form>
    </Screen>
  );
}
