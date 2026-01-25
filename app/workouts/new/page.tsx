import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "./workout-logger"

export default async function NewWorkoutPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return <WorkoutLogger />;
}
