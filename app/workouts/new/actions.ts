"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ---- Zod schemas ----

const SetSchema = z.object({
  reps: z.number(),
  weight: z.number(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema).min(1),
  completed: z.boolean().optional(),
});

const WorkoutSchema = z.object({
  // Support both names; we'll normalize
  name: z.string().optional(),
  workoutName: z.string().optional(),

  // Make optional; we'll fill it in on the server
  performedAt: z.string().optional(),

  exercises: z.array(ExerciseSchema).min(1),
});

type FinishResult =
  | { ok: true; workoutId: string }
  | { ok: false; error: string };

// ---- Insert tree ----

async function insertWorkoutTree(raw: unknown): Promise<string> {
  const parsed = WorkoutSchema.parse(raw);

  const name = (parsed.name ?? parsed.workoutName ?? "Workout").trim() || "Workout";
  const performedAt = parsed.performedAt ?? new Date().toISOString();

  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    throw new Error("Not authenticated.");
  }
  const userId = userData.user.id;

  // 1) Insert workout
  const { data: workoutRow, error: workoutErr } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      name,
      performed_at: performedAt,
    })
    .select("id")
    .single();

  if (workoutErr || !workoutRow?.id) {
    throw new Error(workoutErr?.message || "Failed to create workout.");
  }

  const workoutId = workoutRow.id as string;

  // 2) Insert workout_exercises + exercise_sets
  // We do this sequentially for clarity and to keep set_order correct.
  for (let exIndex = 0; exIndex < parsed.exercises.length; exIndex++) {
    const ex = parsed.exercises[exIndex];

    const { data: exRow, error: exErr } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: workoutId,
        exercise_name: ex.name,
        exercise_order: exIndex + 1,
      })
      .select("id")
      .single();

    if (exErr || !exRow?.id) {
      throw new Error(exErr?.message || "Failed to create workout exercise.");
    }

    const workoutExerciseId = exRow.id as string;

    const setsPayload = ex.sets.map((s, setIndex) => ({
      workout_exercise_id: workoutExerciseId,
      set_order: setIndex + 1,
      reps: s.reps,
      weight: s.weight,
    }));

    const { error: setsErr } = await supabase.from("exercise_sets").insert(setsPayload);
    if (setsErr) {
      throw new Error(setsErr.message || "Failed to create exercise sets.");
    }
  }

  return workoutId;
}

// ---- Public server action ----

export async function finishWorkout(raw: unknown): Promise<FinishResult> {
  try {
    const workoutId = await insertWorkoutTree(raw);
    return { ok: true, workoutId };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Could not save workout." };
  }
}
