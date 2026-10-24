# AGENTS.md

Instructions for AI coding assistants (Claude Code, GitHub Copilot, Cursor, Codex and similar) working on this repo. Read this before making changes.

## What this is

**Home gym log**: a small, phone-first web app for following a home strength-training plan. The user logs weight and reps per set, runs rest timers, and views progress over time. It is built with Next.js (App Router, TypeScript) as a **static export** and deployed on Vercel from the `main` branch. Every push to `main` redeploys automatically.

The user is a beginner lifter training at home. They aren't a professional developer. So explain changes in plain language, and keep the app simple.

## Hard constraints

- **Static export, no server code of our own.** `next.config.ts` has `output: "export"`. Don't add API routes, server actions, middleware, `getServerSideProps`, or anything else that needs a server. Keep dependencies few: currently `next`, `react`, `react-dom`, `dexie` and `@supabase/supabase-js`. Ask before adding more.
- **Accounts and sync go through Supabase only.** Logins and each user's synced data use Supabase from the browser (`lib/supabase.ts`). Access is enforced by row-level security in `supabase/setup.sql`: every table has a `user_id` and an "own rows" policy. Never use the secret or service role key in the app. Change the database by adding a new numbered `.sql` file in `supabase/`, never by editing one that has already been run.
- **No other network calls.** Each user's data is also kept on the device in IndexedDB (via Dexie), so the app works offline and syncs later. Don't add analytics or trackers. Fonts come from `next/font` and are served with the app.
- **Never break saved data.** Users have real training history. To change the local schema, add a new `this.version(n)` block to `UserDB` in `lib/db.ts` with an `upgrade()` function. Never edit an existing version block. Keep the backup file format (`Backup` in `lib/types.ts`) readable by import.
- **Data from before accounts is never deleted.** The original database `homegym` (and the older `localStorage["homegym-v1"]`, which `importLegacy()` copies into it) is only read. After signing in, `LegacyPrompt` offers once to move it into the account (`mergeLegacy()`). Keep both: they're the fallback copy.
- **Exercise `id`s are permanent.** History is keyed by exercise id. Renaming an exercise is fine. Changing its `id` orphans its history.
- **No `dangerouslySetInnerHTML`.** React escapes text; keep it that way for anything the user typed.

## Files

| Path | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout: fonts, metadata, providers, header. |
| `app/page.tsx`, `app/history/page.tsx`, `app/plan/page.tsx` | One file per page (Workout, History, Edit plan). Each wraps a view in `<Page>`. |
| `app/globals.css` | All styling. Colour and font tokens are on `:root`, with a dark-mode override via `prefers-color-scheme`. |
| `components/Header.tsx` | Top bar and page tabs. Add new pages to `PAGES` here. |
| `components/Page.tsx`, `DayBar.tsx` | Page frame (waits for data, optional day bar) and the Monday-to-Sunday day picker. |
| `components/RestTimer.tsx`, `Toast.tsx`, `Providers.tsx` | Rest timer bar, toast messages, and the providers that wrap every page. |
| `components/Login.tsx` | Login screen: email and password (invite only: accounts are created in Supabase, never here). |
| `components/workout/` | Workout page: `WorkoutView` (draft, finish, rest day), `ExerciseCard` (sets and the plate button), `MovePhotos`, `WarmupList`. |
| `components/history/` | History page: progress trends with `Sparkline`, and the session list. |
| `components/plan/` | Edit plan page: `PlanView` (day fields, add or delete days), `ExerciseForm`, `Fields`, `BackupTools` (export, import, restore). |
| `lib/types.ts` | Data types. |
| `lib/supabase.ts`, `lib/auth.tsx` | Supabase connection; `AuthGate` shows the login screen until someone is signed in, and `useAuth()` gives the signed-in user. |
| `supabase/setup.sql` | Database tables and row-level security. Run once in the Supabase SQL editor. |
| `.env.example` | The two public Supabase settings. Copy to `.env.local` for local development. |
| `lib/db.ts` | Dexie databases (one per user, plus the old single-user one), every change with its outbox entry, reading old data, backup helpers. |
| `lib/sync.ts` | Sends the outbox to Supabase, fetches the account's rows, opens an account on a device (a new account gets the example plan). |
| `lib/store.tsx` | `useStore()`: loads the signed-in user's data once, keeps it in React state, writes each change to IndexedDB, then syncs in the background. All pages read and change data through it. |
| `components/LegacyPrompt.tsx` | The one-time offer to move a device's data from before accounts into the account. |
| `lib/plan.ts` | Pure helpers: day order, building a draft, last session, top weights. |
| `lib/alerts.ts` | Beep, vibration, notification and screen wake lock for the rest timer. |
| `lib/defaultPlan.ts` | `DEFAULT_WORKOUTS` and `DEFAULT_PLAN_VERSION`: a generic example plan (never anyone's real plan), used for new accounts and by "Start from example plan". |
| `public/images/` | Movement photos, `<exercise id>-1.jpg` (start) and `-2.jpg` (finish). |
| `public/sw.js` | Minimal service worker so the rest timer can show a phone notification. Caches nothing, makes no network requests. |
| `.claude/skills/home-workout-plan/SKILL.md` | Training rules for writing or changing workouts (equipment, progression, safety). Use it for any change to exercises or `lib/defaultPlan.ts`. |

## Data model

Each user's data is in Supabase (`supabase/setup.sql`: tables `workouts`, `sessions`, `drafts`, `profiles`, each keyed by `user_id` plus the row key, with the app's object in a `data` column) and in a local IndexedDB database `homegym-<user id>` (see `lib/db.ts`):

