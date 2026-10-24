"use client";
// Offered once per account on a device that has data from before accounts.
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { fmtDate } from "@/lib/plan";
import { useStore } from "@/lib/store";

export function LegacyPrompt() {
  const { legacy, moveLegacy, skipLegacy } = useStore();
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!legacy) return null;

  const move = async () => {
    setBusy(true);
    try {
      await moveLegacy();
      toast("Moved into your account");
    } catch {
      setBusy(false);
      toast("Couldn't move the data. Check there's free space on this device and try again.");
    }
  };

  return (
    <>
      <h2 className="section">Your data from before accounts</h2>
      <div className="card">
        <p>
          This device has a plan with {legacy.days} {legacy.days === 1 ? "day" : "days"} and {legacy.sessions} saved{" "}
          {legacy.sessions === 1 ? "session" : "sessions"}{legacy.last ? ", the latest on " + fmtDate(legacy.last) : ""}.
        </p>
        <p>
          Move it into the account for <b>{user.email}</b>? The plan in your account is replaced by this one, and the
          saved sessions are added. The copy on this device stays as it is.
        </p>
      </div>
      <div className="actions">
        <button className="btn primary large" disabled={busy} onClick={move}>Move it into my account</button>
        <button className="btn plain" disabled={busy} onClick={skipLegacy}>Skip, it isn&rsquo;t mine</button>
      </div>
      <p className="empty">You can move it later from Edit plan, under Account.</p>
    </>
  );
}
