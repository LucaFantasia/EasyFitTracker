import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/login");

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, performed_at")
    .order("performed_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <main style={{ padding: 24 }}>
      <h1>All workouts</h1>
      <p style={{ marginTop: 8 }}>
        <Link href="/workouts/new">Start new workout</Link> •{" "}
        <Link href="/dashboard">Dashboard</Link>
      </p>

      <ul style={{ marginTop: 16 }}>
        {workouts?.map((w) => (
          <li key={w.id} style={{ marginBottom: 8 }}>
            <Link href={`/workouts/${w.id}`}>
              {new Date(w.performed_at).toLocaleString()} — {w.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
