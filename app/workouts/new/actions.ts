"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
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
  performedAt: z.string().min(1), // datetime-local
  exercises: z.array(ExerciseSchema).min(1),
});

export async function saveWorkout(raw: unknown) {
  const parsed = WorkoutSchema.parse(raw);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

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

  if (wErr) throw new Error(wErr.message);

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

  if (weErr) throw new Error(weErr.message);
  if (!wexRows) throw new Error("No workout_exercises returned.");

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
  if (sErr) throw new Error(sErr.message);

  redirect("/dashboard");
}
