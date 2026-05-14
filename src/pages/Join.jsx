import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Wordmark } from "../components/shared/Logo";
import { getInviteByToken, markInviteUsed } from "../lib/data";

export default function Join() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const tokenFromUrl = params.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [invite, setInvite] = useState(null);
  const [checking, setChecking] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (tokenFromUrl) checkToken(tokenFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  const checkToken = async (t) => {
    setErr("");
    setChecking(true);
    const { data, error } = await getInviteByToken(t.trim());
    setChecking(false);
    if (error || !data) {
      setErr("Invite not found.");
      setInvite(null);
      return;
    }
    if (data.used) {
      setErr("This invite has already been used.");
      setInvite(null);
      return;
    }
    setInvite(data);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!invite) return;
    setErr("");
    setBusy(true);
    const { data: signUp, error: signErr } = await supabase.auth.signUp({
      email: invite.email,
      password,
    });
    if (signErr || !signUp?.user) {
      setBusy(false);
      setErr(signErr?.message || "Could not create account.");
      return;
    }
    const userId = signUp.user.id;
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        phone,
        role: "client",
        trainer_id: invite.trainer_id,
      });
    if (profileErr) {
      setBusy(false);
      setErr(profileErr.message);
      return;
    }
    await markInviteUsed(invite.id);
    setBusy(false);
    nav("/client", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-md mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <Wordmark className="text-4xl" />
          <p className="mt-2 text-slate-600 uppercase tracking-widest text-xs font-semibold">
            Set up your account
          </p>
        </div>

        {!invite && (
          <div className="card space-y-4">
            <div>
              <label className="label" htmlFor="token">Invite token</label>
              <input
                id="token"
                className="input"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your token"
              />
            </div>
            {err && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {err}
              </div>
            )}
            <button
              onClick={() => checkToken(token)}
              disabled={!token || checking}
              className="btn-primary w-full"
            >
              {checking ? "Checking" : "Continue"}
            </button>
            <p className="text-center text-sm text-slate-500">
              <Link to="/login" className="text-brand-700 font-semibold">Already have an account? Sign in</Link>
            </p>
          </div>
        )}

        {invite && (
          <form onSubmit={submit} className="card space-y-4">
            <div className="text-sm text-slate-600">
              Invite for <span className="font-semibold text-brand-900">{invite.email}</span>
            </div>
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" type="tel" required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="pwd">Password</label>
              <input id="pwd" type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {err}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Creating account" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
