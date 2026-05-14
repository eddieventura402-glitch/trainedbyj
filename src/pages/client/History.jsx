import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { listSessions, listSessionSets } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import EmptyState from "../../components/shared/EmptyState";
import { IconChevronRight, IconX } from "../../components/shared/Icons";

export default function History() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [sets, setSets] = useState([]);

  useEffect(() => {
    if (!user) return;
    listSessions(user.id).then(({ data }) => {
      setSessions(data || []);
      setLoading(false);
    });
  }, [user]);

  const openDetail = async (s) => {
    setOpen(s);
    const { data } = await listSessionSets(s.id);
    setSets(data || []);
  };

  return (
    <AppShell>
      <PageHeader eyebrow="Log" title="History" />
      <div className="mt-4 space-y-2">
        {loading && <div className="text-slate-500">Loading</div>}
        {!loading && sessions.length === 0 && (
          <EmptyState title="No workouts yet" body="Log your first session to start tracking." />
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => openDetail(s)}
            className="card w-full text-left flex items-center gap-2 hover:border-brand-600"
          >
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-brand-900 uppercase truncate">
                {s.workout_type || s.session_type} · {s.date}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {s.total_volume ? `${Number(s.total_volume).toLocaleString()} lb · ` : ""}
                {s.duration_minutes ? `${s.duration_minutes} min · ` : ""}
                {s.distance_miles ? `${s.distance_miles} mi · ` : ""}
                {s.difficulty ? `RPE ${s.difficulty}/10` : ""}
              </div>
            </div>
            <IconChevronRight />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setOpen(null)}>
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-brand-100 flex items-center gap-2">
              <h2 className="font-display font-bold uppercase text-xl text-brand-900 flex-1">
                {open.workout_type || open.session_type} · {open.date}
              </h2>
              <button onClick={() => setOpen(null)} aria-label="Close" className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900">
                <IconX />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {open.total_volume != null && <Stat label="Volume" value={`${Number(open.total_volume).toLocaleString()} lb`} />}
                {open.duration_minutes != null && <Stat label="Duration" value={`${open.duration_minutes} min`} />}
                {open.distance_miles != null && <Stat label="Distance" value={`${open.distance_miles} mi`} />}
                {open.difficulty != null && <Stat label="RPE" value={`${open.difficulty}/10`} />}
              </div>

              {open.notes && (
                <div className="card">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600 mb-1">Notes</div>
                  <div className="text-sm text-slate-700">{open.notes}</div>
                </div>
              )}

              {open.trainer_feedback && (
                <div className="card bg-brand-50 border-brand-200">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-brand-700 mb-1">Coach feedback</div>
                  <div className="text-sm text-brand-900">{open.trainer_feedback}</div>
                </div>
              )}

              {sets.length > 0 && (
                <div className="card">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600 mb-2">Sets</div>
                  <SetsTable sets={sets} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card py-3 text-center">
      <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600">{label}</div>
      <div className="font-display font-bold text-brand-900 text-lg">{value}</div>
    </div>
  );
}

function SetsTable({ sets }) {
  const byEx = {};
  sets.forEach((s) => {
    if (!byEx[s.exercise_name]) byEx[s.exercise_name] = [];
    byEx[s.exercise_name].push(s);
  });
  return (
    <div className="space-y-3">
      {Object.entries(byEx).map(([name, rows]) => {
        const vol = rows.reduce((sum, r) => sum + (Number(r.volume) || Number(r.weight) * Number(r.reps) || 0), 0);
        return (
          <div key={name}>
            <div className="font-semibold text-brand-900">{name}</div>
            <table className="w-full text-sm mt-1">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th>Set</th><th>Weight</th><th>Reps</th><th>Vol</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-brand-50">
                    <td className="py-1">{r.set_number}</td>
                    <td>{r.weight}</td>
                    <td>{r.reps}</td>
                    <td>{Number(r.volume || r.weight * r.reps || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs uppercase tracking-wide text-brand-700 font-semibold mt-1">Volume: {vol.toLocaleString()} lb</div>
          </div>
        );
      })}
    </div>
  );
}
