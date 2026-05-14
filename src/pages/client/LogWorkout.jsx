import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  listClientPrograms,
  listProgramExercises,
  createSession,
  bulkInsertSets,
} from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import ExercisePicker from "../../components/shared/ExercisePicker";
import ExerciseDemo from "../../components/shared/ExerciseDemo";
import { IconPlus, IconTrash, IconDumbbell, IconRun, IconChevronRight } from "../../components/shared/Icons";

const STRENGTH_TYPES = ["upper", "lower", "ab", "custom"];

export default function LogWorkout() {
  const { user } = useAuth();
  const [step, setStep] = useState("choose"); // choose | program | type | log-strength | log-cardio
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (!user) return;
    listClientPrograms(user.id).then(({ data }) => setAssignments(data || []));
  }, [user]);

  return (
    <AppShell>
      <PageHeader eyebrow="New" title="Log workout" />
      {step === "choose" && (
        <div className="mt-4 space-y-3">
          <button onClick={() => setStep("program")} className="card w-full text-left flex items-center gap-3 hover:border-brand-600">
            <div className="w-12 h-12 rounded-full bg-brand-100 grid place-items-center text-brand-700"><IconDumbbell /></div>
            <div className="flex-1">
              <div className="font-display font-bold text-brand-900">Assigned workout</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">From one of your programs</div>
            </div>
            <IconChevronRight />
          </button>
          <button onClick={() => setStep("type")} className="card w-full text-left flex items-center gap-3 hover:border-brand-600">
            <div className="w-12 h-12 rounded-full bg-brand-100 grid place-items-center text-brand-700"><IconRun /></div>
            <div className="flex-1">
              <div className="font-display font-bold text-brand-900">Personal workout</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Free-form: strength, ab, cardio</div>
            </div>
            <IconChevronRight />
          </button>
        </div>
      )}

      {step === "program" && (
        <PickAssignedProgram
          assignments={assignments}
          onBack={() => setStep("choose")}
          onStart={(programId, workoutType) => {
            if (workoutType === "cardio") {
              setStep({ kind: "log-cardio", programId, workoutType });
            } else {
              setStep({ kind: "log-strength", programId, workoutType });
            }
          }}
        />
      )}

      {step === "type" && (
        <PickPersonalType
          onBack={() => setStep("choose")}
          onPick={(workoutType) => {
            if (workoutType === "cardio") setStep({ kind: "log-cardio", programId: null, workoutType });
            else setStep({ kind: "log-strength", programId: null, workoutType });
          }}
        />
      )}

      {typeof step === "object" && step.kind === "log-strength" && (
        <StrengthLogger user={user} programId={step.programId} workoutType={step.workoutType} />
      )}
      {typeof step === "object" && step.kind === "log-cardio" && (
        <CardioLogger user={user} programId={step.programId} workoutType={step.workoutType} />
      )}
    </AppShell>
  );
}

function PickAssignedProgram({ assignments, onBack, onStart }) {
  if (assignments.length === 0) {
    return (
      <div className="mt-4 card text-center">
        <div className="font-display font-bold uppercase text-brand-900 text-lg">No assigned programs</div>
        <p className="text-slate-600 mt-1 text-sm">Jared hasn't assigned a program yet. Log a personal workout instead.</p>
        <button onClick={onBack} className="btn-ghost mt-3">Back</button>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs uppercase tracking-widest font-bold text-brand-600">Pick a program</div>
      {assignments.map((a) => (
        <button
          key={a.id}
          onClick={() => onStart(a.program?.id, a.program?.type || "custom")}
          className="card w-full text-left flex items-center gap-2 hover:border-brand-600"
        >
          <div className="flex-1">
            <div className="font-display font-bold text-brand-900">{a.program?.name}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{a.program?.type}</div>
          </div>
          <IconChevronRight />
        </button>
      ))}
      <button onClick={onBack} className="btn-ghost w-full">Back</button>
    </div>
  );
}

function PickPersonalType({ onBack, onPick }) {
  const types = [
    { id: "upper", label: "Upper", icon: <IconDumbbell /> },
    { id: "lower", label: "Lower", icon: <IconDumbbell /> },
    { id: "ab", label: "Ab", icon: <IconDumbbell /> },
    { id: "cardio", label: "Cardio", icon: <IconRun /> },
    { id: "custom", label: "Custom", icon: <IconDumbbell /> },
  ];
  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs uppercase tracking-widest font-bold text-brand-600">Workout type</div>
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick(t.id)}
          className="card w-full text-left flex items-center gap-3 hover:border-brand-600"
        >
          <div className="w-10 h-10 rounded-full bg-brand-100 grid place-items-center text-brand-700">{t.icon}</div>
          <div className="font-display font-bold text-brand-900 flex-1">{t.label}</div>
          <IconChevronRight />
        </button>
      ))}
      <button onClick={onBack} className="btn-ghost w-full">Back</button>
    </div>
  );
}

