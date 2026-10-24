// Local databases: IndexedDB in the browser, through Dexie.
// Each signed-in user has their own database on the device, "homegym-<user id>", kept in step with
// their account by lib/sync.ts. Every change also goes into that database's outbox until it's sent.
// The original single-user database "homegym" is never changed by the app now: it's only read,
// to offer moving its data into an account (and still fills itself from the older localStorage app).
import Dexie, { type EntityTable } from "dexie";
import { DEFAULT_PLAN_VERSION, DEFAULT_WORKOUTS } from "./defaultPlan";
import type { Backup, Draft, Session, Workout } from "./types";

/** A workout as stored: `order` keeps the user's order of days. */
export type WorkoutRow = Workout & { order: number };
interface Setting { key: string; value: unknown }

export type SyncTable = "workouts" | "sessions" | "drafts";
export const SYNC_TABLES: SyncTable[] = ["workouts", "sessions", "drafts"];
/** A row changed on this device and not yet sent. Its current local state is sent: present = save, gone = delete. */
export interface OutboxItem { key: string; table: SyncTable; id: string; at: number }

class GymDB extends Dexie {
  workouts!: EntityTable<WorkoutRow, "id">;
  sessions!: EntityTable<Session, "id">;
  drafts!: EntityTable<Draft, "workoutId">;
  settings!: EntityTable<Setting, "key">;
}

/** The original single-user database. Never edit or remove this version block. */
class LegacyDB extends GymDB {
  constructor() {
    super("homegym");
    this.version(1).stores({
      workouts: "id, order",
      sessions: "id, date, workoutId",
      drafts: "workoutId",
      settings: "key",
    });
  }
}

/** One per user on this device. Add a new version() block (never edit this one) when the schema changes. */
export class UserDB extends GymDB {
  outbox!: EntityTable<OutboxItem, "key">;
  constructor(userId: string) {
    super("homegym-" + userId);
    this.version(1).stores({
      workouts: "id, order",
      sessions: "id, date, workoutId",
      drafts: "workoutId",
      settings: "key",
      outbox: "key",
    });
  }
}

/** The old app's localStorage key. Read once into the old database, then left in place as a fallback copy. */
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

function draftsOf(b: Backup): Draft[] {
  return Object.entries(b.drafts || {}).map(([workoutId, d]) => ({
    started: d.started || new Date().toISOString(),
    entries: d.entries || {},
    notes: d.notes || "",
    workoutId,
  }));
}

async function fill(db: GymDB, b: Backup): Promise<void> {
  await Promise.all([db.workouts.clear(), db.sessions.clear(), db.drafts.clear()]);
  await db.workouts.bulkPut(toRows(b.workouts));
  await db.sessions.bulkPut(b.sessions || []);
  await db.drafts.bulkPut(draftsOf(b));
}

async function readData(db: GymDB): Promise<AppData> {
  const [rows, sessions, drafts] = await Promise.all([
    db.workouts.orderBy("order").toArray(),
    db.sessions.toArray(),
    db.drafts.toArray(),
  ]);
  return {
    planVersion: DEFAULT_PLAN_VERSION,
    workouts: rows.map(fromRow),
    sessions,
    drafts: Object.fromEntries(drafts.map((d) => [d.workoutId, d])),
  };
}

export const readAll = (db: UserDB) => readData(db);

// ---- The old single-user data on this device ----

/** Moves data from the old localStorage app into the old database, once. */
async function importLegacy(db: LegacyDB): Promise<void> {
  if (await db.settings.get("legacyImported")) return;
  if ((await db.workouts.count()) === 0) {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      const s = raw ? JSON.parse(raw) : null;
      if (isBackup(s)) await db.transaction("rw", [db.workouts, db.sessions, db.drafts], () => fill(db, s));
    } catch {
      /* unreadable old data: nothing to offer */
    }
  }
  await db.settings.put({ key: "legacyImported", value: true });
}

/** The data saved on this device before accounts, or null if there's nothing worth moving. */
export async function readLegacy(): Promise<Backup | null> {
  let hasLocalStorage = false;
  try { hasLocalStorage = !!localStorage.getItem(LEGACY_KEY); } catch { /* blocked */ }
  if (!hasLocalStorage && !(await Dexie.exists("homegym"))) return null;
  const db = new LegacyDB();
  try {
    await importLegacy(db);
    const d = await readData(db);
    if (!d.workouts.length) return null;
    const untouchedExample = !d.sessions.length && !Object.keys(d.drafts).length
      && JSON.stringify(d.workouts) === JSON.stringify(DEFAULT_WORKOUTS);
    return untouchedExample ? null : toBackup(d);
  } finally {
    db.close();
  }
}

