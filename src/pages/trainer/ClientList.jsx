import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { listClients, createInvite, getClientStats } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import EmptyState from "../../components/shared/EmptyState";
import { IconPlus, IconChevronRight, IconCopy, IconCheck, IconLogout } from "../../components/shared/Icons";

export default function ClientList() {
  const { user, profile, signOut } = useAuth();
  const [clients, setClients] = useState([]);
  const [statsByClient, setStatsByClient] = useState({});
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await listClients(user.id);
      const list = data || [];
      setClients(list);
      const stats = {};
      await Promise.all(
        list.map(async (c) => {
          stats[c.id] = await getClientStats(c.id);
        })
      );
      setStatsByClient(stats);
      setLoading(false);
    })();
  }, [user]);

  const generateInvite = async (e) => {
    e.preventDefault();
    setInviteBusy(true);
    const { data, error } = await createInvite(inviteEmail.trim(), user.id);
    setInviteBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    const link = `${window.location.origin}/join?token=${data.token}`;
    setInviteLink(link);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Coach ${profile?.full_name?.split(" ")[0] || ""}`}
        title="Clients"
        right={
          <>
            <button
              onClick={() => setShowInvite(true)}
              className="w-10 h-10 grid place-items-center rounded-full bg-brand-600 text-white"
              aria-label="Invite client"
            >
              <IconPlus />
            </button>
            <button
              onClick={signOut}
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900"
              aria-label="Sign out"
            >
              <IconLogout />
            </button>
          </>
        }
      />
      <div className="mt-4 space-y-3">
        {loading && <div className="text-slate-500">Loading clients</div>}
        {!loading && clients.length === 0 && (
          <EmptyState
            title="No clients yet"
            body="Send your first invite to get someone tracking workouts."
            action={
              <button onClick={() => setShowInvite(true)} className="btn-primary">
                <IconPlus /> Invite a client
              </button>
            }
          />
        )}
        {clients.map((c) => {
          const s = statsByClient[c.id] || { totalSessions: 0, lastDate: null };
          return (
            <Link
              key={c.id}
              to={`/trainer/clients/${c.id}`}
              className="card flex items-center gap-3 hover:border-brand-600 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 grid place-items-center font-display font-bold text-brand-900 text-xl">
                {(c.full_name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-lg text-brand-900 truncate">{c.full_name}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {s.totalSessions} sessions · last {s.lastDate || "—"}
                </div>
              </div>
              <span className="text-brand-600"><IconChevronRight /></span>
            </Link>
          );
        })}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => { setShowInvite(false); setInviteLink(""); setInviteEmail(""); }}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold uppercase text-2xl text-brand-900">Invite a client</h2>
            {!inviteLink ? (
              <form onSubmit={generateInvite} className="space-y-3">
                <div>
                  <label className="label" htmlFor="invite-email">Client email</label>
                  <input id="invite-email" type="email" required className="input" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <button type="submit" disabled={inviteBusy} className="btn-primary w-full">
                  {inviteBusy ? "Generating" : "Generate invite link"}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">Send this link to your client. They will set up their account and connect to you automatically.</div>
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl break-all text-sm font-mono text-brand-900">
                  {inviteLink}
                </div>
                <button onClick={copyLink} className="btn-primary w-full">
                  {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy link</>}
                </button>
                <button onClick={() => { setShowInvite(false); setInviteLink(""); setInviteEmail(""); }} className="btn-ghost w-full">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