function StrengthLogger({ user, programId, workoutType }) {
  const nav = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]); // [{ name, dbId, sets: [{weight, reps}] }]
  const [showPicker, setShowPicker] = useState(false);
  const [demoFor, setDemoFor] = useState(null);
  const [difficulty, setDifficulty] = useState(7);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!programId) return;
    listProgramExercises(programId).then(({ data }) => {
      // Deduplicate by exercise_name for the log UI; show one row per unique name with target_sets blank rows
      const seen = new Map();
      (data || []).forEach((e) => {
        if (!seen.has(e.exercise_name)) {
          seen.set(e.exercise_name, {
            name: e.exercise_name,
            dbId: e.exercise_db_id || null,
            sets: Array.from({ length: Math.max(1, e.target_sets || 1) }, () => ({ weight: "", reps: "" })),
          });
        } else {
          // Add more set slots if subsequent rows exist
          const existing = seen.get(e.exercise_name);
          const more = Array.from({ length: Math.max(1, e.target_sets || 1) }, () => ({ weight: "", reps: "" }));
          existing.sets = [...existing.sets, ...more];
        }
      });
      setItems(Array.from(seen.values()));
    });
  }, [programId]);

  const addExercise = (ex) => {
    setItems((list) => [...list, { name: ex.name, dbId: ex.id || null, sets: [{ weight: "", reps: "" }] }]);
    setShowPicker(false);
  };

  const addSet = (i) => {
    setItems((list) => list.map((it, idx) => idx === i ? { ...it, sets: [...it.sets, { weight: "", reps: "" }] } : it));
  };

  const removeSet = (i, j) => {
    setItems((list) => list.map((it, idx) => idx === i ? { ...it, sets: it.sets.filter((_, k) => k !== j) } : it));
  };

  const removeExercise = (i) => {
    setItems((list) => list.filter((_, idx) => idx !== i));
  };

  const updateSet = (i, j, field, value) => {
    setItems((list) =>
      list.map((it, idx) =>
        idx === i ? { ...it, sets: it.sets.map((s, k) => (k === j ? { ...s, [field]: value } : s)) } : it
      )
    );
  };

  const volumeFor = (sets) =>
    sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);

  const totalVolume = useMemo(
    () => items.reduce((sum, it) => sum + volumeFor(it.sets), 0),
    [items]
  );

  const save = async () => {
    if (items.length === 0) {
      setErr("Add at least one exercise.");
      return;
    }
    setErr("");
    setSaving(true);
    const { data: session, error } = await createSession({
      client_id: user.id,
      program_id: programId,
      session_type: programId ? "assigned" : "personal",
      workout_type: STRENGTH_TYPES.includes(workoutType) ? workoutType : "custom",
      date,
      difficulty,
      total_volume: totalVolume,
      notes: notes || null,
    });
    if (error || !session) {
      setSaving(false);
      setErr(error?.message || "Could not save.");
      return;
    }
    const rows = [];
    items.forEach((it) => {
      it.sets.forEach((s, idx) => {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        if (!w && !r) return;
        rows.push({
          session_id: session.id,
          exercise_name: it.name,
          exercise_db_id: it.dbId,
          set_number: idx + 1,
          weight: w,
          reps: r,
          volume: w * r,
          notes: null,
        });
      });
    });
    if (rows.length) await bulkInsertSets(rows);
    setSaving(false);
    nav("/client/history", { replace: true });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="card grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <div className="label">Date</div>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="col-span-2 text-xs uppercase tracking-widest font-bold text-brand-600">
          Type: {workoutType}
        </div>
      </div>

      {items.map((it, i) => {
        const vol = volumeFor(it.sets);
        return (
          <div key={i} className="card">
            <div className="flex items-center gap-2">
              <div className="font-display font-bold text-brand-900 flex-1">{it.name}</div>
              <button
                onClick={() => setDemoFor({ id: it.dbId, name: it.name })}
                className="px-3 h-10 rounded-lg text-[10px] uppercase tracking-widest font-bold text-brand-700 hover:bg-brand-50"
                aria-label={`How to do ${it.name}`}
              >
                How
              </button>
              <button onClick={() => removeExercise(i)} className="btn-danger" aria-label="Remove exercise"><IconTrash /></button>
            </div>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <div>Set</div>
                <div>Weight (lb)</div>
                <div>Reps</div>
                <div></div>
              </div>
              {it.sets.map((s, j) => (
                <div key={j} className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 items-center">
                  <div className="text-brand-900 font-bold">{j + 1}</div>
                  <input type="number" inputMode="decimal" className="input h-11" value={s.weight} onChange={(e) => updateSet(i, j, "weight", e.target.value)} />
                  <input type="number" inputMode="numeric" className="input h-11" value={s.reps} onChange={(e) => updateSet(i, j, "reps", e.target.value)} />
                  <button onClick={() => removeSet(i, j)} className="text-slate-400 hover:text-red-600 h-11 grid place-items-center" aria-label="Remove set">
                    <IconTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addSet(i)} className="btn-ghost"><IconPlus /> Add set</button>
              <div className="mt-1 text-sm text-brand-700 font-semibold">
                Exercise volume: {vol.toLocaleString()} lb
              </div>
            </div>
          </div>
        );
      })}

      <button onClick={() => setShowPicker(true)} className="btn-secondary w-full"><IconPlus /> Add exercise</button>

      <div className="card">
        <div className="text-xs uppercase tracking-widest font-bold text-brand-600">Session total</div>
        <div className="font-display font-bold text-3xl text-brand-900">{totalVolume.toLocaleString()} lb</div>
      </div>

      <div className="card space-y-3">
        <div>
          <div className="label">Difficulty (1-10)</div>
          <div className="flex items-center gap-3">
            <input type="range" min="1" max="10" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="flex-1 accent-brand-600" />
            <span className="font-display font-bold text-2xl text-brand-900 w-10 text-right">{difficulty}</span>
          </div>
        </div>
        <div>
          <div className="label">Notes</div>
          <textarea className="input min-h-[80px] py-3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
        </div>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {err}
        </div>
      )}
      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Saving" : "Save workout"}
      </button>

      {showPicker && <ExercisePicker onPick={addExercise} onClose={() => setShowPicker(false)} />}
      {demoFor && (
        <ExerciseDemo
          exerciseId={demoFor.id}
          exerciseName={demoFor.name}
          onClose={() => setDemoFor(null)}
        />
      )}
    </div>
  );
}

