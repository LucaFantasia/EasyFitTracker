"use client";

import * as React from "react";

type SetDraft = {
  reps: number;
  weight: number;
};

type ExerciseDraft = {
  name: string;
  sets: SetDraft[];
  completed: boolean;
};

export type WorkoutDraft = {
  name: string;
  performedAt: string;
  exercises: ExerciseDraft[];
};

const STORAGE_KEY = "easy-fit-workout-draft";

const defaultDraft = (): WorkoutDraft => ({
  name: "Workout",
  performedAt: new Date().toISOString(),
  exercises: [],
});

type DraftContextValue = {
  draft: WorkoutDraft;
  setDraft: React.Dispatch<React.SetStateAction<WorkoutDraft>>;
  resetDraft: () => void;

  // ✅ add these mutations
  removeExercise: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
};

const DraftContext = React.createContext<DraftContextValue | null>(null);

export function WorkoutDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<WorkoutDraft>(() => {
    if (typeof window === "undefined") return defaultDraft();
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as WorkoutDraft) : defaultDraft();
  });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const resetDraft = React.useCallback(() => {
    setDraft(defaultDraft());
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeExercise = React.useCallback((exerciseIndex: number) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.exercises.splice(exerciseIndex, 1);
      return next;
    });
  }, []);

  // ✅ HERE is removeSet
  const removeSet = React.useCallback((exerciseIndex: number, setIndex: number) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const ex = next.exercises?.[exerciseIndex];
      if (!ex?.sets) return prev;

      ex.sets.splice(setIndex, 1);
      return next;
    });
  }, []);

  const value = React.useMemo<DraftContextValue>(
    () => ({ draft, setDraft, resetDraft, removeExercise, removeSet }),
    [draft, resetDraft, removeExercise, removeSet]
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useWorkoutDraft() {
  const ctx = React.useContext(DraftContext);
  if (!ctx) throw new Error("useWorkoutDraft must be used inside WorkoutDraftProvider");
  return ctx;
}
