import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import {
  getProfile,
  getClientNotes,
  upsertClientNotes,
  getSchedule,
  addScheduleEntry,
  deleteScheduleEntry,
  listClientPrograms,
  listPrograms,
  assignProgram,
  unassignProgram,
  listSessions,
  updateSession,
  listMetrics,
} from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import { IconPlus, IconShare, IconTrash, IconChevronRight } from "../../components/shared/Icons";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ClientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesRow, setNotesRow] = useState(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [newDay, setNewDay] = useState("Monday");
  const [newTime, setNewTime] = useState("06:00");
  const [assignments, setAssignments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data: p } = await getProfile(id);
      setClient(p);
      const { data: n } = await getClientNotes(user.id, id);
      if (n) { setNotes(n.content || ""); setNotesRow(n); }
      const { data: sched } = await getSchedule(id);
      setSchedule(sched || []);
      const { data: cp } = await listClientPrograms(id);
      setAssignments(cp || []);
      const { data: progs } = await listPrograms(user.id, { templatesOnly: false });
      setTemplates(progs || []);
      const { data: sess } = await listSessions(id);
      setSessions(sess || []);
      const { data: m } = await listMetrics(id);
      setMetrics(m || []);
    })();
  }, [id, user]);

  const saveNotes = async () => {
    const { data } = await upsertClientNotes(user.id, id, notes, notesRow?.id);
    if (data) setNotesRow(data);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 1500);
  };

  const addDay = async () => {
    const { data } = await addScheduleEntry({
      client_id: id,
      trainer_id: user.id,
      day_of_week: newDay,
      time_of_day: newTime,
    });
    if (data) setSchedule((s) => [...s, data]);
  };

  const removeDay = async (entryId) => {
    await deleteScheduleEntry(entryId);
    setSchedule((s) => s.filter((x) => x.id !== entryId));
  };

  const shareSchedule = () => {
    if (!schedule.length || !client) return;
    const body = `Hey ${client.full_name?.split(" ")[0] || ""}, your training days with TrainedByJ: ${schedule
      .map((s) => `${s.day_of_week} ${formatTime(s.time_of_day)}`)
      .join(", ")}. See you there. - Jared`;
    const phone = (client.phone || "").replace(/[^0-9+]/g, "");
    window.open(`sms:${phone}?body=${encodeURIComponent(body)}`);
  };

  const handleAssign = async (programId) => {
    const { data } = await assignProgram(id, programId);
    if (data) {
      const { data: cp } = await listClientPrograms(id);
      setAssignments(cp || []);
    }
    setShowAssign(false);
  };

  const handleUnassign = async (assignmentId) => {
    await unassignProgram(assignmentId);
    setAssignments((a) => a.filter((x) => x.id !== assignmentId));
  };

  const saveFeedback = async (sessionId) => {
    await updateSession(sessionId, { trainer_feedback: feedbackDraft });
    setSessions((list) => list.map((s) => (s.id === sessionId ? { ...s, trainer_feedback: feedbackDraft } : s)));
    setEditingFeedback(null);
    setFeedbackDraft("");
  };

  const volumeChartData = useMemo(() =>
    [...sessions]
      .filter((s) => s.total_volume)
      .reverse()
      .map((s) => ({ date: s.date, volume: Number(s.total_volume) }))
  , [sessions]);

  const weightChartData = useMemo(() =>
    [...metrics]
      .filter((m) => m.bodyweight)
      .reverse()
      .map((m) => ({ date: m.date, weight: Number(m.bodyweight) }))
  , [metrics]);

  const waistChartData = useMemo(() =>
    [...metrics]
      .filter((m) => m.waist)
      .reverse()
      .map((m) => ({ date: m.date, waist: Number(m.waist) }))
  , [metrics]);

  if (!client) {
    return (
      <AppShell>
        <PageHeader title="Client" back />
        <div className="text-slate-500 mt-4">Loading</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Client" title={client.full_name} back />
      {client.phone && (
        <a href={`tel:${client.phone}`} className="block mt-2 text-sm text-brand-700 font-semibold">
          {client.phone}
        </a>
      )}

      {/* Notes */}
      <section className="mt-5">
        <SectionTitle>Private notes</SectionTitle>
        <div className="card">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Injuries, goals, personality, what's working"
            className="input min-h-[120px] py-3"
          />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={saveNotes} className="btn-primary">Save notes</button>
            {notesSaved && <span className="text-sm text-brand-700 font-semibold">Saved</span>}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="mt-6">
        <SectionTitle>Training schedule</SectionTitle>
        <div className="card space-y-3">
          {schedule.length === 0 && <div className="text-slate-500 text-sm">No days set.</div>}
          {schedule.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold text-brand-900">{s.day_of_week}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{formatTime(s.time_of_day)}</div>
              </div>
              <button onClick={() => removeDay(s.id)} className="btn-danger" aria-label="Remove day">
                <IconTrash />
              </button>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div>
              <div className="label">Day</div>
              <select className="input" value={newDay} onChange={(e) => setNewDay(e.target.value)}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Time</div>
              <input type="time" className="input" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>
            <button onClick={addDay} className="btn-primary" aria-label="Add">
              <IconPlus />
            </button>
          </div>
          <button onClick={shareSchedule} disabled={!schedule.length || !client.phone} className="btn-secondary w-full">
            <IconShare /> Share schedule
          </button>
        </div>
      </section>

      {/* Programs */}
      <section className="mt-6">
        <SectionTitle right={
          <button onClick={() => setShowAssign(true)} className="btn-ghost">
            <IconPlus /> Assign
          </button>
        }>Assigned programs</SectionTitle>
        <div className="space-y-2">
          {assignments.length === 0 && <div className="text-slate-500 text-sm">No programs assigned.</div>}
          {assignments.map((a) => (
            <div key={a.id} className="card flex items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold text-brand-900">{a.program?.name}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{a.program?.type}</div>
              </div>
              <button onClick={() => handleUnassign(a.id)} className="btn-danger" aria-label="Unassign">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section className="mt-6">
        <SectionTitle>Session history</SectionTitle>
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-slate-500 text-sm">No sessions yet.</div>}
          {sessions.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-brand-900 uppercase">
                    {s.workout_type || s.session_type} · {s.date}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {s.total_volume ? `${Number(s.total_volume).toLocaleString()} lbs vol · ` : ""}
                    {s.difficulty ? `RPE ${s.difficulty}/10` : ""}
                  </div>
                  {s.notes && <div className="mt-1 text-sm text-slate-700">{s.notes}</div>}
                </div>
              </div>
              {editingFeedback === s.id ? (
                <div className="mt-3 space-y-2">
                  <textarea className="input min-h-[80px] py-3" value={feedbackDraft} onChange={(e) => setFeedbackDraft(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => saveFeedback(s.id)} className="btn-primary flex-1">Save</button>
                    <button onClick={() => setEditingFeedback(null)} className="btn-ghost">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {s.trainer_feedback && (
                    <div className="mt-3 p-3 bg-brand-50 border border-brand-100 rounded-lg text-sm text-brand-900">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600 mb-1">Coach feedback</div>
                      {s.trainer_feedback}
                    </div>
                  )}
                  <button
                    onClick={() => { setEditingFeedback(s.id); setFeedbackDraft(s.trainer_feedback || ""); }}
                    className="btn-ghost mt-2"
                  >
                    {s.trainer_feedback ? "Edit feedback" : "Add feedback"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="mt-6">
        <SectionTitle>Body metrics</SectionTitle>
        <div className="card">
          {metrics.length === 0 && <div className="text-slate-500 text-sm">No measurements logged.</div>}
          {metrics.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Date</th>
                  <th>Weight</th>
                  <th>Waist</th>
                  <th>Arms</th>
                  <th>BF%</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-t border-brand-50">
                    <td className="py-2 font-semibold text-brand-900">{m.date}</td>
                    <td>{m.bodyweight || "—"}</td>
                    <td>{m.waist || "—"}</td>
                    <td>{m.arms || "—"}</td>
                    <td>{m.body_fat_pct || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Charts */}
      <section className="mt-6">
        <SectionTitle>Progress</SectionTitle>
        <Chart title="Total volume per session" data={volumeChartData} dataKey="volume" />
        <Chart title="Bodyweight" data={weightChartData} dataKey="weight" />
        <Chart title="Waist" data={waistChartData} dataKey="waist" />
      </section>

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setShowAssign(false)}>
          <div className="bg-white w-full max-w-md max-h-[80dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold uppercase text-xl text-brand-900 mb-3">Assign a program</h2>
            <div className="space-y-2">
              {templates.length === 0 && (
                <div className="text-slate-500 text-sm">
                  No programs yet. <Link to="/trainer/programs" className="text-brand-700 font-semibold">Create one</Link>.
                </div>
              )}
              {templates.map((p) => (
                <button key={p.id} onClick={() => handleAssign(p.id)} className="w-full text-left card hover:border-brand-600 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-brand-900">{p.name}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">{p.type}{p.is_template ? " · template" : ""}</div>
                  </div>
                  <IconChevronRight />
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(false)} className="btn-ghost w-full mt-3">Cancel</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SectionTitle({ children, right = null }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="font-display font-bold uppercase text-lg text-brand-900 tracking-wide">{children}</h2>
      {right}
    </div>
  );
}

function Chart({ title, data, dataKey }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card mt-3">
      <div className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">{title}</div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -16, right: 6, top: 6, bottom: 0 }}>
            <CartesianGrid stroke="#dcfce7" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#475569" fontSize={11} />
            <YAxis stroke="#475569" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#dcfce7" }} />
            <Line type="monotone" dataKey={dataKey} stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, stroke: "#16a34a", fill: "#fff" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatTime(t) {
  if (!t) return "";
  // accept "06:00" or "06:00:00"
  const [h, m] = t.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "pm" : "am";
  const display = ((hour + 11) % 12) + 1;
  return `${display}:${m} ${ampm}`;
}
