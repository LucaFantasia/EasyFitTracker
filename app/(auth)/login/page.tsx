import Link from "next/link";
import { Screen, Card, Button } from "@/app/_components/ui";
import { login } from "../actions";
import OAuthButtons from "./OAuthButtons";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Constrained column */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "32px 16px",
        }}
      >
        {/* App title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 950 }}>
            Easy Fit Tracker
          </div>
          <div
            style={{
              marginTop: 6,
              color: "var(--muted)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Log workouts fast. No typing.
          </div>
        </div>

        <h1
          style={{
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Log in
        </h1>

        <Card>
          <OAuthButtons />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "6px 0",
              opacity: 0.75,
              fontWeight: 800,
            }}
          >
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", flex: 1 }} />
            <div style={{ fontSize: 12 }}>OR</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", flex: 1 }} />
          </div>

          <form action={login} style={{ display: "grid", gap: 18 }}>
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
                Email
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

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
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <Button full type="submit">
              Log in
            </Button>
          </form>
        </Card>


        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            color: "var(--muted)",
            fontWeight: 700,
          }}
        >
          No account?{" "}
          <Link href="/signup" style={{ fontWeight: 900 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
