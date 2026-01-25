"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteWorkout(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/login");

  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/workouts");
}

export async function updateWorkout(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const performedAt = String(formData.get("performedAt") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/login");

  const { error } = await supabase
    .from("workouts")
    .update({
      name,
      performed_at: new Date(performedAt).toISOString(),
      notes: notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect(`/workouts/${id}`);
}
