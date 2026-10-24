"use client";
// Who is signed in. Logged-out visitors see only the login screen. The last signed-in user is
// remembered on this device so the app still opens offline, when the login can't be refreshed.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAuthRetryableFetchError, type Session } from "@supabase/supabase-js";
import { Login } from "@/components/Login";
import { supabase } from "./supabase";

export interface User { id: string; email: string }

interface Auth {
  user: User;
  signOut(): Promise<void>;
}

const AuthContext = createContext<Auth | null>(null);
const LAST_USER_KEY = "homegym-user";

export function useAuth(): Auth {
  const a = useContext(AuthContext);
  if (!a) throw new Error("useAuth must be used inside <AuthGate>");
  return a;
}

const toUser = (s: Session | null): User | null => (s ? { id: s.user.id, email: s.user.email || "" } : null);

function remember(u: User | null) {
  try {
    if (u) localStorage.setItem(LAST_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(LAST_USER_KEY);
  } catch {
    /* storage blocked: offline opening just won't work */
  }
}

function lastUser(): User | null {
  try {
    const u = JSON.parse(localStorage.getItem(LAST_USER_KEY) || "null");
    return u && typeof u.id === "string" ? u : null;
  } catch {
    return null;
  }
}

/** Shows the login screen until someone is signed in, then the app. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking

  useEffect(() => {
    if (!supabase) { setUser(null); return; }
    let live = true;
    // Keep the same object while the same person is signed in, so the app doesn't reload.
    const show = (u: User | null) => {
      remember(u);
      setUser((cur) => (cur && u && cur.id === u.id ? cur : u));
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (!live) return;
      const offline = isAuthRetryableFetchError(error) || !navigator.onLine;
      show(toUser(data.session) || (offline ? lastUser() : null));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Includes signing in from a password-reset link (PASSWORD_RECOVERY).
      if (event === "SIGNED_OUT") show(null);
      else if (session) show(toUser(session));
    });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, []);

  const auth = useMemo<Auth | null>(() => user ? {
    user,
    async signOut() {
      // "local" signs out this device only, and works without a connection.
      await supabase?.auth.signOut({ scope: "local" });
      remember(null);
      setUser(null);
    },
  } : null, [user]);

  if (user === undefined) return null;
  if (!auth) return <Login />;
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
