import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { listPrograms, createProgram, deleteProgram } from "../../lib/data";
import { seedTemplatesIfMissing } from "../../lib/seed";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import EmptyState from "../../components/shared/EmptyState";
import { IconPlus, IconChevronRight, IconTrash } from "../../components/shared/Icons";

export default function Programs() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("upper");
  const [isTemplate, setIsTemplate] = useState(true);

  const load = async () => {
    const { data } = await listPrograms(user.id);
    setPrograms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      await seedTemplatesIfMissing(user.id);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await createProgram({
      trainer_id: user.id,
      name,
      type,
      is_template: isTemplate,
    });
    if (data) {
      setShowCreate(false);
      setName("");
      setType("upper");
      setIsTemplate(true);
      load();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this program? Existing assignments to clients stay but the program will be gone.")) return;
    await deleteProgram(id);
    load();
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Library"
        title="Programs"
        right={
          <button onClick={() => setShowCreate(true)} className="w-10 h-10 grid place-items-center rounded-full bg-brand-600 text-white" aria-label="New program">
            <IconPlus />
          </button>
        }
      />
      <div className="mt-4 space-y-3">
        {loading && <div className="text-slate-500">Loading</div>}
        {!loading && programs.length === 0 && (
          <EmptyState
            title="No programs yet"
            body="Create your first program or template."
            action={<button onClick={() => setShowCreate(true)} className="btn-primary"><IconPlus /> New program</button>}
          />
        )}
        {programs.map((p) => (
          <div key={p.id} className="card flex items-center gap-3">
            <Link to={`/trainer/programs/${p.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-display font-bold text-brand-900 truncate">{p.name}</div>
                {p.is_template && <span className="chip">Template</span>}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{p.type}</div>
            </Link>
            <button onClick={() => handleDelete(p.id)} className="btn-danger" aria-label="Delete program"><IconTrash /></button>
            <Link to={`/trainer/programs/${p.id}`} className="text-brand-600"><IconChevronRight /></Link>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold uppercase text-2xl text-brand-900 mb-3">New program</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="type">Type</label>
                <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="upper">Upper</option>
                  <option value="lower">Lower</option>
                  <option value="ab">Ab</option>
                  <option value="cardio">Cardio</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} className="w-5 h-5 accent-brand-600" />
                Save as reusable template
              </label>
              <button type="submit" className="btn-primary w-full">Create program</button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
