import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteWorkout } from "./actions";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/login");

  const { data: workout, error: wErr } = await supabase
    .from("workouts")
    .select("id, name, performed_at, notes")
    .eq("id", id)
    .single();

  if (wErr) throw new Error(wErr.message);

  const { data: exRows, error: exErr } = await supabase
    .from("workout_exercises")
    .select("id, exercise_name, exercise_order")
    .eq("workout_id", id)
    .order("exercise_order");

  if (exErr) throw new Error(exErr.message);

  const wexIds = (exRows ?? []).map((r) => r.id);

  const { data: setsRows, error: sErr } = await supabase
    .from("exercise_sets")
    .select("workout_exercise_id, set_order, reps, weight")
    .in("workout_exercise_id", wexIds)
    .order("set_order");

  if (sErr) throw new Error(sErr.message);

  const setsByWex = new Map<string, typeof setsRows>();
  (setsRows ?? []).forEach((s) => {
    const arr = setsByWex.get(s.workout_exercise_id) ?? [];
    arr.push(s);
    setsByWex.set(s.workout_exercise_id, arr);
  });

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <p>
        <Link href="/workouts">← Back to workouts</Link>
      </p>

      <h1 style={{ marginTop: 8 }}>{workout.name}</h1>
      <p>{new Date(workout.performed_at).toLocaleString()}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href={`/workouts/${id}/edit`}>Edit</Link>

        <form action={deleteWorkout}>
          <input type="hidden" name="id" value={id} />
          <button type="submit">Delete</button>
        </form>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {(exRows ?? []).map((ex) => (
        <div key={ex.id} style={{ marginBottom: 18 }}>
          <h3>
            {ex.exercise_order}. {ex.exercise_name}
          </h3>
          <ul>
            {(setsByWex.get(ex.id) ?? []).map((s) => (
              <li key={s.set_order}>
                Set {s.set_order}: {s.reps ?? "-"} reps @ {s.weight ?? "-"} kg
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
