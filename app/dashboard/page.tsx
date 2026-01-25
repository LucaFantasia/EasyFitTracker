import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/actions";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {data.user.email}</p>

      <Link href="/logout">Log out</Link>
    </main>
  );
}
