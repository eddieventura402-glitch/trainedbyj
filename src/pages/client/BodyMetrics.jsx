import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { listMetrics, addMetric, deleteMetric } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import { IconPlus, IconTrash } from "../../components/shared/Icons";

export default function BodyMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [arms, setArms] = useState("");
  const [bf, setBf] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await listMetrics(user.id);
    setMetrics(data || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const row = {
      client_id: user.id,
      date,
      bodyweight: Number(weight) || null,
      waist: Number(waist) || null,
      arms: Number(arms) || null,
      body_fat_pct: Number(bf) || null,
    };
    await addMetric(row);
    setWeight(""); setWaist(""); setArms(""); setBf("");
    await load();
    setBusy(false);
  };

  const remove = async (id) => {
    await deleteMetric(id);
    setMetrics((m) => m.filter((x) => x.id !== id));
  };

  return (
    <AppShell>
      <PageHeader eyebrow="Track" title="Body" />
      <div className="card mt-4 space-y-3">
        <div>
          <div className="label">Date</div>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label">Bodyweight (lb)</div>
            <input type="number" inputMode="decimal" className="input" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <div className="label">Waist (in)</div>
            <input type="number" inputMode="decimal" className="input" value={waist} onChange={(e) => setWaist(e.target.value)} />
          </div>
          <div>
            <div className="label">Arms (in)</div>
            <input type="number" inputMode="decimal" className="input" value={arms} onChange={(e) => setArms(e.target.value)} />
          </div>
          <div>
            <div className="label">Body fat %</div>
            <input type="number" inputMode="decimal" className="input" value={bf} onChange={(e) => setBf(e.target.value)} />
          </div>
        </div>
        <button onClick={save} disabled={busy} className="btn-primary w-full">
          <IconPlus /> {busy ? "Saving" : "Log entry"}
        </button>
      </div>

      <h2 className="font-display font-bold uppercase text-lg text-brand-900 mt-6 mb-2">History</h2>
      <div className="card">
        {metrics.length === 0 ? (
          <div className="text-slate-500 text-sm">No entries yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2">Date</th>
                <th>Wt</th>
                <th>Waist</th>
                <th>Arms</th>
                <th>BF%</th>
                <th></th>
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
                  <td>
                    <button onClick={() => remove(m.id)} className="text-slate-400 hover:text-red-600" aria-label="Delete entry">
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
