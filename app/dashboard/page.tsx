import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {data.user.email}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href="/workouts/new">Start new workout</Link>
        <Link href="/logout">Log out</Link>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <p>Recent workouts will go here.</p>
    </main>
  );
}
