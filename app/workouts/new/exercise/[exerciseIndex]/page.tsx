"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWorkoutDraft } from "../../WorkoutDraftProvider";

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseIndex = Number(params.exerciseIndex);

  const { draft, setDraft } = useWorkoutDraft();
  const exercise = draft.exercises[exerciseIndex];

  if (!exercise) {
    return (
      <main style={{ padding: 16 }}>
        <p>Exercise not found.</p>
        <button onClick={() => router.push("/workouts/new")}>Back</button>
      </main>
    );
  }

  function addSet() {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const sets = next.exercises[exerciseIndex].sets;

      const last = sets[sets.length - 1] ?? { reps: 8, weight: 80 };
      sets.push({ ...last }); // copy last set by default
      return next;
    });

    // go to new set entry page
    const newSetIndex = exercise.sets.length; // previous length = new index
    router.push(`/workouts/new/exercise/${exerciseIndex}/set/${newSetIndex}`);
  }

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <button onClick={() => router.push("/workouts/new")}>← Workout</button>
        <Link href="/dashboard">Dashboard</Link>
      </div>

      <h1 style={{ marginTop: 12 }}>{exercise.name}</h1>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {exercise.sets.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No sets yet.</p>
        ) : (
          exercise.sets.map((s, setIndex) => (
            <Link
              key={setIndex}
              href={`/workouts/new/exercise/${exerciseIndex}/set/${setIndex}`}
              style={{
                display: "block",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong>Set {setIndex + 1}</strong>
              <div style={{ opacity: 0.8, marginTop: 4 }}>
                {s.reps} reps @ {s.weight} kg
              </div>
            </Link>
          ))
        )}
      </div>

      <button
        onClick={addSet}
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          height: 56,
          borderRadius: 14,
          fontSize: 18,
          background: "#22c55e",
          color: "#022c22",
          border: "none",
        }}
      >
        Add set
      </button>
    </main>
  );
}
