import { supabase } from "./supabase";

const UPPER = {
  name: "Upper Body",
  type: "upper",
  is_template: true,
  description: "Jared's standard upper body program.",
  exercises: [
    { exercise_name: "TRX Warm Up: Around the World / Row Holds / Squats", exercise_db_id: "trx-around-the-world", set_type: "warmup", target_sets: 1, target_reps: "10-15", notes: "Three movements as warm-up flow." },
    { exercise_name: "Dumbbell Bench (Incline)", exercise_db_id: "dumbbell-bench-incline", set_type: "warmup", target_sets: 2, target_reps: "5-10", notes: "Warm-up sets." },
    { exercise_name: "Dumbbell Bench (Incline)", exercise_db_id: "dumbbell-bench-incline", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: "Heavy sets." },
    { exercise_name: "Dumbbell Bench (Incline)", exercise_db_id: "dumbbell-bench-incline", set_type: "volume", target_sets: 2, target_reps: "10+", notes: "Volume sets." },
    { exercise_name: "Seated Row (Neutral Grip)", exercise_db_id: "seated-row-neutral", grip: "neutral", set_type: "warmup", target_sets: 1, target_reps: "5-10", notes: null },
    { exercise_name: "Seated Row (Neutral Grip)", exercise_db_id: "seated-row-neutral", grip: "neutral", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Seated Row (Neutral Grip)", exercise_db_id: "seated-row-neutral", grip: "neutral", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Seated Row (Overhand Grip)", exercise_db_id: "seated-row-overhand", grip: "overhand", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Prime Dip Machine", exercise_db_id: "prime-dip-machine", set_type: "warmup", target_sets: 1, target_reps: "5-10", notes: null },
    { exercise_name: "Prime Dip Machine", exercise_db_id: "prime-dip-machine", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Prime Dip Machine", exercise_db_id: "prime-dip-machine", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Tricep Extension (Rope)", exercise_db_id: "tricep-extension-rope", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Tricep Extension (Rope)", exercise_db_id: "tricep-extension-rope", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Hammer Curl (Rope)", exercise_db_id: "hammer-curl-rope", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Hammer Curl (Rope)", exercise_db_id: "hammer-curl-rope", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Leg Lifts", exercise_db_id: "leg-lifts", set_type: "volume", target_sets: 4, target_reps: "10", notes: null },
  ],
};

const LOWER = {
  name: "Lower Body",
  type: "lower",
  is_template: true,
  description: "Jared's standard lower body program.",
  exercises: [
    { exercise_name: "TRX Warm Up: Around the World / Row Holds / Squats", exercise_db_id: "trx-around-the-world", set_type: "warmup", target_sets: 1, target_reps: "10-15", notes: null },
    { exercise_name: "Pendulum Squat", exercise_db_id: "pendulum-squat", set_type: "warmup", target_sets: 1, target_reps: "5-10", notes: null },
    { exercise_name: "Pendulum Squat", exercise_db_id: "pendulum-squat", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Pendulum Squat", exercise_db_id: "pendulum-squat", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Leg Press", exercise_db_id: "leg-press", set_type: "warmup", target_sets: 1, target_reps: "5-10", notes: null },
    { exercise_name: "Leg Press", exercise_db_id: "leg-press", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Leg Press", exercise_db_id: "leg-press", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Leg Kickback", exercise_db_id: "leg-kickback", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Leg Kickback", exercise_db_id: "leg-kickback", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Standing Hamstring Curl", exercise_db_id: "standing-hamstring-curl", set_type: "warmup", target_sets: 1, target_reps: "5-10", notes: null },
    { exercise_name: "Standing Hamstring Curl", exercise_db_id: "standing-hamstring-curl", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "Standing Hamstring Curl", exercise_db_id: "standing-hamstring-curl", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "Leg Extension", exercise_db_id: "leg-extension", set_type: "volume", target_sets: 2, target_reps: "10+", notes: null },
    { exercise_name: "AB Rotation", exercise_db_id: "ab-rotation", set_type: "warmup", target_sets: 1, target_reps: "10", notes: null },
    { exercise_name: "AB Rotation", exercise_db_id: "ab-rotation", set_type: "heavy", target_sets: 3, target_reps: "5-10", notes: null },
    { exercise_name: "AB Rotation", exercise_db_id: "ab-rotation", set_type: "volume", target_sets: 2, target_reps: "10", notes: "Slow tempo." },
    { exercise_name: "AB Crunch", exercise_db_id: "ab-crunch", set_type: "volume", target_sets: 3, target_reps: "10-15", notes: null },
  ],
};

const AB = {
  name: "Ab Day",
  type: "ab",
  is_template: true,
  description: "Jared's standard ab day.",
  exercises: [
    { exercise_name: "TRX Warm Up: Around the World / Row Holds / Squats", exercise_db_id: "trx-around-the-world", set_type: "warmup", target_sets: 1, target_reps: "10-15", notes: null },
    { exercise_name: "Suitcase Carry", exercise_db_id: "suitcase-carry", set_type: "heavy", target_sets: 2, target_reps: "Down and back", notes: "Grip, shoulder, oblique, core." },
    { exercise_name: "AB Crunch", exercise_db_id: "ab-crunch", set_type: "volume", target_sets: 4, target_reps: "10", notes: "Slow tempo." },
    { exercise_name: "Slider Pikes", exercise_db_id: "slider-pikes", set_type: "volume", target_sets: 3, target_reps: "10", notes: null },
  ],
};

export async function seedTemplatesIfMissing(trainerId) {
  const { data: existing } = await supabase
    .from("programs")
    .select("id, name")
    .eq("trainer_id", trainerId)
    .eq("is_template", true);
  const have = new Set((existing || []).map((p) => p.name));
  const all = [UPPER, LOWER, AB];
  for (const tpl of all) {
    if (have.has(tpl.name)) continue;
    const { data: program, error } = await supabase
      .from("programs")
      .insert({
        trainer_id: trainerId,
        name: tpl.name,
        type: tpl.type,
        is_template: tpl.is_template,
        description: tpl.description,
      })
      .select()
      .single();
    if (error || !program) continue;
    const rows = tpl.exercises.map((ex, i) => ({
      program_id: program.id,
      exercise_name: ex.exercise_name,
      exercise_db_id: ex.exercise_db_id || null,
      grip: ex.grip || null,
      set_type: ex.set_type,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      notes: ex.notes || null,
      order_index: i,
    }));
    if (rows.length) await supabase.from("program_exercises").insert(rows);
  }
}
