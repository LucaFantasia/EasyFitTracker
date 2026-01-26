import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const exerciseName = url.searchParams.get("exerciseName");
  const setOrderStr = url.searchParams.get("setOrder");

  if (!exerciseName || !setOrderStr) {
    return NextResponse.json(
      { ok: false, error: "Missing exerciseName or setOrder" },
      { status: 400 }
    );
  }

  const setOrder = Number(setOrderStr);
  if (!Number.isFinite(setOrder) || setOrder < 1) {
    return NextResponse.json(
      { ok: false, error: "Invalid setOrder" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 1) Find the most recent workout_exercise for this user + exercise name
  // We join workouts to order by performed_at
  const { data: wex, error: wexErr } = await supabase
    .from("workout_exercises")
    .select("id, workout_id, exercise_name, workouts!inner(performed_at, user_id)")
    .eq("workouts.user_id", userData.user.id)
    .eq("exercise_name", exerciseName)
    .order("performed_at", { foreignTable: "workouts", ascending: false })
    .limit(1)
    .maybeSingle();

  if (wexErr) {
    return NextResponse.json({ ok: false, error: wexErr.message }, { status: 500 });
  }

  if (!wex) {
    return NextResponse.json({ ok: true, previous: null });
  }

  // 2) Get the set for that workout_exercise at the given set order
  const { data: prevSet, error: setErr } = await supabase
    .from("exercise_sets")
    .select("reps, weight, set_order")
    .eq("workout_exercise_id", wex.id)
    .eq("set_order", setOrder)
    .maybeSingle();

  if (setErr) {
    return NextResponse.json({ ok: false, error: setErr.message }, { status: 500 });
  }

  const performedAt = (wex as any).workouts?.performed_at ?? null;

  return NextResponse.json({
    ok: true,
    previous: prevSet
      ? {
          reps: prevSet.reps,
          weight: prevSet.weight,
          setOrder: prevSet.set_order,
          performedAt,
        }
      : {
          reps: null,
          weight: null,
          setOrder,
          performedAt,
        },
  });
}
