import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main style={{ padding: 24 }}>
      <h1>EasyFitTracker</h1>
      <p>User: {data.user?.email ?? "Not signed in"}</p>
    </main>
  );
}
