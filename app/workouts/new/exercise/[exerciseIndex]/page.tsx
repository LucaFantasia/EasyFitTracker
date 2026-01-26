"use client";

import * as React from "react";
import { useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkoutDraft } from "../../WorkoutDraftProvider";

function Sheet({
  title,
  description,
  dangerLabel,
  cancelLabel = "Cancel",
  onDanger,
  onCancel,
}: {
  title: string;
  description?: string;
  dangerLabel: string;
  cancelLabel?: string;
  onDanger: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        padding: 16,
        zIndex: 80,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(20,20,24,0.98)",
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
          {title}
        </div>
        {description ? (
          <div style={{ opacity: 0.75, marginTop: 6, color: "rgba(255,255,255,0.8)" }}>
            {description}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <button
            onClick={onDanger}
            style={{
              height: 56,
              borderRadius: 16,
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            {dangerLabel}
          </button>

          <button
            onClick={onCancel}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();

  const exerciseIndex = Number(params.exerciseIndex);

  const { draft, setDraft, removeSet, removeExercise } = useWorkoutDraft();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [confirmDeleteSetIndex, setConfirmDeleteSetIndex] = React.useState<number | null>(null);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  if (!mounted) {
    return (
      <main style={{ padding: 16, height: "100dvh" }}>
        <div style={{ opacity: 0.7 }}>Loading…</div>
      </main>
    );
  }

  const exercise = draft.exercises?.[exerciseIndex];

  if (!exercise) {
    return (
      <main style={{ padding: 16, height: "100dvh" }}>
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
        <div style={{ marginTop: 14, opacity: 0.7 }}>
          Exercise not found (index {exerciseIndex}).
        </div>
      </main>
    );
  }

  const completed = Boolean((exercise as any).completed);

  function addSet() {
    const newSetIndex = exercise.sets.length;

    // ✅ navigate immediately
    router.push(`/workouts/new/exercise/${exerciseIndex}/set/${newSetIndex}`);

    // ✅ update draft without blocking navigation
    startTransition(() => {
      setDraft((prev) => {
        const next = structuredClone(prev);
        const ex = next.exercises[exerciseIndex];
        ex.sets.push({ reps: 8, weight: 80 });
        (ex as any).completed = false;
        return next;
      });
    });
  }


  function completeExercise() {
    // optional: require at least 1 set
    if (!exercise.sets?.length) return;

    // ✅ navigate immediately
    router.push("/workouts/new");

    // ✅ update draft without blocking navigation
    startTransition(() => {
      setDraft((prev) => {
        const next = structuredClone(prev);
        const ex = next.exercises[exerciseIndex];
        (ex as any).completed = true;
        return next;
      });
    });
  }


  function markIncomplete() {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const ex = next.exercises[exerciseIndex];
      (ex as any).completed = false;
      return next;
    });
  }

  // Choose which sticky action to show
  const showComplete = exercise.sets.length > 0;

  return (
    <main style={{ padding: 16, paddingBottom: 160, minHeight: "100dvh" }}>
      {/* Top bar */}
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
          ← Workout
        </button>

        <button
          onClick={() => setConfirmDeleteExercise(true)}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(239,68,68,0.18)",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 900,
          }}
        >
          Delete exercise
        </button>
      </div>

      {/* Header */}
      <header style={{ marginTop: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{exercise.name}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <div style={{ opacity: 0.75, fontWeight: 700 }}>
            {exercise.sets.length} sets
          </div>

          {completed ? (
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(34,197,94,0.35)",
                background: "rgba(34,197,94,0.14)",
                color: "rgba(220,252,231,0.95)",
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              Completed ✓
            </div>
          ) : null}
        </div>

        {completed ? (
          <button
            onClick={markIncomplete}
            style={{
              marginTop: 10,
              height: 44,
              padding: "0 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 900,
            }}
          >
            Mark as incomplete
          </button>
        ) : null}
      </header>

      {/* Sets list */}
      <section style={{ marginTop: 16 }}>
        {exercise.sets.length === 0 ? (
          <div style={{ opacity: 0.7, marginTop: 10 }}>
            No sets yet. Add one below.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {exercise.sets.map((s, setIndex) => (
              <div
                key={setIndex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() =>
                    router.push(`/workouts/new/exercise/${exerciseIndex}/set/${setIndex}`)
                  }
                  style={{
                    flex: 1,
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.92)",
                    padding: 0,
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Set {setIndex + 1}</div>
                  <div style={{ opacity: 0.75, marginTop: 4, fontWeight: 700 }}>
                    {s.reps} reps · {s.weight} kg
                  </div>
                </button>

                <button
                  onClick={() => setConfirmDeleteSetIndex(setIndex)}
                  aria-label="Delete set"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(239,68,68,0.18)",
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sticky actions: Add set + Complete */}
      <div
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          display: "grid",
          gap: 10,
        }}
      >
        <button
          onClick={addSet}
          disabled={isPending}
          style={{
            height: 56,
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 900,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          + Add set
        </button>

        <button
          onClick={completeExercise}
          disabled={!showComplete || isPending}
          style={{
            height: 56,
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 900,
            background: showComplete ? "#22c55e" : "rgba(255,255,255,0.12)",
            color: showComplete ? "#022c22" : "rgba(255,255,255,0.5)",
            border: "none",
            opacity: completed ? 0.85 : 1,
          }}
        >
          {completed ? "Completed ✓" : "Complete exercise"}
        </button>
      </div>

      {/* Confirm: delete set */}
      {confirmDeleteSetIndex !== null ? (
        <Sheet
          title="Delete set?"
          description="This removes the set from this exercise."
          dangerLabel="Delete set"
          onDanger={() => {
            removeSet(exerciseIndex, confirmDeleteSetIndex);
            setConfirmDeleteSetIndex(null);

            // If you delete a set, mark as incomplete
            setDraft((prev) => {
              const next = structuredClone(prev);
              const ex = next.exercises[exerciseIndex];
              (ex as any).completed = false;
              return next;
            });
          }}
          onCancel={() => setConfirmDeleteSetIndex(null)}
        />
      ) : null}

      {/* Confirm: delete exercise */}
      {confirmDeleteExercise ? (
        <Sheet
          title="Delete exercise?"
          description="This removes the exercise and all its sets from this workout."
          dangerLabel="Delete exercise"
          onDanger={() => {
            removeExercise(exerciseIndex);
            setConfirmDeleteExercise(false);
            router.push("/workouts/new");
          }}
          onCancel={() => setConfirmDeleteExercise(false)}
        />
      ) : null}
    </main>
  );
}
