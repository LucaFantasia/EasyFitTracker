import Link from "next/link";
import { signup } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Sign up</h1>

      {error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : null}

      <form action={signup} style={{ display: "grid", gap: 12, marginTop: 16 }}>
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

        <button type="submit">Create account</button>
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
