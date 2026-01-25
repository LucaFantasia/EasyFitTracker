import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, performed_at")
    .order("performed_at", { ascending: false })
    .limit(10);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href="/workouts/new">Start new workout</Link>
        <Link href="/workouts">View all workouts</Link>
        <form action={logout}>
          <button type="submit">Log out</button>
        </form>
      </div>

      <h2 style={{ marginTop: 24 }}>Recent workouts</h2>
      {workouts?.length ? (
        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              {new Date(w.performed_at).toLocaleString()} — {w.name}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ opacity: 0.7 }}>No workouts yet.</p>
      )}
    </main>
  );
}
