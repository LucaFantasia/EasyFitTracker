"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "./WorkoutDraftProvider";
import { finishWorkout } from "./actions";

// ✅ Adjust this import to match your project
import { EXERCISES } from "./exercises";

function draftIsValid(draft: any) {
  if (!draft?.name) return false;
  if (!draft?.exercises?.length) return false;
  return draft.exercises.every((ex: any) => ex?.name && ex?.sets?.length >= 1);
}

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

export default function NewWorkoutPage() {
  const router = useRouter();
  const { draft, setDraft, resetDraft } = useWorkoutDraft();

  // ✅ avoid hydration mismatch with localStorage-backed draft
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [isSaving, startSaving] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [confirmDeleteExerciseIndex, setConfirmDeleteExerciseIndex] = React.useState<number | null>(null);

  const canSave = mounted && draftIsValid(draft);

  function addExercise(name: string) {
    setError(null);

    // compute index BEFORE state update
    const newIndex = draft.exercises.length;

    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.push({ name, sets: [] });
      return next;
    });

    router.push(`/workouts/new/exercise/${newIndex}`);
  }

  function deleteExercise(exerciseIndex: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.splice(exerciseIndex, 1);
      return next;
    });
  }

  function cancelWorkout() {
    resetDraft();
    router.push("/dashboard"); // or "/dashboard"
  }

  function onFinish() {
    setError(null);

    if (!draftIsValid(draft)) {
      setError("Add at least 1 set to each exercise before saving.");
      return;
    }

    startSaving(async () => {
      const res = await finishWorkout(draft);
      if (!res || !res.ok) {
        setError(res?.error || "Could not save workout.");
        return;
      }
      resetDraft();
      router.push(`/workouts/${res.workoutId}`);
    });
  }

  // Optional: a consistent top bar
  const TopBar = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <button
        onClick={() => router.push("/workouts")}
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
        ← Workouts
      </button>

      <button
        onClick={() => setConfirmCancel(true)}
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
        Cancel
      </button>
    </div>
  );

  // While mounting, render a stable skeleton
  if (!mounted) {
    return (
      <main style={{ padding: 16, height: "100dvh" }}>
        {TopBar}
        <div style={{ marginTop: 18, opacity: 0.7 }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, paddingBottom: 96, minHeight: "100dvh" }}>
      {TopBar}

      <h1 style={{ marginTop: 14, marginBottom: 6 }}>New workout</h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>
        Tap an exercise to start logging.
      </div>

      {/* Add exercise list */}
      <section>
        <div style={{ display: "grid", gap: 10 }}>
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
                fontWeight: 800,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <hr style={{ margin: "22px 0", opacity: 0.18 }} />

      {/* Current workout draft */}
      <section>
        <h2 style={{ margin: 0 }}>Your workout</h2>

        {draft.exercises.length === 0 ? (
          <div style={{ opacity: 0.7, marginTop: 10 }}>No exercises added yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {draft.exercises.map((ex: any, idx: number) => (
              <div
                key={`${ex.name}-${idx}`}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => router.push(`/workouts/new/exercise/${idx}`)}
                  style={{
                    flex: 1,
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.92)",
                    padding: 0,
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{ex.name}</div>
                  <div style={{ opacity: 0.75, marginTop: 4, fontWeight: 700 }}>
                    {ex.sets?.length ?? 0} sets
                  </div>
                </button>

                <button
                  onClick={() => setConfirmDeleteExerciseIndex(idx)}
                  aria-label="Delete exercise"
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
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error ? (
        <div style={{ marginTop: 12, color: "rgba(255,120,120,0.95)", fontWeight: 900 }}>
          {error}
        </div>
      ) : null}

      {/* Sticky Finish button */}
      <button
        onClick={onFinish}
        disabled={!canSave || isSaving}
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          height: 56,
          borderRadius: 14,
          fontSize: 18,
          fontWeight: 900,
          background: canSave ? "#22c55e" : "rgba(255,255,255,0.12)",
          color: canSave ? "#022c22" : "rgba(255,255,255,0.5)",
          border: "none",
          opacity: isSaving ? 0.85 : 1,
        }}
      >
        {isSaving ? "Saving…" : "Finish & Save workout"}
      </button>

      {/* Confirm: cancel workout */}
      {confirmCancel ? (
        <Sheet
          title="Discard workout?"
          description="This will delete your in-progress workout."
          dangerLabel="Discard workout"
          cancelLabel="Keep editing"
          onDanger={cancelWorkout}
          onCancel={() => setConfirmCancel(false)}
        />
      ) : null}

      {/* Confirm: delete exercise */}
      {confirmDeleteExerciseIndex !== null ? (
        <Sheet
          title="Delete exercise?"
          description="This removes the exercise and all its sets from this workout."
          dangerLabel="Delete exercise"
          onDanger={() => {
            deleteExercise(confirmDeleteExerciseIndex);
            setConfirmDeleteExerciseIndex(null);
          }}
          onCancel={() => setConfirmDeleteExerciseIndex(null)}
        />
      ) : null}
    </main>
  );
}
