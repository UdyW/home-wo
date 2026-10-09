// Pure helpers for workouts, drafts and history. No React, no storage.
import type { Draft, Exercise, Session, SetEntry, Workout } from "./types";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function unitWord(ex: Exercise): string {
  return ex.unit === "sec" ? "sec" : ex.unit === "min" ? "min" : "reps";
}

const hasWeekday = (w: Workout) => w.weekday !== "" && w.weekday != null;

export function isToday(w: Workout, today: number): boolean {
  return hasWeekday(w) && Number(w.weekday) === today;
}

/** Monday first, Sunday last, days without a weekday at the end. */
export function orderedWorkouts(workouts: Workout[]): Workout[] {
  const rank = (w: Workout) => (hasWeekday(w) ? (Number(w.weekday) + 6) % 7 : 99);
  return workouts.slice().sort((a, b) => rank(a) - rank(b));
}

export function newestFirst(sessions: Session[]): Session[] {
  return sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
}

/** The most recent session where at least one set of this exercise was done. */
export function lastEntry(exId: string, sorted: Session[]): { date: string; sets: SetEntry[] } | null {
  for (const s of sorted) {
    const e = s.entries[exId];
    if (e && e.some((x) => x.done)) return { date: s.date, sets: e };
  }
  return null;
}

/**
 * The draft for a workout, with one row per planned set. New rows take their kg from
 * the last session, so the user only types when the weight changes.
 */
export function buildDraft(w: Workout, saved: Draft | undefined, sorted: Session[]): Draft {
  const entries = { ...(saved?.entries || {}) };
  for (const ex of w.exercises) {
    let arr = entries[ex.id];
    if (!arr) {
      const last = lastEntry(ex.id, sorted);
      arr = [];
      for (let i = 0; i < ex.sets; i++) {
        const prev = last && (last.sets[i] || last.sets[0]);
        arr.push({ kg: prev ? prev.kg : "", reps: ex.target, done: false });
      }
    } else {
      arr = arr.slice(0, ex.sets);
      while (arr.length < ex.sets) arr.push({ kg: arr.length ? arr[arr.length - 1].kg : "", reps: ex.target, done: false });
    }
    entries[ex.id] = arr;
  }
  return { workoutId: w.id, started: saved?.started || new Date().toISOString(), entries, notes: saved?.notes || "" };
}

/** Top weight lifted per session for one exercise, oldest first. */
export function topWeights(exId: string, oldestFirst: Session[]): number[] {
  const vals: number[] = [];
  for (const s of oldestFirst) {
    const kgs = (s.entries[exId] || [])
      .filter((x) => x.done && x.kg !== "" && !isNaN(Number(x.kg)))
      .map((x) => Number(x.kg));
    if (kgs.length) vals.push(Math.max(...kgs));
  }
  return vals;
}

export function newExercise(workoutId: string): Exercise {
  return { id: workoutId + "-" + uid(), name: "New exercise", equipment: "", sets: 3, target: 10, unit: "reps", label: "10", rest: 60, start: "", cue: "" };
}

export function newWorkout(dayLabel: string): Workout {
  return { id: uid(), weekday: "", dayLabel, title: "New workout", summary: "", warmup: [], exercises: [], finisher: "", cooldown: "" };
}
