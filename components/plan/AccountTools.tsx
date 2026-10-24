"use client";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export function AccountTools() {
  const { user, signOut } = useAuth();
  const { legacy, moveLegacy } = useStore();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast("Couldn't change the password (" + error.message + "). Check your connection and try again.");
    else { setPassword(""); toast("Password changed."); }
  }

  async function move() {
    if (!confirm("Move this device's data from before accounts into your account? Your plan is replaced by it; its sessions are added.")) return;
    try {
      await moveLegacy();
      toast("Moved into your account");
    } catch {
      toast("Couldn't move the data. Check there's free space on this device and try again.");
    }
  }

  return (
    <>
      <h2 className="section">Account</h2>
      <p className="empty">Signed in as {user.email}. Your plan and history sync to your account when you&rsquo;re online.</p>
      <form onSubmit={changePassword}>
        <div className="card">
          <label className="field">
            <span>New password (at least 8 characters)</span>
            <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button className="btn" disabled={busy}>Change password</button>
          <button type="button" className="btn" onClick={signOut}>Sign out</button>
          {legacy && legacy.choice !== "moved" && (
            <button type="button" className="btn" onClick={move}>Move this device&rsquo;s old data into my account</button>
          )}
        </div>
      </form>
    </>
  );
}
