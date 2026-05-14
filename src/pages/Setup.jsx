import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase, envConfigured } from "../lib/supabase";
import { Wordmark } from "../components/shared/Logo";

const TRAINER_EMAIL = import.meta.env.VITE_TRAINER_EMAIL || "";
const TRAINER_NAME = import.meta.env.VITE_TRAINER_NAME || "";

export default function Setup() {
  const nav = useNavigate();
  const [name, setName] = useState(TRAINER_NAME);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [checking, setChecking] = useState(true);
  const [trainerAlreadyExists, setTrainerAlreadyExists] = useState(false);

  useEffect(() => {
    if (!envConfigured()) {
      setChecking(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("trainer_exists");
      // If the RPC doesn't exist yet (migration not run), don't block setup —
      // fall through so the trainer can still get started.
      if (!error && data === true) setTrainerAlreadyExists(true);
      setChecking(false);
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!TRAINER_EMAIL) {
      setErr("VITE_TRAINER_EMAIL is not set in .env.");
      return;
    }
    setBusy(true);

    const { data: signUp, error: signErr } = await supabase.auth.signUp({
      email: TRAINER_EMAIL,
      password,
    });

    if (signErr) {
      setBusy(false);
      if (/already/i.test(signErr.message)) {
        setErr("This email already has an account. Sign in instead.");
      } else {
        setErr(signErr.message);
      }
      return;
    }

    // If email confirmation is enabled in Supabase, session will be null here.
    // Profile insert requires auth.uid() to match, so it can only be done after sign-in.
    if (!signUp.session) {
      setBusy(false);
      setNeedsConfirm(true);
      return;
    }

    const userId = signUp.user.id;
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: name.trim() || TRAINER_NAME,
        role: "trainer",
      });

    setBusy(false);
    if (profileErr) {
      setErr(profileErr.message);
      return;
    }
    nav("/trainer", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-dvh grid place-items-center bg-white text-brand-900 font-display text-2xl uppercase tracking-wide">
        Loading
      </div>
    );
  }

  if (trainerAlreadyExists) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-md mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <Wordmark className="text-4xl" />
          <p className="mt-2 text-slate-600 uppercase tracking-widest text-xs font-semibold">
            Trainer setup
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

        {needsConfirm ? (
          <div className="card space-y-3">
            <h2 className="font-display font-bold uppercase text-xl text-brand-900">Check your email</h2>
            <p className="text-sm text-slate-700">
              Supabase sent a confirmation link to <span className="font-semibold">{TRAINER_EMAIL}</span>.
              Click it, then come back to <Link to="/login" className="text-brand-700 font-semibold">sign in</Link>.
              Your trainer profile will be created automatically on first login.
            </p>
            <p className="text-xs text-slate-500">
              To skip this step, disable "Confirm email" in your Supabase project's Authentication settings.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4">
            <div>
              <div className="label">Email</div>
              <input
                className="input bg-brand-50 text-slate-700"
                value={TRAINER_EMAIL}
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">Set via VITE_TRAINER_EMAIL in .env.</p>
            </div>
            <div>
              <label className="label" htmlFor="name">Your name</label>
              <input
                id="name"
                required
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="pwd">Choose a password</label>
              <input
                id="pwd"
                type="password"
                required
                minLength={8}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">At least 8 characters.</p>
            </div>
            {err && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {err}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Creating account" : "Create trainer account"}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already set up? <Link to="/login" className="text-brand-700 font-semibold">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
