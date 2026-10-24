// Keeps a user's local database in step with their account in Supabase (supabase/setup.sql).
// Changes are saved on the device first and listed in the outbox; push() sends them when there's
// a connection. pull() fetches the account's rows: a row with an unsent local change keeps the
// local version, otherwise the account's version wins (it may have been changed on another device).
import { DEFAULT_WORKOUTS } from "./defaultPlan";
import { clone, readAll, replaceAll, SYNC_TABLES, type AppData, type SyncTable, type UserDB, type WorkoutRow } from "./db";
import { supabase } from "./supabase";
import type { Draft, Session } from "./types";

type Local = WorkoutRow | Session | Draft;
interface ServerRow { position?: number; data: Local }

/** Each table's key column in Supabase, next to user_id. */
const KEY: Record<SyncTable, string> = { workouts: "id", sessions: "id", drafts: "workout_id" };
const PAGE = 1000;

const keyOf = (table: SyncTable, r: Local) => (table === "drafts" ? (r as Draft).workoutId : (r as Session).id);

function toServer(table: SyncTable, r: Local, userId: string) {
  const updated_at = new Date().toISOString();
  if (table === "workouts") {
    const { order, ...w } = r as WorkoutRow;
    return { user_id: userId, id: w.id, position: order, data: w, updated_at };
  }
  if (table === "sessions") {
    const s = r as Session;
    return { user_id: userId, id: s.id, workout_id: s.workoutId, date: s.date, data: s, updated_at };
  }
  return { user_id: userId, workout_id: (r as Draft).workoutId, data: r, updated_at };
}

const fromServer = (table: SyncTable, r: ServerRow): Local =>
  table === "workouts" ? { ...(r.data as WorkoutRow), order: r.position ?? 0 } : r.data;

/** JSON with object keys sorted: the database doesn't keep key order, so compare with this. */
const stable = (o: unknown) => JSON.stringify(o, (_k, v) =>
  v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v);

/** Sends the outbox. Returns false if it couldn't (offline, signed out); the outbox is kept for next time. */
async function send(db: UserDB, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const items = await db.outbox.toArray();
  for (const table of SYNC_TABLES) {
    const mine = items.filter((i) => i.table === table);
    if (!mine.length) continue;
    const rows = await db.table<Local, string>(table).bulkGet(mine.map((i) => i.id));
    const save = rows.flatMap((r) => (r ? [toServer(table, r, userId)] : []));
    const gone = mine.filter((_, i) => !rows[i]).map((i) => i.id);
    for (let i = 0; i < save.length; i += 500) {
      const { error } = await supabase.from(table).upsert(save.slice(i, i + 500), { onConflict: "user_id," + KEY[table] });
      if (error) return false;
    }
    if (gone.length) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId).in(KEY[table], gone);
      if (error) return false;
    }
    // Clear only the items that weren't changed again while sending.
    await db.transaction("rw", db.outbox, async () => {
      const now = await db.outbox.bulkGet(mine.map((i) => i.key));
      await db.outbox.bulkDelete(mine.filter((it, i) => now[i]?.at === it.at).map((it) => it.key));
    });
  }
  return true;
}

const sending = new WeakMap<UserDB, Promise<boolean>>();

/** Sends unsent changes. Only one send runs at a time per database. */
export function push(db: UserDB, userId: string): Promise<boolean> {
  let p = sending.get(db);
  if (!p) {
    p = send(db, userId).catch(() => false).finally(() => sending.delete(db));
    sending.set(db, p);
  }
  return p;
}

/** Fetches the account's rows into the local database. Returns whether anything changed, or null if it couldn't connect. */
export async function pull(db: UserDB, userId: string): Promise<boolean | null> {
  if (!supabase) return null;
  const server = {} as Record<SyncTable, Local[]>;
  try {
    for (const table of SYNC_TABLES) {
      const rows: ServerRow[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase.from(table)
          .select(table === "workouts" ? "position, data" : "data")
          .eq("user_id", userId).order(KEY[table]).range(from, from + PAGE - 1);
        if (error) return null;
        rows.push(...(data as unknown as ServerRow[]));
        if (data.length < PAGE) break;
      }
      server[table] = rows.map((r) => fromServer(table, r));
    }
  } catch {
    return null;
  }

  let changed = false;
  await db.transaction("rw", [db.workouts, db.sessions, db.drafts, db.outbox], async () => {
    const pending = new Set(await db.outbox.toCollection().primaryKeys());
    for (const table of SYNC_TABLES) {
      const t = db.table<Local, string>(table);
      const local = new Map((await t.toArray()).map((r) => [keyOf(table, r), r]));
      const free = (k: string) => !pending.has(table + ":" + k);
      const put = server[table].filter((r) => free(keyOf(table, r)) && stable(local.get(keyOf(table, r))) !== stable(r));
      const keep = new Set(server[table].map((r) => keyOf(table, r)));
      const del = [...local.keys()].filter((k) => !keep.has(k) && free(k));
      if (put.length || del.length) changed = true;
      await t.bulkPut(put);
      await t.bulkDelete(del);
    }
  });
  return changed;
}

/**
 * Opens a user's data on this device. The first time, it loads the account (needs a connection);
 * a brand-new account starts with the example plan.
 */
export async function openAccount(db: UserDB, userId: string): Promise<AppData> {
  if ((await db.workouts.count()) === 0) {
    if ((await pull(db, userId)) === null) throw new OfflineError();
    if ((await db.workouts.count()) === 0) {
      await replaceAll(db, { workouts: clone(DEFAULT_WORKOUTS) });
      push(db, userId);
    }
  }
  return readAll(db);
}

export class OfflineError extends Error {}
