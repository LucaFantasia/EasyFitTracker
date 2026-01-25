"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SetDraft = {
  reps: number;
  weight: number;
};

type ExerciseDraft = {
  name: string;
  sets: SetDraft[];
};

export type WorkoutDraft = {
  name: string;
  performedAt: string;
  exercises: ExerciseDraft[];
};

export const STORAGE_KEY = "easy-fit-workout-draft";

const defaultDraft = (): WorkoutDraft => ({
  name: "Workout",
  performedAt: new Date().toISOString(),
  exercises: [],
});

const DraftContext = createContext<{
  draft: WorkoutDraft;
  setDraft: React.Dispatch<React.SetStateAction<WorkoutDraft>>;
  resetDraft: () => void;
} | null>(null);

export function WorkoutDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<WorkoutDraft>(() => {
    if (typeof window === "undefined") return defaultDraft();
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && JSON.parse(saved)) || defaultDraft();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const resetDraft = () => {
    const fresh = defaultDraft();
    setDraft(fresh);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  function removeExercise(exerciseIndex: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.splice(exerciseIndex, 1);
      return next;
    });
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const sets = next.exercises[exerciseIndex]?.sets;
      if (!sets) return prev;
      sets.splice(setIndex, 1);
      return next;
    });
  }


  const value = useMemo(() => ({ draft, setDraft, resetDraft, removeExercise, removeSet }), [draft]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useWorkoutDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useWorkoutDraft must be used inside WorkoutDraftProvider");
  return ctx;
}
