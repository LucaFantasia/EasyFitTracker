"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "./WorkoutDraftProvider";
import { EXERCISES } from "./exercises";

export default function NewWorkoutPage() {
  const router = useRouter();
  const { draft, setDraft } = useWorkoutDraft();

  function addExercise(name: string) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.push({ name, sets: [] });
      return next;
    });

    const exerciseIndex = draft.exercises.length; // new index
    router.push(`/workouts/new/exercise/${exerciseIndex}`);
  }

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/workouts">Workouts</Link>
      </div>

      <h1 style={{ marginTop: 12 }}>New workout</h1>

      <section style={{ marginTop: 16 }}>
        <p style={{ opacity: 0.7 }}>Tap an exercise to start logging.</p>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {EXERCISES.map((name) => (
            <button
              key={name}
              onClick={() => addExercise(name)}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                fontSize: 16,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <hr style={{ margin: "24px 0", opacity: 0.2 }} />

      <section>
        <h2>Your workout</h2>

        {draft.exercises.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No exercises added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {draft.exercises.map((ex, idx) => (
              <button
                key={`${ex.name}-${idx}`}
                onClick={() => router.push(`/workouts/new/exercise/${idx}`)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                  color: "inherit",
                }}
              >
                <strong>{ex.name}</strong>
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  {ex.sets.length} sets
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