// ---- Changes to a user's database. Each one also lists the rows it touched in the outbox. ----

type Touched = Partial<Record<SyncTable, string[]>>;
let seq = 0;

async function change(db: UserDB, fn: () => Promise<Touched>): Promise<void> {
  await db.transaction("rw", [db.workouts, db.sessions, db.drafts, db.settings, db.outbox], async () => {
    const touched = await fn();
    const at = Date.now() * 1000 + (seq++ % 1000);
    for (const table of SYNC_TABLES) {
      const ids = [...new Set(touched[table] || [])];
      await db.outbox.bulkPut(ids.map((id) => ({ key: table + ":" + id, table, id, at })));
    }
  });
}

const keysOf = async (db: UserDB): Promise<Required<Touched>> => ({
  workouts: await db.workouts.toCollection().primaryKeys(),
  sessions: await db.sessions.toCollection().primaryKeys(),
  drafts: await db.drafts.toCollection().primaryKeys(),
});

/** Replaces everything in the user's database (backup import, a new account's example plan). */
export const replaceAll = (db: UserDB, b: Backup) => change(db, async () => {
  const before = await keysOf(db);
  await fill(db, b);
  const after = await keysOf(db);
  return {
    workouts: [...before.workouts, ...after.workouts],
    sessions: [...before.sessions, ...after.sessions],
    drafts: [...before.drafts, ...after.drafts],
  };
});

/** Moves the old single-user data into this account: its plan replaces the account's plan; its sessions and drafts are added. */
export const mergeLegacy = (db: UserDB, b: Backup) => change(db, async () => {
  const before = await db.workouts.toCollection().primaryKeys();
  const drafts = draftsOf(b);
  await db.workouts.clear();
  await db.workouts.bulkPut(toRows(b.workouts));
  await db.sessions.bulkPut(b.sessions || []);
  await db.drafts.bulkPut(drafts);
  await db.settings.put({ key: "legacyChoice", value: "moved" });
  return {
    workouts: [...before, ...b.workouts.map((w) => w.id)],
    sessions: (b.sessions || []).map((s) => s.id),
    drafts: drafts.map((d) => d.workoutId),
  };
});

export async function legacyChoice(db: UserDB): Promise<string | null> {
  return ((await db.settings.get("legacyChoice"))?.value as string) || null;
}
export const skipLegacy = (db: UserDB) => db.settings.put({ key: "legacyChoice", value: "skipped" });

export const putDraft = (db: UserDB, d: Draft) => change(db, async () => {
  await db.drafts.put(d);
  return { drafts: [d.workoutId] };
});

export const deleteDraft = (db: UserDB, workoutId: string) => change(db, async () => {
  await db.drafts.delete(workoutId);
  return { drafts: [workoutId] };
});

/** Saves a finished session and removes its draft. */
export const addSession = (db: UserDB, s: Session) => change(db, async () => {
  await db.sessions.put(s);
  await db.drafts.delete(s.workoutId);
  return { sessions: [s.id], drafts: [s.workoutId] };
});

export const deleteSession = (db: UserDB, id: string) => change(db, async () => {
  await db.sessions.delete(id);
  return { sessions: [id] };
});

export const putWorkout = (db: UserDB, w: Workout, order: number) => change(db, async () => {
  await db.workouts.put({ ...w, order });
  return { workouts: [w.id] };
});

/** Saves the whole plan in its current order, removing days that are gone. Optionally clears all drafts. */
export const saveWorkouts = (db: UserDB, workouts: Workout[], clearDrafts = false) => change(db, async () => {
  const keep = new Set(workouts.map((w) => w.id));
  const gone = (await db.workouts.toCollection().primaryKeys()).filter((id) => !keep.has(id));
  await db.workouts.bulkDelete(gone);
  await db.workouts.bulkPut(toRows(workouts));
  const drafts = clearDrafts ? await db.drafts.toCollection().primaryKeys() : [];
  await db.drafts.bulkDelete(drafts);
  return { workouts: [...gone, ...keep], drafts };
});

export function toBackup(d: AppData): Backup {
  return {
    planVersion: d.planVersion,
    workouts: d.workouts,
    sessions: d.sessions,
    drafts: d.drafts,
  };
}
