import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getProgram,
  updateProgram,
  listProgramExercises,
  addProgramExercise,
  updateProgramExercise,
  deleteProgramExercise,
} from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import ExercisePicker from "../../components/shared/ExercisePicker";
import { IconPlus, IconTrash } from "../../components/shared/Icons";

const SET_TYPES = ["warmup", "heavy", "volume"];

export default function ProgramEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("upper");
  const [isTemplate, setIsTemplate] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await getProgram(id);
      setProgram(p);
      if (p) { setName(p.name); setType(p.type); setIsTemplate(!!p.is_template); }
      const { data: ex } = await listProgramExercises(id);
      setExercises(ex || []);
    })();
  }, [id]);

  const saveMeta = async () => {
    await updateProgram(id, { name, type, is_template: isTemplate });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handlePick = async (ex) => {
    const nextIndex = exercises.length;
    const { data } = await addProgramExercise({
      program_id: id,
      exercise_name: ex.name,
      exercise_db_id: ex.id || null,
      grip: null,
      set_type: "heavy",
      target_sets: 3,
      target_reps: "5-10",
      notes: null,
      order_index: nextIndex,
    });
    if (data) setExercises((list) => [...list, data]);
    setShowPicker(false);
  };

  const updateRow = async (rowId, fields) => {
    setExercises((list) => list.map((e) => (e.id === rowId ? { ...e, ...fields } : e)));
    await updateProgramExercise(rowId, fields);
  };

  const removeRow = async (rowId) => {
    setExercises((list) => list.filter((e) => e.id !== rowId));
    await deleteProgramExercise(rowId);
  };

  const move = async (rowId, dir) => {
    const idx = exercises.findIndex((e) => e.id === rowId);
    const target = idx + dir;
    if (target < 0 || target >= exercises.length) return;
    const reordered = [...exercises];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(target, 0, moved);
    setExercises(reordered);
    await Promise.all(
      reordered.map((e, i) => updateProgramExercise(e.id, { order_index: i }))
    );
  };

  if (!program) {
    return (
      <AppShell>
        <PageHeader title="Program" back />
        <div className="text-slate-500 mt-4">Loading</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Program" title={program.name} back />
      <div className="card mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="pname">Name</label>
          <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ptype">Type</label>
          <select id="ptype" className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="upper">Upper</option>
            <option value="lower">Lower</option>
            <option value="ab">Ab</option>
            <option value="cardio">Cardio</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-900">
          <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} className="w-5 h-5 accent-brand-600" />
          Reusable template
        </label>
        <div className="flex items-center gap-2">
          <button onClick={saveMeta} className="btn-primary">Save</button>
          {saved && <span className="text-sm text-brand-700 font-semibold">Saved</span>}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display font-bold uppercase text-lg text-brand-900">Exercises</h2>
        <button onClick={() => setShowPicker(true)} className="btn-primary"><IconPlus /> Add</button>
      </div>

      <div className="mt-2 space-y-3">
        {exercises.length === 0 && <div className="text-slate-500 text-sm">No exercises yet.</div>}
        {exercises.map((ex, i) => (
          <div key={ex.id} className="card space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-display font-bold text-brand-900 flex-1">{i + 1}. {ex.exercise_name}</div>
              <button onClick={() => move(ex.id, -1)} className="btn-ghost px-2" aria-label="Move up">↑</button>
              <button onClick={() => move(ex.id, 1)} className="btn-ghost px-2" aria-label="Move down">↓</button>
              <button onClick={() => removeRow(ex.id)} className="btn-danger" aria-label="Remove"><IconTrash /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="label">Grip</div>
                <input className="input" placeholder="optional" value={ex.grip || ""} onChange={(e) => updateRow(ex.id, { grip: e.target.value })} />
              </div>
              <div>
                <div className="label">Set type</div>
                <select className="input" value={ex.set_type || "heavy"} onChange={(e) => updateRow(ex.id, { set_type: e.target.value })}>
                  {SET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="label">Target sets</div>
                <input type="number" min="1" className="input" value={ex.target_sets || ""} onChange={(e) => updateRow(ex.id, { target_sets: Number(e.target.value) || null })} />
              </div>
              <div>
                <div className="label">Target reps</div>
                <input className="input" placeholder="e.g. 5-10" value={ex.target_reps || ""} onChange={(e) => updateRow(ex.id, { target_reps: e.target.value })} />
              </div>
            </div>
            <div>
              <div className="label">Notes</div>
              <input className="input" value={ex.notes || ""} onChange={(e) => updateRow(ex.id, { notes: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      {showPicker && <ExercisePicker onPick={handlePick} onClose={() => setShowPicker(false)} />}
    </AppShell>
  );
}
