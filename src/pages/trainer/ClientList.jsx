import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { listClients, createInvite, getClientStats } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import EmptyState from "../../components/shared/EmptyState";
import WelcomeCard from "../../components/shared/WelcomeCard";
import { IconPlus, IconChevronRight, IconCopy, IconCheck, IconLogout } from "../../components/shared/Icons";

export default function ClientList() {
  const { user, profile, signOut } = useAuth();
  const [clients, setClients] = useState([]);
  const [statsByClient, setStatsByClient] = useState({});
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

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
    setInviteToken(data.token);
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const inviteMessage = () => {
    const first = inviteFirstName.trim() || "there";
    return `Hey ${first}, welcome to the team.

I've set you up on TrainedByJ — that's the app we'll use to track every workout, log your progress, and stay connected between sessions.

Get started in 30 seconds:

1) Open ${appUrl} on your phone
2) Tap "I have an invite code" at the bottom
3) Paste this code: ${inviteToken}
4) Set your name and password

See you soon.
- Jared`;
  };

  const copyText = async (label, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const closeInvite = () => {
    setShowInvite(false);
    setInviteToken("");
    setInviteEmail("");
    setInviteFirstName("");
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

      <WelcomeCard
        storageKey="tbj.welcome.trainer"
        eyebrow="Welcome to TrainedByJ"
        title="Your coach dashboard"
        items={[
          { title: "Invite clients", body: "Tap the + button up top. Enter their email, share the link." },
          { title: "Build programs", body: "On the Programs tab. Reusable templates or per-client plans." },
          { title: "Schedule sessions", body: "Open any client. Set their recurring days and the next meet-up." },
          { title: "Track and coach", body: "Add private notes, leave feedback on workouts, watch progress charts." },
        ]}
        footerLink={{ to: "/trainer/how-it-works", label: "How it works" }}
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={closeInvite}>
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold uppercase text-2xl text-brand-900">Invite a client</h2>

            {!inviteToken ? (
              <form onSubmit={generateInvite} className="space-y-3">
                <div>
                  <label className="label" htmlFor="invite-first">Their first name</label>
                  <input
                    id="invite-first"
                    className="input"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                  />
                  <p className="text-xs text-slate-500 mt-1">Used to personalize the message you send.</p>
                </div>
                <div>
                  <label className="label" htmlFor="invite-email">Their email</label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    className="input"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">They'll use this email to sign in.</p>
                </div>
                <button type="submit" disabled={inviteBusy} className="btn-primary w-full">
                  {inviteBusy ? "Generating" : "Generate invite"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="card bg-brand-50 border-brand-200">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-brand-700">Invite code</div>
                  <div className="font-mono text-brand-900 text-lg break-all mt-1">{inviteToken}</div>
                  <button
                    onClick={() => copyText("token", inviteToken)}
                    className="btn-ghost mt-2"
                  >
                    {copiedField === "token" ? <><IconCheck /> Copied</> : <><IconCopy /> Copy code</>}
                  </button>
                </div>

                <div className="card">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600">Ready-to-send message</div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800 font-sans leading-snug">
{inviteMessage()}
                  </pre>
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      onClick={() => copyText("message", inviteMessage())}
                      className="btn-primary w-full"
                    >
                      {copiedField === "message" ? <><IconCheck /> Copied message</> : <><IconCopy /> Copy full message</>}
                    </button>
                    <a
                      href={`sms:?body=${encodeURIComponent(inviteMessage())}`}
                      className="btn-secondary w-full"
                    >
                      Open in Messages
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Paste the message into a text or email. Your client opens {appUrl.replace(/^https?:\/\//, "")},
                  taps "I have an invite code," and pastes the code.
                </p>

                <button onClick={closeInvite} className="btn-ghost w-full">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
