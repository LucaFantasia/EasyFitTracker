import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/actions";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {data.user.email}</p>

      <form action={logout} style={{ marginTop: 16 }}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