function CardioLogger({ user, programId }) {
  const nav = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cardioType, setCardioType] = useState("Run");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [difficulty, setDifficulty] = useState(7);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    setSaving(true);
    const { error } = await createSession({
      client_id: user.id,
      program_id: programId,
      session_type: programId ? "assigned" : "personal",
      workout_type: "cardio",
      date,
      difficulty,
      duration_minutes: Number(duration) || null,
      distance_miles: Number(distance) || null,
      notes: notes ? `${cardioType}. ${notes}` : cardioType,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    nav("/client/history", { replace: true });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="card space-y-3">
        <div>
          <div className="label">Date</div>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <div className="label">Type</div>
          <select className="input" value={cardioType} onChange={(e) => setCardioType(e.target.value)}>
            <option>Run</option>
            <option>Bike</option>
            <option>Row</option>
            <option>Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label">Duration (min)</div>
            <input type="number" inputMode="decimal" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <div className="label">Distance (mi)</div>
            <input type="number" inputMode="decimal" className="input" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="label">Difficulty (1-10)</div>
          <div className="flex items-center gap-3">
            <input type="range" min="1" max="10" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="flex-1 accent-brand-600" />
            <span className="font-display font-bold text-2xl text-brand-900 w-10 text-right">{difficulty}</span>
          </div>
        </div>
        <div>
          <div className="label">Notes</div>
          <textarea className="input min-h-[80px] py-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{err}</div>
      )}
      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Saving" : "Save workout"}
      </button>
    </div>
  );
}
