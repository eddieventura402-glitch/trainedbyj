import { useEffect, useMemo, useState } from "react";
import { loadExercises, imageUrl } from "../../lib/exercises";
import ExerciseDemo from "./ExerciseDemo";
import { IconSearch, IconX, IconPlus } from "./Icons";

export default function ExercisePicker({ onPick, onClose, allowCustom = true }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  const [demoFor, setDemoFor] = useState(null);

  useEffect(() => {
    loadExercises().then((data) => {
      setList(data);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const source = list;
    if (!term) return source.slice(0, 60);
    return source
      .filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          e.target?.toLowerCase().includes(term) ||
          e.equipment?.toLowerCase().includes(term) ||
          e.body_part?.toLowerCase().includes(term)
      )
      .slice(0, 100);
  }, [q, list]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md max-h-[90dvh] rounded-t-3xl sm:rounded-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand-100 flex items-center gap-2">
          <h2 className="font-display font-bold uppercase text-xl text-brand-900 flex-1">Pick Exercise</h2>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900">
            <IconX />
          </button>
        </div>
        <div className="p-4 pb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IconSearch /></span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, muscle, equipment"
              className="input pl-10"
              type="search"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading && <div className="text-center text-slate-500 py-8">Loading exercises</div>}
          {!loading && results.map((e) => (
            <div key={e.id} className="flex items-stretch gap-2 border border-brand-100 rounded-xl overflow-hidden hover:border-brand-600 transition-colors">
              <button
                onClick={() => setDemoFor(e)}
                aria-label={`Demo ${e.name}`}
                className="shrink-0 w-16 h-16 bg-slate-50 grid place-items-center overflow-hidden"
              >
                {imageUrl(e) ? (
                  <img src={imageUrl(e)} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-slate-300 text-xs">no img</span>
                )}
              </button>
              <button
                onClick={() => onPick({ id: e.id, name: e.name })}
                className="flex-1 text-left p-2.5 hover:bg-brand-50"
              >
                <div className="font-semibold text-brand-900 leading-tight">{e.name}</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mt-0.5">
                  {e.target} · {e.equipment}
                </div>
              </button>
              <button
                onClick={() => setDemoFor(e)}
                className="px-3 text-[10px] uppercase tracking-widest font-bold text-brand-700 hover:bg-brand-50"
                aria-label={`How to do ${e.name}`}
              >
                How
              </button>
            </div>
          ))}
          {!loading && results.length === 0 && (
            <div className="text-center text-slate-500 py-8">No matches.</div>
          )}
        </div>
        {allowCustom && (
          <div className="p-4 border-t border-brand-100 bg-brand-50">
            <div className="label">Or add custom exercise</div>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Exercise name"
                className="input flex-1"
              />
              <button
                disabled={!custom.trim()}
                onClick={() => {
                  onPick({ id: null, name: custom.trim() });
                  setCustom("");
                }}
                className="btn-primary px-4"
                aria-label="Add custom exercise"
              >
                <IconPlus />
              </button>
            </div>
          </div>
        )}
      </div>

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
