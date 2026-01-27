import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Screen, Card, Button } from "@/app/_components/ui";
import { updateWorkoutName } from "../actions";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workout, error } = await supabase
    .from("workouts")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error || !workout) notFound();

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: 16 }}>
        <Link href={`/workouts/${id}`} style={{ textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      <Screen>
        <h1 style={{ marginTop: 8 }}>Edit workout name</h1>

        <Card>
          <form action={updateWorkoutName} style={{ display: "grid", gap: 12 }}>
            <input type="hidden" name="id" value={id} />

            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  fontWeight: 800,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Name
              </label>
              <input name="name" defaultValue={workout.name || "Workout"} />
            </div>

            <Button full type="submit">
              Save
            </Button>
          </form>
        </Card>
      </Screen>
    </div>
  );
}
