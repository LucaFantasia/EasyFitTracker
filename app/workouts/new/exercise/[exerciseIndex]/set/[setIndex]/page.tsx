"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWorkoutDraft } from "@/app/workouts/new/WorkoutDraftProvider";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundToStep(value: number, step: number) {
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function formatShortDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

function buildRanges({ min, max, size }: { min: number; max: number; size: number }) {
  const out: { start: number; end: number }[] = [];
  for (let start = min; start < max; start += size) {
    const end = Math.min(max, start + size);
    out.push({ start, end });
  }
  return out;
}

function buildValuesInRange({ start, end, step }: { start: number; end: number; step: number }) {
  const out: number[] = [];
  for (let v = start; v <= end; v = roundToStep(v + step, step)) {
    out.push(roundToStep(v, step));
  }
  return out;
}

function GridButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 74,
        borderRadius: 18,
        border: selected ? "1px solid rgba(34,197,94,0.55)" : "1px solid rgba(255,255,255,0.10)",
        background: selected ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.92)",
        fontWeight: 900,
        fontSize: 24,
      }}
    >
      {children}
    </button>
  );
}

function RangePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44,
        padding: "0 14px",
        borderRadius: 999,
        border: active ? "1px solid rgba(34,197,94,0.55)" : "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.92)",
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      {label}
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
  selectedValue,
  onPickValue,
  onClose,
  footer,
}: {
  title: string;
  subtitle: string;
  valueDisplay: string;
  ranges: { start: number; end: number }[];
  rangeIndex: number;
  setRangeIndex: (n: number) => void;
  values: number[];
  selectedValue: number;
  onPickValue: (v: number) => void;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              height: 44,
              width: 44,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 900,
              fontSize: 18,
            }}
            aria-label="Back"
          >
            ←
          </button>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 18, fontWeight: 950, color: "rgba(255,255,255,0.96)" }}>{title}</div>
            <div style={{ opacity: 0.75, fontWeight: 800, marginTop: 2 }}>{subtitle}</div>
          </div>

          <div
            style={{
              height: 44,
              padding: "0 12px",
              borderRadius: 999,
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.14)",
              color: "rgba(220,252,231,0.95)",
              fontWeight: 950,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {valueDisplay}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto", paddingBottom: 6 }}>
          {ranges.map((r, i) => (
            <RangePill
              key={`${r.start}-${r.end}`}
              label={`${r.start}–${r.end}`}
              active={i === rangeIndex}
              onClick={() => setRangeIndex(i)}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {values.map((v) => {
            const selected = Math.abs(v - selectedValue) < 1e-9;
            return (
              <GridButton key={v} selected={selected} onClick={() => onPickValue(v)}>
                {Number.isInteger(v) ? v : String(v).replace(/\.0$/, "")}
              </GridButton>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        {footer ? <div style={{ marginBottom: 12 }}>{footer}</div> : null}
        <button
          onClick={onClose}
          style={{
            height: 56,
            width: "100%",
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 950,
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

export default function SetEntryPage({
  params,
}: {
  params: Promise<{ exerciseIndex: string; setIndex: string }>;
}) {
  const router = useRouter();
  const { draft, setDraft } = useWorkoutDraft() as any;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [picker, setPicker] = React.useState<null | "reps" | "weight">(null);

  const { exerciseIndex: exerciseIndexStr, setIndex: setIndexStr } = React.use(params);
  const exerciseIndex = Number(exerciseIndexStr);
  const setIndex = Number(setIndexStr);

  const exercise = draft?.exercises?.[exerciseIndex];
  const exerciseName = String(exercise?.name ?? "");
  const currentSet = exercise?.sets?.[setIndex];

  const [previous, setPrevious] = React.useState<any | null>(null);
  const [prevLoading, setPrevLoading] = React.useState(false);

  React.useEffect(() => {
    if (!mounted) return;
    if (!exerciseName) return;

    let cancelled = false;

    async function loadPrevious() {
      setPrevLoading(true);
      try {
        const setOrder = setIndex + 1;
        const res = await fetch(
          `/api/previous-set?exerciseName=${encodeURIComponent(exerciseName)}&setOrder=${setOrder}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;
        setPrevious(json?.ok ? json.previous : null);
      } catch {
        if (!cancelled) setPrevious(null);
      } finally {
        if (!cancelled) setPrevLoading(false);
      }
    }

    loadPrevious();
    return () => {
      cancelled = true;
    };
  }, [mounted, exercise?.name, setIndex]);

  const safeReps = Number(currentSet?.reps ?? 8);
  const safeWeight = Number(currentSet?.weight ?? 80);

  const repsRanges = React.useMemo(() => buildRanges({ min: 1, max: 30, size: 5 }), []);
  const initialRepsRange = React.useMemo(() => {
    const reps = clamp(safeReps, 1, 30);
    return Math.floor((reps - 1) / 5);
  }, [safeReps]);

  const [repsRangeIndex, setRepsRangeIndex] = React.useState(initialRepsRange);
  React.useEffect(() => setRepsRangeIndex(initialRepsRange), [initialRepsRange]);

  const repsValues = React.useMemo(() => {
    const r = repsRanges[repsRangeIndex] ?? repsRanges[0];
    return buildValuesInRange({ start: r.start, end: r.end, step: 1 });
  }, [repsRanges, repsRangeIndex]);

  // ✅ Weight grid stays 2.5kg increments
  const weightMin = 0;
  const weightMax = 200;
  const bandSize = 10;
  const weightGridStep = 2.5;

  const weightRanges = React.useMemo(
    () =>
      buildRanges({ min: weightMin, max: weightMax, size: bandSize }).map((r) => ({
        start: r.start,
        end: Math.min(weightMax, r.start + bandSize),
      })),
    []
  );

  const initialWeightRange = React.useMemo(() => {
    const w = clamp(safeWeight, weightMin, weightMax);
    return clamp(Math.floor(w / bandSize), 0, weightRanges.length - 1);
  }, [safeWeight, weightRanges.length]);

  const [weightRangeIndex, setWeightRangeIndex] = React.useState(initialWeightRange);
  React.useEffect(() => setWeightRangeIndex(initialWeightRange), [initialWeightRange]);

  const weightValues = React.useMemo(() => {
    const r = weightRanges[weightRangeIndex] ?? weightRanges[0];
    return buildValuesInRange({ start: r.start, end: r.end, step: weightGridStep });
  }, [weightRanges, weightRangeIndex]);

  function updateSet(next: { reps?: number; weight?: number }) {
    setDraft((prev: any) => {
      const copy = structuredClone(prev);
      const ex = copy.exercises[exerciseIndex];
      if (!ex) return prev;

      while (ex.sets.length <= setIndex) ex.sets.push({ reps: 8, weight: 80 });

      ex.sets[setIndex] = {
        reps: next.reps ?? ex.sets[setIndex]?.reps ?? 8,
        weight: next.weight ?? ex.sets[setIndex]?.weight ?? 80,
      };

      (ex as any).completed = false;
      return copy;
    });
  }

  // Fine tune step for buttons
  const fineStep = 0.125;

  function bumpWeight(delta: number) {
    const next = clamp(roundToStep(safeWeight + delta, fineStep), weightMin, weightMax);
    updateSet({ weight: next });
  }

  if (!mounted) {
    return (
      <main style={{ height: "100dvh", padding: 16 }}>
        <div style={{ opacity: 0.7 }}>Loading…</div>
      </main>
    );
  }

  if (!exercise) {
    return (
      <main style={{ height: "100dvh", padding: 16 }}>
        <p>Missing exercise.</p>
      </main>
    );
  }

  const prevDate = previous?.performedAt ? formatShortDate(previous.performedAt) : null;

  return (
    <main style={{ height: "100dvh", display: "flex", flexDirection: "column", padding: 16 }}>
      <header style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>{exercise.name}</h2>
        <p style={{ opacity: 0.7, marginTop: 6, marginBottom: 0 }}>Set {setIndex + 1}</p>

        <div
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.75 }}>
              Last time {prevLoading ? "(loading…)" : ""}
              {previous?.performedAt ? ` · ${formatShortDate(previous.performedAt)}` : ""}
            </div>

            {previous?.setOrder ? (
              <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.75 }}>Set {previous.setOrder}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <div
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 900 }}>Reps</div>
              <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{previous?.reps ?? "—"}</div>
            </div>

            <div
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 900 }}>Weight</div>
              <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>
                {previous?.weight ?? "—"} kg
              </div>
            </div>
          </div>

          {prevDate ? (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, fontWeight: 900 }}>{prevDate}</div>
          ) : null}
        </div>
      </header>

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
            <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 800 }}>Reps</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{safeReps}</div>
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
            <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 800 }}>Weight</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {Number.isInteger(safeWeight) ? `${safeWeight} kg` : `${String(safeWeight)} kg`}
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, opacity: 0.7 }}>Change →</div>
        </button>
      </div>

      <div style={{ marginTop: "auto" }}>
        <button
          onClick={() => router.back()}
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

      {picker === "reps" ? (
        <FullScreenPicker
          title="Pick Reps"
          subtitle="Tap a range, then tap the exact reps"
          valueDisplay={`${safeReps}`}
          ranges={repsRanges}
          rangeIndex={repsRangeIndex}
          setRangeIndex={setRepsRangeIndex}
          values={repsValues}
          selectedValue={safeReps}
          onPickValue={(v) => updateSet({ reps: v })}
          onClose={() => setPicker(null)}
        />
      ) : null}

      {picker === "weight" ? (
        <FullScreenPicker
          title="Pick Weight"
          subtitle="10kg bands, 2.5kg grid + micro-adjust"
          valueDisplay={`${String(safeWeight)}kg`}
          ranges={weightRanges}
          rangeIndex={weightRangeIndex}
          setRangeIndex={setWeightRangeIndex}
          values={weightValues}
          selectedValue={safeWeight}
          onPickValue={(v) => updateSet({ weight: v })}
          onClose={() => setPicker(null)}
          footer={
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <GridButton selected={false} onClick={() => bumpWeight(-1)}>−1</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(-0.5)}>−0.5</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(-0.25)}>−0.25</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(-0.125)}>−0.125</GridButton>

              <GridButton selected={false} onClick={() => bumpWeight(+0.125)}>+0.125</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(+0.25)}>+0.25</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(+0.5)}>+0.5</GridButton>
              <GridButton selected={false} onClick={() => bumpWeight(+1)}>+1</GridButton>
            </div>
          }
        />
      ) : null}
    </main>
  );
}
