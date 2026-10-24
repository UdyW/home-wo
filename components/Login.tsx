"use client";
// Login screen: email and password. Accounts are created by the app owner in Supabase
// (invite only), so this screen never creates one.
import { useState, type FormEvent, type ReactNode } from "react";
import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="top"><h1>Home gym log</h1></header>
      <main>
        <h2 className="section">Sign in</h2>
        {children}
      </main>
    </>
  );
}

function signInError(e: AuthError): string {
  if (isAuthRetryableFetchError(e)) return "No connection. Check your internet, then try again.";
  if (e.status === 429) return "Too many tries. Wait a minute, then try again.";
  if (e.code === "invalid_credentials") return "Wrong email or password. Check them and try again.";
  return "Couldn't sign in (" + e.message + "). Try again in a moment.";
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!supabase) {
    return (
      <Shell>
        <p className="empty">Login isn&rsquo;t set up yet. Add the Supabase settings listed in .env.example, then rebuild the app.</p>
      </Shell>
    );
  }
  const auth = supabase.auth;

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(signInError(error));
    // On success the gate sees the new login and opens the app.
  }

  async function forgot() {
    if (!email.trim()) { setMessage("Type your email first, then tap Forgot password."); return; }
    setBusy(true);
    const { error } = await auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin });
    setBusy(false);
    setMessage(error
      ? signInError(error)
      : "If that email has an account, we sent a link. Tap it to sign in, then change your password in Edit plan.");
  }

  return (
    <Shell>
      <form onSubmit={signIn}>
        <div className="card">
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button className="btn primary large" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <button type="button" className="btn plain" disabled={busy} onClick={forgot}>Forgot password</button>
        </div>
      </form>
      {message && <p role="alert">{message}</p>}
      <p className="empty">Accounts are invite only. Ask the app owner if you need one.</p>
    </Shell>
  );
}
