"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SetDraft = {
  reps: number;
  weight: number;
};

type ExerciseDraft = {
  name: string;
  sets: SetDraft[];
};

type WorkoutDraft = {
  name: string;
  performedAt: string;
  exercises: ExerciseDraft[];
};

const DraftContext = createContext<{
  draft: WorkoutDraft;
  setDraft: React.Dispatch<React.SetStateAction<WorkoutDraft>>;
} | null>(null);

const STORAGE_KEY = "easy-fit-workout-draft";

export function WorkoutDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<WorkoutDraft>(() => {
    if (typeof window === "undefined") {
      return {
        name: "Workout",
        performedAt: new Date().toISOString(),
        exercises: [],
      };
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    return (
      (saved && JSON.parse(saved)) || {
        name: "Workout",
        performedAt: new Date().toISOString(),
        exercises: [],
      }
    );
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  return (
    <DraftContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftContext.Provider>
  );
}

export function useWorkoutDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) {
    throw new Error("useWorkoutDraft must be used inside WorkoutDraftProvider");
  }
  return ctx;
}
