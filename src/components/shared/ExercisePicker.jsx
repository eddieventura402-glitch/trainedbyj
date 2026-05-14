import { useMemo, useState } from "react";
import exercises from "../../data/exercises.json";
import { IconSearch, IconX, IconPlus } from "./Icons";

export default function ExercisePicker({ onPick, onClose, allowCustom = true }) {
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return exercises.slice(0, 60);
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.target.toLowerCase().includes(term) ||
        e.equipment.toLowerCase().includes(term) ||
        e.bodyPart.toLowerCase().includes(term)
    );
  }, [q]);

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
        <div className="p-4">
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
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => onPick({ id: e.id, name: e.name })}
              className="w-full text-left p-3 rounded-xl border border-brand-100 hover:border-brand-600 hover:bg-brand-50 transition-colors"
            >
              <div className="font-semibold text-brand-900">{e.name}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {e.target} · {e.equipment} · {e.bodyPart}
              </div>
            </button>
          ))}
          {results.length === 0 && (
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
    </div>
  );
}
