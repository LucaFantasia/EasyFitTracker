import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Log in</h1>

      {error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : null}

      <form action={login} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input name="email" type="email" required style={{ width: "100%" }} />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
            style={{ width: "100%" }}
          />
        </label>

        <button type="submit">Log in</button>
      </form>

      <p style={{ marginTop: 16 }}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
