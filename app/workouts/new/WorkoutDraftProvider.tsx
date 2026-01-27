"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type DraftSet = { reps: number; weight: number };
type DraftExercise = { name: string; sets: DraftSet[]; completed?: boolean };

export type WorkoutDraft = {
  workoutName?: string;
  startedAt?: string; // ✅ new
  exercises: DraftExercise[];
};

type WorkoutDraftContextValue = {
  draft: WorkoutDraft;

  setDraft: React.Dispatch<React.SetStateAction<WorkoutDraft>>;

  setWorkoutName: (name: string) => void;

  addExercise: (name: string) => void;
  removeExercise: (exerciseIndex: number) => void;

  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;

  setReps: (exerciseIndex: number, setIndex: number, reps: number) => void;
  setWeight: (exerciseIndex: number, setIndex: number, weight: number) => void;

  completeExercise: (exerciseIndex: number) => void;

  resetDraft: () => void;
};

const STORAGE_KEY = "workout_draft_v1";

const WorkoutDraftContext = createContext<WorkoutDraftContextValue | null>(null);

function newDraft(): WorkoutDraft {
  return { workoutName: "", startedAt: new Date().toISOString(), exercises: [] };
}

function readInitialDraft(): WorkoutDraft {
  if (typeof window === "undefined") return newDraft();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return newDraft();

    const parsed = JSON.parse(raw) as Partial<WorkoutDraft>;
    const startedAt =
      typeof parsed.startedAt === "string" && parsed.startedAt.length > 0
        ? parsed.startedAt
        : new Date().toISOString();

    return {
      workoutName: typeof parsed.workoutName === "string" ? parsed.workoutName : "",
      startedAt,
      exercises: Array.isArray(parsed.exercises) ? (parsed.exercises as DraftExercise[]) : [],
    };
  } catch {
    return newDraft();
  }
}

export function WorkoutDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<WorkoutDraft>(() => readInitialDraft());

  // ✅ Ensure startedAt always exists (for older localStorage drafts)
  useEffect(() => {
    if (!draft.startedAt) {
      setDraft((d) => ({ ...d, startedAt: new Date().toISOString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const value = useMemo<WorkoutDraftContextValue>(() => {
    const setWorkoutName = (name: string) => {
      setDraft((d) => ({ ...d, workoutName: name }));
    };

    const addExercise = (name: string) => {
      setDraft((d) => ({
        ...d,
        startedAt: d.startedAt ?? new Date().toISOString(),
        exercises: [...d.exercises, { name, sets: [], completed: false }],
      }));
    };

    const removeExercise = (exerciseIndex: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.filter((_, i) => i !== exerciseIndex),
      }));
    };

    const addSet = (exerciseIndex: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          return { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] };
        }),
      }));
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          return { ...ex, sets: ex.sets.filter((_, s) => s !== setIndex) };
        }),
      }));
    };

    const setReps = (exerciseIndex: number, setIndex: number, reps: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, reps } : s)),
          };
        }),
      }));
    };

    const setWeight = (exerciseIndex: number, setIndex: number, weight: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, weight } : s)),
          };
        }),
      }));
    };

    const completeExercise = (exerciseIndex: number) => {
      setDraft((d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) =>
          i === exerciseIndex ? { ...ex, completed: true } : ex
        ),
      }));
    };

    const resetDraft = () => setDraft(newDraft());

    return {
      draft,
      setDraft,
      setWorkoutName,
      addExercise,
      removeExercise,
      addSet,
      removeSet,
      setReps,
      setWeight,
      completeExercise,
      resetDraft,
    };
  }, [draft]);

  return <WorkoutDraftContext.Provider value={value}>{children}</WorkoutDraftContext.Provider>;
}

export function useWorkoutDraft() {
  const ctx = useContext(WorkoutDraftContext);
  if (!ctx) throw new Error("useWorkoutDraft must be used within WorkoutDraftProvider");
  return ctx;
}
