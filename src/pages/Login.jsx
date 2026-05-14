import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Wordmark } from "../components/shared/Logo";
import { supabase, envConfigured } from "../lib/supabase";

const TRAINER_EMAIL = import.meta.env.VITE_TRAINER_EMAIL || "";
const TRAINER_NAME = import.meta.env.VITE_TRAINER_NAME || "";

export default function Login() {
  const { signIn, session, profile, loading, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // Default to "no trainer yet" so the Get Started CTA shows on initial render
  // (and during the brief async check). The CTA hides only once we confirm a
  // trainer profile exists.
  const [trainerExists, setTrainerExists] = useState(false);

  useEffect(() => {
    if (!envConfigured()) return;
    (async () => {
      const { data, error } = await supabase.rpc("trainer_exists");
      if (!error && data === true) setTrainerExists(true);
    })();
  }, []);

  // If the trainer signs in but has no profile row yet (post email-confirm), create it.
  useEffect(() => {
    if (loading) return;
    if (!session?.user) return;
    if (profile) return;
    if (!TRAINER_EMAIL) return;
    if ((session.user.email || "").toLowerCase() !== TRAINER_EMAIL.toLowerCase()) return;
    (async () => {
      const { error } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, full_name: TRAINER_NAME || "Trainer", role: "trainer" });
      if (!error) await refreshProfile();
    })();
  }, [loading, session, profile, refreshProfile]);

  if (!loading && session && profile) {
    return <Navigate to={profile.role === "trainer" ? "/trainer" : "/client"} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-md mx-auto px-6 py-10">
          <div className="mb-10 text-center">
            <Wordmark className="text-5xl" />
            <p className="mt-3 text-slate-600 uppercase tracking-widest text-xs font-semibold">
              Personal training, tracked
            </p>
          </div>

          {!envConfigured() && (
            <div className="card mb-4 border-yellow-300 bg-yellow-50">
              <div className="font-display font-bold uppercase text-yellow-900">Setup needed</div>
              <p className="mt-1 text-sm text-yellow-900">
                Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.
              </p>
            </div>
          )}

          {/* First-time CTA — shown only until a trainer has been created */}
          {!trainerExists && (
            <>
              <div className="card mb-5 bg-brand-900 border-brand-900 text-center">
                <div className="text-xs uppercase tracking-widest font-bold text-brand-200">First time here?</div>
                <h2 className="font-display font-bold text-2xl text-white uppercase mt-1 leading-tight">Set up your trainer account</h2>
                <Link
                  to="/setup"
                  className="mt-4 inline-flex items-center justify-center px-5 h-12 rounded-xl bg-white text-brand-900 font-semibold uppercase tracking-wide w-full"
                >
                  Get started
                </Link>
              </div>

              <div className="flex items-center gap-3 my-5 text-xs uppercase tracking-widest font-bold text-slate-400">
                <div className="flex-1 h-px bg-brand-100" />
                <span>Or sign in</span>
                <div className="flex-1 h-px bg-brand-100" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="card space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {err && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {err}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Signing in" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              New client? <Link to="/join" className="text-brand-700 font-semibold">Open your invite link</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
