"use client";

import { createClient } from "@/lib/supabase/client";

export default function OAuthButtons() {
  const supabase = createClient();

  async function signIn(provider: "google") {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        type="button"
        onClick={() => signIn("google")}
        style={{
          height: 52,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.92)",
          fontWeight: 900,
          fontSize: 16,
        }}
      >
        Continue with Google
      </button>
    </div>
  );
}
