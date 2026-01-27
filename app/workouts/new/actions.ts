"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
  name: z.string().optional(),
  workoutName: z.string().optional(),

  performedAt: z.string().optional(),

  // ✅ new
  startedAt: z.string().optional(),

  exercises: z.array(ExerciseSchema).min(1),
});

type FinishResult =
  | { ok: true; workoutId: string }
  | { ok: false; error: string };

function computeDurationSeconds(startedAt?: string) {
  if (!startedAt) return null;
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return null;
  const now = Date.now();
  const seconds = Math.floor((now - start) / 1000);
  return seconds >= 0 ? seconds : null;
}

async function insertWorkoutTree(raw: unknown): Promise<string> {
  const parsed = WorkoutSchema.parse(raw);

  const name = (parsed.name ?? parsed.workoutName ?? "Workout").trim() || "Workout";
  const performedAt = parsed.performedAt ?? new Date().toISOString();
  const durationSeconds = computeDurationSeconds(parsed.startedAt);

  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) throw new Error("Not authenticated.");
  const userId = userData.user.id;

  const { data: workoutRow, error: workoutErr } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      name,
      performed_at: performedAt,
      duration_seconds: durationSeconds, // ✅ new
    })
    .select("id")
    .single();

  if (workoutErr || !workoutRow?.id) {
    throw new Error(workoutErr?.message || "Failed to create workout.");
  }

  const workoutId = workoutRow.id as string;

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
    if (setsErr) throw new Error(setsErr.message || "Failed to create exercise sets.");
  }

  return workoutId;
}

export async function finishWorkout(raw: unknown): Promise<FinishResult> {
  try {
    const workoutId = await insertWorkoutTree(raw);
    return { ok: true, workoutId };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Could not save workout." };
  }
}
