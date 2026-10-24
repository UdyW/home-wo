"use client";
// App state for the signed-in user: loaded once from their database on this device, kept in React
// state, and written back on every change. Pages read from here synchronously, so inputs never lag
// or lose focus. Changes are then sent to the account in the background (lib/sync.ts).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "./auth";
import { DEFAULT_WORKOUTS } from "./defaultPlan";
import {
  addSession, clone, deleteDraft, deleteSession, legacyChoice, mergeLegacy, putDraft, putWorkout, readAll,
  readLegacy, replaceAll, saveWorkouts, skipLegacy, UserDB, type AppData,
} from "./db";
import { isToday, newestFirst, uid } from "./plan";
import { OfflineError, openAccount, pull, push } from "./sync";
import type { Backup, Draft, Session, Workout } from "./types";

/** Data saved on this device before accounts, offered once for moving into the account. */
export interface Legacy {
  days: number;
  sessions: number;
  last: string | null;
  choice: string | null; // "moved", "skipped" or null (not asked yet)
}

interface Store {
  data: AppData;
  /** Sessions sorted newest first. */
  sessions: Session[];
  today: number;
  /** The workout day picked in the day bar. */
  workout: Workout;
  legacy: Legacy | null;
  selectDay(id: string): void;
  saveDraft(d: Draft): void;
  clearDraft(workoutId: string): void;
  finishSession(w: Workout, d: Draft): void;
  deleteSession(id: string): void;
  /** Saves changes to one existing workout (fields, exercises). */
  updateWorkout(w: Workout): void;
  /** Saves the whole list of days (adding or deleting a day). */
  setWorkouts(ws: Workout[], selectId?: string): void;
  restorePlan(): void;
  importBackup(b: Backup): Promise<void>;
  moveLegacy(): Promise<void>;
  skipLegacy(): void;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used inside <WhenLoaded>");
  return s;
}

export function useStoreIfLoaded(): Store | null {
  return useContext(StoreContext);
}

function summarise(b: Backup, choice: string | null): Legacy {
  const sessions = b.sessions || [];
  return {
    days: b.workouts.length,
    sessions: sessions.length,
    last: newestFirst(sessions)[0]?.date || null,
    choice,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { user } = useAuth();
  const db = useMemo(() => new UserDB(user.id), [user.id]);
  const [data, setData] = useState<AppData | null>(null);
  const [failed, setFailed] = useState<"storage" | "offline" | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [today, setToday] = useState(0);
  const [legacy, setLegacy] = useState<{ backup: Backup; info: Legacy } | null>(null);
  const ref = useRef<AppData | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const commit = useCallback((next: AppData) => {
    ref.current = next;
    setData(next);
  }, []);

  /** Sends changes, then fetches any made on other devices. */
  const sync = useCallback(async () => {
    await push(db, user.id);
    if (await pull(db, user.id)) commit(await readAll(db));
  }, [db, user.id, commit]);

  useEffect(() => {
    let live = true;
    openAccount(db, user.id)
      .then(async (d) => {
        const old = await readLegacy().catch(() => null);
        const choice = old ? await legacyChoice(db) : null;
        if (!live) return;
        const day = new Date().getDay();
        commit(d);
        setToday(day);
        setSelectedId((d.workouts.find((w) => isToday(w, day)) || d.workouts[0]).id);
        setLegacy(old ? { backup: old, info: summarise(old, choice) } : null);
        sync();
      })
      .catch((e) => live && setFailed(e instanceof OfflineError ? "offline" : "storage"));

    const onVisible = () => { if (document.visibilityState === "visible") sync(); };
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live = false;
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(pushTimer.current);
    };
  }, [db, user.id, commit, sync]);

  // Saves on the device, then sends to the account a moment later (typing makes many small changes).
  const persist = useCallback(
    (p: Promise<unknown>) => p
      .then(() => {
        clearTimeout(pushTimer.current);
        pushTimer.current = setTimeout(() => push(db, user.id), 1500);
      })
      .catch(() => toast("Couldn't save on this device. Export a backup from Edit plan.")),
    [db, user.id, toast],
  );

  const store = useMemo<Store | null>(() => {
    if (!data) return null;
    const cur = () => ref.current as AppData;
    const workout = data.workouts.find((w) => w.id === selectedId) || data.workouts[0];

    const setWorkouts = (ws: Workout[], selectId?: string) => {
      commit({ ...cur(), workouts: ws });
      if (selectId) setSelectedId(selectId);
      persist(saveWorkouts(db, ws));
    };

    return {
      data,
      sessions: newestFirst(data.sessions),
      today,
      workout,
      legacy: legacy?.info || null,
      selectDay: setSelectedId,

      saveDraft(d) {
        commit({ ...cur(), drafts: { ...cur().drafts, [d.workoutId]: d } });
        persist(putDraft(db, d));
      },

      clearDraft(workoutId) {
        const drafts = { ...cur().drafts };
        delete drafts[workoutId];
        commit({ ...cur(), drafts });
        persist(deleteDraft(db, workoutId));
      },

      finishSession(w, d) {
        const names = Object.fromEntries(w.exercises.map((x) => [x.id, x.name]));
        const session: Session = {
          id: uid(), workoutId: w.id, title: w.dayLabel + " " + w.title, date: new Date().toISOString(),
          entries: clone(d.entries), names, notes: d.notes,
        };
        const drafts = { ...cur().drafts };
        delete drafts[w.id];
        commit({ ...cur(), sessions: [...cur().sessions, session], drafts });
        persist(addSession(db, session));
      },

      deleteSession(id) {
        commit({ ...cur(), sessions: cur().sessions.filter((s) => s.id !== id) });
        persist(deleteSession(db, id));
      },

      updateWorkout(w) {
        const ws = cur().workouts;
        const order = ws.findIndex((x) => x.id === w.id);
        commit({ ...cur(), workouts: ws.map((x) => (x.id === w.id ? w : x)) });
        persist(putWorkout(db, w, order));
      },

      setWorkouts,

      restorePlan() {
        const ws = clone(DEFAULT_WORKOUTS);
        commit({ ...cur(), workouts: ws, drafts: {} });
        setSelectedId(ws[0].id);
        persist(saveWorkouts(db, ws, true));
      },

      async importBackup(b) {
        await replaceAll(db, b);
        const d = await readAll(db);
        commit(d);
        setSelectedId(d.workouts[0].id);
        push(db, user.id);
      },

      async moveLegacy() {
        if (!legacy) return;
        await mergeLegacy(db, legacy.backup);
        const d = await readAll(db);
        commit(d);
        setSelectedId((d.workouts.find((w) => isToday(w, today)) || d.workouts[0]).id);
        setLegacy({ ...legacy, info: { ...legacy.info, choice: "moved" } });
        push(db, user.id);
      },

      skipLegacy() {
        if (!legacy) return;
        setLegacy({ ...legacy, info: { ...legacy.info, choice: "skipped" } });
        persist(skipLegacy(db));
      },
    };
  }, [data, selectedId, today, legacy, db, user.id, commit, persist]);

  if (failed) {
    return (
      <main>
        <p className="empty">
          {failed === "offline"
            ? navigator.onLine
              ? "Couldn’t load your account. Reload to try again. If it keeps happening, tell the app owner."
              : "Connect to the internet once so this device can load your account, then reload."
            : "This browser won’t let the app store data. Turn off private browsing, or allow website data for this site, then reload."}
        </p>
      </main>
    );
  }
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

/** Renders its children only once the data has loaded. */
export function WhenLoaded({ children }: { children: ReactNode }) {
  return useStoreIfLoaded() ? <>{children}</> : null;
}
