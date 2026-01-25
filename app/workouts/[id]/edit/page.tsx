import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWorkout } from "../actions";

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/login");

  const { data: workout, error } = await supabase
    .from("workouts")
    .select("id, name, performed_at, notes")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <p>
        <Link href={`/workouts/${id}`}>← Back</Link>
      </p>

      <h1 style={{ marginTop: 8 }}>Edit workout</h1>

      <form action={updateWorkout} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input type="hidden" name="id" value={id} />

        <label>
          Name
          <input name="name" defaultValue={workout.name} style={{ width: "100%" }} />
        </label>

        <label>
          Date & time
          <input
            type="datetime-local"
            name="performedAt"
            defaultValue={toDatetimeLocal(workout.performed_at)}
          />
        </label>

        <label>
          Notes
          <textarea name="notes" defaultValue={workout.notes ?? ""} rows={4} />
        </label>

        <button type="submit">Save</button>
      </form>
    </main>
  );
}
