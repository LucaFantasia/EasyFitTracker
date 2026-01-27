"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteWorkout(workoutId: string) {
  const supabase = await createClient();

  // RLS should ensure users can only delete their own
  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) throw new Error(error.message);

  redirect("/workouts");
}

export async function updateWorkoutName(workoutId: string, name: string) {
  const supabase = await createClient();

  const trimmed = (name ?? "").trim() || "Workout";

  const { error } = await supabase.from("workouts").update({ name: trimmed }).eq("id", workoutId);
  if (error) throw new Error(error.message);

  redirect(`/workouts/${workoutId}`);
}
