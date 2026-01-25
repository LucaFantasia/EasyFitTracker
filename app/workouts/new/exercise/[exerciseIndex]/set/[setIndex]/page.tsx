"use client";

import { useParams, useRouter } from "next/navigation";
import { useWorkoutDraft } from "../../../../WorkoutDraftProvider";

function NumberPicker({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p style={{ marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => onChange(Math.max(min, value - step))}>–</button>
        <div style={{ fontSize: 40, width: 120, textAlign: "center" }}>
          {value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + step))}>+</button>
      </div>
    </div>
  );
}


export default function SetEntryPage() {
  const router = useRouter();
  const params = useParams();
  const exerciseIndex = Number(params.exerciseIndex);
  const setIndex = Number(params.setIndex);

  const { draft, setDraft } = useWorkoutDraft();
  const exercise = draft.exercises[exerciseIndex];

  if (!exercise.sets[setIndex]) {
    setDraft((prev) => {
        const next = structuredClone(prev);
        const sets = next.exercises[exerciseIndex].sets;
        while (sets.length <= setIndex) sets.push({ reps: 8, weight: 80 });
        return next;
    });
  }

  const currentSet =
    exercise.sets[setIndex] ?? { reps: 8, weight: 80 };

  function updateSet(reps: number, weight: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises[exerciseIndex].sets[setIndex] = { reps, weight };
      return next;
    });
  }

  function saveAndGoBack() {
    router.back();
  }

  return (
    <main
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h2>{exercise.name}</h2>
        <p style={{ opacity: 0.7 }}>
          Set {setIndex + 1}
        </p>
      </header>

      <div style={{ flex: 1, display: "grid", gap: 24 }}>
        <NumberPicker
          label="Reps"
          value={currentSet.reps}
          min={1}
          max={30}
          onChange={(v) => updateSet(v, currentSet.weight)}
        />
        <NumberPicker
          label="Weight (kg)"
          value={currentSet.weight}
          min={0}
          max={200}
          step={0.5}
          onChange={(v) => updateSet(currentSet.reps, v)}
        />
      </div>

      <button
        onClick={saveAndGoBack}
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 12,
          fontSize: 18,
          background: "#22c55e",
          color: "#022c22",
          border: "none",
        }}
      >
        Save Set
      </button>
    </main>
  );
}
