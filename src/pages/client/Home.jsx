import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getSchedule, listClientPrograms, getClientStats } from "../../lib/data";
import AppShell from "../../components/shared/AppShell";
import PageHeader from "../../components/shared/PageHeader";
import WelcomeCard from "../../components/shared/WelcomeCard";
import { IconPlus, IconLogout } from "../../components/shared/Icons";

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Home() {
  const { user, profile, signOut } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalVolume: 0, lastDate: null });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sched } = await getSchedule(user.id);
      setSchedule(sched || []);
      const { data: cp } = await listClientPrograms(user.id);
      setAssignments(cp || []);
      setStats(await getClientStats(user.id));
    })();
  }, [user]);

  const today = DAY_ORDER[new Date().getDay()];
  const todaySchedule = schedule.find((s) => s.day_of_week === today);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Welcome"
        title={`Hey ${profile?.full_name?.split(" ")[0] || ""}`}
        right={
          <button onClick={signOut} className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900" aria-label="Sign out">
            <IconLogout />
          </button>
        }
      />

      <WelcomeCard
        storageKey="tbj.welcome.client"
        eyebrow="Welcome aboard"
        title="Start training with Jared"
        items={[
          { title: "Log every workout", body: "Tap Log to record strength sets or cardio. Volume calculates as you go." },
          { title: "Watch the demos", body: "Tap How on any exercise to see a GIF and step-by-step instructions." },
          { title: "Track your body", body: "Body tab logs weight, waist, arms, and body fat over time." },
          { title: "See your progress", body: "Stats tab charts your volume and measurements. Coach feedback lives on each session." },
        ]}
        footerLink={{ to: "/client/how-it-works", label: "How it works" }}
      />

      {/* Next session (set by Jared) */}
      {profile?.next_session_at && (
        <section className="mt-4">
          <div className="card bg-brand-900 text-white border-brand-900">
            <div className="text-xs uppercase tracking-widest font-bold text-brand-200">Next session with Jared</div>
            <div className="font-display font-bold text-3xl uppercase mt-1 leading-tight">
              {new Date(profile.next_session_at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div className="mt-1 text-brand-100 text-lg">
              {new Date(profile.next_session_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              {profile.next_session_location && <> · {profile.next_session_location}</>}
            </div>
            <Link to="/client/log" className="mt-4 inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-white text-brand-900 font-semibold uppercase tracking-wide">
              <IconPlus /> Start workout
            </Link>
          </div>
        </section>
      )}

      {/* Today */}
      {!profile?.next_session_at && (
        <section className="mt-4">
          <div className="card bg-brand-900 text-white border-brand-900">
            <div className="text-xs uppercase tracking-widest font-bold text-brand-200">Today</div>
            <div className="font-display font-bold text-3xl uppercase mt-1">{today}</div>
            {todaySchedule ? (
              <div className="mt-1 text-brand-100">Training at {formatTime(todaySchedule.time_of_day)}</div>
            ) : (
              <div className="mt-1 text-brand-100">No session scheduled.</div>
            )}
            <Link to="/client/log" className="mt-4 inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-white text-brand-900 font-semibold uppercase tracking-wide">
              <IconPlus /> Start workout
            </Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Sessions" value={stats.totalSessions} />
        <Stat label="Volume" value={`${Math.round(stats.totalVolume).toLocaleString()}`} unit="lb" />
        <Stat label="Last" value={stats.lastDate || "—"} small />
      </section>

      {/* Week schedule */}
      <section className="mt-6">
        <h2 className="font-display font-bold uppercase text-lg text-brand-900 mb-2">Your week</h2>
        <div className="card">
          {schedule.length === 0 ? (
            <div className="text-slate-500 text-sm">Jared hasn't set your schedule yet.</div>
          ) : (
            <ul className="divide-y divide-brand-50">
              {schedule.map((s) => (
                <li key={s.id} className="py-2 flex items-center">
                  <span className="font-semibold text-brand-900 flex-1">{s.day_of_week}</span>
                  <span className="text-slate-600">{formatTime(s.time_of_day)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Assigned programs */}
      <section className="mt-6">
        <h2 className="font-display font-bold uppercase text-lg text-brand-900 mb-2">Your programs</h2>
        <div className="space-y-2">
          {assignments.length === 0 && <div className="text-slate-500 text-sm">No programs assigned yet.</div>}
          {assignments.map((a) => (
            <div key={a.id} className="card">
              <div className="font-display font-bold text-brand-900">{a.program?.name}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{a.program?.type}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, unit, small = false }) {
  return (
    <div className="card text-center py-4">
      <div className="text-[10px] uppercase tracking-widest font-bold text-brand-600">{label}</div>
      <div className={`font-display font-bold ${small ? "text-base" : "text-2xl"} text-brand-900 leading-tight mt-1`}>
        {value}{unit && <span className="text-xs ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "pm" : "am";
  const display = ((hour + 11) % 12) + 1;
  return `${display}:${m} ${ampm}`;
}
