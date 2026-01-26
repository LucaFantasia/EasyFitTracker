"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Row, Pill } from "@/app/_components/ui";
import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "./WorkoutDraftProvider";
import { finishWorkout } from "./actions";

function draftIsValid(draft: any) {
  const name = (draft?.workoutName ?? draft?.name ?? "").trim();
  if (!name) return false;
  if (!draft?.exercises?.length) return false;

  return draft.exercises.every((ex: any) => {
    if (!ex?.name) return false;
    if (!ex?.sets?.length || ex.sets.length < 1) return false;

    // Optional strictness: require reps/weight to be > 0 for each set
    // (If your app allows 0 as a placeholder, remove this block)
    return ex.sets.every((s: any) => typeof s?.reps === "number" && typeof s?.weight === "number");
  });
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
  const { draft, resetDraft, removeExercise, setWorkoutName, setDraft } = useWorkoutDraft() as any;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [isSaving, startSaving] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [confirmDeleteExerciseIndex, setConfirmDeleteExerciseIndex] = React.useState<number | null>(
    null
  );

  const workoutName = (draft?.workoutName ?? draft?.name ?? "Workout").trim() || "Workout";
  const canSave = mounted && draftIsValid(draft);

  function cancelWorkout() {
    resetDraft();
    router.push("/workouts");
  }

  function onFinish() {
    setError(null);

    // Ensure name exists even if older parts of the app still use draft.name
    if (!workoutName.trim()) {
      setError("Give your workout a name before saving.");
      return;
    }

    if (!draftIsValid(draft)) {
      setError("Add at least 1 set to each exercise before saving.");
      return;
    }

    // Make sure the server action receives a name field too (backwards compatible)
    const payload = {
      ...draft,
      workoutName,
      name: workoutName,
    };

    startSaving(async () => {
      const res = await finishWorkout(payload);
      if (!res || !res.ok) {
        setError(res?.error || "Could not save workout.");
        return;
      }
      resetDraft();
      router.push(`/workouts/${res.workoutId}`);
    });
  }

  if (!mounted) {
    return (
      <main style={{ padding: 16, height: "100dvh" }}>
        <div style={{ opacity: 0.7 }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, paddingBottom: 160, minHeight: "100dvh" }}>
      {/* Top bar: left group + right group */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Left group */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
        </div>

        {/* Right group */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/workouts/new/name" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 44,
                padding: "0 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              <Pill>Name</Pill>
              <span style={{ color: "#22c55e" }}>{workoutName}</span>
              <span style={{ opacity: 0.7, fontWeight: 800 }}>Edit</span>
            </div>
          </Link>

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
      </div>

      {/* Exercise list */}
      <section style={{ marginTop: 16 }}>
        {draft.exercises.length === 0 ? (
          <div style={{ opacity: 0.7, marginTop: 10 }}>No exercises added yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {draft.exercises.map((ex: any, idx: number) => {
              const completed = Boolean(ex.completed);
              return (
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
                    {completed ? (
                      <div
                        style={{
                          marginTop: 8,
                          display: "inline-flex",
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
              );
            })}
          </div>
        )}
      </section>

      {error ? (
        <div style={{ marginTop: 12, color: "rgba(255,120,120,0.95)", fontWeight: 900 }}>
          {error}
        </div>
      ) : null}

      {/* Sticky actions */}
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
          onClick={() => router.push("/workouts/new/add-exercise")}
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
          + Add exercise
        </button>

        <button
          onClick={onFinish}
          disabled={!canSave || isSaving}
          style={{
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
      </div>

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
            removeExercise(confirmDeleteExerciseIndex);
            setConfirmDeleteExerciseIndex(null);
          }}
          onCancel={() => setConfirmDeleteExerciseIndex(null)}
        />
      ) : null}
    </main>
  );
}
