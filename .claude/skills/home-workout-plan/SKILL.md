---
name: home-workout-plan
description: Rules for working on the Home gym log app now that it supports multiple users, each with their own login, equipment, weekly schedule and workout history. Covers adding multi-user support (accounts, per-user data, migrating the original single-user data), and entering or changing a user's workouts exactly as they describe them in lib/defaultPlan.ts or their saved plan. Use this whenever the user asks to add a user or friend, set up login or accounts, add or change an exercise, swap equipment, add a day (such as Wednesday), change sets, reps or rest, edit lib/defaultPlan.ts, or touch anything to do with plans, logs or user data, even if they don't mention "workout plan" or "multi-user".
---

# Home workout plan (multi-user)

The Home gym log started as a one-person app. It now needs to serve several people, starting with the owner and one friend. Each user logs in and sees only their own plan, equipment and history.

## The most important rule: users bring their own schedules

Every user already knows their weekly routine. **Do not design, generate, suggest or "improve" workout routines.** Your job is to record what the user tells you, accurately, in the app's format.

- Enter exercises, sets, reps, holds, rest and weekdays exactly as given.
- If something the schema needs is missing (for example sets, reps or rest), ask. Don't fill it in with a guess.
- Don't add, remove, reorder or substitute exercises unless asked. If a requested exercise needs equipment the user hasn't listed, point that out and ask what they want to do. Don't swap it yourself.
- A form `cue` is optional. If the user supplies one, use it word for word. If they ask you to write one, keep it to 2–3 short sentences of standard, conservative form guidance.
- Never claim an exercise burns fat from a particular area (such as belly fat). Spot reduction doesn't work.
- Don't give medical advice. If a user mentions pain or an injury, suggest they see a qualified professional, and only change their plan when they tell you what to change.

## Privacy: the repo is public

The repository is public, so nothing personal belongs in it.

- No names, emails, ages, measurements, goals, weights lifted or real workout logs in code, seed files, fixtures, comments, commit messages or docs.
- `lib/defaultPlan.ts` holds only a **generic example plan** (or an empty template) for new accounts. It must not be anyone's real plan. If it currently contains the owner's real plan, move that plan into the owner's account data as part of the migration, then replace the file's contents with a generic example.
- Real user data lives only in the per-user data store (see below), never in the repo.
- Secrets (API keys, database URLs, auth secrets) go in environment variables. Add `.env*` to `.gitignore` and provide a `.env.example` with placeholder values only.
- For testing, use invented test accounts (such as `test-user-a`, `test-user-b`) with invented plans.

## Data model

Every piece of user data is scoped to a user. The target shape:

- **User**: id, display name, login identity. Nothing else is required.
- **Equipment profile** (per user): free-text list of what they own, plus optional plate-to-kg mappings for cable machines (for example "High pulley plate 1 = 6 kg"). Different users will have different machines, so never assume one user's equipment applies to another.
- **Plan** (per user): their workouts, each with a short permanent `id`, a `weekday` (0 = Sunday … 6 = Saturday), optional `restDay: true`, and a list of exercises.
- **Exercise** (inside a plan): uses the existing schema in `AGENTS.md`, for example:

```ts
{ id: "wed-rdl", name: "Romanian deadlift", equipment: "Barbell", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
  start: "Empty bar",
  cue: "Soft knees, push the hips back and slide the bar down the thighs. Back flat, then drive the hips forward to stand." }
```

- **Session logs** (per user): keyed by user id + exercise id + date.

Rules that keep history intact:

1. Exercise ids follow `<workoutId>-<slug>` and must be unique **within that user's plan**. Two users may both have `wed-rdl`; logs stay separate because they are keyed by user id too.
2. **Never change an existing exercise's `id`**, because that orphans its history. Edit `name` and other fields instead.
3. Cardio and walking items use `unit: "min"` and `weighted: false`. Bodyweight moves use `weighted: false` so the kg box is hidden.
4. Cable-machine `start` values use that user's own plate mapping, written as "Plate N (about X kg)". If the user hasn't given a mapping, write just "Plate N".
5. The progression hint (shown when the last session hit target on every set) is calculated per user from that user's logs only.

## Building multi-user support

### Decide before coding

These choices change the whole implementation. Check `AGENTS.md` and the existing code first. If they aren't already settled, ask the user before writing code:

- **Where data lives**: a hosted backend (for example Supabase or Firebase), the app's own API and database, or something else. Data must sync across devices because users log on their phones.
- **How people log in**: email magic link, email and password, or a social login.
- **Who can create accounts**: open sign-up, or invite-only (recommended for a small group of friends).

Propose one sensible default with a one-line reason and wait for confirmation. Don't install or sign up for services on the user's behalf.

### Requirements

- Each user can read and write only their own data. Enforce this on the server or with database access rules (for example row-level security). Hiding things in the UI is not enough.
- A logged-out visitor sees only the login screen. No plans or logs are visible without logging in.
- New users start with the generic example plan or an empty plan, and can edit it to match their own schedule.
- The app stays phone-friendly. Login, plan editing and logging must all work comfortably on a small screen.
- Keep working offline where the app already does, syncing when a connection returns. If that's out of scope for a first version, say so to the user rather than silently dropping it.

### Migrating the original user's data

The owner already has history on their phone (check `AGENTS.md` and the code to see where it's stored today, for example browser storage). Losing it is the worst possible outcome.

1. Before changing storage, add a way to **export** the existing data to a file, and tell the user to export a backup before they update.
2. After the owner logs in for the first time, offer a one-time **import** of the old local data into their account. Keep exercise ids unchanged so history lines up.
3. Don't delete the old local data automatically. Leave it until the user confirms the import worked.

### Plan versioning

The old `DEFAULT_PLAN_VERSION` mechanism pushed changes to `lib/defaultPlan.ts` into the single user's saved plan. With several users this would overwrite or pollute their personal plans, so:

- Changes to `lib/defaultPlan.ts` affect **only new accounts**. Never merge them into existing users' plans automatically.
- To change a specific user's plan, edit that user's saved plan through the app (or a migration that targets only them), as described below.

## Changing a user's workouts

When asked to add or edit workouts, first confirm **which user** the change is for if it's not obvious. Then:

1. Get the details from the user: day, exercises, sets, reps or time, rest, equipment, and any cue or starting weight they want.
2. Write the change into that user's plan only, following the data-model rules above.
3. For a new day, give the workout a short permanent `id` and the right `weekday`.
4. Don't touch other users' plans or `lib/defaultPlan.ts` unless explicitly asked.

## Checklist before finishing any task

1. Run `npm run build` (Node 20 or later) and fix any type errors.
2. If you touched accounts, data access or storage, test with two test accounts: each must see only their own plan and logs, and a logged-out browser must see neither.
3. Search the diff for personal data (names, emails, measurements, real plans) and secrets before committing.
4. Tell the user how to get the change onto their phone (see "Important gotcha" in `AGENTS.md`), and whether they need to export a backup first.
