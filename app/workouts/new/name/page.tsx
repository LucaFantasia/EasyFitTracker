"use client";

import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "../WorkoutDraftProvider";
import { Screen, Card, Button, Row } from "@/app/_components/ui";
import { useState } from "react";

const PRESETS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Cardio"];

export default function WorkoutNamePage() {
  const router = useRouter();
  const { draft, setWorkoutName } = useWorkoutDraft();
  const [custom, setCustom] = useState(draft.workoutName ?? "");

  return (
    <Screen>
      <button onClick={() => router.back()} style={{ color: "var(--accent)" }}>
        ← Back
      </button>

      <h1 style={{ marginTop: 12, marginBottom: 8 }}>Workout name</h1>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Pick a preset or set a custom name.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setWorkoutName(p);
              router.push("/workouts/new");
            }}
            style={{ textAlign: "left" }}
          >
            <Card>
              <Row>
                <span style={{ fontWeight: 700 }}>{p}</span>
                <span style={{ marginLeft: "auto", color: "var(--muted)" }}>Select</span>
              </Row>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <label style={{ fontSize: 14, color: "var(--muted)" }}>Custom</label>
        <div style={{ marginTop: 8 }}>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Workout"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <Button
            full
            type="button"
            onClick={() => {
              setWorkoutName(custom.trim());
              router.push("/workouts/new");
            }}
          >
            Save name
          </Button>
        </div>
      </Card>
    </Screen>
  );
}
