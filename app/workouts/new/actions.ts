"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SetSchema = z.object({
  reps: z.number().int().nullable(),
  weight: z.number().nullable(),
});

const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.array(SetSchema).min(1),
});

const WorkoutSchema = z.object({
  name: z.string().min(1),
  performedAt: z.string().min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

async function insertWorkoutTree(raw: unknown) {
  const parsed = WorkoutSchema.parse(raw);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false as const, error: "Not authenticated" };
  }

  // 1) Insert workout
  const { data: workout, error: wErr } = await supabase
    .from("workouts")
    .insert({
      user_id: userData.user.id,
      name: parsed.name,
      performed_at: new Date(parsed.performedAt).toISOString(),
    })
    .select("id")
    .single();

  if (wErr) return { ok: false as const, error: wErr.message };
  if (!workout) return { ok: false as const, error: "Workout not returned" };

  // 2) Insert workout exercises
  const wexToInsert = parsed.exercises.map((e, i) => ({
    workout_id: workout.id,
    exercise_name: e.name,
    exercise_order: i + 1,
  }));

  const { data: wexRows, error: weErr } = await supabase
    .from("workout_exercises")
    .insert(wexToInsert)
    .select("id, exercise_order");

  if (weErr) return { ok: false as const, error: weErr.message };
  if (!wexRows) return { ok: false as const, error: "No workout_exercises returned" };

  const wexSorted = [...wexRows].sort((a, b) => a.exercise_order - b.exercise_order);

  // 3) Insert sets
  const setsToInsert = wexSorted.flatMap((wex, idx) => {
    const ex = parsed.exercises[idx];
    return ex.sets.map((s, setIdx) => ({
      workout_exercise_id: wex.id,
      set_order: setIdx + 1,
      reps: s.reps,
      weight: s.weight,
    }));
  });

  const { error: sErr } = await supabase.from("exercise_sets").insert(setsToInsert);
  if (sErr) return { ok: false as const, error: sErr.message };

  return { ok: true as const, workoutId: workout.id };
}

// ✅ new: client can call this, then clear local draft and navigate
export async function finishWorkout(raw: unknown) {
  return insertWorkoutTree(raw);
}
