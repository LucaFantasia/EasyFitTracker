"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "../WorkoutDraftProvider";
import { EXERCISES } from "../exercises";

export default function AddExercisePage() {
  const router = useRouter();
  const { draft, setDraft } = useWorkoutDraft();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  function addExercise(name: string) {
    const newIndex = draft.exercises.length;

    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.push({ name, sets: [], completed: false });
      return next;
    });

    router.push(`/workouts/new/exercise/${newIndex}`);
  }

  if (!mounted) {
    return (
      <main style={{ padding: 16, height: "100dvh" }}>
        <div style={{ opacity: 0.7 }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, paddingBottom: 96, minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => router.push("/workouts/new")}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 900,
          }}
        >
          ← Back
        </button>
      </div>

      <header style={{ marginTop: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Add exercise</h1>
        <div style={{ opacity: 0.7, marginTop: 6, fontWeight: 700 }}>
          Choose one to add to your workout.
        </div>
      </header>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {EXERCISES.map((name: string) => (
          <button
            key={name}
            onClick={() => addExercise(name)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </main>
  );
}
