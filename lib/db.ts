// Local database: IndexedDB in the browser, through Dexie. Nothing leaves the device.
import Dexie, { type EntityTable } from "dexie";
import { DEFAULT_PLAN_VERSION, DEFAULT_WORKOUTS } from "./defaultPlan";
import type { Backup, Draft, Session, Workout } from "./types";

/** A workout as stored: `order` keeps the user's order of days. */
export type WorkoutRow = Workout & { order: number };
interface Setting { key: string; value: unknown }

class GymDB extends Dexie {
  workouts!: EntityTable<WorkoutRow, "id">;
  sessions!: EntityTable<Session, "id">;
  drafts!: EntityTable<Draft, "workoutId">;
  settings!: EntityTable<Setting, "key">;

  constructor() {
    super("homegym");
    // Add a new version() block (never edit this one) when the schema changes.
    this.version(1).stores({
      workouts: "id, order",
      sessions: "id, date, workoutId",
      drafts: "workoutId",
      settings: "key",
    });
  }
}

export const db = new GymDB();

/** The old app's localStorage key. Read once, then left in place as a fallback copy. */
const LEGACY_KEY = "homegym-v1";

export interface AppData {
  planVersion: number;
  workouts: Workout[];
  sessions: Session[];
  drafts: Record<string, Draft>;
}

export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

export function isBackup(s: unknown): s is Backup {
  const b = s as Backup;
  return !!b && Array.isArray(b.workouts) && b.workouts.length > 0;
}

function toRows(workouts: Workout[]): WorkoutRow[] {
  return workouts.map((w, i) => ({ ...w, order: i }));
}
function fromRow({ order, ...w }: WorkoutRow): Workout {
  void order;
  return w;
}

/** Replaces everything in the database with the given data (backup import, first-time move). */
export async function replaceAll(b: Backup): Promise<void> {
  const drafts = Object.entries(b.drafts || {}).map(([workoutId, d]) => ({
    started: d.started || new Date().toISOString(),
    entries: d.entries || {},
    notes: d.notes || "",
    workoutId,
  }));
  await db.transaction("rw", [db.workouts, db.sessions, db.drafts, db.settings], async () => {
    await Promise.all([db.workouts.clear(), db.sessions.clear(), db.drafts.clear()]);
    await db.workouts.bulkPut(toRows(b.workouts));
    await db.sessions.bulkPut(b.sessions || []);
    await db.drafts.bulkPut(drafts);
    await db.settings.put({ key: "planVersion", value: b.planVersion || 1 });
  });
}

/** Moves data from the old localStorage app into the database, once. */
async function importLegacy(): Promise<void> {
  if (await db.settings.get("legacyImported")) return;
  if ((await db.workouts.count()) === 0) {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      const s = raw ? JSON.parse(raw) : null;
      if (isBackup(s)) await replaceAll(s);
    } catch {
      /* unreadable old data: start from the default plan */
    }
  }
  await db.settings.put({ key: "legacyImported", value: true });
}

/** Adds default workout days the user doesn't have yet. Never changes days they already have. */
async function addNewDefaultDays(): Promise<void> {
  const pv = Number((await db.settings.get("planVersion"))?.value || 1);
  if (pv >= DEFAULT_PLAN_VERSION) return;
  const rows = await db.workouts.orderBy("order").toArray();
  const have = new Set(rows.map((w) => w.id));
  let order = rows.length ? rows[rows.length - 1].order + 1 : 0;
  const added = DEFAULT_WORKOUTS.filter((w) => !have.has(w.id)).map((w) => ({ ...clone(w), order: order++ }));
  await db.workouts.bulkPut(added);
  await db.settings.put({ key: "planVersion", value: DEFAULT_PLAN_VERSION });
}

export async function loadAll(): Promise<AppData> {
  await importLegacy();
  if ((await db.workouts.count()) === 0) {
    await replaceAll({ workouts: clone(DEFAULT_WORKOUTS), planVersion: DEFAULT_PLAN_VERSION });
  }
  await addNewDefaultDays();
  const [rows, sessions, drafts, pv] = await Promise.all([
    db.workouts.orderBy("order").toArray(),
    db.sessions.toArray(),
    db.drafts.toArray(),
    db.settings.get("planVersion"),
  ]);
  return {
    planVersion: Number(pv?.value || 1),
    workouts: rows.map(fromRow),
    sessions,
    drafts: Object.fromEntries(drafts.map((d) => [d.workoutId, d])),
  };
}

/** Saves the whole plan in its current order, removing days that are gone. */
export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  await db.transaction("rw", db.workouts, async () => {
    const keep = new Set(workouts.map((w) => w.id));
    const gone = (await db.workouts.toCollection().primaryKeys()).filter((id) => !keep.has(id));
    await db.workouts.bulkDelete(gone);
    await db.workouts.bulkPut(toRows(workouts));
  });
}

export function toBackup(d: AppData): Backup {
  return {
    planVersion: d.planVersion,
    workouts: d.workouts,
    sessions: d.sessions,
    drafts: d.drafts,
  };
}
