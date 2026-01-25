"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkoutDraft } from "../../../../WorkoutDraftProvider";

type PickerMode = "reps" | "weight" | null;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundToStep(n: number, step: number) {
  const inv = 1 / step;
  return Math.round(n * inv) / inv;
}

function buildRanges({
  min,
  max,
  size,
}: {
  min: number;
  max: number;
  size: number;
}) {
  const ranges: Array<{ start: number; end: number }> = [];
  for (let s = min; s <= max; s += size) {
    ranges.push({ start: s, end: Math.min(max, s + size - 1) });
  }
  return ranges;
}

function buildValuesInRange({
  start,
  end,
  step,
}: {
  start: number;
  end: number;
  step: number;
}) {
  const out: number[] = [];
  const count = Math.floor((end - start) / step) + 1;
  for (let i = 0; i < count; i++) {
    out.push(roundToStep(start + i * step, step));
  }
  return out;
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44,
        padding: "0 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 16,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function BigGridButton({
  children,
  onClick,
  subtle,
}: {
  children: React.ReactNode;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 64,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: subtle ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function FullScreenPicker({
  title,
  subtitle,
  valueDisplay,
  ranges,
  rangeIndex,
  setRangeIndex,
  values,
  onPickValue,
  onClose,
  footer,
}: {
  title: string;
  subtitle?: string;
  valueDisplay: string;
  ranges: Array<{ start: number; end: number }>;
  rangeIndex: number;
  setRangeIndex: (i: number) => void;
  values: number[];
  onPickValue: (v: number) => void;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  // lock page scroll while open
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,12,0.98)",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        zIndex: 50,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onClose}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          ←
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{subtitle}</div>
          ) : null}
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {valueDisplay}
        </div>
      </header>

      {/* Range pills */}
      <div style={{ marginTop: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", gap: 10, paddingBottom: 6 }}>
          {ranges.map((r, i) => (
            <PillButton
              key={`${r.start}-${r.end}`}
              active={i === rangeIndex}
              onClick={() => setRangeIndex(i)}
            >
              {r.start}–{r.end}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Values grid */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          paddingBottom: 12,
        }}
      >
        {values.map((v) => (
          <BigGridButton key={v} onClick={() => onPickValue(v)}>
            {Number.isInteger(v) ? v : v.toFixed(1).replace(/\.0$/, "")}
          </BigGridButton>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        {footer}
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            height: 56,
            width: "100%",
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 800,
            background: "#22c55e",
            color: "#022c22",
            border: "none",
          }}
        >
          Done
        </button>
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
  const exercise = draft.exercises?.[exerciseIndex];

  // Ensure set exists (DON'T set state during render)
  React.useEffect(() => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const ex = next.exercises?.[exerciseIndex];
      if (!ex) return prev;

      const sets = ex.sets;
      while (sets.length <= setIndex) sets.push({ reps: 8, weight: 80 });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseIndex, setIndex]);

  if (!exercise) {
    return (
      <main style={{ height: "100dvh", padding: 16 }}>
        <p>Missing exercise.</p>
      </main>
    );
  }

  const currentSet = exercise.sets?.[setIndex] ?? { reps: 8, weight: 80 };

  function updateSet(next: { reps?: number; weight?: number }) {
    setDraft((prev) => {
      const copy = structuredClone(prev);
      const ex = copy.exercises[exerciseIndex];
      ex.sets[setIndex] = {
        reps: next.reps ?? ex.sets[setIndex]?.reps ?? 8,
        weight: next.weight ?? ex.sets[setIndex]?.weight ?? 80,
      };
      return copy;
    });
  }

  const [picker, setPicker] = React.useState<PickerMode>(null);

  // --- Reps picker setup ---
  const repsRanges = React.useMemo(() => buildRanges({ min: 1, max: 30, size: 5 }), []);
  const initialRepsRange = React.useMemo(() => {
    const reps = clamp(Number(currentSet.reps ?? 8), 1, 30);
    return Math.floor((reps - 1) / 5);
  }, [currentSet.reps]);
  const [repsRangeIndex, setRepsRangeIndex] = React.useState(initialRepsRange);

  React.useEffect(() => {
    setRepsRangeIndex(initialRepsRange);
  }, [initialRepsRange]);

  const repsValues = React.useMemo(() => {
    const r = repsRanges[repsRangeIndex] ?? repsRanges[0];
    return buildValuesInRange({ start: r.start, end: r.end, step: 1 });
  }, [repsRanges, repsRangeIndex]);

  // --- Weight picker setup ---
  // 10kg bands, step 2.5kg (fast to pick)
  const weightMin = 0;
  const weightMax = 200;
  const bandSize = 10;
  const weightStep = 2.5;

  const weightRanges = React.useMemo(
    () =>
      buildRanges({
        min: weightMin,
        max: weightMax,
        size: bandSize,
      }).map((r) => ({
        start: r.start,
        end: Math.min(weightMax, r.start + bandSize),
      })),
    []
  );

  const initialWeightRange = React.useMemo(() => {
    const w = clamp(Number(currentSet.weight ?? 80), weightMin, weightMax);
    return clamp(Math.floor(w / bandSize), 0, weightRanges.length - 1);
  }, [currentSet.weight, weightRanges.length]);

  const [weightRangeIndex, setWeightRangeIndex] = React.useState(initialWeightRange);

  React.useEffect(() => {
    setWeightRangeIndex(initialWeightRange);
  }, [initialWeightRange]);

  const weightValues = React.useMemo(() => {
    const r = weightRanges[weightRangeIndex] ?? weightRanges[0];
    // Example: 70–80 band => 70, 72.5, 75, 77.5, 80
    return buildValuesInRange({ start: r.start, end: r.end, step: weightStep });
  }, [weightRanges, weightRangeIndex]);

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
        <h2 style={{ margin: 0 }}>{exercise.name}</h2>
        <p style={{ opacity: 0.7, marginTop: 6, marginBottom: 0 }}>
          Set {setIndex + 1}
        </p>
      </header>

      {/* Two big tap targets */}
      <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
        <button
          onClick={() => setPicker("reps")}
          style={{
            height: 76,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 700 }}>Reps</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {currentSet.reps}
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, opacity: 0.7 }}>Change →</div>
        </button>

        <button
          onClick={() => setPicker("weight")}
          style={{
            height: 76,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 700 }}>Weight</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {Number.isInteger(currentSet.weight)
                ? `${currentSet.weight} kg`
                : `${String(currentSet.weight).replace(/\.0$/, "")} kg`}
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, opacity: 0.7 }}>Change →</div>
        </button>
      </div>

      <div style={{ marginTop: "auto" }}>
        <button
          onClick={saveAndGoBack}
          style={{
            marginTop: 16,
            height: 56,
            width: "100%",
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 900,
            background: "#22c55e",
            color: "#022c22",
            border: "none",
          }}
        >
          Save Set
        </button>
      </div>

      {/* Full-screen pickers */}
      {picker === "reps" ? (
        <FullScreenPicker
          title="Pick Reps"
          subtitle="Tap a range, then tap the exact reps"
          valueDisplay={`${currentSet.reps}`}
          ranges={repsRanges}
          rangeIndex={repsRangeIndex}
          setRangeIndex={setRepsRangeIndex}
          values={repsValues}
          onPickValue={(v) => updateSet({ reps: v })}
          onClose={() => setPicker(null)}
        />
      ) : null}

      {picker === "weight" ? (
        <FullScreenPicker
          title="Pick Weight"
          subtitle="10kg bands, 2.5kg steps (fast)"
          valueDisplay={`${currentSet.weight}kg`}
          ranges={weightRanges}
          rangeIndex={weightRangeIndex}
          setRangeIndex={setWeightRangeIndex}
          values={weightValues}
          onPickValue={(v) => updateSet({ weight: v })}
          onClose={() => setPicker(null)}
          footer={
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              <BigGridButton
                subtle
                onClick={() => updateSet({ weight: clamp(roundToStep(currentSet.weight - 2.5, 2.5), 0, 200) })}
              >
                −2.5
              </BigGridButton>
              <BigGridButton
                subtle
                onClick={() => updateSet({ weight: clamp(roundToStep(currentSet.weight - 5, 2.5), 0, 200) })}
              >
                −5
              </BigGridButton>
              <BigGridButton
                subtle
                onClick={() => updateSet({ weight: clamp(roundToStep(currentSet.weight + 5, 2.5), 0, 200) })}
              >
                +5
              </BigGridButton>
              <BigGridButton
                subtle
                onClick={() => updateSet({ weight: clamp(roundToStep(currentSet.weight + 2.5, 2.5), 0, 200) })}
              >
                +2.5
              </BigGridButton>
            </div>
          }
        />
      ) : null}
    </main>
  );
}
