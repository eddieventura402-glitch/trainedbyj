import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { listSessions, listMetrics } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";

export default function Progress() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!user) return;
    listSessions(user.id).then(({ data }) => setSessions(data || []));
    listMetrics(user.id).then(({ data }) => setMetrics(data || []));
  }, [user]);

  const volumeData = useMemo(() =>
    [...sessions]
      .filter((s) => s.total_volume)
      .reverse()
      .map((s) => ({ date: s.date, volume: Number(s.total_volume) }))
  , [sessions]);

  const weightData = useMemo(() =>
    [...metrics]
      .filter((m) => m.bodyweight)
      .reverse()
      .map((m) => ({ date: m.date, weight: Number(m.bodyweight) }))
  , [metrics]);

  const waistData = useMemo(() =>
    [...metrics]
      .filter((m) => m.waist)
      .reverse()
      .map((m) => ({ date: m.date, waist: Number(m.waist) }))
  , [metrics]);

  const armsData = useMemo(() =>
    [...metrics]
      .filter((m) => m.arms)
      .reverse()
      .map((m) => ({ date: m.date, arms: Number(m.arms) }))
  , [metrics]);

  return (
    <AppShell>
      <PageHeader eyebrow="Stats" title="Progress" />
      <div className="mt-4 space-y-3">
        <Chart title="Volume per session" data={volumeData} dataKey="volume" />
        <Chart title="Bodyweight" data={weightData} dataKey="weight" />
        <Chart title="Waist" data={waistData} dataKey="waist" />
        <Chart title="Arms" data={armsData} dataKey="arms" />
        {volumeData.length === 0 && weightData.length === 0 && (
          <div className="card text-center text-slate-500 py-8">No data yet. Log some workouts and body metrics.</div>
        )}
      </div>
    </AppShell>
  );
}

function Chart({ title, data, dataKey }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">{title}</div>
      <div className="h-56">
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