| Table | Key | Holds |
| --- | --- | --- |
| `workouts` | `id` | `Workout` plus `order` (the user's order of days) |
| `sessions` | `id` (indexes `date`, `workoutId`) | finished workouts |
| `drafts` | `workoutId` | in-progress entries, one per workout |
| `settings` | `key` | `legacyChoice` (this device's answer to the move offer) |
| `outbox` | `"<table>:<key>"` | rows changed on this device and not yet sent |

Ids only need to be unique within one user's data: two users can both have `wed-rdl`.

```ts
Workout = {
  id: "mon",                 // permanent
  weekday: 1,                // 0 = Sunday ... 6 = Saturday; "" = none. Opens automatically on that day; the day bar is ordered Monday to Sunday.
  restDay: false,            // true = shows warmup items as gentle suggestions, nothing to log
  dayLabel: "Monday",
  title: "Strength A",
  summary: "One-line description",
  warmup: [["Movement", "Amount", "Note"]],
  exercises: [Exercise],
  finisher: "text",
  cooldown: "text"
}

Exercise = {
  id: "mon-hipthrust",       // permanent; convention "<workoutId>-<slug>"
  name: "Barbell hip thrust",
  equipment: "Bench, barbell, towel or pad",
  sets: 3,
  target: 10,                // number of reps, seconds ("sec") or minutes ("min")
  unit: "reps" | "sec" | "min",
  weighted: false,           // optional; false hides the kg box (bodyweight moves, walks)
  label: "10 per leg",       // display text for the target
  rest: 90,                  // seconds; starts the rest timer when a set is marked done
  start: "Suggested starting weight",
  cue: "How to do it"
}

Draft   = { workoutId, started: ISODate, entries: { [exerciseId]: [Set] }, notes: "" }
Session = { id, workoutId, title, date: ISODate, entries: { [exerciseId]: [Set] }, names: { [exerciseId]: name }, notes }
Set     = { kg: "20" | "", reps: 10, done: true }   // kg and reps are stored as typed (strings), compare with Number()
```

The backup file is `{ planVersion, workouts, sessions, drafts: { [workoutId]: Draft } }`, the same shape the old localStorage app used. Old backups import fine.

## Important gotcha: editing `lib/defaultPlan.ts`

It's the example plan for **new accounts only**. Changes never reach existing users, on purpose: each user's plan is their own. To change a user's plan, they edit it in **Edit plan**. **Start from example plan** replaces their plan with the example (history is kept). `DEFAULT_PLAN_VERSION` is only written into backups.

## Code conventions

- Function components and hooks, TypeScript strict. Files that use state, effects or browser APIs start with `"use client"`.
- Read and change data only through `useStore()`. It updates React state first, then writes to IndexedDB (and the outbox), so inputs never lag. Use `<Page>` (or `WhenLoaded`) around anything that calls `useStore()`.
- Inputs are controlled and save as you type. Use `CommitField` for values that are cleaned up on save (numbers, the warm-up list), so typing isn't interrupted.
- Keep pure logic in `lib/plan.ts` (no React, no storage), so dashboards and new pages can reuse it.
- Styling stays in `app/globals.css` with the existing class names and tokens. No CSS framework.
- Use absolute paths for files in `public/` (`/images/...`, `/sw.js`), because pages live at different URLs.
- UI copy: plain, sentence case, active verbs ("Finish and save session"). Errors say what to do next.
- Keep the quality floor: works at 360 px wide, visible keyboard focus, `prefers-reduced-motion` respected, sufficient contrast in light and dark modes.
- The "plate" button (a set-done toggle styled as a bumper plate) is the app's signature element. Keep it.

## Adding a page

1. Create `app/<name>/page.tsx` that renders `<Page><YourView /></Page>` (add `dayBar` if the page works per day).
2. Put the view in `components/<name>/`, reading data with `useStore()`.
3. Add a tab to `PAGES` in `components/Header.tsx`.

## Testing a change

There's no test suite. Use Node 20 or later (`nvm use 22`). Before committing:

1. Run `npm run build`. It type-checks and fails on errors.
2. Run `npm run dev` and open http://localhost:3000, or `npm start` to serve the built `out/` folder.
3. Sign in with a test account (such as `test-user-a`) in a fresh profile, and check that its plan loads.
4. Enter kg and reps, mark sets done, and check that the rest timer starts.
5. Tap **Finish and save session**, then check that History shows it and the progress line updates.
6. In **Edit plan**, add, move and remove an exercise, then reload and check that the changes persist.
7. Export a backup, then import it again.
8. Sign in with a second test account in another browser: each sees only its own plan and history, and a logged-out browser sees only the login screen. A change made on one device appears on another after reopening the app.
9. Check for errors in the browser console.

## Deploying

Commit and push to `main`. Vercel runs `npm run build` and serves the `out/` folder; `vercel.json` sets the Next.js framework preset. Keep deploying to the same domain: the move of old data from localStorage only works on the same site address.

## Don't commit

`.DS_Store`, `node_modules/`, `.next/`, `out/`, `.vercel/`, `.env*` files (except `.env.example`), and personal backup files (`home-gym-backup-*.json`). This repo is public.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
