import Link from "next/link";
import { Card, Button } from "@/app/_components/ui";
import { signup } from "../actions";
import OAuthButtons from "../login/OAuthButtons";

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "32px 16px",
        }}
      >
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
            Create your account
          </div>
        </div>

        <h1
          style={{
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Sign up
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

          <form action={signup} style={{ display: "grid", gap: 14 }}>
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
              <div style={{ marginTop: 6 }}>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ marginTop: 6 }}>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <Button full type="submit">
              Create account
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
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 900 }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
