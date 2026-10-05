# AGENTS.md

Instructions for AI coding assistants (Claude Code, GitHub Copilot, Cursor, Codex and similar) working on this repo. Read this before making changes.

## What this is

**Home gym log**: a small, phone-first web app for following a home strength-training plan. The user logs weight and reps per set, runs rest timers, and views progress over time. It is deployed on Vercel from the `main` branch. Every push to `main` redeploys automatically.

The user is a beginner lifter training at home. They aren't a professional developer. So explain changes in plain language, and keep the app simple.

## Hard constraints

- **No build step, no framework, no backend.** Plain HTML, CSS and JavaScript served as static files. Don't add React, bundlers, TypeScript, npm dependencies or a `package.json` unless the user explicitly asks.
- **Data stays in the browser.** All state lives in `localStorage` under the key `homegym-v1`. Don't add analytics, trackers or network calls. The only external requests allowed are the Google Fonts stylesheet and font files.
- **Never break saved data.** Users have real training history in `localStorage`. Any change to the data shape needs a migration in `load()` in `app.js`. Don't rename the storage key without migrating old data.
- **Exercise `id`s are permanent.** History is keyed by exercise id. Renaming an exercise is fine. Changing its `id` orphans its history.
- **Escape all user-entered text** with `esc()` before putting it into `innerHTML`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell: header, view tabs, day bar, `<main id="app">`, rest timer, toast. Loads `data.js`, then `app.js`. |
| `styles.css` | All styling. Colour and font tokens are on `:root`, with a dark-mode override via `prefers-color-scheme`. |
| `app.js` | All logic in one IIFE: storage, rendering of the three views, event delegation, rest timer, backup import/export. |
| `data.js` | `window.DEFAULT_WORKOUTS`: the starting plan, used on first load and by "Restore original plan". |
| `images/` | Two movement photos per exercise, `<exercise id>-1.jpg` (start) and `-2.jpg` (finish). Missing photos show a placeholder. `images/README.md` lists the filenames. |
| `README.md` | User-facing setup and usage notes. |
| `.claude/skills/home-workout-plan/SKILL.md` | Training rules for writing or changing workouts (equipment, progression, safety). Use it for any change to exercises or `data.js`. |

## Data model

```js
// localStorage["homegym-v1"]
{
  workouts: [Workout],
  sessions: [Session],   // finished workouts, any order (sorted by date when read)
  drafts: { [workoutId]: Draft }  // in-progress entries, one per workout
}

Workout = {
  id: "mon",                 // permanent
  weekday: 1,                // 0 = Sunday ... 6 = Saturday; "" = none. Opens automatically on that day.
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
  target: 10,                // number of reps, or seconds when unit is "sec"
  unit: "reps" | "sec",
  label: "10 per leg",       // display text for the target
  rest: 90,                  // seconds; starts the rest timer when a set is marked done
  start: "Suggested starting weight",
  cue: "How to do it"
}

Draft   = { started: ISODate, entries: { [exerciseId]: [Set] }, notes: "" }
Session = { id, workoutId, title, date: ISODate, entries: { [exerciseId]: [Set] }, names: { [exerciseId]: name }, notes }
Set     = { kg: "20" | "", reps: 10, done: true }   // kg and reps are stored as typed (strings), compare with Number()
```

## Important gotcha: editing `data.js`

`data.js` is only read when there's no saved state, or when the user taps **Edit plan, Restore original plan**. Restoring replaces the whole plan and wipes their in-app edits (history is kept). So after changing `data.js`, tell the user one of these:

1. They can add the change themselves in the **Edit plan** tab (keeps their edits), or
2. They can tap **Restore original plan** to load the new defaults (loses their plan edits).

If a change must reach existing users automatically, add a versioned migration in `load()` that merges new workouts or exercises in by `id`, without touching existing ones.

## Code conventions

- Match the existing style: ES5-compatible functions with `var`, string-concatenated templates, and event delegation via `data-action`, `data-f`, `data-wf` and `data-xf` attributes on `#app`.
- Render functions rebuild `app.innerHTML`. Text inputs update state on `input`/`change` without re-rendering, so focus isn't lost.
- Call `save()` after every state change.
- UI copy: plain, sentence case, active verbs ("Finish and save session"). Errors say what to do next.
- Keep the quality floor: works at 360 px wide, visible keyboard focus, `prefers-reduced-motion` respected, sufficient contrast in light and dark modes.
- The "plate" button (a set-done toggle styled as a bumper plate) is the app's signature element. Keep it.

## Testing a change

There's no test suite. Before committing:

1. Open `index.html` directly in a browser, or run `npx serve .`.
2. With a fresh profile (or after clearing site data), check that Monday and Friday load.
3. Enter kg and reps, mark sets done, and check that the rest timer starts.
4. Tap **Finish and save session**, then check that History shows it and the progress line updates.
5. In **Edit plan**, add, move and remove an exercise, then reload and check that the changes persist.
6. Export a backup, then import it again.
7. Check for errors in the browser console. Run `node --check app.js` for syntax.

## Deploying

Commit and push to `main`. Vercel redeploys within about a minute. Framework preset: Other. No build command; the output directory is the repo root.

## Don't commit

`.DS_Store`, `node_modules/`, `.vercel/`, and personal backup files (`home-gym-backup-*.json`). This repo is public.
