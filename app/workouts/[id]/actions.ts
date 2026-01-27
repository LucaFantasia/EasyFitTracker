"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteWorkout(formData: FormData) {
  const workoutId = String(formData.get("id") ?? "");
  if (!workoutId) throw new Error("Missing workout id.");

  const supabase = await createClient();

  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) throw new Error(error.message);

  redirect("/workouts");
}

export async function updateWorkoutName(formData: FormData) {
  const workoutId = String(formData.get("id") ?? "");
  const nameRaw = String(formData.get("name") ?? "");
  const name = nameRaw.trim() || "Workout";

  if (!workoutId) throw new Error("Missing workout id.");

  const supabase = await createClient();

  const { error } = await supabase.from("workouts").update({ name }).eq("id", workoutId);
  if (error) throw new Error(error.message);

  redirect(`/workouts/${workoutId}`);
}
