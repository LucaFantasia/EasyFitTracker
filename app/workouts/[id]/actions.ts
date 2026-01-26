"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateWorkout(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;

  await supabase.from("workouts").update({ name }).eq("id", id);

  redirect(`/workouts/${id}`);
}

export async function deleteWorkout(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  await supabase.from("workouts").delete().eq("id", id);

  redirect("/workouts");
}
