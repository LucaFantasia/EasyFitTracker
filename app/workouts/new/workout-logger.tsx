"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EXERCISES } from "./exercises";

type SetEntry = { reps: number | ""; weight: number | "" };
type ExerciseEntry = {
  id: string;
  name: string;
  sets: SetEntry[];
  completed: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function WorkoutLogger() {
  const [workoutName, setWorkoutName] = useState("Push Day");
  const [performedAt, setPerformedAt] = useState(() => {
    const d = new Date();
    // yyyy-MM-ddThh:mm for datetime-local
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  });

  const [selectedExercise, setSelectedExercise] = useState<string>(EXERCISES[0]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  const canFinishWorkout = useMemo(() => exercises.length > 0, [exercises.length]);

  function addExercise() {
  const name = selectedExercise.trim();
  if (!name) return;

  // Prevent duplicates (optional but nice)
  setExercises((prev) => {
    if (prev.some((e) => e.name === name)) return prev;
    return [
      ...prev,
      {
        id: uid(),
        name,
        sets: [{ reps: "", weight: "" }],
        completed: false,
      },
    ];
  });
}

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  function toggleCompleteExercise(id: string) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  }

  function addSet(exerciseId: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId ? { ...e, sets: [...e.sets, { reps: "", weight: "" }] } : e
      )
    );
  }

  function removeSet(exerciseId: string, setIdx: number) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseId) return e;
        const next = e.sets.filter((_, i) => i !== setIdx);
        return { ...e, sets: next.length ? next : [{ reps: "", weight: "" }] };
      })
    );
  }

  function updateSet(exerciseId: string, setIdx: number, patch: Partial<SetEntry>) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseId) return e;
        const sets = e.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
        return { ...e, sets };
      })
    );
  }

  async function finishWorkout() {
    // Later: call a server action to save to DB.
    const payload = {
      workoutName: workoutName.trim(),
      performedAt,
      exercises: exercises.map((e) => ({
        name: e.name,
        completed: e.completed,
        sets: e.sets.map((s) => ({
          reps: s.reps === "" ? null : Number(s.reps),
          weight: s.weight === "" ? null : Number(s.weight),
        })),
      })),
    };

    // For now just show it
    alert("Workout payload (placeholder):\n" + JSON.stringify(payload, null, 2));
  }

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1>New workout</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Back</Link>
          <Link href="/logout">Log out</Link>
        </div>
      </div>

      <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label>
          Workout name
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Date & time
          <input
            type="datetime-local"
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
          />
        </label>
      </section>

      <hr style={{ margin: "24px 0" }} />

      <section style={{ display: "grid", gap: 12 }}>
        <h2>Exercises</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{ flex: 1, padding: 6 }}
            >
                {EXERCISES.map((name) => (
                <option key={name} value={name}>
                    {name}
                </option>
                ))}
            </select>

            <button onClick={addExercise}>Add</button>
        </div>


        {exercises.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No exercises yet. Add one above.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {exercises.map((ex) => (
              <div
                key={ex.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  opacity: ex.completed ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{ex.name}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleCompleteExercise(ex.id)}>
                      {ex.completed ? "Mark incomplete" : "Complete exercise"}
                    </button>
                    <button onClick={() => removeExercise(ex.id)}>Remove</button>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {ex.sets.map((s, idx) => (
                    <div
                      key={idx}
                      style={{ display: "grid", gridTemplateColumns: "80px 120px 120px 1fr", gap: 8, alignItems: "center" }}
                    >
                      <span>Set {idx + 1}</span>

                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(e) =>
                          updateSet(ex.id, idx, {
                            reps: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />

                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="Weight (kg)"
                        value={s.weight}
                        onChange={(e) =>
                          updateSet(ex.id, idx, {
                            weight: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />

                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => removeSet(ex.id, idx)}>Remove set</button>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={() => addSet(ex.id)}>Add set</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr style={{ margin: "24px 0" }} />

      <button disabled={!canFinishWorkout} onClick={finishWorkout}>
        Finish workout
      </button>
      {!canFinishWorkout ? (
        <p style={{ opacity: 0.7, marginTop: 8 }}>Add at least one exercise to finish.</p>
      ) : null}
    </main>
  );
}
