"use client";
// App state: loaded once from the local database, kept in React state, and written back
// on every change. Pages read from here synchronously, so inputs never lag or lose focus.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/components/Toast";
import { DEFAULT_PLAN_VERSION, DEFAULT_WORKOUTS } from "./defaultPlan";
import { clone, db, loadAll, replaceAll, saveWorkouts, type AppData } from "./db";
import { isToday, newestFirst, uid } from "./plan";
import type { Backup, Draft, Session, Workout } from "./types";

interface Store {
  data: AppData;
  /** Sessions sorted newest first. */
  sessions: Session[];
  today: number;
  /** The workout day picked in the day bar. */
  workout: Workout;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [data, setData] = useState<AppData | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [today, setToday] = useState(0);
  const ref = useRef<AppData | null>(null);

  useEffect(() => {
    loadAll()
      .then((d) => {
        const day = new Date().getDay();
        ref.current = d;
        setData(d);
        setToday(day);
        setSelectedId((d.workouts.find((w) => isToday(w, day)) || d.workouts[0]).id);
      })
      .catch(() => setFailed(true));
  }, []);

  const commit = useCallback((next: AppData) => {
    ref.current = next;
    setData(next);
  }, []);

  const persist = useCallback(
    (p: Promise<unknown>) => p.catch(() => toast("Couldn't save on this device. Export a backup from Edit plan.")),
    [toast],
  );

  const store = useMemo<Store | null>(() => {
    if (!data) return null;
    const cur = () => ref.current as AppData;
    const workout = data.workouts.find((w) => w.id === selectedId) || data.workouts[0];

    const setWorkouts = (ws: Workout[], selectId?: string) => {
      commit({ ...cur(), workouts: ws });
      if (selectId) setSelectedId(selectId);
      persist(saveWorkouts(ws));
    };

    return {
      data,
      sessions: newestFirst(data.sessions),
      today,
      workout,
      selectDay: setSelectedId,

      saveDraft(d) {
        commit({ ...cur(), drafts: { ...cur().drafts, [d.workoutId]: d } });
        persist(db.drafts.put(d));
      },

      clearDraft(workoutId) {
        const drafts = { ...cur().drafts };
        delete drafts[workoutId];
        commit({ ...cur(), drafts });
        persist(db.drafts.delete(workoutId));
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
        persist(db.transaction("rw", db.sessions, db.drafts, async () => {
          await db.sessions.put(session);
          await db.drafts.delete(w.id);
        }));
      },

      deleteSession(id) {
        commit({ ...cur(), sessions: cur().sessions.filter((s) => s.id !== id) });
        persist(db.sessions.delete(id));
      },

      updateWorkout(w) {
        const ws = cur().workouts;
        const order = ws.findIndex((x) => x.id === w.id);
        commit({ ...cur(), workouts: ws.map((x) => (x.id === w.id ? w : x)) });
        persist(db.workouts.put({ ...w, order }));
      },

      setWorkouts,

      restorePlan() {
        const ws = clone(DEFAULT_WORKOUTS);
        commit({ ...cur(), workouts: ws, drafts: {}, planVersion: DEFAULT_PLAN_VERSION });
        setSelectedId(ws[0].id);
        persist(Promise.all([
          saveWorkouts(ws),
          db.drafts.clear(),
          db.settings.put({ key: "planVersion", value: DEFAULT_PLAN_VERSION }),
        ]));
      },

      async importBackup(b) {
        await replaceAll(b);
        const d = await loadAll(); // also adds any new default days
        commit(d);
        setSelectedId(d.workouts[0].id);
      },
    };
  }, [data, selectedId, today, commit, persist]);

  if (failed) {
    return (
      <main>
        <p className="empty">
          This browser won&rsquo;t let the app store data. Turn off private browsing, or allow website data for this site, then reload.
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
