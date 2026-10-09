// The app's data shapes. Exercise and workout ids are permanent: history is keyed by them.

export type Unit = "reps" | "sec" | "min";

/** [movement, amount, note] */
export type WarmupItem = [string, string, string?];

export interface Exercise {
  id: string; // "<workoutId>-<slug>"
  name: string;
  equipment: string;
  sets: number;
  target: number; // reps, seconds or minutes, depending on unit
  unit: Unit;
  weighted?: boolean; // false hides the kg box
  label: string; // display text for the target, e.g. "10 per leg"
  rest: number; // seconds
  start: string;
  cue: string;
}

export interface Workout {
  id: string;
  weekday: number | ""; // 0 = Sunday ... 6 = Saturday; "" = no day
  restDay?: boolean;
  dayLabel: string;
  title: string;
  summary: string;
  warmup: WarmupItem[];
  exercises: Exercise[];
  finisher: string;
  cooldown: string;
}

/** kg and reps are kept as typed (strings when edited); compare with Number(). */
export interface SetEntry {
  kg: string;
  reps: number | string;
  done: boolean;
}

export type Entries = Record<string, SetEntry[]>;

export interface Draft {
  workoutId: string;
  started: string; // ISO date
  entries: Entries;
  notes: string;
}

export interface Session {
  id: string;
  workoutId: string;
  title: string;
  date: string; // ISO date
  entries: Entries;
  names: Record<string, string>;
  notes: string;
}

/** The backup file format. Same shape as the old localStorage "homegym-v1" value. */
export interface Backup {
  planVersion?: number;
  workouts: Workout[];
  sessions?: Session[];
  drafts?: Record<string, Omit<Draft, "workoutId"> & { workoutId?: string }>;
}
