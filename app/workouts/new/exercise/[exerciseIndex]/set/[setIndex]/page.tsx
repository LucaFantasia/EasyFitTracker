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

function buildRanges({ min, max, size }: { min: number; max: number; size: number }) {
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
  for (let i = 0; i < count; i++) out.push(roundToStep(start + i * step, step));
  return out;
}

function formatShortDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
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
        border: active ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(255,255,255,0.12)",
        background: active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 16,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function GridButton({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: "clamp(64px, 10vh, 92px)",
        borderRadius: 18,
        border: selected ? "1px solid rgba(34,197,94,0.55)" : "1px solid rgba(255,255,255,0.12)",
        background: selected ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.08)",
        color: selected ? "rgba(220,252,231,0.98)" : "rgba(255,255,255,0.92)",
        fontSize: "clamp(20px, 3.2vh, 30px)",
        fontWeight: 900,
        transform: selected ? "scale(1.02)" : "scale(1)",
        transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
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
  selectedValue,
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
  selectedValue: number;
  onPickValue: (v: number) => void;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
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
            fontWeight: 900,
          }}
        >
          ←
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
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
            border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.14)",
            fontWeight: 900,
            color: "rgba(220,252,231,0.95)",
          }}
        >
          {valueDisplay}
        </div>
      </header>

      <div style={{ marginTop: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", gap: 10, paddingBottom: 6 }}>
          {ranges.map((r, i) => (
            <PillButton key={`${r.start}-${r.end}`} active={i === rangeIndex} onClick={() => setRangeIndex(i)}>
              {r.start}–{r.end}
            </PillButton>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          alignContent: values.length <= 6 ? "center" : "start",
          paddingBottom: 12,
        }}
      >
        {values.map((v) => {
          const isSelected = Number(v) === Number(selectedValue);
          return (
            <GridButton key={v} selected={isSelected} onClick={() => onPickValue(v)}>
              {Number.isInteger(v) ? v : v.toFixed(1).replace(/\.0$/, "")}
            </GridButton>
          );
        })}
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
            fontWeight: 900,
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
  // ✅ ALL hooks first, always
  const router = useRouter();
  const params = useParams();
  const { draft, setDraft } = useWorkoutDraft();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [picker, setPicker] = React.useState<PickerMode>(null);

  const [prevLoading, setPrevLoading] = React.useState(false);
  const [previous, setPrevious] = React.useState<{
    reps: number | null;
    weight: number | null;
    performedAt: string | null;
    setOrder: number;
  } | null>(null);

  // params (safe parsing)
  const exerciseIndex = Number((params as any).exerciseIndex);
  const setIndex = Number((params as any).setIndex);

  // derive exercise/set (no early returns yet)
  const exercise = mounted ? draft.exercises?.[exerciseIndex] : undefined;
  const currentSet = exercise?.sets?.[setIndex];

  // ensure set exists
  React.useEffect(() => {
    if (!mounted) return;

    setDraft((prev) => {
      const next = structuredClone(prev);
      const ex = next.exercises?.[exerciseIndex];
      if (!ex) return prev;

      while (ex.sets.length <= setIndex) ex.sets.push({ reps: 8, weight: 80 });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, exerciseIndex, setIndex]);

  // load previous set info
  React.useEffect(() => {
    if (!mounted) return;
    if (!exercise?.name) return;

    let cancelled = false;
    let exerciseName = exercise ? exercise.name : "";

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

  // pickers setup (safe defaults if currentSet undefined)
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

  const weightMin = 0;
  const weightMax = 200;
  const bandSize = 10;
  const weightStep = 2.5;

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
    return buildValuesInRange({ start: r.start, end: r.end, step: weightStep });
  }, [weightRanges, weightRangeIndex]);

  function updateSet(next: { reps?: number; weight?: number }) {
    setDraft((prev) => {
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

  // ✅ Now it’s safe to early-return (all hooks already ran)
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
        <p style={{ opacity: 0.7, marginTop: 6, marginBottom: 0 }}>
          Set {setIndex + 1}
        </p>

        {/* Last time card (display-only) */}
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
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  opacity: 0.75,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                Set {previous.setOrder}
              </div>
            ) : null}
          </div>

          {previous && previous.reps != null && previous.weight != null ? (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 950, color: "rgba(255,255,255,0.96)" }}>
                {previous.reps}
                <span style={{ fontSize: 16, fontWeight: 900, opacity: 0.7, marginLeft: 6 }}>reps</span>
              </div>

              <div style={{ fontSize: 26, fontWeight: 950, color: "rgba(255,255,255,0.96)" }}>
                {Number.isInteger(previous.weight) ? previous.weight : String(previous.weight).replace(/\.0$/, "")}
                <span style={{ fontSize: 16, fontWeight: 900, opacity: 0.7, marginLeft: 6 }}>kg</span>
              </div>
            </div>
          ) : previous ? (
            <div style={{ marginTop: 10, opacity: 0.75, fontWeight: 800 }}>
              No data for this set last time.
            </div>
          ) : (
            <div style={{ marginTop: 10, opacity: 0.75, fontWeight: 800 }}>
              No previous data for this exercise yet.
            </div>
          )}
        </div>

      </header>

      {/* Current values */}
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
              {Number.isInteger(safeWeight)
                ? `${safeWeight} kg`
                : `${String(safeWeight).replace(/\.0$/, "")} kg`}
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
          subtitle="10kg bands, 2.5kg steps"
          valueDisplay={`${safeWeight}kg`}
          ranges={weightRanges}
          rangeIndex={weightRangeIndex}
          setRangeIndex={setWeightRangeIndex}
          values={weightValues}
          selectedValue={safeWeight}
          onPickValue={(v) => updateSet({ weight: v })}
          onClose={() => setPicker(null)}
          footer={
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <GridButton selected={false} onClick={() => updateSet({ weight: clamp(roundToStep(safeWeight - 2.5, 2.5), 0, 200) })}>
                −2.5
              </GridButton>
              <GridButton selected={false} onClick={() => updateSet({ weight: clamp(roundToStep(safeWeight - 5, 2.5), 0, 200) })}>
                −5
              </GridButton>
              <GridButton selected={false} onClick={() => updateSet({ weight: clamp(roundToStep(safeWeight + 5, 2.5), 0, 200) })}>
                +5
              </GridButton>
              <GridButton selected={false} onClick={() => updateSet({ weight: clamp(roundToStep(safeWeight + 2.5, 2.5), 0, 200) })}>
                +2.5
              </GridButton>
            </div>
          }
        />
      ) : null}
    </main>
  );
}
